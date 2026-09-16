import Link from "next/link";
import { FileText } from "lucide-react";

export default function InvoiceButton({ kind, id, label }: { kind: "premium" | "frame" | "project"; id: number; label?: string }) {
  return (
    <Link href={`/invoice?type=${kind}&id=${id}`} title="Buat & kirim invoice"
      className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
      <FileText className="h-3.5 w-3.5" />
      {label ?? "Invoice"}
    </Link>
  );
}