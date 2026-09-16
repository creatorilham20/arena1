"use client";

import { ShieldPlus, Shield } from "lucide-react";
import { Modal } from "@/components/ui/client";
import { inputClass, FormGroup } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";
import { registerWarrantyClaim } from "@/app/actions";

export default function WarrantyClaimForm({ accountId, appName }: { accountId: number; appName: string }) {
  const { open, setOpen, error, pending, submit, close } = useModalForm(registerWarrantyClaim);

  return (
    <>
      <button onClick={() => setOpen(true)} title={`Klaim garansi ${appName}`}
        className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <ShieldPlus className="h-3.5 w-3.5" /> Garansi
      </button>

      <Modal open={open} onClose={close} title="Klaim Garansi">
        <form onSubmit={(e) => { e.preventDefault(); submit(new FormData(e.currentTarget)); }} className="space-y-4">
          <input type="hidden" name="account_id" value={accountId} />
          <FormGroup label="Aplikasi">
            <input value={appName} disabled className={`${inputClass} opacity-60`} />
          </FormGroup>
          <FormGroup label="Tanggal Klaim">
            <input type="date" name="claim_date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
          </FormGroup>
          <FormGroup label="Kendala (keluhan akun)">
            <textarea name="issue" rows={3} required className={inputClass} placeholder="cth: akun tidak bisa login / layanan berhenti..." />
          </FormGroup>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Klaim menuntut penggantian: akun di-refund/ganti sesuai kebijakan garansi Anda.
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>}
          <button type="submit" disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            {pending ? "Menyimpan..." : "Ajukan Klaim"}
          </button>
        </form>
      </Modal>
    </>
  );
}

export function WarrantyBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pending: ["bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", "Pending"],
    approved: ["bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", "Disetujui / Ganti"],
    rejected: ["bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300", "Ditolak"],
  };
  const [cls, label] = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/10 ${cls}`}>
      <Shield className="h-3 w-3" /> {label}
    </span>
  );
}

export function ResolveClaimForm({ claimId }: { claimId: number }) {
  const { open, setOpen, error, pending, submit, close } = useModalForm(async (fd) => {
    const { resolveWarrantyClaim } = await import("@/app/actions");
    return resolveWarrantyClaim(fd);
  });

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        Proses
      </button>
      <Modal open={open} onClose={close} title="Proses Klaim Garansi">
        <form onSubmit={(e) => { e.preventDefault(); submit(new FormData(e.currentTarget)); }} className="space-y-4">
          <input type="hidden" name="id" value={claimId} />
          <FormGroup label="Keputusan">
            <select name="status" className={inputClass}>
              <option value="approved">Disetujui (ganti / refund)</option>
              <option value="rejected">Ditolak</option>
            </select>
          </FormGroup>
          <FormGroup label="Catatan Solusi">
            <textarea name="resolution_note" rows={3} className={inputClass} placeholder="cth: akun diganti baru, durasi 30 hari" />
          </FormGroup>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>}
          <button type="submit" disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            {pending ? "Menyimpan..." : "Simpan Keputusan"}
          </button>
        </form>
      </Modal>
    </>
  );
}