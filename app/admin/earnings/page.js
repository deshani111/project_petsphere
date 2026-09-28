"use client";

import Link from "next/link";
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
    case "download":
      return <svg {...common}><path d="M7 1.9v6" /><path d="m4.4 6.3 2.6 2.6 2.6-2.6" /><path d="M2.3 11.6h9.4" /></svg>;
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

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
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

function statusLabel(status) {
  if (status === "paid") return "Paid";
  if (status === "pending") return "Pending";
  if (status === "refunded") return "Refunded";
  return String(status || "Unknown").replace(/_/g, " ");
}

function statusClass(status) {
  return String(status || "").toLowerCase();
}

function downloadCsv(rows, period) {
  const csv = [
    ["Date", "User", "Sitter", "Service Type", "Amount", "Status"],
    ...rows.map((row) => [
      row.displayDate,
      row.ownerName,
      row.sitterName,
      row.serviceType,
      row.amountLabel,
      row.statusLabel,
    ]),
  ]
    .map((line) => line.map((value) => `"${String(value || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `petsphere-earnings-overview-${period}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildChartBuckets(transactions) {
  const buckets = [
    { label: "W1", gross: 0 },
    { label: "W2", gross: 0 },
    { label: "W3", gross: 0 },
    { label: "W4", gross: 0 },
  ];

  const sorted = [...transactions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  sorted.forEach((transaction, index) => {
    const bucketIndex = Math.min(3, Math.floor((index / Math.max(1, sorted.length)) * 4));
    buckets[bucketIndex].gross += Number(transaction.amount || 0);
  });

  const maxGross = Math.max(1, ...buckets.map((bucket) => bucket.gross));

  return buckets.map((bucket) => ({
    ...bucket,
    grossHeight: Math.max(18, (bucket.gross / maxGross) * 100),
    netHeight: Math.max(14, ((bucket.gross * 0.85) / maxGross) * 100),
    net: bucket.gross * 0.85,
  }));
}

export default function AdminEarningsOverviewPage() {
  const [period, setPeriod] = useState("last_30_days");
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
  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);
  const chartBuckets = useMemo(() => buildChartBuckets(transactions), [transactions]);
  const completedCount = useMemo(() => transactions.filter((transaction) => transaction.status === "paid").length, [transactions]);

  const totalRevenue = data?.summary?.totalVolume || 0;
  const totalTrend = data?.summary?.volumeTrend;
  const revenueTrend = totalTrend == null ? "Past 30 Days" : `${totalTrend > 0 ? "+" : ""}${totalTrend.toFixed(1)}%`;
  const completedTrend = data?.summary?.payoutTrend == null ? "Past 30 Days" : `${data.summary.payoutTrend > 0 ? "+" : ""}${data.summary.payoutTrend.toFixed(1)}%`;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1>Earnings Overview</h1>
          <p>Track your platform growth and financial performance</p>
        </div>

        <div className={styles.controlRow}>
          <label className={styles.periodSelect}>
            <Icon name="calendar" />
            <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Earnings period">
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className={styles.exportButton} onClick={() => data && downloadCsv(transactions, period)} disabled={!data}>
            <Icon name="download" />
            Export Report
          </button>
        </div>
      </header>

      {error && <div className={styles.errorState} role="alert">{error}</div>}

      {loading && !data ? (
        <div className={styles.loadingState}>Loading earnings data…</div>
      ) : (
        <>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={styles.cardIcon}>◰</span>
              <span className={styles.cardTrend}>{revenueTrend}</span>
              <small>Total Revenue</small>
              <strong>{formatCurrency(totalRevenue)}</strong>
            </article>

            <article className={styles.summaryCard}>
              <span className={styles.cardIcon}>▥</span>
              <span className={styles.cardTrend}>{completedTrend}</span>
              <small>Completed Transactions</small>
              <strong>{completedCount.toLocaleString("en-US")}</strong>
            </article>
          </div>

          <article className={styles.chartCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Revenue Trend</h2>
              </div>
              <div className={styles.legend}>
                <span><i className={styles.legendGross} />Gross Sales</span>
                <span><i className={styles.legendNet} />Net Profit</span>
              </div>
            </div>

            <div className={styles.chartArea} aria-label="Revenue trend chart">
              <div className={styles.gridLines} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className={styles.chartBars}>
                {chartBuckets.map((bucket) => (
                  <div key={bucket.label} className={styles.chartGroup}>
                    <div className={styles.barPair}>
                      <span className={styles.grossBar} style={{ height: `${bucket.grossHeight}%` }} />
                      <span className={styles.netBar} style={{ height: `${bucket.netHeight}%` }} />
                    </div>
                    <small>{bucket.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              <h2>Recent Transactions</h2>
              <Link href="/admin/earnings/history" className={styles.historyLink}>
                View All History
              </Link>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User / Sitter</th>
                    <th>Service Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatShortDate(transaction.createdAt)}</td>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.avatar}>{initials(transaction.ownerName)}</span>
                          <div>
                            <strong>{transaction.ownerName}</strong>
                            <small>Sitter: {transaction.sitterName}</small>
                          </div>
                        </div>
                      </td>
                      <td>{transaction.serviceType}</td>
                      <td className={styles.amount}>{transaction.amountLabel}</td>
                      <td>
                        <span className={`${styles.statusPill} ${styles[statusClass(transaction.status)]}`}>
                          {statusLabel(transaction.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!recentTransactions.length && (
                <div className={styles.emptyState}>
                  <strong>No transactions found</strong>
                  <span>Try a different period.</span>
                </div>
              )}
            </div>
          </article>
        </>
      )}
    </section>
  );
}
