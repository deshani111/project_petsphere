import type { ReactNode } from "react";
import BookingFlowShell from "./components/booking-flow-shell";

export default function NewBookingLayout({ children }: { children: ReactNode }) {
  return <BookingFlowShell>{children}</BookingFlowShell>;
}
