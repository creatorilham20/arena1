import { Settings, Save, Download, Upload, RefreshCw, Trash2, ShieldCheck } from "lucide-react";
import { Card, FormGroup, inputClass, PageHeader } from "@/components/ui/primitives";
import { getSetting, queryAll } from "@/lib/db";
import { updateSettings, backupAction, resetDemoAction, startFromScratchAction, restoreAction } from "@/app/actions";
import { formatDateTime } from "@/lib/format";
import PinSettings from "@/components/pin-settings";
import { isPinEnabled } from "@/lib/pin";

export const dynamic = "force-dynamic";

const ACTION_TONE: Record<string, string> = {
  create: "text-emerald-600 dark:text-emerald-400",
  update: "text-amber-600 dark:text-amber-400",
  delete: "text-rose-600 dark:text-rose-400",
  payment: "text-blue-600 dark:text-blue-400",
  renew: "text-violet-600 dark:text-violet-400",
  backup: "text-indigo-600 dark:text-indigo-400",
};
const ACTION_LABEL: Record<string, string> = {
  create: "Tambah", update: "Update", delete: "Hapus", payment: "Pembayaran",
  renew: "Perpanjang", backup: "Backup", auth: "Login", restore: "Import", reset: "Demo",
};

export default async function PengaturanPage() {
  const [businessName, waNumber, demoModeRaw, pinEnabled, logs, cCounts, pCounts, fpCounts, prjCounts, foCounts, txCounts] = await Promise.all([
    getSetting("business_name"),
    getSetting("wa_number"),
    getSetting("demo_mode"),
    isPinEnabled(),
    queryAll<{ id: number; action: string; details: string; created_at: string }>(
      "SELECT * FROM activity_log ORDER BY created_at DESC, id DESC LIMIT 25"),
    queryAll<{ c: number }>("SELECT COUNT(*) as c FROM customers"),
    queryAll<{ c: number }>("SELECT COUNT(*) as c FROM premium_accounts"),
    queryAll<{ c: number }>("SELECT COUNT(*) as c FROM frame_products"),
    queryAll<{ c: number }>("SELECT COUNT(*) as c FROM projects"),
    queryAll<{ c: number }>("SELECT COUNT(*) as c FROM frame_orders"),
    queryAll<{ c: number }>("SELECT COUNT(*) as c FROM transactions"),
  ]);
  const demoMode = demoModeRaw === "true";
  const counts = {
    customers: cCounts[0]?.c ?? 0,
    premium: pCounts[0]?.c ?? 0,
    frameProducts: fpCounts[0]?.c ?? 0,
    projects: prjCounts[0]?.c ?? 0,
    frameOrders: foCounts[0]?.c ?? 0,
    transactions: txCounts[0]?.c ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" description="Profil, import/export data, demo, riwayat aktivitas" icon={<Settings className="h-5 w-5" />} />

      {demoMode && (
        <Card className="border-amber-300 p-4 dark:border-amber-500/40">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Mode Demo Aktif</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Data saat ini adalah contoh untuk pembuktian fitur. Saat sudah yakin ingin mulai memakai sungguhan, klik <b>Mulai Pakai (kosongkan demo)</b>. Semua data demo akan dihapus permanen.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={startFromScratchAction}>
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl">
                <Trash2 className="h-4 w-4" /> Mulai Pakai (Kosongkan Demo)
              </button>
            </form>
            <form action={resetDemoAction}>
              <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                <RefreshCw className="h-4 w-4" /> Reset Data Demo
              </button>
            </form>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Profil Bisnis</h3>
          <form action={updateSettings} className="space-y-4">
            <FormGroup label="Nama Bisnis">
              <input type="text" name="business_name" defaultValue={businessName ?? "Ilham Business Manager"} className={inputClass} />
            </FormGroup>
            <FormGroup label="Nomor WhatsApp (LRB)">
              <input type="tel" name="wa_number" defaultValue={waNumber ?? ""} className={inputClass} placeholder="08xxxxxxxxxx" />
              <p className="mt-1 text-xs text-muted-foreground">Dipakai untuk kirim laporan & template ke diri sendiri / admin.</p>
            </FormGroup>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
              <Save className="h-4 w-4" /> Simpan
            </button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Backup, Export & Import Data</h3>
          <p className="mb-4 text-xs text-muted-foreground">Backup otomatis ke koleksi file <code className="rounded bg-muted px-1">.json</code>, tersimpan di server (folder <code className="rounded bg-muted px-1">backup/</code> secara lokal, atau sistem sementara di Netlify). Untuk menyimpan permanen, selalu unduh lewat <b>Export File JSON</b>.</p>
          <div className="flex flex-wrap gap-2">
            <form action={backupAction}>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                <Save className="h-4 w-4" /> Backup Lokal
              </button>
            </form>
            <a href="/api/export" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
              <Download className="h-4 w-4" /> Export File JSON
            </a>
          </div>
          <form action={restoreAction} className="mt-4 space-y-3">
            <FormGroup label="Import dari file backup (.json)">
              <input type="file" name="file" accept="application/json,.json" required className={`${inputClass} file:mr-3 file:rounded-xl file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs`} />
            </FormGroup>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:border-amber-500/40 dark:hover:bg-amber-500/10">
              <Upload className="h-4 w-4" /> Import & Overwrite
            </button>
          </form>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-indigo-500" /> Keamanan Aplikasi (PIN)
        </h3>
        <PinSettings enabled={pinEnabled} />
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Informasi Database</h3>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Pelanggan", count: counts.customers },
            { label: "Akun Premium", count: counts.premium },
            { label: "Produk Frame", count: counts.frameProducts },
            { label: "Project", count: counts.projects },
            { label: "Pesanan Frame", count: counts.frameOrders },
            { label: "Transaksi", count: counts.transactions },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-lg font-bold">{item.count}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold">Riwayat Aktivitas</h3>
        <div className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-sm">
                <div className="min-w-0">
                  <span className={`font-medium ${ACTION_TONE[log.action] ?? "text-slate-500"}`}>
                    {ACTION_LABEL[log.action] ?? log.action}
                  </span>
                  <span className="mx-1.5 text-muted-foreground">·</span>
                  <span className="truncate text-muted-foreground">{log.details}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}