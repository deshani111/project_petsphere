import { Check, Clock3, XCircle } from "lucide-react";

const statusConfig = {
  pending: { label: "Awaiting review", Icon: Clock3 },
  approved: { label: "Approved", Icon: Check },
  rejected: { label: "Rejected", Icon: XCircle },
};

export default function StatusBadge({ status, reason }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.Icon;
  return <span className="marketplace-status-badge" title={status === "rejected" ? reason || "This ad was rejected." : config.label} aria-label={status === "rejected" ? `${config.label}: ${reason || "No reason provided"}` : config.label} data-status={status}><Icon size={14} aria-hidden="true" /><span>{config.label}</span></span>;
}
