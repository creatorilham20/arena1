"use client";

import { useState } from "react";
import { Plus, Pencil, RefreshCw } from "lucide-react";
import { createPremiumAccount, updatePremiumAccount, renewPremiumAccount, deletePremiumAccount } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { DeleteButton } from "@/components/ui/delete-button";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

export interface CustomerOption { id: number; name: string; }
export interface PremiumInput {
  id?: number;
  app_name: string;
  email: string;
  password_acc?: string;
  package_type: string;
  buy_price: number;
  sell_price: number;
  start_date: string;
  end_date: string;
  devices: number;
  status: string;
  customer_id: number | null;
  refund_amount: number;
  refund_reason?: string;
  notes?: string;
}

function RenewButton({ id, appName }: { id: number; appName: string }) {
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState(1);
  const [pending, setPending] = useState(false);
  const doRenew = async () => {
    setPending(true);
    const fd = new FormData();
    fd.append("id", String(id));
    fd.append("months", String(months));
    await renewPremiumAccount(fd);
    setPending(false);
    setOpen(false);
  };
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Perpanjang</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Perpanjang ${appName}`}>
        <div className="space-y-4">
          <FormGroup label="Perpanjang selama (bulan)">
            <input type="number" min={1} max={24} value={months} onChange={(e) => setMonths(Number(e.target.value) || 1)} className={inputClass} />
          </FormGroup>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</button>
            <button onClick={doRenew} disabled={pending} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {pending ? "Memproses..." : "Perpanjang"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function PremiumForm({ customers, account }: { customers: CustomerOption[]; account?: PremiumInput }) {
  const isEdit = !!account;
  const action = isEdit ? updatePremiumAccount : createPremiumAccount;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const [pkg, setPkg] = useState(account?.package_type ?? "Bulanan");

  return (
    <>
      {isEdit ? (
        <div className="flex items-center gap-1.5">
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <RenewButton id={account.id!} appName={account.app_name} />
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl">
          <Plus className="h-4 w-4" />
          Tambah Akun
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Akun Premium" : "Tambah Akun Premium"} wide>
        <form action={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Nama Aplikasi" required>
              <input type="text" name="app_name" required defaultValue={account?.app_name} className={inputClass} placeholder="Netflix, Spotify..." />
            </FormGroup>
            <FormGroup label="Pelanggan">
              <select name="customer_id" defaultValue={account?.customer_id ?? ""} className={inputClass}>
                <option value="">Tanpa pelanggan</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Email / Akun">
              <input type="text" name="email" required defaultValue={account?.email} className={inputClass} placeholder="email@akun.com" />
            </FormGroup>
            <FormGroup label="Password Akun">
              <input type="text" name="password_acc" defaultValue={account?.password_acc} className={inputClass} placeholder="password akun" />
            </FormGroup>
            <FormGroup label="Jenis Paket">
              <select name="package_type" value={pkg} onChange={(e) => setPkg(e.target.value)} className={inputClass}>
                {["Harian", "Bulanan", "Kuota", "Tahunan", "Sekali"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Jumlah Perangkat">
              <input type="number" min={1} name="devices" defaultValue={account?.devices ?? 1} className={inputClass} />
            </FormGroup>
            <FormGroup label="Harga Modal">
              <input type="number" step="any" min={0} name="buy_price" defaultValue={account?.buy_price ?? 0} className={inputClass} />
            </FormGroup>
            <FormGroup label="Harga Jual">
              <input type="number" step="any" min={0} name="sell_price" required defaultValue={account?.sell_price ?? 0} className={inputClass} />
            </FormGroup>
            <FormGroup label="Tanggal Mulai">
              <input type="date" name="start_date" defaultValue={account?.start_date} className={inputClass} />
            </FormGroup>
            <FormGroup label="Tanggal Expired">
              <input type="date" name="end_date" required defaultValue={account?.end_date} className={inputClass} />
            </FormGroup>
            <FormGroup label="Status">
              <select name="status" defaultValue={account?.status ?? "active"} className={inputClass}>
                <option value="active">Aktif</option>
                <option value="expired">Expired</option>
              </select>
            </FormGroup>
            <FormGroup label="Jumlah Refund">
              <input type="number" step="any" min={0} name="refund_amount" defaultValue={account?.refund_amount ?? 0} className={inputClass} />
            </FormGroup>
          </div>
          <FormGroup label="Alasan Refund">
            <input type="text" name="refund_reason" defaultValue={account?.refund_reason} className={inputClass} placeholder="Alasan refund" />
          </FormGroup>
          <FormGroup label="Catatan">
            <textarea name="notes" defaultValue={account?.notes} className={`${inputClass} min-h-[50px]`} placeholder="Catatan" />
          </FormGroup>
          {account && <input type="hidden" name="id" value={account.id} />}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <div className="flex items-center justify-between gap-2 pt-2">
            {isEdit ? <DeleteButton action={deletePremiumAccount} id={account.id!} message={`Hapus akun ${account.app_name}?`} /> : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</button>
              <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50">
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}