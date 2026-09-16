"use client";

import { useEffect, useState } from "react";

export default function DashboardClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 p-5 text-center">
        <p className="font-mono text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">--:--<span className="text-lg text-muted-foreground">:--</span></p>
        <p className="text-xs font-medium text-muted-foreground">Memuat waktu...</p>
      </div>
    );
  }

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const date = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-5 text-center">
      <p className="font-mono text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">{hh}:{mm}<span className="text-lg text-muted-foreground">:{ss}</span></p>
      <p className="text-xs font-medium text-muted-foreground">{date}</p>
    </div>
  );
}