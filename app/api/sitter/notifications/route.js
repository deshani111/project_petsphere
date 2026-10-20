import { NextResponse } from "next/server";
import { getCurrentSitter } from "../../../../modules/sitter/sitter.service";
import {
  listUserNotifications,
  markUserNotificationsRead,
} from "../../../../modules/notifications/notification.service";

export async function GET() {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  return NextResponse.json({ notifications: await listUserNotifications(sitter.user_id) });
}

export async function PATCH(request) {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = await markUserNotificationsRead(sitter.user_id, body.id);
  if (result.error) return NextResponse.json({ message: result.error }, { status: 400 });
  return NextResponse.json({ message: "Notifications updated." });
}
