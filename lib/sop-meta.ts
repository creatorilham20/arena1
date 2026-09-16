import { Smartphone, Clapperboard, Frame, Camera, Wallet, ClipboardList, Truck, Store, Package, Sparkles, Video, Users, Banknote, Monitor, BookOpen, type LucideIcon } from "lucide-react";

export const LINE_ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  clapperboard: Clapperboard,
  frame: Frame,
  camera: Camera,
  wallet: Wallet,
  clipboard: ClipboardList,
  truck: Truck,
  store: Store,
  package: Package,
  sparkles: Sparkles,
  video: Video,
  users: Users,
  banknote: Banknote,
  monitor: Monitor,
  book: BookOpen,
};

export const LINE_ICON_KEYS = Object.keys(LINE_ICONS);

export const LINE_ICON_LABELS: Record<string, string> = {
  smartphone: "Smartphone (Akun Premium)",
  clapperboard: "Editing",
  frame: "Frame / Bingkai",
  camera: "Dokumentasi",
  wallet: "Keuangan",
  clipboard: "Catatan Umum",
  truck: "Kiriman / Logistik",
  store: "Toko",
  package: "Produk",
  sparkles: "Layanan Tambahan",
  video: "Video",
  users: "Jasa",
  banknote: "Uang",
  monitor: "Perangkat",
  book: "Edukasi / Buku",
};

export const LINE_COLORS: { name: string; hex: string }[] = [
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Biru", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Hijau", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Oranye", hex: "#f97316" },
  { name: "Rose", hex: "#f43f5e" },
];

export const LINE_COLOR_HEX = LINE_COLORS.map((c) => c.hex);

export interface BusinessLineInput {
  id?: number;
  name: string;
  slug?: string;
  kind?: string;
  description?: string;
  color: string;
  icon: string;
  warn?: string;
  is_active?: number;
  sort: number;
}

export interface SopStepInput {
  id?: number;
  line_id: number;
  title: string;
  detail?: string;
  tip?: string;
  sort: number;
}

export interface SopLineWithSteps {
  line: BusinessLineInput & { id: number; created_at?: string };
  steps: (SopStepInput & { id: number; created_at?: string })[];
}