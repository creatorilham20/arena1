"use client";

import { Plus, Pencil } from "lucide-react";
import { createFrameProduct, updateFrameProduct, deleteFrameProduct } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { DeleteButton } from "@/components/ui/delete-button";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

export interface FrameProductInput {
  id?: number;
  name: string;
  size: string;
  material: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  notes?: string;
}

export default function FrameProductForm({ product }: { product?: FrameProductInput }) {
  const isEdit = !!product;
  const action = isEdit ? updateFrameProduct : createFrameProduct;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);

  return (
    <>
      {isEdit ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl">
          <Plus className="h-4 w-4" />
          Tambah Produk
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Produk Frame" : "Tambah Produk Frame"}>
        <form action={submit} className="space-y-4">
          <FormGroup label="Nama Produk" required>
            <input type="text" name="name" required defaultValue={product?.name} className={inputClass} placeholder="Bingkai Kayu A4" />
          </FormGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Ukuran">
              <input type="text" name="size" defaultValue={product?.size ?? "A4"} className={inputClass} placeholder="A4, A3, 4R..." />
            </FormGroup>
            <FormGroup label="Bahan">
              <input type="text" name="material" defaultValue={product?.material ?? "Kayu"} className={inputClass} placeholder="Kayu, Aluminium, MDF..." />
            </FormGroup>
            <FormGroup label="HPP / Harga Modal">
              <input type="number" step="any" min={0} name="buy_price" defaultValue={product?.buy_price ?? 0} className={inputClass} />
            </FormGroup>
            <FormGroup label="Harga Jual">
              <input type="number" step="any" min={0} name="sell_price" required defaultValue={product?.sell_price ?? 0} className={inputClass} />
            </FormGroup>
            <FormGroup label="Stok">
              <input type="number" min={0} name="stock" defaultValue={product?.stock ?? 0} className={inputClass} />
            </FormGroup>
            <FormGroup label="Stok Minimum">
              <input type="number" min={0} name="min_stock" defaultValue={product?.min_stock ?? 0} className={inputClass} />
            </FormGroup>
          </div>
          <FormGroup label="Catatan">
            <textarea name="notes" defaultValue={product?.notes} className={`${inputClass} min-h-[50px]`} placeholder="Catatan" />
          </FormGroup>
          {product && <input type="hidden" name="id" value={product.id} />}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <div className="flex items-center justify-between gap-2 pt-2">
            {isEdit ? <DeleteButton action={deleteFrameProduct} id={product.id!} message={`Hapus produk ${product.name}?`} /> : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</button>
              <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50">
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}