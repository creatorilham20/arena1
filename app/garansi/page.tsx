import { ShieldCheck } from "lucide-react";
import { Card, StatCard, PageHeader, EmptyState, Td, Th } from "@/components/ui/primitives";
import { queryAll } from "@/lib/db";
import { formatIDR, formatDate } from "@/lib/format";
import { WarrantyBadge, ResolveClaimForm } from "@/components/forms/warranty-form";

export const dynamic = "force-dynamic";

interface ClaimRow {
  id: number; account_id: number; app_name: string; sell_price: number; warranty_end: string | null;
  claim_date: string; issue: string; status: string; resolution_date: string | null; resolution_note: string | null;
  customer_name: string | null; customer_phone: string | null;
}

export default async function GaransiPage() {
  const rows = await queryAll<ClaimRow>(`SELECT wc.*, pa.app_name, pa.sell_price, pa.warranty_end, c.name as customer_name, c.phone as customer_phone
    FROM warranty_claims wc
    LEFT JOIN premium_accounts pa ON pa.id = wc.account_id
    LEFT JOIN customers c ON c.id = pa.customer_id
    ORDER BY wc.status = 'pending' DESC, wc.claim_date DESC`);

  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;
  const onWarranty = ((await queryAll<{ c: number }>("SELECT COUNT(*) as c FROM premium_accounts WHERE status = 'active' AND warranty_end >= CURRENT_DATE::text"))[0]?.c ?? 0) as number;

  return (
    <div className="space-y-6">
      <PageHeader title="Klaim Garansi" description="Kelola klaim garansi akun premium" icon={<ShieldCheck className="h-5 w-5" />} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Pending" value={pending} icon={<ShieldCheck className="h-4 w-4" />} tone="amber" />
        <StatCard title="Disetujui (Ganti)" value={approved} icon={<ShieldCheck className="h-4 w-4" />} tone="red" />
        <StatCard title="Ditolak" value={rejected} icon={<ShieldCheck className="h-4 w-4" />} tone="slate" />
        <StatCard title="Akun Masih Masa Garansi" value={onWarranty} icon={<ShieldCheck className="h-4 w-4" />} tone="green" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Akun</Th><Th>Pelanggan</Th><Th>Klaim</Th><Th>Kendala</Th><Th>Garansi s/d</Th><Th>Status</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-muted/50">
                  <Td><p className="font-medium">{r.app_name}</p><p className="text-xs text-muted-foreground">{formatIDR(r.sell_price)}</p></Td>
                  <Td>
                    <p>{r.customer_name ?? "-"}</p>
                    {r.customer_phone && <p className="text-xs text-muted-foreground">{r.customer_phone}</p>}
                  </Td>
                  <Td>{formatDate(r.claim_date)}</Td>
                  <Td><p className="max-w-[220px] truncate" title={r.issue}>{r.issue}</p></Td>
                  <Td>{r.warranty_end ? formatDate(r.warranty_end) : "-"}</Td>
                  <Td>
                    <WarrantyBadge status={r.status} />
                    <span className="mt-1 block text-xs text-muted-foreground">{r.resolution_note}</span>
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      {r.status === "pending" && <ResolveClaimForm claimId={r.id} />}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <EmptyState title="Belum ada klaim garansi" description="Klaim tampil di sini saat pelanggan mengajukan garansi akun premium" />}
      </Card>
    </div>
  );
}