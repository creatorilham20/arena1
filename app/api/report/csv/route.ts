import { NextRequest } from "next/server";
import { reportCSV, periodRange } from "@/lib/report";
import { isUnlocked } from "@/lib/pin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isUnlocked())) return new Response("Forbidden", { status: 403 });
  const sp = req.nextUrl.searchParams;
  const periodKey = sp.get("p") ?? "thismonth";
  const business = sp.get("b") ?? "all";
  const month = Number(sp.get("m")) || undefined;
  const year = Number(sp.get("y")) || undefined;
  const period = periodRange(periodKey, month, year);
  const csv = await reportCSV(periodKey, business, month, year);
  const filename = `laporan-${period.key}-${period.label.replace(/[/\\]/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
  const bytes = new TextEncoder().encode("\uFEFF" + csv);
  return new Response(bytes, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}