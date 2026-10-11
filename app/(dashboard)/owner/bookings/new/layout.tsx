import type { ReactNode } from "react";
import BookingFlowShell from "./components/booking-flow-shell";
import { BookingProvider } from "./components/booking-context";

export default function NewBookingLayout({ children }: { children: ReactNode }) {
  return <BookingProvider><BookingFlowShell>{children}</BookingFlowShell></BookingProvider>;
}
