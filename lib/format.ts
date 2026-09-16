export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value.length >= 10 ? value.slice(0, 10) + "T00:00:00" : value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysLeft(date: string | null | undefined): number | null {
  if (!date) return null;
  const target = new Date(date.slice(0, 10) + "T00:00:00");
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - t.getTime()) / 86400000);
}

export function monthName(month: number): string {
  return ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][month - 1] ?? String(month);
}