import { FileBarChart, TrendingUp, DollarSign, TrendingDown, BarChart3, MessageCircle, FileSpreadsheet } from "lucide-react";
import { Card, StatCard, PageHeader, inputClass } from "@/components/ui/primitives";
import { BarChart, DonutChart } from "@/components/charts";
import { queryAll } from "@/lib/db";
import { getTransactions, calcFinance } from "@/lib/analytics";
import { getBusinessOptions } from "@/lib/business";
import { formatIDR, monthName } from "@/lib/format";
import { reportWALink } from "@/lib/report";

export const dynamic = "force-dynamic";

const DONUT_COLORS = ["#8b5cf6", "#3b82f6", "#f59e0b", "#f43f5e"];

export default async function LaporanPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const now = new Date();
  const currentMonth = Number(sp.month) || now.getMonth() + 1;
  const currentYear = Number(sp.year) || now.getFullYear();
  const biz = typeof sp.business === "string" ? sp.business : "all";
  const mode = typeof sp.mode === "string" ? sp.mode : "monthly";

  const [options, [rows, yearRows]] = await Promise.all([
    getBusinessOptions(),
    Promise.all([
      getTransactions(biz !== "all" ? biz : undefined, currentMonth, currentYear),
      getTransactions(biz !== "all" ? biz : undefined, undefined, currentYear),
    ]),
  ]);

  const thisMonthLabel = `${monthName(currentMonth)} ${currentYear}`;
  const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
  const lastMonthLabel = `${monthName(lastMonthDate.getMonth() + 1)} ${lastMonthDate.getFullYear()}`;

  const fin = calcFinance(rows);
  const yearFin = calcFinance(yearRows);

  const reportPeriods = [
    { k: "last7", label: "7 Hari Terakhir" },
    { k: "thisweek", label: "Minggu Ini" },
    { k: "thismonth", label: thisMonthLabel },
    { k: "lastmonth", label: lastMonthLabel },
    { k: "thisyear", label: `Tahun ${currentYear}` },
  ];
  const reportRows = await Promise.all(reportPeriods.map(async (r) => ({
    ...r,
    waHref: await reportWALink(r.k, biz, currentMonth, currentYear),
    csvHref: `/api/report/csv?p=${r.k}&b=${biz}&m=${currentMonth}&y=${currentYear}`,
  })));

  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
    const dayTx = rows.filter((r) => r.tx_date?.startsWith(dateStr));
    return {
      label: String(i + 1),
      income: dayTx.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0),
      expense: dayTx.filter((r) => r.type === "expense" || r.type === "refund").reduce((s, r) => s + r.amount, 0),
    };
  }).filter((d) => d.income > 0 || d.expense > 0);

  const expenseCat = new Map<string, number>();
  rows.filter((r) => r.type === "expense" || r.type === "refund").forEach((r) => {
    const cat = r.category || "Lainnya";
    expenseCat.set(cat, (expenseCat.get(cat) ?? 0) + r.amount);
  });
  const expenseCategories = Array.from(expenseCat.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  const bizRev = options.map((b) => {
    const bRows = yearRows.filter((r) => r.business_type === b.slug);
    return {
      key: b.slug,
      label: b.name,
      color: b.color,
      revenue: bRows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0),
      expense: bRows.filter((r) => r.type === "expense" || r.type === "refund").reduce((s, r) => s + r.amount, 0),
    };
  });

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Keuangan" description="Ringkasan keuangan seluruh bisnis" icon={<FileBarChart className="h-5 w-5" />} />

      <Card className="p-4">
        <form method="get" className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <select name="mode" defaultValue={mode} className={inputClass}>
            <option value="monthly">Bulanan</option><option value="yearly">Tahunan</option>
          </select>
          {mode === "monthly" && (
            <select name="month" defaultValue={String(currentMonth)} className={inputClass}>
              {months.map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
            </select>
          )}
          <select name="year" defaultValue={String(currentYear)} className={inputClass}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select name="business" defaultValue={biz} className={inputClass}>
            <option value="all">Semua Bisnis</option>
            <option value="general">Umum</option>
            {options.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
          <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Terapkan</button>
        </form>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">Laporan Otomatis (WA & Excel)</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Hasilkan ringkasan keuangan langsung jadi — kirim via WhatsApp atau simpan sebagai file Excel (format CSV yang terbuka di Microsoft Excel / Google Sheets).
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {reportRows.map((r) => (
            <div key={r.k} className="rounded-2xl border border-border p-3">
              <p className="text-sm font-semibold">{r.label}</p>
              <div className="mt-2 flex gap-2">
                <a href={r.waHref} target="_blank" rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-2 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md">
                  <MessageCircle className="h-3.5 w-3.5" /> WA
                </a>
                <a href={r.csvHref}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {mode === "monthly" ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard title={`Pemasukan ${monthName(currentMonth)}`} value={formatIDR(fin.income)} icon={<DollarSign className="h-4 w-4" />} tone="green" />
            <StatCard title="Pengeluaran" value={formatIDR(fin.expense)} icon={<TrendingDown className="h-4 w-4" />} tone="red" />
            <StatCard title="Laba Bersih" value={formatIDR(fin.income - fin.expense)} icon={<TrendingUp className="h-4 w-4" />} tone="indigo" />
            <StatCard title="Transaksi" value={rows.length} icon={<BarChart3 className="h-4 w-4" />} tone="slate" sub={`Piutang ${formatIDR(fin.receivableOpen)}`} />
          </div>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Grafik Harian {monthName(currentMonth)}</h3>
            {dailyData.length > 0 ? (
              <div className="space-y-4">
                <BarChart data={dailyData.map((d) => ({ label: d.label, value: d.income }))} color="#22c55e" height={130} />
                <BarChart data={dailyData.map((d) => ({ label: d.label, value: d.expense }))} color="#fb7185" height={70} />
              </div>
            ) : <p className="text-sm text-muted-foreground">Tidak ada data transaksi untuk bulan ini (rawat tabel dengan transaksi)</p>}
          </Card>

          {expenseCategories.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold">Pengeluaran per Kategori</h3>
              <DonutChart data={expenseCategories.slice(0, 6).map((c, i) => ({ label: `${c.label}`, value: c.value, color: DONUT_COLORS[i % DONUT_COLORS.length] }))} />
            </Card>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard title="Pemasukan Tahun Ini" value={formatIDR(yearFin.income)} icon={<DollarSign className="h-4 w-4" />} tone="green" />
            <StatCard title="Pengeluaran" value={formatIDR(yearFin.expense)} icon={<TrendingDown className="h-4 w-4" />} tone="red" />
            <StatCard title="Laba Bersih" value={formatIDR(yearFin.income - yearFin.expense)} icon={<TrendingUp className="h-4 w-4" />} tone="indigo" />
            <StatCard title="Total Transaksi" value={yearRows.length} icon={<BarChart3 className="h-4 w-4" />} tone="slate" />
          </div>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Revenue per Bisnis (Tahun {currentYear})</h3>
            <BarChart data={bizRev.map((b) => ({ label: b.label, value: b.revenue }))} color="#6366f1" height={150} />
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Pengeluaran per Bisnis (Tahun {currentYear})</h3>
            <BarChart data={bizRev.map((b) => ({ label: b.label, value: b.expense }))} color="#fb7185" height={110} />
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Omzet per Bulan ({currentYear})</h3>
            <BarChart
              data={Array.from({ length: 12 }, (_, i) => {
                const mm = `${String(i + 1).padStart(2, "0")}`;
                const bRows = yearRows.filter((r) => r.tx_date?.startsWith(`${currentYear}-${mm}`));
                return { label: monthName(i + 1).slice(0, 3), value: bRows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0) };
              })}
              color="#8b5cf6"
              height={150}
            />
          </Card>
        </>
      )}
    </div>
  );
}