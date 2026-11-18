"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, BadgeCheck, CalendarDays, ChartNoAxesCombined, CircleDollarSign, Clock3, Download, Wallet } from "lucide-react";
import { arc, pie } from "d3-shape";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const periodOptions = [
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
];
const emptyTransactions = [];
const serviceCategories = [
  { name: "Boarding", color: "#ad3f42" },
  { name: "Walking", color: "#c97070" },
  { name: "Grooming", color: "#d1a09b" },
  { name: "Pet Sitting", color: "#dfc2bd" },
];

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildChartBuckets(transactions, period, now = new Date()) {
  const ranges = [];
  if (period === "this_year") {
    for (let month = 0; month < 12; month += 1) {
      const start = new Date(now.getFullYear(), month, 1);
      ranges.push({
        start,
        end: new Date(now.getFullYear(), month + 1, 1),
        label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(start),
      });
    }
  } else {
    const start = period === "this_month"
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    for (let bucketStart = new Date(start), index = 0; bucketStart < end; index += 1) {
      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketEnd.getDate() + 7);
      const boundedEnd = bucketEnd < end ? bucketEnd : end;
      ranges.push({
        start: new Date(bucketStart),
        end: boundedEnd,
        label: period === "this_month"
          ? `${bucketStart.getDate()}–${boundedEnd.getDate() - 1}`
          : `W${index + 1}`,
      });
      bucketStart = bucketEnd;
    }
  }

  const buckets = ranges.map((range) => ({ ...range, gross: 0, fees: 0 }));
  for (const transaction of transactions) {
    const date = new Date(transaction.createdAt);
    const bucket = buckets.find(({ start, end }) => date >= start && date < end);
    if (!bucket) continue;
    bucket.gross += Number(transaction.amount || 0);
    bucket.fees += Number(transaction.platformFee || 0);
  }

  const maxGross = Math.max(0, ...buckets.map((bucket) => bucket.gross));
  return buckets.map((bucket) => ({
    ...bucket,
    grossHeight: maxGross ? (bucket.gross / maxGross) * 100 : 0,
    feeHeight: maxGross ? (bucket.fees / maxGross) * 100 : 0,
  }));
}

export default function AdminEarningsOverviewPage() {
  const [period, setPeriod] = useState("last_30_days");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/earnings?period=${period}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Earnings data could not be loaded.");
        return payload;
      })
      .then((payload) => { if (!cancelled) setData(payload); })
      .catch((loadError) => { if (!cancelled) { setError(loadError.message || "Earnings data could not be loaded."); setData(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, reloadKey]);

  const transactions = data?.transactions || emptyTransactions;
  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);
  const chartBuckets = useMemo(() => buildChartBuckets(transactions, period), [transactions, period]);
  const serviceRevenue = useMemo(() => {
    const totals = new Map(serviceCategories.map(({ name }) => [name, 0]));

    for (const transaction of transactions) {
      const service = String(transaction.serviceType || "").toLowerCase();
      const category = service.includes("boarding")
        ? "Boarding"
        : service.includes("walk")
          ? "Walking"
          : service.includes("groom")
            ? "Grooming"
            : service.includes("sitting")
              ? "Pet Sitting"
              : null;

      if (category) {
        totals.set(category, totals.get(category) + Number(transaction.amount || 0));
      }
    }

    return serviceCategories.map((category) => ({
      ...category,
      revenue: totals.get(category.name),
    }));
  }, [transactions]);
  const serviceRevenueTotal = serviceRevenue.reduce(
    (total, category) => total + category.revenue,
    0,
  );
  const serviceRevenueSlices = useMemo(() => {
    const path = arc().innerRadius(68).outerRadius(94).cornerRadius(2);
    return pie()
      .sort(null)
      .value((category) => category.revenue)(serviceRevenue.filter((category) => category.revenue > 0))
      .map((slice) => ({
        ...slice.data,
        path: path(slice),
      }));
  }, [serviceRevenue]);
  const completedCount = useMemo(() => transactions.filter((transaction) => transaction.status === "paid").length, [transactions]);
  const pendingCount = useMemo(() => transactions.filter((transaction) => transaction.status === "pending").length, [transactions]);

  const totalRevenue = data?.summary?.totalVolume || 0;
  const compareLabel = data?.compareLabel || "previous period";

  function renderTrend(value) {
    if (value == null) return <span className={`${styles.trendBadge} ${styles.trendNeutral}`}>No prior data</span>;
    const TrendIcon = value >= 0 ? ArrowUpRight : ArrowDownRight;
    return (
      <span className={`${styles.trendBadge} ${value >= 0 ? styles.trendPositive : styles.trendNegative}`} aria-label={`${value >= 0 ? "Up" : "Down"} ${Math.abs(value).toFixed(1)}% compared with ${compareLabel.toLowerCase()}`}>
        <TrendIcon size={14} aria-hidden="true" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1>Earnings overview</h1>
          <p>Track payment volume, platform fees, and sitter payouts.</p>
        </div>

        <div className={styles.controlRow}>
          <label className={styles.periodSelect}>
            <CalendarDays size={17} aria-hidden="true" />
            <select value={period} onChange={(event) => { if (event.target.value !== period) { setLoading(true); setError(""); setPeriod(event.target.value); } }} aria-label="Earnings period">
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className={styles.exportButton} onClick={() => data && downloadCsv(transactions, period)} disabled={!data}>
            <Download size={16} aria-hidden="true" />
            Export Report
          </button>
        </div>
      </header>

      {error ? (
        <div className={styles.errorState} role="alert">
          <strong>We couldn’t load earnings data</strong>
          <span>{error}</span>
          <button type="button" onClick={() => { setLoading(true); setError(""); setReloadKey((value) => value + 1); }}>Try again</button>
        </div>
      ) : loading && !data ? (
        <div className={styles.loadingState}>Loading earnings data…</div>
      ) : (
        <>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <div className={styles.metricTop}>
                <span className={`${styles.cardIcon} ${styles.volumeIcon}`}><CircleDollarSign size={19} aria-hidden="true" /></span>
                {renderTrend(data?.summary?.volumeTrend)}
              </div>
              <div className={styles.metricCopy}>
                <small>Payment volume</small>
                <strong>{formatCurrency(totalRevenue)}</strong>
                <span>{`vs ${compareLabel.toLowerCase()}`}</span>
              </div>
            </article>

            <article className={styles.summaryCard}>
              <div className={styles.metricTop}>
                <span className={`${styles.cardIcon} ${styles.feeIcon}`}><ChartNoAxesCombined size={19} aria-hidden="true" /></span>
                {renderTrend(data?.summary?.feeTrend)}
              </div>
              <div className={styles.metricCopy}>
                <small>Platform fees</small>
                <strong>{formatCurrency(data?.summary?.platformFees)}</strong>
                <span>Across all payment statuses</span>
              </div>
            </article>

            <article className={styles.summaryCard}>
              <div className={styles.metricTop}>
                <span className={`${styles.cardIcon} ${styles.payoutIcon}`}><Wallet size={19} aria-hidden="true" /></span>
                {renderTrend(data?.summary?.payoutTrend)}
              </div>
              <div className={styles.metricCopy}>
                <small>Sitter payouts</small>
                <strong>{formatCurrency(data?.summary?.successfulPayouts)}</strong>
                <span>From completed payments</span>
              </div>
            </article>

            <article className={styles.summaryCard}>
              <div className={styles.metricTop}>
                <span className={`${styles.cardIcon} ${styles.completedIcon}`}><BadgeCheck size={19} aria-hidden="true" /></span>
                <span className={`${styles.countBadge} ${pendingCount ? styles.countPending : ""}`}>
                  {pendingCount ? <><Clock3 size={13} aria-hidden="true" /> {pendingCount} pending</> : "All clear"}
                </span>
              </div>
              <div className={styles.metricCopy}>
                <small>Completed transactions</small>
                <strong>{completedCount.toLocaleString("en-US")}</strong>
                <span>{`${(data?.summary?.refundedCount || 0).toLocaleString("en-US")} refunded in this period`}</span>
              </div>
            </article>
          </div>

          <section className={styles.analyticsGrid} aria-label="Revenue analytics">
            <article className={styles.chartCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <span className={styles.sectionEyebrow}>Performance</span>
                  <h2>Revenue Trend</h2>
                  <p>Payment volume and platform fees for {data?.periodLabel?.toLowerCase() || "the selected period"}.</p>
                </div>
                <div className={styles.legend}>
                  <span><i className={styles.legendGross} />Payment volume</span>
                  <span><i className={styles.legendNet} />Platform fees</span>
                </div>
              </div>

              {transactions.length ? (
                <div className={styles.chartArea} role="img" aria-label="Payment volume and platform fees grouped by date">
                  <div className={styles.gridLines} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className={styles.chartBars} style={{ gridTemplateColumns: `repeat(${chartBuckets.length}, minmax(0, 1fr))` }}>
                    {chartBuckets.map((bucket) => (
                      <div key={bucket.label} className={styles.chartGroup} title={`${bucket.label}: ${formatCurrency(bucket.gross)} payment volume, ${formatCurrency(bucket.fees)} platform fees`}>
                        <div className={styles.barPair} aria-hidden="true">
                          <span className={styles.grossBar} style={{ height: `${bucket.grossHeight}%` }} />
                          <span className={styles.netBar} style={{ height: `${bucket.feeHeight}%` }} />
                        </div>
                        <small>{bucket.label}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.chartEmpty}>
                  <span className={styles.emptyIcon}><ChartNoAxesCombined size={20} aria-hidden="true" /></span>
                  <strong>No payment activity for this period</strong>
                  <span>Try another date range to explore earnings activity.</span>
                </div>
              )}
            </article>

            <article className={`${styles.chartCard} ${styles.serviceCard}`}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <span className={styles.sectionEyebrow}>Breakdown</span>
                  <h2>Revenue by Service</h2>
                  <p>Revenue share for {data?.periodLabel?.toLowerCase() || "the selected period"}.</p>
                </div>
              </div>

              {serviceRevenueTotal > 0 ? (
                <div className={styles.serviceRevenueContent}>
                  <div
                    className={styles.donutVisual}
                    role="img"
                    aria-label={`Revenue by service. Total ${formatCurrency(serviceRevenueTotal)}. ${serviceRevenue.map((category) => `${category.name}: ${formatCurrency(category.revenue)}, ${serviceRevenueTotal ? ((category.revenue / serviceRevenueTotal) * 100).toFixed(1) : "0.0"} percent`).join(". ")}`}
                  >
                    <svg viewBox="0 0 220 220" aria-hidden="true" focusable="false">
                      {serviceRevenueSlices.map((slice) => (
                        <path
                          key={slice.name}
                          d={slice.path}
                          transform="translate(110 110)"
                          fill={slice.color}
                        />
                      ))}
                    </svg>
                    <div className={styles.donutCenter}>
                      <span>Total revenue</span>
                      <strong>{formatCurrency(serviceRevenueTotal)}</strong>
                    </div>
                  </div>

                  <ul className={styles.serviceLegend} aria-label="Revenue by service categories">
                    {serviceRevenue.map((category) => {
                      const percentage = (category.revenue / serviceRevenueTotal) * 100;
                      return (
                        <li key={category.name}>
                          <span className={styles.serviceLegendName}>
                            <i style={{ backgroundColor: category.color }} aria-hidden="true" />
                            {category.name}
                          </span>
                          <span className={styles.serviceLegendValue}>
                            <strong>{formatCurrency(category.revenue)}</strong>
                            <small>{percentage.toFixed(1)}%</small>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className={styles.serviceEmpty} role="status">
                  <span className={styles.emptyIcon}><ChartNoAxesCombined size={20} aria-hidden="true" /></span>
                  <strong>No service revenue for this period</strong>
                  <span>Revenue will appear here when payments are recorded for these services.</span>
                </div>
              )}
            </article>
          </section>

          <article className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionEyebrow}>Activity</span>
                <h2>Recent transactions</h2>
                <p>{`${transactions.length.toLocaleString("en-US")} transactions in ${data?.periodLabel?.toLowerCase() || "this period"}`}</p>
              </div>
              <Link href="/admin/earnings/history" className={styles.historyLink}>
                View all history <span aria-hidden="true">→</span>
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
                  <span className={styles.emptyIcon}><CalendarDays size={20} aria-hidden="true" /></span>
                  <strong>No transactions found</strong>
                  <span>Payments will appear here when activity is recorded for this period.</span>
                </div>
              )}
            </div>
          </article>
        </>
      )}
    </section>
  );
}
