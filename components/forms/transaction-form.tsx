"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createTransaction, updateTransaction, markReceivablePaid, markDebtPaid } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

const TX_TYPES = [
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
  { value: "receivable", label: "Piutang" },
  { value: "debt", label: "Hutang" },
  { value: "refund", label: "Refund" },
];

const BIZ = [
  { value: "general", label: "Umum" },
  { value: "premium", label: "Premium Apps" },
  { value: "editing", label: "Jasa Editing" },
  { value: "frame", label: "Frame Custom" },
  { value: "documentation", label: "Dokumentasi" },
];

export function TxTypePill({ type }: { type: string }) {
  const cfg = TX_TYPES.find((t) => t.value === type);
  const tone = { income: "text-emerald-600", expense: "text-rose-600", receivable: "text-indigo-600", debt: "text-amber-600", refund: "text-orange-600" }[type] ?? "text-slate-500";
  return <span className={`text-xs font-semibold ${tone}`}>{cfg?.label ?? type}</span>;
}

export interface TransactionInput {
  id?: number;
  type: string;
  business_type: string;
  category?: string;
  description?: string;
  amount: number;
  tx_date: string;
  payment_method: string;
  storage?: string;
  status: string;
}

export default function TransactionForm({ tx, storages = [], bizOptions }: { tx?: TransactionInput; storages?: { name: string }[]; bizOptions?: { value: string; label: string }[] }) {
  const isEdit = !!tx;
  const action = isEdit ? updateTransaction : createTransaction;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const [type, setType] = useState(tx?.type ?? "expense");
  const bizList = [
    { value: "general", label: "Umum" },
    ...(bizOptions && bizOptions.length > 0 ? bizOptions : BIZ.filter((b) => b.value !== "general")),
  ];

  return (
    <>
      {isEdit ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Transaksi" : "Tambah Transaksi"}>
        <form action={submit} className="space-y-4">
          <FormGroup label="Jenis">
            <div className="flex flex-wrap gap-2">
              {TX_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${type === t.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-border"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />
          </FormGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Bisnis">
              <select name="business_type" defaultValue={tx?.business_type ?? "general"} className={inputClass}>
                {bizList.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Kategori">
              <input type="text" name="category" defaultValue={tx?.category} className={inputClass} placeholder="Penjualan, Transport, Bahan..." />
            </FormGroup>
          </div>
          <FormGroup label="Nominal" required>
            <input type="number" step="any" min={0} name="amount" required defaultValue={tx?.amount} className={inputClass} placeholder="0" />
          </FormGroup>
          <FormGroup label="Deskripsi">
            <input type="text" name="description" defaultValue={tx?.description} className={inputClass} placeholder="Keterangan transaksi" />
          </FormGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormGroup label="Tanggal"><input type="date" name="tx_date" defaultValue={tx?.tx_date ?? new Date().toISOString().slice(0, 10)} className={inputClass} /></FormGroup>
            <FormGroup label="Metode Bayar">
              <select name="payment_method" defaultValue={tx?.payment_method ?? "Tunai"} className={inputClass}>
                <option>Tunai</option><option>Transfer</option><option>QRIS</option><option>Debit/Kredit</option>
              </select>
            </FormGroup>
            <FormGroup label="Tempat Penyimpanan">
              <select name="storage" defaultValue={tx?.storage ?? "Tunai"} className={inputClass}>
                {storages.length === 0 && <option value="Tunai">Tunai</option>}
                {storages.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </FormGroup>
          </div>
          <FormGroup label="Status">
            <select name="status" defaultValue={tx?.status ?? "completed"} className={inputClass}>
              <option value="completed">Selesai</option>
              <option value="pending">Menunggu</option>
              <option value="paid">Lunas</option>
            </select>
          </FormGroup>
          {tx && <input type="hidden" name="id" value={tx.id} />}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</button>
            <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50">
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ClaimReceivableButton({ id }: { id: number }) {
  const [p, setP] = useState(false);
  return (
    <button onClick={async () => { setP(true); const fd = new FormData(); fd.append("id", String(id)); await markReceivablePaid(fd); }}
      disabled={p} className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
      Terima
    </button>
  );
}

export function PayDebtButton({ id }: { id: number }) {
  const [p, setP] = useState(false);
  return (
    <button onClick={async () => { setP(true); const fd = new FormData(); fd.append("id", String(id)); await markDebtPaid(fd); }}
      disabled={p} className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
      Bayar
    </button>
  );
}