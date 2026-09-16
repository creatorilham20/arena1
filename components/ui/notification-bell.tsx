"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarClock, FolderCheck } from "lucide-react";
import Link from "next/link";
import type { NotifItem } from "@/lib/notifications";

const TONE_TEXT: Record<NotifItem["tone"], string> = {
  red: "bg-rose-50 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
  amber: "bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/30",
};

function Group({ title, icon, items }: { title: string; icon: React.ReactNode; items: NotifItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 px-1 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon} {title}
      </p>
      <div className="space-y-1">
        {items.map((it, i) => (
          <Link key={`${it.label}-${i}`} href={it.href} onClick={() => undefined}
            className="block rounded-xl p-2.5 transition-colors hover:bg-muted">
            <span className={`inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${TONE_TEXT[it.tone]}`}>
              {it.label}
            </span>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{it.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function NotificationBell({ items }: { items: NotifItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const masaAktif = items.filter((i) => i.group === "masaAktif");
  const pengerjaan = items.filter((i) => i.group === "pengerjaan");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifikasi"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted"
      >
        <Bell className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-up">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">
            Notifikasi
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{items.length}</span>
          </div>
          <div className="max-h-[70vh] space-y-2 overflow-y-auto p-3">
            <Group title="Masa Aktif" icon={<CalendarClock className="h-3 w-3" />} items={masaAktif} />
            <Group title="Pengerjaan" icon={<FolderCheck className="h-3 w-3" />} items={pengerjaan} />
            {items.length === 0 && (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">Tidak ada pengingat. Aman semua! 🎉</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}