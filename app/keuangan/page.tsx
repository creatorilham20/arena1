import { PiggyBank, Landmark, Banknote, Smartphone, Wallet, ArrowDownCircle, ArrowUpCircle, Layers } from "lucide-react";
import { Card, StatCard, Badge, PageHeader, EmptyState, Td, Th, inputClass, type Tone } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import { getTransactions, storageBalances, type StorageBalance } from "@/lib/analytics";
import { formatIDR, formatDate } from "@/lib/format";
import { deleteStorage } from "@/app/actions";
import StorageForm, { type StorageInput } from "@/components/forms/storage-form";
import { TxTypePill } from "@/components/forms/transaction-form";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { label: string; icon: typeof Landmark; tone: Tone }> = {
  cash: { label: "Tunai / Cash", icon: Banknote, tone: "green" },
  bank: { label: "Rekening Bank", icon: Landmark, tone: "blue" },
  ewallet: { label: "E-Wallet", icon: Smartphone, tone: "violet" },
  other: { label: "Penyimpanan", icon: Wallet, tone: "slate" },
};

const ICON_CHIP: Record<Tone, string> = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  red: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

export default async function KeuanganPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const sel = typeof sp.s === "string" ? sp.s : "all";

  const balances = await storageBalances();
  const txns = await getTransactions();
  const active = balances.filter((b) => b.is_active === 1);
  const total = active.reduce((s, b) => s + b.balance, 0);
  const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const shown = sel === "all" ? txns : txns.filter((t) => t.storage === sel);

  return (
    <div className="space-y-6">
      <PageHeader title="Keuangan" description="Saldo uang berdasarkan tempat penyimpanan, sinkron otomatis dari transaksi" icon={<PiggyBank className="h-5 w-5" />}>
        <StorageForm />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Total Saldo" value={formatIDR(total)} icon={<Wallet className="h-4 w-4" />} tone="indigo" sub={`${active.length} penyimpanan aktif`} />
        <StatCard title="Total Masuk" value={formatIDR(income)} icon={<ArrowUpCircle className="h-4 w-4" />} tone="green" />
        <StatCard title="Total Keluar" value={formatIDR(expense)} icon={<ArrowDownCircle className="h-4 w-4" />} tone="red" />
        <StatCard title="Jenis Penyimpanan" value={String(active.length)} icon={<Layers className="h-4 w-4" />} tone="blue" sub="Cash, Bank & E-Wallet" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((b) => {
          const meta = TYPE_META[b.type] ?? TYPE_META.other;
          const Icon = meta.icon;
          return (
            <Card key={b.id || b.name} className={`p-4 ${b.is_active === 0 ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${ICON_CHIP[meta.tone]}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold">{b.name}</p>
              <p className="text-sm text-xs text-muted-foreground">{b.account_no || "\u00A0"}</p>
              <p className="mt-1 text-xl font-bold">
                {b.balance < 0 ? "-" : ""}{formatIDR(Math.abs(b.balance))}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Saldo awal {formatIDR(b.initial_balance)}</span>
                <span>Mutasi {formatIDR(b.income - b.expense - b.refund)}</span>
              </div>
              <div className="mt-3 flex justify-end gap-1.5">
                <StorageForm st={b as unknown as StorageInput} />
                {b.id > 0 && <DeleteButton action={deleteStorage} id={b.id} message={`Hapus penyimpanan "${b.name}"?`} />}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <form method="get" className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold">Mutasi Transaksi</h3>
          <select name="s" defaultValue={sel} className={`${inputClass} max-w-xs`}>
            <option value="all">Semua Penyimpanan</option>
            {balances.map((b) => <option key={b.id || b.name} value={b.name}>{b.name}</option>)}
          </select>
          <button type="submit" className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">Tampilkan</button>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Jenis</Th><Th>Deskripsi</Th><Th>Tanggal</Th><Th>Penyimpanan</Th><Th>Nominal</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.slice(0, 50).map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-muted/50">
                  <Td><TxTypePill type={t.type} /></Td>
                  <Td><p className="max-w-[220px] truncate">{t.description ?? "-"}</p></Td>
                  <Td>{formatDate(t.tx_date)}</Td>
                  <Td><Badge tone={t.storage === "Tunai" ? "green" : "blue"}>{t.storage ?? "Tunai"}</Badge></Td>
                  <Td><span className={`font-semibold ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{t.type === "income" ? "+" : "-"} {formatIDR(t.amount)}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown.length === 0 && <EmptyState title="Tidak ada transaksi" description="Transaksi yang masuk di sini akan otomatis memengaruhi saldo penyimpanan" />}
      </Card>
    </div>
  );
}