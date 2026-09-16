import { CSSProperties, ReactNode } from "react";

export type Tone = "indigo" | "green" | "red" | "amber" | "slate" | "blue" | "violet" | "rose" | "orange";

const toneMap: Record<Tone, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  red: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  amber: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  slate: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30",
  blue: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30",
  violet: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30",
  rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  orange: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30",
};

export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`rounded-2xl border border-border bg-card text-card-foreground card-shadow ${className}`} style={style}>{children}</div>;
}

export function StatCard({
  title,
  value,
  icon,
  tone = "indigo",
  sub,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  tone?: Tone;
  sub?: string;
}) {
  const iconTone: Record<Tone, string> = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    red: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="rounded-2xl border border-border bg-card card-shadow transition-transform hover:-translate-y-0.5 hover:shadow-md animate-fade-up">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          {icon && <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconTone[tone]}`}>{icon}</span>}
        </div>
        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "slate", className = "", style }: { children: ReactNode; tone?: Tone; className?: string; style?: CSSProperties }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneMap[tone]} ${className}`} style={style}>
      {children}
    </span>
  );
}

export function ColorPill({ label, color, className = "" }: { label: string; color: string; className?: string }) {
  return (
    <span
      className={`inline-flex max-w-[160px] items-center gap-1.5 overflow-hidden rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
      style={{ backgroundColor: `${color}1a`, color, borderColor: `${color}40`, "--tw-ring-color": `${color}40` } as CSSProperties}
      title={label}
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function PageHeader({ title, description, children, icon }: { title: string; description?: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-14 text-center">
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 whitespace-nowrap ${className}`}>{children}</td>;
}

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

export const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function FormGroup({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

