import { prisma } from "../../lib/prisma";

const PERIOD_CONFIG = {
  last_30_days: {
    label: "Last 30 Days",
    compareLabel: "Past 30 Days",
    days: 30,
  },
  this_month: {
    label: "This Month",
    compareLabel: "Past Month",
    days: null,
  },
  this_year: {
    label: "This Year",
    compareLabel: "Past Year",
    days: null,
  },
};

function clampPeriod(period) {
  return PERIOD_CONFIG[period] ? period : "last_30_days";
}

function toStringId(value) {
  return typeof value === "bigint" ? value.toString() : String(value);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function subtractDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getCurrentPeriodRange(period, now = new Date()) {
  const today = startOfDay(now);

  if (period === "this_year") {
    return {
      start: new Date(today.getFullYear(), 0, 1),
      end: addDays(today, 1),
    };
  }

  if (period === "this_month") {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: addDays(today, 1),
    };
  }

  return {
    start: subtractDays(addDays(today, 1), 30),
    end: addDays(today, 1),
  };
}

function getComparisonRange(start, end) {
  const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  return {
    start: subtractDays(start, duration),
    end: start,
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPerson(user) {
  if (!user) {
    return "Unknown User";
  }

  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.full_name || "Unknown User";
}

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getPlatformFee(amount) {
  return Number((Number(amount || 0) * 0.15).toFixed(2));
}

function mapPaymentStatus(status) {
  if (status === "completed") {
    return { key: "paid", label: "Paid" };
  }

  if (status === "pending") {
    return { key: "pending", label: "Pending" };
  }

  if (status === "refunded") {
    return { key: "refunded", label: "Refunded" };
  }

  return {
    key: String(status || "unknown").toLowerCase(),
    label: String(status || "Unknown").replace(/_/g, " "),
  };
}

function mapTransaction(payment) {
  const booking = payment.booking;
  const owner = booking?.pet_owner?.users;
  const sitter = booking?.pet_sitter?.users;
  const ownerName = formatPerson(owner);
  const sitterName = formatPerson(sitter);
  const amount = Number(payment.amount || 0);
  const platformFee = getPlatformFee(amount);
  const netAmount = Number((amount - platformFee).toFixed(2));
  const status = mapPaymentStatus(payment.status);

  return {
    id: toStringId(payment.payment_id),
    transactionId: `#TXN-${String(payment.payment_id).padStart(6, "0")}`,
    displayDate: formatShortDate(payment.payment_date),
    createdAt: payment.payment_date.toISOString(),
    ownerName,
    sitterName,
    userInitials: getInitials(ownerName || sitterName),
    serviceType: booking?.service_type?.name || "Service",
    amount,
    amountLabel: formatCurrency(amount),
    platformFee,
    platformFeeLabel: `-$${platformFee.toFixed(2)}`,
    netAmount,
    netAmountLabel: `$${netAmount.toFixed(2)}`,
    status: status.key,
    statusLabel: status.label,
    bookingStatus: booking?.status || "",
    paymentMethod: payment.payment_method || "",
    invoiceNumber: payment.invoice_number || "",
    transactionRef: payment.transaction_ref || "",
  };
}

function aggregate(payments) {
  return payments.reduce(
    (totals, payment) => {
      const amount = Number(payment.amount || 0);
      const platformFee = getPlatformFee(amount);
      totals.totalVolume += amount;
      totals.platformFees += platformFee;

      if (payment.status === "completed") {
        totals.successfulPayouts += amount - platformFee;
        totals.successfulCount += 1;
      }

      if (payment.status === "pending") {
        totals.pendingCount += 1;
      }

      if (payment.status === "refunded") {
        totals.refundedCount += 1;
      }

      return totals;
    },
    {
      totalVolume: 0,
      platformFees: 0,
      successfulPayouts: 0,
      successfulCount: 0,
      pendingCount: 0,
      refundedCount: 0,
    }
  );
}

function trendPercent(current, previous) {
  if (!previous) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

async function loadPaymentsForRange(start, end) {
  return prisma.payment.findMany({
    where: {
      payment_date: {
        gte: start,
        lt: end,
      },
    },
    orderBy: {
      payment_date: "desc",
    },
    include: {
      booking: {
        include: {
          service_type: {
            select: {
              name: true,
            },
          },
          pet_owner: {
            include: {
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                  full_name: true,
                },
              },
            },
          },
          pet_sitter: {
            include: {
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                  full_name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getAdminEarningsData(period = "last_30_days") {
  const selectedPeriod = clampPeriod(period);
  const { start, end } = getCurrentPeriodRange(selectedPeriod);
  const previousRange = getComparisonRange(start, end);

  const [periodPayments, previousPayments] = await Promise.all([
    loadPaymentsForRange(start, end),
    loadPaymentsForRange(previousRange.start, previousRange.end),
  ]);

  const currentTotals = aggregate(periodPayments);
  const previousTotals = aggregate(previousPayments);

  const volumeTrend = trendPercent(currentTotals.totalVolume, previousTotals.totalVolume);
  const feeTrend = trendPercent(currentTotals.platformFees, previousTotals.platformFees);
  const payoutTrend = trendPercent(currentTotals.successfulPayouts, previousTotals.successfulPayouts);

  return {
    period: selectedPeriod,
    periodLabel: PERIOD_CONFIG[selectedPeriod].label,
    compareLabel: PERIOD_CONFIG[selectedPeriod].compareLabel,
    summary: {
      totalVolume: currentTotals.totalVolume,
      platformFees: currentTotals.platformFees,
      successfulPayouts: currentTotals.successfulPayouts,
      volumeTrend,
      feeTrend,
      payoutTrend,
      statusLabel: currentTotals.successfulCount > 0 ? "Stable" : "No Activity",
      statusTone: currentTotals.pendingCount > currentTotals.successfulCount ? "watch" : "good",
    },
    transactions: periodPayments.map(mapTransaction),
    totalTransactions: periodPayments.length,
  };
}
