import styles from "../page.module.css";

const chartWidth = 760;
const chartHeight = 236;
const chartPadding = { top: 12, right: 12, bottom: 32, left: 62 };

function formatAxisCurrency(value) {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-$" : "$";

  if (absoluteValue >= 1_000_000) {
    return `${sign}${(absoluteValue / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (absoluteValue >= 1_000) {
    return `${sign}${(absoluteValue / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return `${sign}${Math.round(absoluteValue)}`;
}

function formatTooltipCurrency(value) {
  return `${value < 0 ? "-$" : "$"}${Math.abs(value).toFixed(2)}`;
}

function getBuckets(payments, period) {
  if (!payments.length) return [];
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daily = period === "7" || period === "30";
  if (period === "7") start.setUTCDate(start.getUTCDate() - 6);
  else if (period === "30") start.setUTCDate(start.getUTCDate() - 29);
  else if (period === "90") start.setUTCDate(start.getUTCDate() - 89);
  else if (period === "365") start.setUTCMonth(start.getUTCMonth() - 11, 1);
  else {
    const firstPayment = new Date(payments[0].date);
    start.setUTCFullYear(firstPayment.getUTCFullYear(), firstPayment.getUTCMonth(), 1);
  }

  const weekly = period === "90";
  const monthly = !daily && !weekly;
  const buckets = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`;
    buckets.push({ key, amount: 0 });
    if (monthly) cursor.setUTCMonth(cursor.getUTCMonth() + 1, 1);
    else cursor.setUTCDate(cursor.getUTCDate() + (weekly ? 7 : 1));
  }

  for (const payment of payments) {
    const date = new Date(payment.date);
    if (date < start || date > now) continue;
    const elapsedDays = (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start.getTime()) / 86400000;
    const index = monthly
      ? (date.getUTCFullYear() - start.getUTCFullYear()) * 12 + date.getUTCMonth() - start.getUTCMonth()
      : Math.min(buckets.length - 1, Math.floor(elapsedDays / (weekly ? 7 : 1)));
    if (buckets[index]) buckets[index].amount += Number(payment.amount || 0);
  }
  return buckets;
}

export default function RevenueChart({ payments, period }) {
  const buckets = getBuckets(payments, period);
  if (!buckets.length) return <div className={styles.chartEmpty}>No completed payments in this period.</div>;

  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const max = Math.max(...buckets.map((bucket) => bucket.amount), 1);
  const points = buckets.map((bucket, index) => ({
    ...bucket,
    x: chartPadding.left + (buckets.length === 1 ? plotWidth / 2 : (index / (buckets.length - 1)) * plotWidth),
    y: chartPadding.top + plotHeight - (bucket.amount / max) * plotHeight,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${chartPadding.left},${chartHeight - chartPadding.bottom} ${line} ${chartWidth - chartPadding.right},${chartHeight - chartPadding.bottom}`;
  const labels = [0, 1, 2, 3].map((index) => max - (max * index) / 3);
  const dateLabel = (key) => new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: period === "7" || period === "30" || period === "90" ? "numeric" : undefined,
    year: period === "all" ? "2-digit" : undefined,
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00.000Z`));

  return (
    <div className={styles.chartFrame}>
      <svg className={styles.revenueChart} viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Revenue trend chart">
        <defs><linearGradient id="admin-revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ad3f42" stopOpacity=".18" /><stop offset="100%" stopColor="#ad3f42" stopOpacity="0" /></linearGradient></defs>
        {labels.map((value, index) => {
          const y = chartPadding.top + (plotHeight * index) / 3;
          return <g key={index}><line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} className={styles.chartGridline} /><text x={chartPadding.left - 10} y={y + 4} textAnchor="end" className={styles.chartAxis}>{formatAxisCurrency(value)}</text></g>;
        })}
        <polygon points={area} fill="url(#admin-revenue-fill)" />
        <polyline points={line} className={styles.chartLine} />
        {points.map((point) => <circle key={point.key} cx={point.x} cy={point.y} r="4" className={styles.chartPoint} tabIndex="0"><title>{`${dateLabel(point.key)}: ${formatTooltipCurrency(point.amount)}`}</title></circle>)}
        {points.filter((_, index) => index === 0 || index === points.length - 1 || index === Math.floor(points.length / 2)).map((point) => <text key={`label-${point.key}`} x={point.x} y={chartHeight - 8} textAnchor="middle" className={styles.chartAxis}>{dateLabel(point.key)}</text>)}
      </svg>
    </div>
  );
}
