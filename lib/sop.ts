import { queryAll } from "./db";
import type { SopLineWithSteps } from "./sop-meta";

export async function getBusinessLinesWithSteps(): Promise<SopLineWithSteps[]> {
  const lines = await queryAll<{ id: number; name: string; description: string | null; color: string; icon: string; warn: string | null; sort: number }>(
    "SELECT id, name, description, color, icon, warn, sort FROM business_lines ORDER BY sort ASC, id ASC");
  const steps = await queryAll<{ id: number; line_id: number; title: string; detail: string | null; tip: string | null; sort: number }>(
    "SELECT id, line_id, title, detail, tip, sort FROM sop_steps ORDER BY sort ASC, id ASC");

  const byLine = new Map<number, SopLineWithSteps["steps"]>();
  for (const s of steps) {
    const arr = byLine.get(s.line_id);
    if (arr) arr.push({ id: s.id, line_id: s.line_id, title: s.title, detail: s.detail ?? undefined, tip: s.tip ?? undefined, sort: s.sort });
    else byLine.set(s.line_id, [{ id: s.id, line_id: s.line_id, title: s.title, detail: s.detail ?? undefined, tip: s.tip ?? undefined, sort: s.sort }]);
  }

  return lines.map((l) => ({
    line: {
      id: l.id,
      name: l.name,
      description: l.description ?? undefined,
      color: l.color,
      icon: l.icon,
      warn: l.warn ?? undefined,
      sort: l.sort,
    },
    steps: byLine.get(l.id) ?? [],
  }));
}