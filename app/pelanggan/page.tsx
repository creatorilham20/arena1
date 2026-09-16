import { Users, Search } from "lucide-react";
import { Card, StatCard, PageHeader, EmptyState, inputClass } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import { queryAll } from "@/lib/db";
import { deleteCustomer } from "@/app/actions";
import CustomerForm, { CustomerInput } from "@/components/forms/customer-form";

export const dynamic = "force-dynamic";

interface Row {
  id: number; name: string; phone: string | null; email: string | null; address: string | null;
  notes: string | null; premium_count: number; project_count: number; frame_count: number;
}

export default async function PelangganPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  let sql = `SELECT c.*, COUNT(DISTINCT pa.id) as premium_count, COUNT(DISTINCT p.id) as project_count, COUNT(DISTINCT fo.id) as frame_count
    FROM customers c
    LEFT JOIN premium_accounts pa ON pa.customer_id = c.id
    LEFT JOIN frame_orders fo ON fo.customer_id = c.id
    LEFT JOIN projects p ON p.client_name = c.name
    GROUP BY c.id`;
  const params: (string|number)[] = [];
  if (q) { sql += " HAVING (LOWER(c.name) LIKE ? OR LOWER(c.phone) LIKE ? OR LOWER(c.email) LIKE ?)"; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += " ORDER BY c.name ASC";

  const customers = await queryAll<Row>(sql, ...params);
  const total = (await queryAll<{ c: number }>("SELECT COUNT(*) as c FROM customers"))[0]?.c ?? 0;
  const active = (await queryAll<{ c: number }>(`SELECT COUNT(DISTINCT c.id) as c FROM customers c
    WHERE EXISTS (SELECT 1 FROM premium_accounts pa WHERE pa.customer_id = c.id)
       OR EXISTS (SELECT 1 FROM frame_orders fo WHERE fo.customer_id = c.id)
       OR EXISTS (SELECT 1 FROM projects p WHERE p.client_name = c.name)`))[0]?.c ?? 0;

  const toForm = (c: Row): CustomerInput => ({ id: c.id, name: c.name, phone: c.phone ?? undefined, email: c.email ?? undefined, address: c.address ?? undefined, notes: c.notes ?? undefined });

  return (
    <div className="space-y-6">
      <PageHeader title="Pelanggan" description="Database seluruh pelanggan & klien" icon={<Users className="h-5 w-5" />}>
        <CustomerForm />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Total Pelanggan" value={total} icon={<Users className="h-4 w-4" />} tone="indigo" />
        <StatCard title="Aktif (punya transaksi)" value={active} icon={<Users className="h-4 w-4" />} tone="green" />
      </div>

      <Card className="p-4">
        <form method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" name="q" defaultValue={q} placeholder="Cari nama, HP, atau email..." className={`${inputClass} pl-9`} />
          </div>
          <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Cari</button>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <Card key={c.id} className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-up">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">{c.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.email ?? "Tanpa email"}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {c.phone && <p>HP: {c.phone}</p>}
              {c.address && <p>Alamat: {c.address}</p>}
              {c.notes && <p>Catatan: {c.notes}</p>}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
              <div className="text-center"><p className="text-lg font-bold text-violet-600 dark:text-violet-400">{c.premium_count}</p><p className="text-[10px] text-muted-foreground">Premium</p></div>
              <div className="text-center"><p className="text-lg font-bold text-blue-600 dark:text-blue-400">{c.project_count}</p><p className="text-[10px] text-muted-foreground">Project</p></div>
              <div className="text-center"><p className="text-lg font-bold text-amber-600 dark:text-amber-400">{c.frame_count}</p><p className="text-[10px] text-muted-foreground">Frame</p></div>
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-1.5">
              <CustomerForm customer={toForm(c)} />
              <DeleteButton action={deleteCustomer} id={c.id} message={`Hapus pelanggan ${c.name}?`} />
            </div>
          </Card>
        ))}
      </div>
      {customers.length === 0 && <EmptyState title="Tidak ada pelanggan" description="Sesuaikan filter atau tambah pelanggan baru" />}
    </div>
  );
}