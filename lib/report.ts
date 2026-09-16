import { queryAll, getSetting } from "@/lib/db";
import { formatIDR } from "@/lib/format";
import { waLink } from "@/lib/wa";

export interface Tx {
  id: number; type: string; business_type: string; category: string | null;
  description: string | null; amount: number; tx_date: string; payment_method: string | null; status: string;
}

export interface Period { key: string; label: string; start: string; end: string }

export function periodRange(periodKey: string, month?: number, year?: number): Period {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (periodKey === "last7") {
    const s = new Date(now.getTime() - 6 * 86400000);
    return { key: periodKey, label: "7 Hari Terakhir", start: iso(s), end: iso(now) };
  }
  if (periodKey === "thisweek") {
    const day = (now.getDay() + 6) % 7;
    const s = new Date(now.getTime() - day * 86400000);
    return { key: periodKey, label: "Minggu Ini", start: iso(s), end: iso(now) };
  }
  if (periodKey === "monthly" || periodKey === "thismonth") {
    return { key: periodKey, label: `${m}-${y}`, start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-31` };
  }
  if (periodKey === "lastmonth") {
    const d = new Date(y, m - 2, 1);
    return { key: periodKey, label: `${d.getMonth() + 1}-${d.getFullYear()}`, start: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`, end: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-31` };
  }
  if (periodKey === "yearly" || periodKey === "thisyear") {
    return { key: periodKey, label: `${y}`, start: `${y}-01-01`, end: `${y}-12-31` };
  }
  return { key: periodKey, label: periodKey, start: "", end: "" };
}

async function getTx(period: Period, business?: string) {
  const p: (string | number)[] = [];
  let sql = "SELECT * FROM transactions WHERE tx_date BETWEEN ? AND ?";
  p.push(period.start, period.end);
  if (business && business !== "all") { sql += " AND business_type = ?"; p.push(business); }
  sql += " ORDER BY tx_date";
  return queryAll<Tx>(sql, ...p);
}

const BIZ_LABEL: Record<string, string> = { general: "Umum", premium: "Premium", editing: "Editing", frame: "Frame", documentation: "Dokumentasi" };

export async function reportWAText(periodKey: string, business?: string, month?: number, year?: number): Promise<{ period: Period; text: string }> {
  const period = periodRange(periodKey, business && periodKey === "monthly" ? month : month, year);
  const [rows, bizName] = await Promise.all([getTx(period, business), getSetting("business_name")]);
  const name = bizName ?? "Ilham Business Manager";

  const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const refund = rows.filter((r) => r.type === "refund").reduce((s, r) => s + r.amount, 0);
  const receivable = rows.filter((r) => r.type === "receivable" && r.status !== "paid").reduce((s, r) => s + r.amount, 0);
  const debt = rows.filter((r) => r.type === "debt" && r.status !== "paid").reduce((s, r) => s + r.amount, 0);

  let text = `*📊 LAPORAN KEUANGAN*\n`;
  text += `*${name}*\n`;
  text += `Periode: ${period.label}\n`;
  text += "----------------------------------\n";
  text += `💵 Pemasukan: *${formatIDR(income)}*\n`;
  text += `💸 Pengeluaran: *${formatIDR(expense)}*\n`;
  text += `↩️ Refund: *${formatIDR(refund)}*\n`;
  text += `💰 Saldo Kas: *${formatIDR(income - expense - refund)}*\n`;
  text += `⏳ Piutang Terbuka: *${formatIDR(receivable)}*\n`;
  text += `🧾 Hutang Terbuka: *${formatIDR(debt)}*\n`;
  text += "----------------------------------\n";
  const bizRows = ["premium", "editing", "frame", "documentation"].map((b) => {
    const rr = rows.filter((r) => r.business_type === b);
    const inc = rr.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
    const exp = rr.filter((r) => r.type === "expense" || r.type === "refund").reduce((s, r) => s + r.amount, 0);
    return { b, inc, exp };
  });
  for (const r of bizRows) text += `• ${BIZ_LABEL[r.b] ?? r.b}: omzet ${formatIDR(r.inc)} · belanja ${formatIDR(r.exp)}\n`;
  text += "----------------------------------\n";
  text += `Total transaksi: ${rows.length}\n`;
  text += `*Laporan dibuat otomatis oleh ${name}* 🙏`;
  return { period, text };
}

export async function reportCSV(periodKey: string, business?: string, month?: number, year?: number): Promise<string> {
  const period = periodRange(periodKey, month, year);
  const rows = await getTx(period, business);
  const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
  const header = "Tanggal;Bisnis;Jenis;Kategori;Deskripsi;Pembayaran;Status;Jumlah";
  const lines = rows.map((r) =>
    [r.tx_date, BIZ_LABEL[r.business_type] ?? r.business_type, r.type.toUpperCase(), r.category ?? "", r.description ?? "", r.payment_method ?? "", r.status, r.amount].map(esc).join(";"));
  return [header, ...lines].join("\n");
}

export async function reportWALink(periodKey: string, business?: string, month?: number, year?: number): Promise<string> {
  const { text } = await reportWAText(periodKey, business, month, year);
  const waNumber = await getSetting("wa_number");
  return waLink(text, waNumber || undefined);
}