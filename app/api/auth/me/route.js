import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentSession } from "../../../../lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { user_id: BigInt(session.sub) },
    select: { first_name: true, last_name: true },
  });
  const name = `${user?.first_name || "Pet"} ${user?.last_name || "Owner"}`.trim();
  return NextResponse.json({ name });
}
