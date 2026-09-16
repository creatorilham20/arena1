import Link from "next/link";
import { Printer, MessageCircle, ArrowLeft, FileText } from "lucide-react";
import { buildInvoice, waInvoiceLink } from "@/lib/invoice";
import { formatIDR, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const type = (typeof sp.type === "string" ? sp.type : "project") as "premium" | "frame" | "project";
  const id = Number(typeof sp.id === "string" ? sp.id : "0");
  const inv = await buildInvoice(type, id);

  if (!inv) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">Data tidak ditemukan.</p>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← Kembali ke beranda</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 py-4">
      <div className="no-print flex items-center justify-between gap-2">
        <Link href={inv.kind === "premium" ? "/bisnis/premium" : inv.kind === "frame" ? "/bisnis/frame" : "/project"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
            <Printer className="h-4 w-4" /> Cetak / Save PDF
          </button>
          <a href={waInvoiceLink(inv)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl">
            <MessageCircle className="h-4 w-4" /> Kirim WA
          </a>
        </div>
      </div>

      <div className="invoice-sheet rounded-2xl bg-background p-6 shadow-lg ring-1 ring-border sm:p-10">
        <div className="flex items-start justify-between gap-4 border-b-2 border-foreground/10 pb-6">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{inv.businessName}</h1>
            <p className="mt-1 text-xs text-muted-foreground">Invoice tagihan otomatis — dicetak {formatDate(new Date().toISOString().slice(0, 10))}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">INVOICE</p>
            <p className="mt-1 text-sm font-bold">{inv.no}</p>
            <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${inv.remaining > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"}`}>
              {inv.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-border py-5 text-sm sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ditagih ke</p>
            <p className="mt-1 font-semibold">{inv.custName}</p>
            <p className="text-xs text-muted-foreground">{inv.custDetail}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tanggal</p>
            <p className="mt-1">{inv.date}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Jatuh Tempo</p>
            <p className="mt-1">{inv.dueDate ?? "-"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ref</p>
            <p className="mt-1">#{inv.id}</p>
          </div>
        </div>

        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2">Deskripsi</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Harga</th>
              <th className="py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inv.items.map((it, i) => (
              <tr key={i}>
                <td className="py-3">{it.desc}</td>
                <td className="py-3 text-center">{it.qty} {it.unit}</td>
                <td className="py-3 text-right">{formatIDR(it.price)}</td>
                <td className="py-3 text-right font-semibold">{formatIDR(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-full space-y-1.5 text-sm sm:w-64">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatIDR(inv.total)}</span></div>
            {inv.dp > 0 && <div className="flex justify-between text-muted-foreground"><span>DP</span><span>{formatIDR(inv.dp)}</span></div>}
            <div className="flex justify-between text-muted-foreground"><span>Sudah Dibayar</span><span>{formatIDR(inv.paid)}</span></div>
            <div className="flex justify-between border-t-2 border-foreground/10 pt-2 text-base font-bold">
              <span>{inv.remaining > 0 ? "Sisa Tagihan" : "Lunas"}</span>
              <span>{inv.remaining > 0 ? formatIDR(inv.remaining) : formatIDR(0)}</span>
            </div>
          </div>
        </div>

        {inv.note && <p className="mt-5 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">Catatan: {inv.note}</p>}
        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Terima kasih atas kepercayaan Anda 🤝</p>
          <p className="mt-1">{inv.businessName} — Pembayaran &gt; selesai, bukti transfer mohon dikirim via WA untuk verifikasi.</p>
        </div>
      </div>
      
    </div>
  );
}