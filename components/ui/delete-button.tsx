"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "./client";

export function DeleteButton({
  action,
  id,
  label = "Hapus",
  message,
}: {
  action: (fd: FormData) => Promise<unknown>;
  id: string | number;
  label?: string;
  message?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const handleDelete = () => {
    const fd = new FormData();
    fd.append("id", String(id));
    start(async () => {
      await action(fd);
      setOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
        title="Hapus"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label && <span className="hidden sm:inline">{label}</span>}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Konfirmasi Hapus">
        <p className="text-sm text-muted-foreground">{message ?? "Yakin ingin menghapus data ini? Tindakan tidak dapat dibatalkan."}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
            Batal
          </button>
          <button onClick={handleDelete} disabled={pending} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50">
            {pending ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </Modal>
    </>
  );
}