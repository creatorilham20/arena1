import { Tag } from "lucide-react";
import { Card, PageHeader, EmptyState, inputClass } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import { queryAll } from "@/lib/db";
import { getBusinessOptions, getBusinessMap } from "@/lib/business";
import { formatIDR } from "@/lib/format";
import { deletePriceItem } from "@/app/actions";
import PriceForm, { PriceInput, PriceBadge } from "@/components/forms/price-form";

export const dynamic = "force-dynamic";

interface Row {
  id: number; business_type: string; item_name: string; category: string | null;
  price: number; unit: string; note: string | null;
}

export default async function HargaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const biz = typeof sp.business === "string" ? sp.business : "all";

  const [options, bizMap] = await Promise.all([getBusinessOptions(), getBusinessMap()]);
  const optionList = options.map((b) => ({ value: b.slug, label: b.name }));
  const badgeMap: Record<string, { name: string; color: string }> = {};
  for (const b of options) badgeMap[b.slug] = { name: b.name, color: b.color };

  const all = await queryAll<Row>("SELECT * FROM price_list ORDER BY business_type, item_name");
  let items = all.filter((x) => (biz === "all" ? true : x.business_type === biz) && (!q || `${x.item_name} ${x.category ?? ""}`.toLowerCase().includes(q)));

  const toForm = (r: Row): PriceInput => ({ id: r.id, business_type: r.business_type, item_name: r.item_name, category: r.category ?? undefined, price: r.price, unit: r.unit, note: r.note ?? undefined });

  return (
    <div className="space-y-6">
      <PageHeader title="List Harga" description="Daftar harga barang & jasa untuk semua lini bisnis" icon={<Tag className="h-5 w-5" />}>
        <PriceForm bizOptions={optionList} />
      </PageHeader>

      <Card className="p-4">
        <form method="get" className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <select name="business" defaultValue={biz} className={inputClass}>
            <option value="all">Semua Bisnis</option>
            {optionList.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <input type="text" name="q" defaultValue={q} placeholder="Cari nama harga..." className={inputClass} />
          <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Terapkan</button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-up">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{r.item_name}</p>
                <PriceBadge business={r.business_type} bizMap={badgeMap} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.category ?? "Tanpa kategori"}{r.note ? ` · ${r.note}` : ""}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="text-right">
                <p className="font-bold text-indigo-600 dark:text-indigo-400">{formatIDR(r.price)}</p>
                <p className="text-[10px] text-muted-foreground">/ {r.unit}</p>
              </div>
              <PriceForm item={toForm(r)} bizOptions={optionList} />
              <DeleteButton action={deletePriceItem} id={r.id} message={`Hapus harga ${r.item_name}?`} />
            </div>
          </Card>
        ))}
      </div>
      {items.length === 0 && <EmptyState title="Belum ada item harga" description="Tambahkan harga barang/jasa dari tiap lini bisnis" />}
    </div>
  );
}