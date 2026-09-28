const icons = { users: "♧", bookings: "▣", revenue: "▤", applications: "♙" };

export default function SummaryCard({ label, value, trend, direction = "up", icon }) {
  return <article className="summary-card"><span className="summary-card__icon" aria-hidden="true">{icons[icon]}</span><span className={`summary-card__trend summary-card__trend--${direction}`}>{direction === "up" ? "↑" : "↓"} {trend}</span><small>{label}</small><strong>{value}</strong></article>;
}
