import { Smartphone, DollarSign, TrendingUp, TrendingDown, Timer } from "lucide-react";
import { Card, StatCard, Badge, PageHeader, EmptyState, Td, Th } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import InvoiceButton from "@/components/invoice-button";
import WarrantyClaimForm from "@/components/forms/warranty-form";
import { queryAll } from "@/lib/db";
import { premiumStats } from "@/lib/analytics";
import { formatIDR, formatDate, daysLeft } from "@/lib/format";
import { deletePremiumAccount } from "@/app/actions";
import PremiumForm, { PremiumInput } from "@/components/forms/premium-form";

export const dynamic = "force-dynamic";

interface Row {
  id: number; app_name: string; email: string; password_acc: string | null; package_type: string;
  buy_price: number; sell_price: number; start_date: string; end_date: string; devices: number;
  status: string; customer_id: number | null; refund_amount: number; refund_reason: string | null;
  notes: string | null; customer_name: string | null;
}

export default async function PremiumPage() {
  const accounts = await queryAll<Row>(`SELECT pa.*, c.name as customer_name FROM premium_accounts pa
     LEFT JOIN customers c ON c.id = pa.customer_id ORDER BY pa.status = 'active' DESC, pa.end_date ASC`);
  const stats = await premiumStats();
  const customers = await queryAll<{ id: number; name: string }>("SELECT id, name FROM customers ORDER BY name");

  const toForm = (a: Row): PremiumInput => ({
    id: a.id, app_name: a.app_name, email: a.email, password_acc: a.password_acc ?? undefined,
    package_type: a.package_type, buy_price: a.buy_price, sell_price: a.sell_price,
    start_date: a.start_date, end_date: a.end_date, devices: a.devices, status: a.status,
    customer_id: a.customer_id, refund_amount: a.refund_amount, refund_reason: a.refund_reason ?? undefined, notes: a.notes ?? undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Premium Apps" description="Kelola akun aplikasi premium, langganan, modal & keuntungan" icon={<Smartphone className="h-5 w-5" />}>
        <PremiumForm customers={customers} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Akun Aktif" value={stats.active.length} icon={<Smartphone className="h-4 w-4" />} tone="violet" sub={`${stats.expired.length} expired`} />
        <StatCard title="Total Omzet" value={formatIDR(stats.revenue)} icon={<DollarSign className="h-4 w-4" />} tone="green" />
        <StatCard title="Modal" value={formatIDR(stats.capital)} icon={<TrendingDown className="h-4 w-4" />} tone="amber" />
        <StatCard title="Keuntungan" value={formatIDR(stats.profit)} icon={<TrendingUp className="h-4 w-4" />} tone="indigo" sub={`Refund: ${formatIDR(stats.refunds)}`} />
      </div>

      {stats.expiringSoonCount > 0 && (
        <Card className="border-amber-200 p-4 dark:border-amber-500/30">
          <div className="flex items-center gap-2"><Timer className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold">{stats.expiringSoonCount} akun akan expired dalam 7 hari. Klik Perpanjang untuk renewal.</h3></div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Aplikasi</Th><Th>Pelanggan</Th><Th>Paket</Th><Th>Masa Aktif</Th><Th>Sisa Hari</Th><Th>Modal</Th><Th>Jual</Th><Th>Laba</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.map((a) => {
                const days = daysLeft(a.end_date);
                const profit = a.sell_price - a.buy_price - a.refund_amount;
                const active = a.status === "active";
                return (
                  <tr key={a.id} className="transition-colors hover:bg-muted/50">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-violet-500/10 text-violet-500" : "bg-slate-500/10 text-slate-500"}`}><Smartphone className="h-3.5 w-3.5" /></span>
                        <div><p className="font-medium">{a.app_name}</p><p className="text-xs text-muted-foreground">{a.email}</p></div>
                      </div>
                    </Td>
                    <Td><span>{a.customer_name ?? "-"}</span><p className="text-xs text-muted-foreground">{a.devices} perangkat</p></Td>
                    <Td><Badge tone="slate">{a.package_type}</Badge></Td>
                    <Td><p className="whitespace-normal">{formatDate(a.start_date)} <span className="text-muted-foreground">→</span> {formatDate(a.end_date)}</p></Td>
                    <Td>{active && days !== null ? <Badge tone={days <= 1 ? "red" : days <= 3 ? "amber" : days <= 7 ? "indigo" : "green"}>{days <= 0 ? "Hari ini" : `H-${days}`}</Badge> : <Badge tone="red">Expired</Badge>}</Td>
                    <Td className="text-rose-600 dark:text-rose-400">{formatIDR(a.buy_price)}</Td>
                    <Td className="text-emerald-600 dark:text-emerald-400">{formatIDR(a.sell_price)}</Td>
                    <Td className="font-semibold">{formatIDR(profit)}</Td>
                    <Td>
                      <div className="flex flex-wrap justify-end items-center gap-1.5">
                        <PremiumForm customers={customers} account={toForm(a)} />
                        <InvoiceButton kind="premium" id={a.id} label="Invoice" />
                        <WarrantyClaimForm accountId={a.id} appName={a.app_name} />
                        <DeleteButton action={deletePremiumAccount} id={a.id} message={`Hapus akun ${a.app_name}?`} />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && <EmptyState title="Belum ada akun premium" description="Klik Tambah Akun untuk mulai mencatat" />}
      </Card>
    </div>
  );
}