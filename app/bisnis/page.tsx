import Link from "next/link";
import { ArrowUpRight, Briefcase } from "lucide-react";
import { Card, Badge, EmptyState } from "@/components/ui/primitives";
import { getAllBusinessSummary } from "@/lib/analytics";
import { getBusinessOptions, businessHref } from "@/lib/business";
import { LINE_ICONS } from "@/lib/sop-meta";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BisnisPage() {
  const summary = await getAllBusinessSummary();
  const options = await getBusinessOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bisnis Anda</h1>
        <p className="mt-1 text-sm text-muted-foreground">{options.length} lini usaha dalam satu kendali</p>
      </div>

      {options.length === 0 ? (
        <Card className="p-6">
          <EmptyState title="Belum ada lini bisnis" description="Tambahkan lini bisnis pertama lewat menu SOP Bisnis" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {options.map((b) => {
            const data = summary.byBusiness.find((s) => s.key === b.slug) ?? { revenue: 0, profit: 0 };
            const Icon = LINE_ICONS[b.icon] ?? Briefcase;
            return (
              <Link key={b.slug} href={businessHref(b.slug)}>
                <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: b.color }} />
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}cc)` }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <h2 className="mt-3 text-base font-semibold">{b.name}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.description || "Lini bisnis aktif"}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                    <div><p className="text-[11px] text-muted-foreground">Omzet</p><p className="text-base font-bold" style={{ color: b.color }}>{formatIDR(data.revenue)}</p></div>
                    <div><p className="text-[11px] text-muted-foreground">Laba</p><p className={`text-base font-bold ${data.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{formatIDR(data.profit)}</p></div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {summary.byBusiness.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Perbandingan Bisnis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Bisnis</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Omzet</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Laba</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Marjin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.byBusiness.map((b) => (
                  <tr key={b.key}>
                    <td className="px-2 py-2.5 font-medium">
                      <Badge style={{ backgroundColor: `${b.color}20`, color: b.color, borderColor: `${b.color}55` }}>{b.label}</Badge>
                    </td>
                    <td className="px-2 py-2.5 text-right font-medium">{formatIDR(b.revenue)}</td>
                    <td className={`px-2 py-2.5 text-right font-semibold ${b.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>{formatIDR(b.profit)}</td>
                    <td className="px-2 py-2.5 text-right text-muted-foreground">{b.revenue > 0 ? `${Math.round((b.profit / b.revenue) * 100)}%` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}