import { queryOne, getSetting } from "@/lib/db";
import { formatIDR } from "@/lib/format";
import { waLink } from "@/lib/wa";

export interface InvoiceItem {
  desc: string;
  qty: number;
  unit: string;
  price: number;
  amount: number;
}

export interface InvoiceData {
  kind: "premium" | "frame" | "project";
  id: number;
  no: string;
  businessName: string;
  date: string;
  dueDate: string | null;
  status: string;
  custName: string;
  phone: string | null;
  custDetail: string;
  items: InvoiceItem[];
  dp: number;
  paid: number;
  total: number;
  remaining: number;
  note: string;
}

const BIZ_LABEL: Record<string, string> = { premium: "Premium Apps", editing: "Jasa Editing", frame: "Frame Custom", documentation: "Dokumentasi" };

export async function buildInvoice(kind: "premium" | "frame" | "project", id: number): Promise<InvoiceData | null> {
  const businessName = (await getSetting("business_name")) ?? "Ilham Business Manager";
  if (kind === "premium") {
    const row = await queryOne<{ id: number; app_name: string; email: string; package_type: string; sell_price: number; start_date: string; end_date: string; devices: number; status: string; customer_id: number | null; refund_amount: number }>(
      "SELECT * FROM premium_accounts WHERE id = ?", id);
    if (!row) return null;
    let custName = "-";
    let phone: string | null = null;
    if (row.customer_id) {
      const c = await queryOne<{ name: string; phone: string | null }>("SELECT name, phone FROM customers WHERE id = ?", row.customer_id);
      if (c) { custName = c.name; phone = c.phone; }
    }
    const remaining = row.status === "cancelled" ? 0 : Math.max(0, row.sell_price - row.refund_amount);
    return {
      kind, id, no: `INV-PRM-${String(row.id).padStart(4, "0")}`, businessName,
      date: row.start_date, dueDate: row.end_date,
      status: row.refund_amount > 0 ? "REFUND" : row.status === "expired" ? "SELESAI" : "AKTIF",
      custName, phone, custDetail: row.email,
      items: [{ desc: `${row.app_name} — paket ${row.package_type} (${row.devices} device)`, qty: 1, unit: "paket", price: row.sell_price, amount: row.sell_price }],
      dp: 0, paid: row.sell_price, total: row.sell_price, remaining,
      note: row.refund_amount > 0 ? `Refund sebesar ${formatIDR(row.refund_amount)} telah dikembalikan.` : `Masa aktif s/d ${row.end_date}.`,
    };
  }
  if (kind === "frame") {
    const row = await queryOne<{ id: number; order_no: string; customer_id: number | null; quantity: number; price: number; dp_amount: number; paid_amount: number; deadline: string | null; status: string; notes: string | null }>(
      "SELECT * FROM frame_orders WHERE id = ?", id);
    if (!row) return null;
    let custName = "-";
    let phone: string | null = null;
    if (row.customer_id) {
      const c = await queryOne<{ name: string; phone: string | null }>("SELECT name, phone FROM customers WHERE id = ?", row.customer_id);
      if (c) { custName = c.name; phone = c.phone; }
    }
    const total = row.price * row.quantity;
    return {
      kind, id, no: `INV-${row.order_no}`, businessName,
      date: new Date().toISOString().slice(0, 10), dueDate: row.deadline,
      status: row.paid_amount >= total ? "LUNAS" : row.paid_amount > 0 ? "DP" : "BELUM BAYAR",
      custName, phone, custDetail: "",
      items: [{ desc: `Pesanan bingkai ${row.notes ?? "custom"}`, qty: row.quantity, unit: "pcs", price: row.price, amount: total }],
      dp: row.dp_amount, paid: row.paid_amount, total, remaining: Math.max(0, total - row.paid_amount),
      note: row.notes ?? "",
    };
  }
  const row = await queryOne<{ id: number; project_no: string; client_name: string; service_type: string; business_type: string; description: string | null; price: number; dp_amount: number; paid_amount: number; deadline: string | null; event_date: string | null; event_location: string | null; event_type: string | null; status: string }>(
    "SELECT * FROM projects WHERE id = ?", id);
  if (!row) return null;
  const cust = await queryOne<{ phone: string | null }>("SELECT phone FROM customers WHERE name = ?", row.client_name);
  return {
    kind, id, no: `INV-${row.project_no}`, businessName,
    date: new Date().toISOString().slice(0, 10), dueDate: row.deadline ?? row.event_date,
    status: row.status === "cancelled" ? "BATAL" : row.paid_amount >= row.price ? "LUNAS" : row.paid_amount > 0 ? "DP" : "BELUM BAYAR",
    custName: row.client_name, phone: cust?.phone ?? null, custDetail: `${BIZ_LABEL[row.business_type] ?? row.business_type}${row.event_type ? " — " + row.event_type : ""}`,
    items: [{ desc: `${row.service_type}${row.event_location ? " — " + row.event_location : ""}`, qty: 1, unit: "paket", price: row.price, amount: row.price }],
    dp: row.dp_amount, paid: row.paid_amount, total: row.price, remaining: Math.max(0, row.price - row.paid_amount),
    note: row.description ?? "",
  };
}

export function invoiceWAText(inv: InvoiceData): string {
  const s = inv.businessName.toUpperCase();
  let lines = `*INVOICE ${inv.no}*\n`;
  lines += `*${s}*\n`;
  lines += "==================================\n";
  lines += `Tanggal  : ${inv.date}\n`;
  lines += `Kepada   : ${inv.custName}\n`;
  if (inv.custDetail) lines += `Akun/Paket: ${inv.custDetail}\n`;
  lines += "----------------------------------\n";
  for (const it of inv.items) lines += `${it.desc}\n ${it.qty} x ${formatIDR(it.price)} = *${formatIDR(it.amount)}*\n`;
  lines += "----------------------------------\n";
  if (inv.dp > 0) lines += `DP Terbayar: ${formatIDR(inv.dp)}\n`;
  lines += `Total     : *${formatIDR(inv.total)}*\n`;
  if (inv.remaining > 0) lines += `Sisa      : *${formatIDR(inv.remaining)}*\n`;
  lines += `Status    : *${inv.status}*\n`;
  lines += "----------------------------------\n";
  if (inv.note) lines += `Catatan: ${inv.note}\n`;
  lines += "*Terima kasih atas kepercayaan Anda!*\n";
  return lines;
}

export function waInvoiceLink(inv: InvoiceData, phone?: string): string {
  return waLink(invoiceWAText(inv), phone ?? inv.phone ?? undefined);
}