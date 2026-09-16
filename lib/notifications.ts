import { queryAll } from "./db";

export interface NotifItem {
  group: "masaAktif" | "pengerjaan";
  label: string;
  sub: string;
  href: string;
  tone: "red" | "amber" | "indigo";
}

function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const target = new Date(date.slice(0, 10) + "T00:00:00");
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - t.getTime()) / 86400000);
}

const tone = (d: number): "red" | "amber" | "indigo" => (d < 0 ? "red" : d <= 3 ? "amber" : "indigo");

export async function getNotifications(): Promise<NotifItem[]> {
  const items: NotifItem[] = [];

  const accounts = await queryAll<{ id: number; app_name: string; end_date: string | null }>(
    "SELECT id, app_name, end_date FROM premium_accounts WHERE status = 'active' ORDER BY end_date ASC");
  for (const a of accounts) {
    const d = daysUntil(a.end_date);
    if (d === null || d > 7) continue;
    items.push({
      group: "masaAktif",
      label: a.app_name,
      sub: d >= 0 ? `Masa aktif sisa ${d} hari lagi` : `Masa aktif sudah berakhir ${-d} hari lalu — perpanjang!`,
      href: "/bisnis/premium",
      tone: tone(d),
    });
  }

  const projects = await queryAll<{
    id: number; project_no: string; client_name: string; business_type: string;
    status: string; deadline: string | null; event_date: string | null;
  }>(
    "SELECT id, project_no, client_name, business_type, status, deadline, event_date FROM projects WHERE status NOT IN ('paid','cancelled') ORDER BY COALESCE(deadline, event_date) ASC");
  for (const p of projects) {
    const d = daysUntil(p.deadline ?? p.event_date);
    if (d === null || d > 7) continue;
    items.push({
      group: "pengerjaan",
      label: p.client_name,
      sub: `${p.project_no} · ${p.status === "processing" ? "sedang dikerjakan" : p.status} · ${d >= 0 ? `deadline H-${d}` : `terlambat ${-d} hari`}`,
      href: "/project",
      tone: tone(d),
    });
  }

  const orders = await queryAll<{ id: number; order_no: string; status: string; deadline: string | null }>(
    "SELECT id, order_no, status, deadline FROM frame_orders WHERE status NOT IN ('done','cancelled') AND deadline IS NOT NULL ORDER BY deadline ASC");
  for (const o of orders) {
    const d = daysUntil(o.deadline);
    if (d === null || d > 7) continue;
    items.push({
      group: "pengerjaan",
      label: o.order_no,
      sub: `Pesanan bingkai ${o.status} · ${d >= 0 ? `deadline H-${d}` : `terlambat ${-d} hari`}`,
      href: "/bisnis/frame",
      tone: tone(d),
    });
  }

  return items.sort((a, b) => (a.sub < b.sub ? -1 : 1)).slice(0, 20);
}