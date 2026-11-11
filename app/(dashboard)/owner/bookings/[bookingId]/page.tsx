import { notFound } from "next/navigation";
import { bookings } from "../../../../../lib/mock-bookings";
import { loadOwnerBookingDetails } from "../owner-booking-details";
import { BookingDetails } from "./booking-details";

export default async function BookingDetailsPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const sample = bookings.find((booking) => booking.id === bookingId);
  if (sample) return <BookingDetails booking={sample} />;
  const actual = await loadOwnerBookingDetails(bookingId);
  if (!actual) notFound();
  return <BookingDetails booking={actual.booking} contactBookingId={actual.hasSitter ? bookingId : undefined} />;
}
