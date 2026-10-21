import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/session";
import { prisma } from "../../lib/prisma";
import { OwnerHeaderNameProvider } from "../../components/owner-dashboard/owner-header-context";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "pet_owner") {
    redirect("/");
  }

  const user = await prisma.users.findUnique({
    where: { user_id: BigInt(session.sub) },
    select: { first_name: true, last_name: true },
  });
  const userName = `${user?.first_name || "Pet"} ${user?.last_name || "Owner"}`.trim();

  return <OwnerHeaderNameProvider userName={userName}>{children}</OwnerHeaderNameProvider>;
}
