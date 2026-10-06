import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/session";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "pet_owner") {
    redirect("/");
  }

  return children;
}
