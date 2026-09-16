import { formatIDR } from "@/lib/format";

export interface BarDatum { label: string; value: number; }

export function BarChart({ data, height = 160, color = "#6366f1" }: { data: BarDatum[]; height?: number; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const hPct = Math.max((d.value / max) * 95, 3);
          return (
            <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${d.label}: ${formatIDR(d.value)}`}>
              <span className="text-[9px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {d.value >= 1000000 ? `${(d.value / 1000000).toFixed(1)}jt` : d.value >= 1000 ? `${Math.round(d.value / 1000)}rb` : d.value}
              </span>
              <div
                className="w-full rounded-t-md transition-all group-hover:opacity-100"
                style={{ height: `${hPct}%`, backgroundColor: d.value > 0 ? color : "var(--border)", opacity: d.value > 0 ? 0.8 : 0.3 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 truncate text-center text-[9px] text-muted-foreground">{d.label}</div>
        ))}
      </div>
    </div>
  );
}

export interface DonutDatum { label: string; value: number; color: string; }

export function DonutChart({ data, size = 150 }: { data: DonutDatum[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
          {data.map((d, i) => {
            if (!d.value) return null;
            const frac = d.value / (total || 1);
            const dash = frac * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-tight">{formatIDR(total)}</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="truncate text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-semibold">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}