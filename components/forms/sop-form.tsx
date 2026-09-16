"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import {
  createBusinessLine, updateBusinessLine, createSopStep, updateSopStep,
} from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { inputClass, FormGroup } from "@/components/ui/primitives";
import { LINE_COLORS, LINE_ICONS, LINE_ICON_LABELS, LINE_ICON_KEYS, type BusinessLineInput, type SopStepInput } from "@/lib/sop-meta";
import { useModalForm } from "./use-modal-form";

function ColorPicker({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {LINE_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            onClick={() => onChange(c.hex)}
            className={`h-8 w-8 rounded-full transition-transform ${value === c.hex ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"}`}
            style={{ background: c.hex }}
            aria-label={c.name}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">Warna dipilih: <span style={{ color: value }}>{value}</span></p>
    </div>
  );
}

function IconPicker({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  const keys = LINE_ICON_KEYS;
  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-5 gap-1.5">
        {keys.map((k) => {
          const Icon = LINE_ICONS[k];
          return (
            <button
              key={k}
              type="button"
              title={LINE_ICON_LABELS[k]}
              onClick={() => onChange(k)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${value === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      {value && <p className="mt-1.5 text-[11px] text-muted-foreground">Ikon: {LINE_ICON_LABELS[value] ?? value}</p>}
    </div>
  );
}

export default function LineForm({ line }: { line?: BusinessLineInput }) {
  const isEdit = !!line;
  const action = isEdit ? updateBusinessLine : createBusinessLine;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const [color, setColor] = useState(line?.color ?? LINE_COLORS[0].hex);
  const [icon, setIcon] = useState(line?.icon ?? "clipboard");
  const [active, setActive] = useState(line?.is_active !== 0);

  return (
    <>
      {isEdit ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          <Pencil className="h-3.5 w-3.5" /> Ubah Lini
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
          <Plus className="h-4 w-4" /> Tambah Lini Bisnis
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Lini Bisnis" : "Tambah Lini Bisnis"} wide>
        <form action={submit} className="space-y-4">
          <FormGroup label="Nama Lini Bisnis" required>
            <input type="text" name="name" defaultValue={line?.name} required className={inputClass} placeholder="cth: Foto Prewedding, Jastip, Thrift..." />
          </FormGroup>
          {line?.slug && (
            <p className="rounded-xl bg-muted px-3 py-2 text-[11px] text-muted-foreground">
              ID: <code className="font-mono">{line.slug}</code> · lini baru otomatis muncul di transaksi, harga, project, layanan, & laporan
            </p>
          )}
          <FormGroup label="Deskripsi Singkat">
            <input type="text" name="description" defaultValue={line?.description} className={inputClass} placeholder="Penjelasan singkat lini bisnis ini" />
          </FormGroup>
          <FormGroup label="Warna">
            <ColorPicker name="color" value={color} onChange={setColor} />
          </FormGroup>
          <FormGroup label="Ikon">
            <IconPicker name="icon" value={icon} onChange={setIcon} />
          </FormGroup>
          <FormGroup label="Peringatan (opsional)">
            <input type="text" name="warn" defaultValue={line?.warn} className={inputClass} placeholder="Tampil di bagian atas kartu SOP, mis: Jangan kirim password sebelum bayar" />
          </FormGroup>
          {line?.kind === "internal" ? (
            <input type="hidden" name="is_active" value="1" />
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
              <input type="checkbox" name="is_active" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded" />
              <span className="text-sm">
                <b>Aktif</b>
                <span className="block text-xs text-muted-foreground">Jika nonaktif, lini ini disembunyikan dari menu transaksi, harga, project & lainnya</span>
              </span>
            </label>
          )}
          {line && <input type="hidden" name="id" value={line.id} />}
          {line && <input type="hidden" name="sort" value={line.sort} />}
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

export function StepForm({ line, step, color }: { line: BusinessLineInput; step?: SopStepInput; color?: string }) {
  const isEdit = !!step;
  const action = isEdit ? updateSopStep : createSopStep;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const [selColor] = useState(color ?? LINE_COLORS[0].hex);
  const accent = useMemo(() => ({ background: `linear-gradient(135deg, ${selColor}, ${selColor}cc)` }), [selColor]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
      >
        {isEdit ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {isEdit ? "Ubah" : "Tambah Langkah"}
      </button>

      <Modal open={open} onClose={close} title={isEdit ? "Edit Langkah SOP" : "Tambah Langkah SOP"}>
        <form action={submit} className="space-y-4">
          <FormGroup label="Judul Langkah" required>
            <input type="text" name="title" defaultValue={step?.title} required className={inputClass} placeholder="cth: Deal & DP" />
          </FormGroup>
          <FormGroup label="Penjelasan">
            <textarea name="detail" defaultValue={step?.detail} rows={5} className={`${inputClass} resize-y`} placeholder="Tulis langkah/prosedur secara jelas..." />
          </FormGroup>
          <FormGroup label="Tips (opsional)">
            <input type="text" name="tip" defaultValue={step?.tip} className={inputClass} placeholder="Tips singkat untuk langkah ini" />
          </FormGroup>
          <input type="hidden" name="line_id" value={line.id} />
          {step && <input type="hidden" name="id" value={step.id} />}
          {step && <input type="hidden" name="sort" value={step.sort} />}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</button>
            <button type="submit" disabled={pending} style={accent} className="rounded-xl px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50">
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}