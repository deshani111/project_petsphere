import { NextResponse } from "next/server";
import { getCurrentSitter } from "../../../../modules/sitter/sitter.service";
import { getSitterConversations } from "../../../../modules/messaging/messaging.service";

export async function GET() {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  try {
    return NextResponse.json(await getSitterConversations(sitter));
  } catch (error) {
    console.error("Sitter conversations could not be loaded:", error);
    return NextResponse.json({ message: "Could not load conversations." }, { status: 500 });
  }
}
