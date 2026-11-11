
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import OwnerLayoutShell from "../../components/owner-dashboard/owner-layout-shell";
import { getCurrentSession } from "../../lib/session";
import { prisma } from "../../lib/prisma";
import { OwnerHeaderNameProvider } from "../../components/owner-dashboard/owner-header-context";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function OwnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "pet_owner") {
    redirect("/");
  }

  const user = await prisma.users.findUnique({
    where: {
      user_id: BigInt(session.sub),
    },
    select: {
      first_name: true,
      last_name: true,
    },
  });

  const userName = `${
    user?.first_name || "Pet"
  } ${user?.last_name || "Owner"}`.trim();

  return (
    <OwnerHeaderNameProvider userName={userName}>
      <OwnerLayoutShell>
        {children}
      </OwnerLayoutShell>
    </OwnerHeaderNameProvider>
  );
}
