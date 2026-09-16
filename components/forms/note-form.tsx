"use client";

import { Plus, Pencil } from "lucide-react";
import { createNote, updateNote } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

const NOTE_TAGS = ["Umum", "Ide", "Bisnis", "Kontak", "Urgent"];

export interface NoteInput {
  id?: number;
  title: string;
  content?: string;
  tag?: string;
  created_at?: string;
}

export default function NoteForm({ note }: { note?: NoteInput }) {
  const isEdit = !!note;
  const action = isEdit ? updateNote : createNote;
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
          Tambah Catatan
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? "Edit Catatan" : "Tambah Catatan"}>
        <form action={submit} className="space-y-4">
          <FormGroup label="Judul" required>
            <input type="text" name="title" defaultValue={note?.title} required className={inputClass} placeholder="Ide, pengingat, orang yang harus dihubungi..." />
          </FormGroup>
          <FormGroup label="Label">
            <select name="tag" defaultValue={note?.tag ?? "Umum"} className={inputClass}>
              {NOTE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Isi Catatan">
            <textarea name="content" defaultValue={note?.content} rows={5} className={`${inputClass} resize-y`} placeholder="Tulis detailnya di sini..." />
          </FormGroup>
          {note && <input type="hidden" name="id" value={note.id} />}
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