"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const periodOptions = [
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
];

function Icon({ name }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 14 14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "calendar":
      return <svg {...common}><rect x="1.8" y="2.7" width="10.4" height="9" rx="1.6" /><path d="M3.4 1.9v2M10.6 1.9v2M1.8 5.1h10.4" /></svg>;
    case "filter":
      return <svg {...common}><path d="M2.2 3h9.6M4.3 7h5.4M5.9 11h2.2" /></svg>;
    case "refresh":
      return <svg {...common}><path d="M11.6 6.1A4.7 4.7 0 0 0 3 4.5" /><path d="M3.2 2.8 3 4.6l1.8.2" /><path d="M2.4 7.9A4.7 4.7 0 0 0 11 9.5" /><path d="M10.8 11.2 11 9.4l-1.8-.2" /></svg>;
    case "more":
      return <svg {...common}><path d="M7 3.1v.1M7 7v.1M7 10.9v.1" /></svg>;
    default:
      return null;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusClass(status) {
  return String(status || "").toLowerCase();
}

function ExportCsv(rows, period) {
  const csv = [
    ["Date", "Transaction ID", "User", "Sitter", "Service Type", "Amount", "Platform Fee", "Net Amount", "Status"],
    ...rows.map((row) => [
      row.displayDate,
      row.transactionId,
      row.ownerName,
      row.sitterName,
      row.serviceType,
      row.amountLabel,
      row.platformFeeLabel,
      row.netAmountLabel,
      row.statusLabel,
    ]),
  ]
    .map((line) => line.map((value) => `"${String(value || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `petsphere-earnings-${period}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminEarningsPage() {
  const [period, setPeriod] = useState("last_30_days");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEarnings = async (selectedPeriod = period) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/earnings?period=${selectedPeriod}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Earnings data could not be loaded.");
      }

      setData(payload);
    } catch (loadError) {
      setError(loadError.message || "Earnings data could not be loaded.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const transactions = data?.transactions || [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (statusFilter !== "all" && transaction.status !== statusFilter) {
        return false;
      }

      if (serviceFilter !== "all" && transaction.serviceType !== serviceFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, statusFilter, serviceFilter]);

  const services = useMemo(() => {
    const unique = new Set();
    transactions.forEach((transaction) => unique.add(transaction.serviceType));
    return Array.from(unique).sort();
  }, [transactions]);

  const summary = data?.summary || {};
  const volumeTrend = summary.volumeTrend == null ? "Past 30 Days" : `${summary.volumeTrend > 0 ? "+" : ""}${summary.volumeTrend.toFixed(1)}%`;
  const feeTrend = summary.feeTrend == null ? "Past 30 Days" : `${summary.feeTrend > 0 ? "+" : ""}${summary.feeTrend.toFixed(1)}%`;
  const payoutTrend = summary.payoutTrend == null ? "Stable" : `${summary.payoutTrend > 0 ? "+" : ""}${summary.payoutTrend.toFixed(1)}%`;

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumbs}>
        <span>Admin</span>
        <span>/</span>
        <span>Earnings</span>
        <span>/</span>
        <strong>Transaction History</strong>
      </div>

      <header className={styles.header}>
        <div>
          <h1>Transaction History</h1>
          <p>Manage and monitor all platform-wide financial activities.</p>
        </div>
        <div className={styles.headerControls}>
          <label className={styles.periodPicker}>
            <Icon name="calendar" />
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.filterButton} onClick={() => setFiltersOpen((open) => !open)}>
            <Icon name="filter" />
            Filter
          </button>
        </div>
      </header>

      {filtersOpen && (
        <div className={styles.filterPanel}>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
          <label>
            Service Type
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
              <option value="all">All</option>
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              setStatusFilter("all");
              setServiceFilter("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {error && <div className={styles.errorState} role="alert">{error}</div>}

      {loading && !data ? (
        <div className={styles.loadingState}>Loading earnings data…</div>
      ) : (
        <>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={styles.summaryIcon}>◫</span>
              <span className={styles.summaryTrend}>{volumeTrend}</span>
              <small>Total Volume</small>
              <strong>{formatCurrency(summary.totalVolume)}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryIcon}>%</span>
              <span className={styles.summaryTrend}>{feeTrend}</span>
              <small>Platform Fees</small>
              <strong>{formatCurrency(summary.platformFees)}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span className={`${styles.summaryIcon} ${styles.good}`}>✓</span>
              <span className={styles.statusBadge}>{summary.statusLabel || "Stable"}</span>
              <small>Successful Payouts</small>
              <strong>{formatCurrency(summary.successfulPayouts)}</strong>
              <span className={styles.summaryFooter}>{payoutTrend}</span>
            </article>
          </div>

          <article className={styles.tableCard}>
            <div className={styles.sectionHeading}>
              <h2>Transaction History</h2>
              <button type="button" onClick={() => loadEarnings(period)}>
                <Icon name="refresh" />
                Refresh
              </button>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>User / Sitter</th>
                    <th>Service Type</th>
                    <th>Amount</th>
                    <th>Platform Fee</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.displayDate}</td>
                      <td><span className={styles.transactionId}>{transaction.transactionId}</span></td>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.avatar}>{initials(transaction.ownerName || transaction.sitterName)}</span>
                          <div>
                            <strong>{transaction.ownerName}</strong>
                            <small>Sitter: {transaction.sitterName}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className={styles.serviceBadge}>{transaction.serviceType}</span></td>
                      <td className={styles.amount}>{transaction.amountLabel}</td>
                      <td className={styles.fee}>{transaction.platformFeeLabel}</td>
                      <td className={styles.net}>{transaction.netAmountLabel}</td>
                      <td>
                        <span className={`${styles.statusPill} ${styles[statusClass(transaction.status)]}`}>
                          {transaction.statusLabel}
                        </span>
                      </td>
                      <td>
                        <button type="button" className={styles.moreButton} aria-label={`Actions for ${transaction.transactionId}`}>
                          <Icon name="more" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!filteredTransactions.length && (
                <div className={styles.emptyState}>
                  <strong>No transactions found</strong>
                  <span>Try a different filter or period.</span>
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <span>Showing 1 - {filteredTransactions.length} of {data?.totalTransactions || 0} transactions</span>
              <div className={styles.pagination}>
                <button type="button" disabled aria-label="Previous page">‹</button>
                <button type="button" className={styles.current} aria-current="page">1</button>
                <button type="button" disabled>2</button>
                <button type="button" disabled>3</button>
                <span>…</span>
                <button type="button" disabled>{Math.max(1, Math.ceil((data?.totalTransactions || 0) / 12))}</button>
                <button type="button" disabled aria-label="Next page">›</button>
              </div>
            </footer>
          </article>
        </>
      )}
    </section>
  );
}
