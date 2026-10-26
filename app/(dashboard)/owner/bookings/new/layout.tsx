import type { ReactNode } from "react";
import BookingFlowShell from "./components/booking-flow-shell";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default function NewBookingLayout({ children }: { children: ReactNode }) {
  return <BookingFlowShell>{children}</BookingFlowShell>;
}
