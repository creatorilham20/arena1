"use client";

import { Tag, Plus, Pencil } from "lucide-react";
import { useMemo } from "react";
import { Modal } from "@/components/ui/client";
import { inputClass, FormGroup, Badge, ColorPill } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";
import { savePriceItem } from "@/app/actions";

export interface PriceInput {
  id?: number;
  business_type: string;
  item_name: string;
  category?: string;
  price: number;
  unit?: string;
  note?: string;
}

const BIZ_BADGE: Record<string, string> = { premium: "violet", editing: "blue", frame: "amber", documentation: "rose" };
const BIZ_LABEL: Record<string, string> = { premium: "Premium", editing: "Editing", frame: "Frame", documentation: "Dokumentasi" };

export function PriceBadge({ business, bizMap }: { business: string; bizMap?: Record<string, { name: string; color: string }> }) {
  const meta = bizMap?.[business];
  if (meta) return <ColorPill label={meta.name} color={meta.color} />;
  return <Badge tone={(BIZ_BADGE[business] as "violet" | "blue" | "amber" | "rose") ?? "slate"}>{BIZ_LABEL[business] ?? business}</Badge>;
}

export default function PriceForm({ item, bizOptions = [] }: { item?: PriceInput; bizOptions?: { value: string; label: string }[] }) {
  const isEdit = !!item;
  const { open, setOpen, error, pending, submit, close } = useModalForm(savePriceItem);
  const options = useMemo(() => {
    if (bizOptions.length === 0) return bizOptions;
    const has = bizOptions.some((b) => b.value === item?.business_type);
    if (item?.business_type && !has) return [{ value: item.business_type, label: item.business_type }, ...bizOptions];
    return bizOptions;
  }, [bizOptions, item?.business_type]);

  return (
    <>
      {isEdit ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" /> Ubah
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
          <Plus className="h-4 w-4" /> Item Harga
        </button>
      )}

      <Modal open={open} onClose={close} title="Item Harga">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); submit(fd); }} className="space-y-4">
          <input type="hidden" name="id" value={item?.id ?? ""} />
          <FormGroup label="Lini Bisnis">
            <select name="business_type" defaultValue={item?.business_type ?? "premium"} className={inputClass}>
              {options.length > 0 ? options.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)
                : <>
                    <option value="premium">Premium Apps</option>
                    <option value="editing">Jasa Editing</option>
                    <option value="frame">Frame Custom</option>
                    <option value="documentation">Dokumentasi</option>
                  </>}
            </select>
          </FormGroup>
          <FormGroup label="Nama Barang / Jasa">
            <input name="item_name" defaultValue={item?.item_name} required className={inputClass} placeholder="cth: Netflix 1 Bulan" />
          </FormGroup>
          <FormGroup label="Kategori">
            <input name="category" defaultValue={item?.category} className={inputClass} placeholder="Akun Premium, Jasa Editing, Bingkai..." />
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Harga (Rp)">
              <input type="number" name="price" defaultValue={item?.price ?? 0} min={0} required className={inputClass} />
            </FormGroup>
            <FormGroup label="Satuan">
              <input name="unit" defaultValue={item?.unit ?? "pcs"} className={inputClass} placeholder="pcs / akun" />
            </FormGroup>
          </div>
          <FormGroup label="Catatan">
            <input name="note" defaultValue={item?.note} className={inputClass} placeholder="opsional" />
          </FormGroup>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>}
          <button type="submit" disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </>
  );
}