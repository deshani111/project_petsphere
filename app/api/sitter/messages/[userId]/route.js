import { NextResponse } from "next/server";
import { getCurrentSitter } from "../../../../../modules/sitter/sitter.service";
import {
  getSitterConversation,
  sendSitterMessage,
} from "../../../../../modules/messaging/messaging.service";

export async function GET(_, context) {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  const result = await getSitterConversation(sitter, (await context.params).userId);
  if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function POST(request, context) {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = await sendSitterMessage(sitter, (await context.params).userId, body.text);
  if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });
  return NextResponse.json(result, { status: 201 });
}
