import { NextResponse } from "next/server";
import { getCurrentSitter } from "../../../../modules/sitter/sitter.service";
import { getSitterPaymentTransactions } from "../../../../modules/payments/payment.service";

export async function GET(request) {
  const sitter = await getCurrentSitter();
  if (!sitter) return NextResponse.json({ message: "Sitter access is required." }, { status: 401 });
  const query = new URL(request.url).searchParams;
  const page = Math.max(1, Number(query.get("page")) || 1);
  const range = query.get("range") || "30";
  const status = query.get("status") || "all";
  try {
    return NextResponse.json(await getSitterPaymentTransactions(sitter.sitter_id, { page, range, status }));
  } catch (error) {
    console.error("Sitter payment transactions could not be loaded:", error);
    return NextResponse.json({ message: "Could not load payment transactions." }, { status: 500 });
  }
}
