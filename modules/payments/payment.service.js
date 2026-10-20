import { prisma } from "../../lib/prisma";

function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item
  ));
}

export async function getSitterPaymentTransactions(sitterId, { page = 1, range = "30", status = "all" } = {}) {
  const take = 10;
  const since = range === "all" ? null : new Date(Date.now() - Number(range) * 86400000);
  const where = {
    booking: { sitter_id: sitterId },
    ...(status !== "all" ? { status } : {}),
    ...(since ? { payment_date: { gte: since } } : {}),
  };
  const [payments, total, groups] = await Promise.all([
    prisma.payment.findMany({
      where,
      select: {
        payment_id: true,
        payment_date: true,
        amount: true,
        status: true,
        transaction_ref: true,
        invoice_number: true,
        booking: { select: { pet: { select: { pet_name: true } }, service_type: { select: { name: true } } } },
      },
      orderBy: { payment_date: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.payment.count({ where }),
    prisma.payment.groupBy({ by: ["status"], where, _sum: { amount: true } }),
  ]);
  const transactions = payments.map((payment) => ({
    id: payment.payment_id,
    date: payment.payment_date,
    description: `${payment.booking?.service_type?.name || "Pet care"} · ${payment.booking?.pet?.pet_name || "Booking"}`,
    amount: Number(payment.amount),
    fee: 0,
    netAmount: Number(payment.amount),
    status: payment.status,
    reference: payment.transaction_ref || payment.invoice_number || null,
  }));
  const totalFor = (statuses) => groups.filter((group) => statuses.includes(group.status)).reduce((sum, group) => sum + Number(group._sum.amount || 0), 0);
  const successful = totalFor(["paid", "completed"]);
  const pending = totalFor(["pending", "processing"]);
  return serialize({
    summary: { totalEarnings: successful + pending, pendingPayouts: pending, successfulPayouts: successful },
    transactions,
    pagination: { page, total, pages: Math.max(1, Math.ceil(total / take)) },
  });
}
