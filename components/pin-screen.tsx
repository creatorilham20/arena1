"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { unlockPin } from "@/app/actions";
import { inputClass } from "@/components/ui/primitives";

export default function PinScreen({ businessName }: { businessName: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    if (!pin || pending) return;
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.set("pin", pin);
      const res = await unlockPin(fd);
      if (res?.error) {
        setError(res.error);
        setPin("");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 text-white">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 shadow-2xl shadow-black/20 backdrop-blur">
        <Lock className="h-9 w-9" />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight">{businessName}</h1>
        <p className="mt-1 text-sm text-white/70">Masukkan PIN untuk membuka aplikasi</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="w-full max-w-xs space-y-3"
      >
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          maxLength={8}
          className={`${inputClass} bg-white/15 text-center text-lg tracking-[0.5em] text-white placeholder:text-white/40 focus:bg-white/20 focus:ring-white/40 focus:border-white/40`}
        />
        {error && <p className="rounded-xl bg-rose-500/20 px-3 py-2 text-center text-xs text-rose-100">{error}</p>}
        <button
          type="submit"
          disabled={pending || !pin}
          className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:bg-white/90 disabled:opacity-50"
        >
          {pending ? "Memeriksa..." : "Buka"}
        </button>
      </form>

      <p className="text-[11px] text-white/50">PIN diatur di menu Pengaturan → Keamanan</p>
    </div>
  );
}