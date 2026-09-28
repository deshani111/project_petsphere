export default function RevenueChart({ values }) {
  const safeValues = values.length ? values : [12000, 18000, 25000, 33000, 38500, 42150];
  const max = Math.max(...safeValues, 1);
  const points = safeValues.map((value, index) => {
    const x = safeValues.length === 1 ? 2 : 2 + (index / (safeValues.length - 1)) * 96;
    const y = 92 - (value / max) * 71;
    return `${x},${y}`;
  }).join(" ");
  const area = `2,100 ${points} 98,100`;
  return <div className="revenue-chart" aria-label="Revenue over time"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#dca3a4" stopOpacity=".35" /><stop offset="100%" stopColor="#fff" stopOpacity=".04" /></linearGradient></defs><polygon points={area} /><polyline points={points} /></svg></div>;
}
