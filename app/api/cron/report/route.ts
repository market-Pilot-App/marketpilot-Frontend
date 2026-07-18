import { NextResponse } from "next/server";

export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const [report, tokens] = await Promise.all([
      fetch(`${API_URL}/api/scheduler/run-morning-report`, { method: "POST" }),
      fetch(`${API_URL}/api/scheduler/check-tokens`, { method: "POST" }),
    ]);
    const data = await report.json();
    const tokenData = await tokens.json();
    return NextResponse.json({ report: data, tokens: tokenData });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
