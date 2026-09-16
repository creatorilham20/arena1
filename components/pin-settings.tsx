"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, Lock, Unlock } from "lucide-react";
import { FormGroup, inputClass } from "@/components/ui/primitives";
import { setPin, removePin, lockApp } from "@/app/actions";

export default function PinSettings({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const run = (action: (fd: FormData) => Promise<{ ok: boolean; error?: string }>, fd: FormData, okText: string) => {
    setMsg(null);
    start(async () => {
      const res = await action(fd);
      if (res?.ok) {
        setMsg({ ok: true, text: okText });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res?.error ?? "Terjadi kesalahan." });
      }
    });
  };

  const onSet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    run(setPin, new FormData(e.currentTarget), "PIN disimpan.");
  };
  const onRemove = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    run(removePin, new FormData(e.currentTarget), "PIN dinonaktifkan.");
  };
  const onLock = () => {
    start(async () => {
      await lockApp();
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {enabled ? (
        <>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> PIN aktif — aplikasi terkunci saat pertama dibuka di perangkat.
          </div>

          <button onClick={onLock} disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">
            <Lock className="h-4 w-4" /> {pending ? "Mengunci..." : "Kunci Sekarang"}
          </button>

          <form onSubmit={onSet} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ubah PIN</h4>
            <FormGroup label="PIN Saat Ini">
              <input type="password" name="current" inputMode="numeric" autoComplete="off" maxLength={8} required className={inputClass} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="PIN Baru">
                <input type="password" name="pin" inputMode="numeric" autoComplete="off" maxLength={8} minLength={4} required className={inputClass} />
              </FormGroup>
              <FormGroup label="Konfirmasi PIN">
                <input type="password" name="confirm" inputMode="numeric" autoComplete="off" maxLength={8} minLength={4} required className={inputClass} />
              </FormGroup>
            </div>
            <button type="submit" disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">
              <KeyRound className="h-4 w-4" /> Simpan PIN Baru
            </button>
          </form>

          <form onSubmit={onRemove} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nonaktifkan PIN</h4>
            <FormGroup label="PIN Saat Ini">
              <input type="password" name="current" inputMode="numeric" autoComplete="off" maxLength={8} required className={inputClass} />
            </FormGroup>
            <button type="submit" disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10 disabled:opacity-50">
              <Unlock className="h-4 w-4" /> Matikan PIN
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={onSet} className="space-y-3">
          <p className="text-sm text-muted-foreground">Aktifkan PIN agar data hanya bisa dibuka oleh Anda (4-8 digit angka).</p>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="PIN">
              <input type="password" name="pin" inputMode="numeric" autoComplete="off" maxLength={8} minLength={4} required className={inputClass} />
            </FormGroup>
            <FormGroup label="Konfirmasi PIN">
              <input type="password" name="confirm" inputMode="numeric" autoComplete="off" maxLength={8} minLength={4} required className={inputClass} />
            </FormGroup>
          </div>
          <button type="submit" disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            <ShieldCheck className="h-4 w-4" /> {pending ? "Menyimpan..." : "Aktifkan PIN"}
          </button>
        </form>
      )}

      {msg && <p className={`rounded-xl px-3 py-2 text-xs ${msg.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}>{msg.text}</p>}
    </div>
  );
}