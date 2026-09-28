"use client";

import { SiteFooter, SiteHeader } from "./site-chrome";

export default function LayoutShell({ children }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
