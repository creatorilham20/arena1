"use client";

import { Plus, Pencil } from "lucide-react";
import { createCustomer, updateCustomer } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

export interface CustomerInput {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export default function CustomerForm({ customer }: { customer?: CustomerInput }) {
  const isEdit = !!customer;
  const action = isEdit ? updateCustomer : createCustomer;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);

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
          Tambah Pelanggan
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}>
        <form action={submit} className="space-y-4">
          <FormGroup label="Nama" required>
            <input type="text" name="name" required defaultValue={customer?.name} className={inputClass} placeholder="Nama pelanggan" />
          </FormGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="No. HP">
              <input type="tel" name="phone" defaultValue={customer?.phone} className={inputClass} placeholder="08xx..." />
            </FormGroup>
            <FormGroup label="Email">
              <input type="email" name="email" defaultValue={customer?.email} className={inputClass} placeholder="email@contoh.com" />
            </FormGroup>
          </div>
          <FormGroup label="Alamat">
            <textarea name="address" defaultValue={customer?.address} className={`${inputClass} min-h-[70px]`} placeholder="Alamat lengkap" />
          </FormGroup>
          <FormGroup label="Catatan">
            <textarea name="notes" defaultValue={customer?.notes} className={`${inputClass} min-h-[50px]`} placeholder="Catatan tambahan" />
          </FormGroup>
          {customer && <input type="hidden" name="id" value={customer.id} />}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">Batal</button>
            <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50">
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}