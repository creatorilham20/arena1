import { dumpAllData } from "@/lib/db";
import { isUnlocked } from "@/lib/pin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isUnlocked())) return new Response("Forbidden", { status: 403 });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `bismart-backup-${stamp}.json`;
  const bytes = new TextEncoder().encode(JSON.stringify(await dumpAllData(), null, 2));
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}