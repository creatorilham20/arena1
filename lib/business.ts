import { cache } from "react";
import { queryAll } from "./db";

export interface BizOption {
  slug: string;
  name: string;
  color: string;
  icon: string;
  description: string | null;
}

export interface BizMapEntry extends BizOption {
  kind: string;
  is_active: number;
}

const FALLBACK: BizOption = { slug: "", name: "", color: "#64748b", icon: "clipboard", description: null };

export const getBusinessOptions = cache(async (): Promise<BizOption[]> => {
  const rows = await queryAll<BizOption>(
    "SELECT slug, name, color, icon, description FROM business_lines WHERE kind = 'service' AND is_active = 1 AND slug IS NOT NULL ORDER BY sort ASC, id ASC");
  return rows;
});

export const getBusinessMap = cache(async (): Promise<Record<string, BizMapEntry>> => {
  const rows = await queryAll<BizMapEntry>(
    "SELECT slug, name, color, icon, description, kind, is_active FROM business_lines WHERE slug IS NOT NULL");
  const map: Record<string, BizMapEntry> = {};
  for (const r of rows) map[r.slug] = r;
  return map;
});

export function resolveBiz(map: Record<string, BizMapEntry>, slug: string | null | undefined): BizOption {
  const e = slug ? map[slug] : undefined;
  if (e) return { slug: e.slug, name: e.name, color: e.color, icon: e.icon, description: e.description };
  if (slug === "general") return { slug: "general", name: "Umum", color: "#64748b", icon: "clipboard", description: null };
  return { ...FALLBACK, slug: slug ?? "", name: slug ?? "Bisnis" };
}

export const MODULE_SLUGS = new Set(["premium", "editing", "frame", "documentation"]);

export function businessHref(slug: string): string {
  if (MODULE_SLUGS.has(slug)) return `/bisnis/${slug}`;
  return `/harga?business=${encodeURIComponent(slug)}`;
}