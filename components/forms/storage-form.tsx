"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createStorage, updateStorage } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

const STORAGE_TYPES = [
  { value: "cash", label: "Tunai / Cash" },
  { value: "bank", label: "Rekening Bank" },
  { value: "ewallet", label: "E-Wallet" },
];

export interface StorageInput {
  id?: number;
  name: string;
  type: string;
  account_no?: string;
  initial_balance: number;
  is_active: number;
}

export default function StorageForm({ st }: { st?: StorageInput }) {
  const isEdit = !!st;
  const action = isEdit ? updateStorage : createStorage;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const [type, setType] = useState(st?.type ?? "cash");

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
          Tambah Penyimpanan
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Penyimpanan" : "Tambah Penyimpanan"}>
        <form action={submit} className="space-y-4">
          <FormGroup label="Nama Penyimpanan" required>
            <input type="text" name="name" defaultValue={st?.name} required className={inputClass} placeholder="BRI, DANA, Cash, dst." />
          </FormGroup>
          <FormGroup label="Jenis">
            <div className="flex flex-wrap gap-2">
              {STORAGE_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${type === t.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-border"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />
          </FormGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Nomor Rekening / Akun">
              <input type="text" name="account_no" defaultValue={st?.account_no} className={inputClass} placeholder="Opsional" />
            </FormGroup>
            <FormGroup label="Saldo Awal (Rp)">
              <input type="number" min={0} step="any" name="initial_balance" defaultValue={st?.initial_balance ?? 0} className={inputClass} placeholder="0" />
            </FormGroup>
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" value="1" defaultChecked={(st?.is_active ?? 1) === 1} className="h-4 w-4 rounded border-border" />
              Penyimpanan aktif (muncul di daftar transaksi)
            </label>
          )}
          {st && <input type="hidden" name="id" value={st.id} />}
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