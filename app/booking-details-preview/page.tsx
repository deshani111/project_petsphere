import { notFound } from "next/navigation";
import { BookingDetails } from "../(dashboard)/owner/bookings/[bookingId]/booking-details";
import { OwnerDashboardFrame } from "../../components/owner-dashboard/owner-layout-shell";
import { bookings } from "../../lib/mock-bookings";

export default function BookingDetailsPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <OwnerDashboardFrame userName="Pet Owner" previewPath="/owner/bookings/booking-001">
      <BookingDetails booking={bookings[0]} preview />
    </OwnerDashboardFrame>
  );
}
