import { NextResponse } from "next/server";
import { authorizeAdmin } from "../../../../lib/authorization";
import {
  listUserNotifications,
  markUserNotificationsRead,
} from "../../../../modules/notifications/notification.service";

async function getAuthorizedAdminSession() {
  const authorization = await authorizeAdmin();
  if (!authorization.session) {
    return {
      response: NextResponse.json(
        { message: authorization.status === 401 ? "Authentication required." : "Admin access is required." },
        { status: authorization.status },
      ),
    };
  }

  return { session: authorization.session };
}

export async function GET() {
  const { session, response } = await getAuthorizedAdminSession();
  if (response) return response;

  return NextResponse.json({
    notifications: await listUserNotifications(BigInt(session.sub)),
  });
}

export async function PATCH(request) {
  const { session, response } = await getAuthorizedAdminSession();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const result = await markUserNotificationsRead(BigInt(session.sub), body.id);
  if (result.error) return NextResponse.json({ message: result.error }, { status: 400 });
  return NextResponse.json({ message: "Notifications updated." });
}
