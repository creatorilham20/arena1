import { ArrowLeftRight, Search, ArrowDownCircle, ArrowUpCircle, RotateCcw, Landmark, Wallet } from "lucide-react";
import { Card, StatCard, Badge, ColorPill, PageHeader, EmptyState, Td, Th, inputClass } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import { queryAll } from "@/lib/db";
import { calcFinance, getStorages, type TxRow } from "@/lib/analytics";
import { getBusinessOptions, getBusinessMap, resolveBiz } from "@/lib/business";
import { formatIDR, formatDate, monthName } from "@/lib/format";
import { deleteTransaction } from "@/app/actions";
import TransactionForm, { TxTypePill, TransactionInput, ClaimReceivableButton, PayDebtButton } from "@/components/forms/transaction-form";

export const dynamic = "force-dynamic";

export default async function TransaksiPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" ? sp.type : "all";
  const business = typeof sp.business === "string" ? sp.business : "all";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const month = typeof sp.month === "string" ? sp.month : "";
  const year = typeof sp.year === "string" ? sp.year : "";
  const storage = typeof sp.storage === "string" ? sp.storage : "all";

  const [bizOptions, bizMap] = await Promise.all([getBusinessOptions(), getBusinessMap()]);
  const optionList = [{ value: "general", label: "Umum" }, ...bizOptions.map((b) => ({ value: b.slug, label: b.name }))];

  let sql = "SELECT * FROM transactions WHERE 1=1";
  const params: (string|number)[] = [];
  if (type !== "all") { sql += " AND type = ?"; params.push(type); }
  if (business !== "all") { sql += " AND business_type = ?"; params.push(business); }
  if (storage !== "all") { sql += " AND storage = ?"; params.push(storage); }
  if (q) { sql += " AND (LOWER(description) LIKE ? OR LOWER(category) LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }
  if (month && year) { sql += " AND substr(tx_date,1,7) = ?"; params.push(`${year}-${month}`); }
  sql += " ORDER BY tx_date DESC, id DESC";

  const rows = await queryAll<TxRow>(sql, ...params);
  const allRows = await queryAll<TxRow>("SELECT * FROM transactions");
  const fin = calcFinance(allRows);
  const storages = await getStorages();

  const filtered = calcFinance(rows);
  const filteredActive = !!(month && year) || q || type !== "all" || business !== "all" || storage !== "all";

  return (
    <div className="space-y-6">
      <PageHeader title="Transaksi" description="Pemasukan, pengeluaran, refund, hutang & piutang" icon={<ArrowLeftRight className="h-5 w-5" />}>
        <TransactionForm storages={storages} bizOptions={optionList} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Pemasukan" value={formatIDR(filteredActive ? filtered.income : fin.income)} icon={<ArrowUpCircle className="h-4 w-4" />} tone="green" />
        <StatCard title="Pengeluaran" value={formatIDR(filteredActive ? filtered.expense : fin.expense)} icon={<ArrowDownCircle className="h-4 w-4" />} tone="red" />
        <StatCard title="Saldo Kas" value={formatIDR(filteredActive ? filtered.balance : fin.balance)} icon={<Wallet className="h-4 w-4" />} tone="indigo" />
        <StatCard title="Refund" value={formatIDR(filteredActive ? filtered.refund : fin.refund)} icon={<RotateCcw className="h-4 w-4" />} tone="amber" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Piutang (Belum Dibayar)" value={formatIDR(fin.receivableOpen)} icon={<Landmark className="h-4 w-4" />} tone="blue" sub={`${fin.receivable} total tercatat`} />
        <StatCard title="Hutang (Belum Dibayar)" value={formatIDR(fin.debtOpen)} icon={<Wallet className="h-4 w-4" />} tone="amber" sub={`${fin.debt} total tercatat`} />
      </div>

      <Card className="p-4">
        <form method="get" className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <select name="type" defaultValue={type} className={inputClass}>
            <option value="all">Semua Jenis</option>
            <option value="income">Pemasukan</option><option value="expense">Pengeluaran</option>
            <option value="receivable">Piutang</option><option value="debt">Hutang</option><option value="refund">Refund</option>
          </select>
          <select name="business" defaultValue={business} className={inputClass}>
            <option value="all">Semua Bisnis</option>
            {optionList.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <select name="storage" defaultValue={storage} className={inputClass}>
            <option value="all">Semua Penyimpanan</option>
            {storages.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select name="month" defaultValue={month} className={inputClass}>
            <option value="">Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={String(m).padStart(2, "0")}>{monthName(m)}</option>)}
          </select>
          <select name="year" defaultValue={year} className={inputClass}>
            <option value="">Semua Tahun</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Terapkan Filter</button>
        </form>
        <form method="get" className="mt-3 flex gap-2">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="business" value={business} />
          <input type="hidden" name="storage" value={storage} />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" name="q" defaultValue={q} placeholder="Cari transaksi..." className={`${inputClass} pl-9`} />
          </div>
          <button type="submit" className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">Cari</button>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Jenis</Th><Th>Bisnis</Th><Th>Kategori</Th><Th>Deskripsi</Th><Th>Tanggal</Th><Th>Penyimpanan</Th><Th>Status</Th><Th>Nominal</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-muted/50">
                  <Td><TxTypePill type={t.type} /></Td>
                  <Td>{(() => { const m = resolveBiz(bizMap, t.business_type); return <ColorPill label={m.name} color={m.color} />; })()}</Td>
                  <Td>{t.category ?? "-"}</Td>
                  <Td><p className="max-w-[200px] truncate">{t.description ?? "-"}</p></Td>
                  <Td>{formatDate(t.tx_date)}</Td>
                  <Td>{t.storage ? <Badge tone={t.storage === "Tunai" ? "green" : t.storage === "BRI" || t.storage === "SEABANK" ? "blue" : t.storage === "DANA" ? "violet" : "slate"}>{t.storage}</Badge> : <Badge tone="slate">-</Badge>}</Td>
                  <Td>{t.status === "paid" ? <Badge tone="green">Lunas</Badge> : t.type === "receivable" && t.status !== "paid" ? <Badge tone="blue">Belum dibayar</Badge> : t.type === "debt" && t.status !== "paid" ? <Badge tone="amber">Belum dibayar</Badge> : <Badge tone="slate">Selesai</Badge>}</Td>
                  <Td>
                    <span className={`font-semibold ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : t.type === "expense" || t.type === "refund" ? "text-rose-600 dark:text-rose-400" : t.type === "receivable" ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {t.type === "income" || t.type === "receivable" ? "+" : "-"} {formatIDR(t.amount)}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap justify-end items-center gap-1.5">
                      {t.type === "receivable" && t.status !== "paid" && <ClaimReceivableButton id={t.id} />}
                      {t.type === "debt" && t.status !== "paid" && <PayDebtButton id={t.id} />}
                      <TransactionForm tx={t as unknown as TransactionInput} storages={storages} bizOptions={optionList} />
                      <DeleteButton action={deleteTransaction} id={t.id} message={`Hapus transaksi ${formatIDR(t.amount)}?`} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <EmptyState title="Tidak ada transaksi" description="Sesuaikan filter atau tambah transaksi baru" />}
      </Card>
    </div>
  );
}