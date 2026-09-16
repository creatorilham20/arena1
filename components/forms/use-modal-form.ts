"use client";

import { useState, useTransition } from "react";

export type ModalFormState = { ok?: boolean; error?: string };

export function useModalForm(action: (fd: FormData) => Promise<ModalFormState>) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (fd: FormData) => {
    setError(null);
    start(async () => {
      const res = await action(fd);
      if (res?.error) setError(res.error);
      else { setOpen(false); setError(null); }
    });
  };

  const close = () => { setOpen(false); setError(null); };

  return { open, setOpen, error, pending, submit, close };
}