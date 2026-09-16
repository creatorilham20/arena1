"use client";

import { useState } from "react";
import { Plus, Pencil, CheckCircle2 } from "lucide-react";
import { createProject, updateProject, markProjectPaid, deleteProject } from "@/app/actions";
import { Modal } from "@/components/ui/client";
import { DeleteButton } from "@/components/ui/delete-button";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { useModalForm } from "./use-modal-form";

export interface ProjectInput {
  id?: number;
  project_no?: string;
  business_type: string;
  client_name: string;
  service_type: string;
  description?: string;
  price: number;
  dp_amount: number;
  paid_amount: number;
  operational_cost: number;
  deadline?: string;
  event_date?: string;
  event_location?: string;
  event_type?: string;
  status: string;
}

const STATUSES = [
  { value: "lead", label: "Lead" },
  { value: "deal", label: "Deal" },
  { value: "processing", label: "Diproses" },
  { value: "done", label: "Selesai" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Batal" },
];

const STATUS_TONE: Record<string, "slate" | "amber" | "blue" | "green" | "violet" | "rose"> = {
  lead: "slate", deal: "amber", processing: "blue", done: "green", paid: "violet", cancelled: "rose",
};
const STATUS_LABEL: Record<string, string> = {
  lead: "Lead", deal: "Deal", processing: "Diproses", done: "Selesai", paid: "Lunas", cancelled: "Batal",
};

export function ProjectStatusPill({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_TONE[status] ? "ring-current/20 bg-current/10" : ""} ${
    { lead: "text-slate-500 bg-slate-100", deal: "text-amber-600 bg-amber-50", processing: "text-blue-600 bg-blue-50",
      done: "text-emerald-600 bg-emerald-50", paid: "text-violet-600 bg-violet-50", cancelled: "text-rose-600 bg-rose-50" }[status] ?? "text-slate-500 bg-slate-50"
  }`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function MarkPaidProjectButton({ id, price, paid }: { id: number; price: number; paid: number }) {
  const [pending, setPending] = useState(false);
  if (price - paid <= 0) return null;
  return (
    <button onClick={async () => { setPending(true); const fd = new FormData(); fd.append("id", String(id)); await markProjectPaid(fd); }}
      disabled={pending} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 disabled:opacity-50">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Lunasi</span>
    </button>
  );
}

export default function ProjectForm({ businessType, project, bizOptions }: { businessType: string; project?: ProjectInput; bizOptions?: { value: string; label: string }[] }) {
  const isEdit = !!project;
  const action = isEdit ? updateProject : createProject;
  const { open, setOpen, error, pending, submit, close } = useModalForm(action);
  const [price, setPrice] = useState(project?.price ?? 0);
  const [dp, setDp] = useState(project?.dp_amount ?? 0);
  const [opCost, setOpCost] = useState(project?.operational_cost ?? 0);
  const showBizSelect = !isEdit && bizOptions && bizOptions.length > 0;
  const isEditing = businessType === "editing";
  const isDoc = businessType === "documentation";

  return (
    <>
      {isEdit ? (
        <div className="flex items-center gap-1.5">
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <MarkPaidProjectButton id={project.id!} price={project.price} paid={project.paid_amount} />
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl ${isEditing ? "bg-gradient-to-r from-blue-500 to-sky-600 shadow-blue-500/25" : isDoc ? "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/25" : "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-indigo-500/25"}`}>
          <Plus className="h-4 w-4" />
          Tambah Project
        </button>
      )}

      <Modal open={open} onClose={close} title={isEdit ? `Edit ${project?.project_no ?? "Project"}` : "Tambah Project"} wide>
        <form action={submit} className="space-y-4">
          {showBizSelect ? (
            <FormGroup label="Lini Bisnis">
              <select name="business_type" defaultValue={businessType} className={inputClass}>
                {bizOptions!.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </FormGroup>
          ) : <input type="hidden" name="business_type" value={businessType} />}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Nama Klien" required><input type="text" name="client_name" required defaultValue={project?.client_name} className={inputClass} placeholder="Nama klien" /></FormGroup>
            <FormGroup label="Jenis Layanan" required><input type="text" name="service_type" required defaultValue={project?.service_type} className={inputClass} placeholder={isEditing ? "Editing Video, Foto..." : isDoc ? "Pernikahan, Seminar..." : "Jenis layanan / paket"} /></FormGroup>
          </div>
          {!isEditing && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormGroup label="Jenis Acara"><input type="text" name="event_type" defaultValue={project?.event_type} className={inputClass} placeholder="Pernikahan, Seminar..." /></FormGroup>
              <FormGroup label="Tanggal Acara"><input type="date" name="event_date" defaultValue={project?.event_date} className={inputClass} /></FormGroup>
              <FormGroup label="Lokasi Acara"><input type="text" name="event_location" defaultValue={project?.event_location} className={inputClass} placeholder="Gedung, hotel..." /></FormGroup>
            </div>
          )}
          {!isDoc && <FormGroup label="Deadline"><input type="date" name="deadline" defaultValue={project?.deadline} className={inputClass} /></FormGroup>}
          <FormGroup label="Deskripsi"><textarea name="description" defaultValue={project?.description} className={`${inputClass} min-h-[50px]`} placeholder="Deskripsi project" /></FormGroup>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FormGroup label="Harga Project"><input type="number" step="any" min={0} name="price" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} className={inputClass} /></FormGroup>
            <FormGroup label="DP"><input type="number" step="any" min={0} name="dp_amount" value={dp} onChange={(e) => setDp(Number(e.target.value) || 0)} className={inputClass} /></FormGroup>
            <FormGroup label="Sudah Dibayar"><input type="number" step="any" min={0} name="paid_amount" defaultValue={project?.paid_amount ?? 0} className={inputClass} /></FormGroup>
            <FormGroup label="Biaya Operasional"><input type="number" step="any" min={0} name="operational_cost" value={opCost} onChange={(e) => setOpCost(Number(e.target.value) || 0)} className={inputClass} /></FormGroup>
          </div>
          <FormGroup label="Status">
            <select name="status" defaultValue={project?.status ?? "lead"} className={inputClass}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormGroup>
          <div className="rounded-xl bg-muted p-3 text-sm space-y-0.5">
            <p className="text-muted-foreground">Sisa pembayaran: <b className="text-foreground">{Math.max(0, price - dp)}</b></p>
            <p className="text-muted-foreground">Laba bersih: <b className="text-emerald-600 dark:text-emerald-400">{price - opCost}</b></p>
          </div>
          {project && <input type="hidden" name="id" value={project.id} />}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}
          <div className="flex items-center justify-between gap-2 pt-2">
            {isEdit ? <DeleteButton action={deleteProject} id={project.id!} message={`Hapus project ${project.project_no}?`} /> : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={close} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</button>
              <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50">
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}