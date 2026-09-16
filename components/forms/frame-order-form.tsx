"use client";

import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { createFrameOrder, updateFrameOrder, markFrameOrderLunas } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

export interface FrameOrderInput {
  id?: number;
  order_no: string;
  customer_id: number | null;
  frame_product_id: number | null;
  custom_size?: string;
  custom_material?: string;
  custom_design?: string;
  quantity: number;
  price: number;
  dp_amount: number;
  paid_amount: number;
  production_cost: number;
  deadline?: string;
  status: string;
  notes?: string;
}

export function MarkPaidButton({ id, price, paid }: { id: number; price: number; paid: number }) {
  const [pending, setPending] = useState(false);
  if (price - paid <= 0) return null;
  return (
    <button onClick={async () => { setPending(true); const fd = new FormData(); fd.append("id", String(id)); await markFrameOrderLunas(fd); }}
      disabled={pending} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 disabled:opacity-50">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Lunasi</span>
    </button>
  );
}

export default function FrameOrderForm({ customers, products, order }: { customers: { id: number; name: string }[]; products: { id: number; name: string; sell_price: number }[]; order?: FrameOrderInput }) {
  const isEdit = !!order;
  const action = isEdit ? updateFrameOrder : createFrameOrder;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const [selected, setSelected] = useState(order?.frame_product_id ?? "");
  const [qty, setQty] = useState(order?.quantity ?? 1);
  const [price, setPrice] = useState(order?.price ?? 0);
  const [customOn, setCustomOn] = useState(false);

  const handleProd = (v: string) => {
    setSelected(v);
    const p = products.find((p) => String(p.id) === v);
    if (p && !isEdit) { setPrice(p.sell_price); setCustomOn(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl">
        <Plus className="h-4 w-4" />
        Buat Pesanan
      </button>
      <Modal open={open} onClose={close} title={isEdit ? `Edit Pesanan ${order?.order_no}` : "Buat Pesanan Frame"} wide>
        <form action={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Pelanggan">
              <select name="customer_id" defaultValue={order?.customer_id ?? ""} className={inputClass}>
                <option value="">Tanpa pelanggan</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Produk">
              <select name="frame_product_id" value={String(selected)} onChange={(e) => handleProd(e.target.value)} className={inputClass}>
                <option value="">Pilih produk stok...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormGroup>
          </div>
          <button type="button" onClick={() => setCustomOn(!customOn)} className="text-xs font-medium text-amber-600 underline underline-offset-2 dark:text-amber-400">
            {customOn ? "Sembunyikan opsi custom" : "+ Ukuran/bahan custom"}
          </button>
          {customOn && (
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Ukuran Custom"><input type="text" name="custom_size" defaultValue={order?.custom_size} className={inputClass} placeholder="cth: 20x30 cm" /></FormGroup>
              <FormGroup label="Bahan Custom"><input type="text" name="custom_material" defaultValue={order?.custom_material} className={inputClass} placeholder="cth: Kayu Ukir" /></FormGroup>
            </div>
          )}
          <FormGroup label="Desain Custom">
            <textarea name="custom_design" defaultValue={order?.custom_design} className={`${inputClass} min-h-[50px]`} placeholder="Deskripsi desain" />
          </FormGroup>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FormGroup label="Jumlah"><input type="number" min={1} name="quantity" value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} className={inputClass} /></FormGroup>
            <FormGroup label="Harga per unit"><input type="number" step="any" min={0} name="price" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} className={inputClass} /></FormGroup>
            <FormGroup label="Total"><input type="number" step="any" disabled value={price * qty} className={`${inputClass} opacity-70`} /></FormGroup>
            <FormGroup label="DP"><input type="number" step="any" min={0} name="dp_amount" defaultValue={order?.dp_amount ?? 0} className={inputClass} /></FormGroup>
            <FormGroup label="Sudah Dibayar"><input type="number" step="any" min={0} name="paid_amount" defaultValue={order?.paid_amount ?? 0} className={inputClass} /></FormGroup>
            <FormGroup label="Biaya Produksi"><input type="number" step="any" min={0} name="production_cost" defaultValue={order?.production_cost ?? 0} className={inputClass} /></FormGroup>
            <FormGroup label="Deadline"><input type="date" name="deadline" defaultValue={order?.deadline} className={inputClass} /></FormGroup>
            <FormGroup label="Status">
              <select name="status" defaultValue={order?.status ?? "pending"} className={inputClass}>
                <option value="pending">Menunggu</option>
                <option value="processing">Diproses</option>
                <option value="done">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
            </FormGroup>
          </div>
          <FormGroup label="Catatan"><textarea name="notes" defaultValue={order?.notes} className={`${inputClass} min-h-[50px]`} placeholder="Catatan" /></FormGroup>
          {order && <input type="hidden" name="id" value={order.id} />}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</button>
            <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50">
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}