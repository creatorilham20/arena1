"use client";

import { Plus, Pencil } from "lucide-react";
import { useMemo } from "react";
import { createTemplate, updateTemplate } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { inputClass, FormGroup } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

export interface TemplateInput {
  id?: number;
  business_type: string;
  step_title: string;
  step_desc?: string;
  step_kapan?: string;
  script: string;
  sort: number;
}

const BIZ = [
  { value: "premium", label: "Premium Apps" },
  { value: "editing", label: "Jasa Editing" },
  { value: "frame", label: "Frame Custom" },
  { value: "documentation", label: "Dokumentasi" },
];

export default function TemplateForm({ tpl, bizOptions }: { tpl?: TemplateInput; bizOptions?: { value: string; label: string }[] }) {
  const isEdit = !!tpl;
  const action = isEdit ? updateTemplate : createTemplate;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const options = useMemo(() => {
    if (!bizOptions || bizOptions.length === 0) return BIZ;
    if (tpl?.business_type && !bizOptions.some((b) => b.value === tpl.business_type)) {
      return [{ value: tpl.business_type, label: tpl.business_type }, ...bizOptions];
    }
    return bizOptions;
  }, [bizOptions, tpl?.business_type]);

  return (
    <>
      {isEdit ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          <Pencil className="h-3.5 w-3.5" /> Ubah
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
          <Plus className="h-4 w-4" /> Tambah Template
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Template" : "Tambah Template Layanan"} wide>
        <form action={submit} className="space-y-4">
          <FormGroup label="Lini Bisnis">
            <select name="business_type" defaultValue={tpl?.business_type ?? "premium"} className={inputClass}>
              {options.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </FormGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Judul Langkah" required>
              <input name="step_title" defaultValue={tpl?.step_title} required className={inputClass} placeholder="cth: Deal & DP" />
            </FormGroup>
            <FormGroup label="Kapan Digunakan">
              <input name="step_kapan" defaultValue={tpl?.step_kapan} className={inputClass} placeholder="cth: H-3 sebelum expired" />
            </FormGroup>
          </div>
          <FormGroup label="Deskripsi">
            <input name="step_desc" defaultValue={tpl?.step_desc} className={inputClass} placeholder="Penjelasan singkat langkah ini" />
          </FormGroup>
          <FormGroup label="Isi Template WA" required>
            <textarea name="script" defaultValue={tpl?.script} required rows={8} className={`${inputClass} resize-y font-mono text-xs`} placeholder="Tulis teks template di sini... gunakan *bold*, emoji, dan [TEMPLATE VAR] seperti [NAMA], [HARGA]" />
          </FormGroup>
          {tpl && <input type="hidden" name="id" value={tpl.id} />}
          {tpl && <input type="hidden" name="sort" value={tpl.sort} />}
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