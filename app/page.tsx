import Link from "next/link";
import {
  Wallet, TrendingUp, TrendingDown, Scale, FolderKanban, Timer, Smartphone, AlertTriangle, Landmark, ArrowUpRight,
} from "lucide-react";
import { Card, StatCard, Badge } from "@/components/ui/primitives";
import { BarChart, DonutChart } from "@/components/charts";
import { getAllBusinessSummary, getTransactions, calcFinance, projectStats, storageBalances } from "@/lib/analytics";
import { getBusinessMap, resolveBiz, businessHref } from "@/lib/business";
import { formatIDR, formatDate, daysLeft, monthName } from "@/lib/format";
import { queryAll } from "@/lib/db";
import DashboardClock from "@/components/dashboard-clock";
import DashboardCalendar from "@/components/dashboard-calendar";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [
    summary, allTx, projects, monthTx, storages, customerCount, bizMap, expiring, allPrem, allProj, allFrame,
  ] = await Promise.all([
    getAllBusinessSummary(),
    getTransactions(),
    projectStats(),
    getTransactions("all", month, year),
    storageBalances(),
    queryAll<{ c: number }>("SELECT COUNT(*) as c FROM customers"),
    getBusinessMap(),
    queryAll<{ id: number; app_name: string; end_date: string }>(
      "SELECT id, app_name, end_date FROM premium_accounts WHERE status = 'active' ORDER BY end_date ASC LIMIT 10"),
    queryAll<{ end_date: string }>("SELECT end_date FROM premium_accounts WHERE status = 'active' AND end_date IS NOT NULL"),
    queryAll<{ business_type: string; deadline: string | null; event_date: string | null }>(
      "SELECT business_type, deadline, event_date FROM projects"),
    queryAll<{ deadline: string | null }>("SELECT deadline FROM frame_orders WHERE deadline IS NOT NULL"),
  ]);

  const monthFin = calcFinance(monthTx);
  const activeStorages = storages.filter((s) => s.is_active === 1);
  const storageTotal = activeStorages.reduce((s, b) => s + b.balance, 0);

  const incomeByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, now.getMonth() - (5 - i), 1);
    const rows = allTx.filter((t) => {
      const [y, m] = (t.tx_date ?? "").slice(0, 10).split("-").map(Number);
      return y === d.getFullYear() && m === d.getMonth() + 1;
    });
    return {
      label: monthName(d.getMonth() + 1).slice(0, 3),
      income: rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0),
      expense: rows.filter((r) => r.type === "expense" || r.type === "refund").reduce((s, r) => s + r.amount, 0),
    };
  });

  const withDays = expiring.map((a) => ({ ...a, days: daysLeft(a.end_date) })).filter((a) => a.days !== null && a.days <= 7);

  const upcoming = projects.upcoming.slice(0, 5);
  const best = summary.byBusiness.reduce((b, x) => (x.revenue > b.revenue ? x : b), summary.byBusiness[0]);
  const customerTotal = customerCount[0]?.c ?? 0;

  const premiumColor = summary.byBusiness.find((b) => b.key === "premium")?.color ?? "#8b5cf6";
  const events: { date: string; color: string }[] = [];
  const addEvent = (date: string | null | undefined, color: string) => {
    if (!date) return;
    events.push({ date: date.slice(0, 10), color });
  };
  for (const a of allPrem) addEvent(a.end_date, premiumColor);
  for (const p of allProj) addEvent(p.deadline ?? p.event_date, resolveBiz(bizMap, p.business_type).color);
  for (const o of allFrame) addEvent(o.deadline, "#f59e0b");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Halo, Ilham 👋</h1>
        <p className="text-sm text-muted-foreground">Ringkasan seluruh bisnis Anda · {formatDate(now.toISOString())}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Link href="/laporan"><StatCard title="Total Omzet" value={formatIDR(summary.totalRevenue)} icon={<Wallet className="h-4 w-4" />} tone="indigo" sub={`Terbaik: ${best.label}`} /></Link>
        <Link href="/laporan"><StatCard title="Laba Bersih" value={formatIDR(summary.totalProfit)} icon={<TrendingUp className="h-4 w-4" />} tone="green" sub={`${best.label} paling untung`} /></Link>
        <Link href="/transaksi"><StatCard title="Pengeluaran" value={formatIDR(summary.totalExpense)} icon={<TrendingDown className="h-4 w-4" />} tone="red" /></Link>
        <Link href="/transaksi"><StatCard title="Saldo Kas" value={formatIDR(summary.balance)} icon={<Scale className="h-4 w-4" />} tone="amber" /></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Link href="/transaksi"><StatCard title="Piutang" value={formatIDR(summary.receivableOpen)} icon={<Landmark className="h-4 w-4" />} tone="blue" sub="Project + tercatat" /></Link>
        <Link href="/project"><StatCard title="Project Aktif" value={summary.activeProjects} icon={<FolderKanban className="h-4 w-4" />} tone="indigo" sub="Semua lini" /></Link>
        <Link href="/bisnis/premium"><StatCard title="Akun Akan Expired" value={summary.expiringAccounts} icon={<Timer className="h-4 w-4" />} tone="red" sub="Dalam 7 hari" /></Link>
        <Link href="/sop"><StatCard title="Lini Bisnis" value={`${summary.byBusiness.length} Bisnis`} icon={<Smartphone className="h-4 w-4" />} tone="violet" sub="Kelola di SOP Bisnis" /></Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2"><DashboardClock /></Card>
        <div className="lg:col-span-3"><DashboardCalendar events={events} /></div>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Penyimpanan Keuangan</h3>
          <Link href="/keuangan" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">Kelola →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {activeStorages.map((s) => (
            <div key={s.id} className="rounded-xl bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">{s.name}</p>
              <p className={`mt-1 truncate text-sm font-bold ${s.balance < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>{formatIDR(s.balance)}</p>
            </div>
          ))}
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-3 text-white shadow-lg shadow-indigo-500/25">
            <p className="text-xs font-medium opacity-80">Total Uang</p>
            <p className="mt-1 truncate text-sm font-bold">{formatIDR(storageTotal)}</p>
          </div>
        </div>
      </Card>

      {(withDays.length > 0 || upcoming.length > 0) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {withDays.length > 0 && (
            <Card className="border-rose-200 p-4 dark:border-rose-500/30">
              <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-500" /><h3 className="text-sm font-semibold">Akun Premium Segera Expired</h3></div>
              <div className="space-y-2">
                {withDays.map((a) => (
                  <Link key={a.id} href="/bisnis/premium" className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm transition-colors hover:bg-border">
                    <span className="font-medium">{a.app_name}</span>
                    <Badge tone={a.days! <= 1 ? "red" : a.days! <= 3 ? "amber" : "indigo"}>H-{a.days} · {formatDate(a.end_date)}</Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}
          {upcoming.length > 0 && (
            <Card className="border-rose-200 p-4 dark:border-rose-500/30">
              <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-500" /><h3 className="text-sm font-semibold">Deadline Project Terdekat</h3></div>
              <div className="space-y-2">
                {upcoming.map((p) => (
                  <Link key={p.id} href="/project" className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm transition-colors hover:bg-border">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.client_name}</p>
                      <p className="text-xs text-muted-foreground">{resolveBiz(bizMap, p.business_type).name}</p>
                    </div>
                    <Badge tone={p.daysLeft! <= 1 ? "red" : p.daysLeft! <= 3 ? "amber" : "indigo"}>H-{p.daysLeft}</Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Grafik 6 Bulan Terakhir</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Pemasukan</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />Pengeluaran</span>
            </div>
          </div>
          <div className="space-y-4">
            <BarChart data={incomeByMonth.map((m) => ({ label: m.label, value: m.income }))} color="#6366f1" height={130} />
            <BarChart data={incomeByMonth.map((m) => ({ label: m.label, value: m.expense }))} color="#fb7185" height={70} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Komposisi Omzet per Bisnis</h3>
          <DonutChart data={summary.byBusiness.map((b) => ({ label: b.label, value: b.revenue, color: b.color }))} />
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Bisnis Anda</h3>
          <Link href="/bisnis" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">Lihat semua</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summary.byBusiness.map((b) => (
            <Link key={b.key} href={businessHref(b.key)}>
              <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${b.color}20`, color: b.color }}>
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: b.color }} />
                </div>
                <p className="mt-3 text-sm font-semibold">{b.label}</p>
                <p className="text-lg font-bold" style={{ color: b.color }}>{formatIDR(b.revenue)}</p>
                <p className={`mt-0.5 text-xs ${b.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>Laba: {formatIDR(b.profit)}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Ringkasan {monthName(month)}</h3>
          <Link href="/laporan" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">Laporan →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Pemasukan</p><p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(monthFin.income)}</p></div>
          <div><p className="text-xs text-muted-foreground">Pengeluaran</p><p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">{formatIDR(monthFin.expense)}</p></div>
          <div><p className="text-xs text-muted-foreground">Laba</p><p className="mt-1 text-lg font-bold">{formatIDR(monthFin.income - monthFin.expense)}</p></div>
          <div><p className="text-xs text-muted-foreground">Pelanggan</p><p className="mt-1 text-lg font-bold">{customerTotal}</p></div>
        </div>
      </Card>
    </div>
  );
}