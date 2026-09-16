"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { monthName } from "@/lib/format";

const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function DashboardCalendar({
  events,
}: {
  events: { date: string; color: string }[];
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const dots = useMemo(() => {
    const map: Record<string, { day: number; colors: string[] }> = {};
    const pad = (n: number) => String(n).padStart(2, "0");
    for (const e of events) {
      if (!e.date) continue;
      const d = e.date.slice(0, 10);
      const [y, m] = d.split("-").map(Number);
      if (y !== year || m !== month) continue;
      const day = Number(d.slice(8, 10));
      if (!map[day]) map[day] = { day, colors: [] };
      const colors = map[day].colors;
      if (!colors.includes(e.color)) colors.push(e.color);
    }
    return map;
  }, [events, year, month]);

  const first = new Date(year, month - 1, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayKey = new Date().toISOString().slice(0, 10);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const colors = useMemo(() => {
    const list: string[] = [];
    for (const d of Object.values(dots)) for (const c of d.colors) if (!list.includes(c)) list.push(c);
    return list;
  }, [dots]);

  const dPad = (n: number) => String(n).padStart(2, "0");
  const go = (dy: number, dm: number) => {
    const d = new Date(year + dy, month - 1 + dm, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };
  const today = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Kalender</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => go(0, -1)} className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted" title="Bulan sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] font-medium"
          >
            {MONTHS.map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] font-medium"
          >
            {Array.from({ length: 9 }, (_, i) => now.getFullYear() - 4 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => go(0, 1)} className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted" title="Bulan berikutnya">
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isCurrentMonth && (
            <button onClick={today} className="ml-1 flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted" title="Kembali ke bulan ini">
              <RotateCcw className="h-3 w-3" />
              Hari ini
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DOW.map((d) => <span key={d} className="pb-1 text-[10px] font-semibold text-muted-foreground">{d}</span>)}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} className="aspect-square" />;
          const dt = `${year}-${dPad(month)}-${dPad(day)}`;
          const isToday = dt === todayKey;
          const d = dots[day];
          return (
            <span key={dt} className={`flex aspect-square flex-col items-center justify-center rounded-lg text-[11px] font-medium ${isToday ? "bg-foreground text-background" : "hover:bg-muted"}`}>
              {day}
              {d && d.colors.length > 0 && (
                <span className="mt-0.5 flex gap-0.5">
                  {d.colors.slice(0, 3).map((c, j) => <span key={j} className="h-1 w-1 rounded-full" style={{ backgroundColor: c }} />)}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {colors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {colors.map((c) => <span key={c} className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />Jadwal lini ini</span>)}
        </div>
      )}
    </Card>
  );
}