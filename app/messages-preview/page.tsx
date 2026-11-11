import { notFound } from "next/navigation";
import MessagesPage from "./sample-inbox";
import { OwnerDashboardFrame } from "../../components/owner-dashboard/owner-layout-shell";

export default function MessagesPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <OwnerDashboardFrame userName="Pet Owner" previewPath="/owner/messages">
      <MessagesPage />
    </OwnerDashboardFrame>
  );
}
