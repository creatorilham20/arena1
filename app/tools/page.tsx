import Link from "next/link";
import {
  Store, Tag, MessageSquareText, Calculator, ShieldCheck, ArrowUpRight,
} from "lucide-react";
import { Card, PageHeader } from "@/components/ui/primitives";

const TOOLS = [
  {
    href: "/harga",
    label: "List Harga",
    description: "Daftar harga jual per layanan & produk untuk 4 lini bisnis, mudah dicopy ke WA.",
    icon: Tag,
    tone: "from-indigo-500 to-violet-600 shadow-indigo-500/30",
  },
  {
    href: "/layanan",
    label: "Template Layanan",
    description: "Template pesan copy-paste untuk penawaran premium apps, editing, frame & dokumentasi.",
    icon: MessageSquareText,
    tone: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  },
  {
    href: "/kalkulator",
    label: "Kalkulator Bisnis",
    description: "Hitung harga jual, HPP, BEP, dan simulasi refund/cadangan garansi secara instan.",
    icon: Calculator,
    tone: "from-amber-500 to-orange-600 shadow-amber-500/30",
  },
  {
    href: "/garansi",
    label: "Klaim Garansi",
    description: "Catat & selesaikan klaim garansi untuk akun premium dan produk frame.",
    icon: ShieldCheck,
    tone: "from-rose-500 to-pink-600 shadow-rose-500/30",
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alat & Template"
        description="Kumpulan alat bantu harian untuk mengelola bisnis, lengkap dengan template siap pakai."
        icon={<Store className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <Card className={`h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl`}>
              <div className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tool.tone}`}>
                  <tool.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold">{tool.label}</h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-muted/50 p-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tips</h3>
        <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
          <li>Gunakan <b>List Harga</b> untuk menjawab &quot;berapakah harganya?&quot; dalam hitungan detik.</li>
          <li>Salin template dari <b>Template Layanan</b> lalu edit nomor WA & detailnya sesuai klien.</li>
          <li>Cek <b>Kalkulator</b> sebelum menentukan margin agar tidak jual rugi.</li>
          <li>Catat semua <b>Klaim Garansi</b> agar tahu jumlah refund/cadangan yang harus disisihkan.</li>
        </ul>
      </Card>
    </div>
  );
}