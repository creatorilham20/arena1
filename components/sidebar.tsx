"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LayoutDashboard, Briefcase, ArrowLeftRight, FolderKanban, Users, FileBarChart, Settings,
  Smartphone, Clapperboard, Frame, Camera, Moon, Sun, Menu, X, Store, Lock,
  Tag, MessageSquareText, Calculator, ShieldCheck, PiggyBank, NotebookPen, ClipboardList,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import NotificationBell from "./ui/notification-bell";
import { lockApp } from "@/app/actions";
import type { NotifItem } from "@/lib/notifications";

const MENU = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/bisnis", label: "Bisnis", icon: Briefcase,
    children: [
      { href: "/bisnis/premium", label: "Premium Apps", icon: Smartphone, color: "text-violet-500" },
      { href: "/bisnis/editing", label: "Jasa Editing", icon: Clapperboard, color: "text-blue-500" },
      { href: "/bisnis/frame", label: "Frame Custom", icon: Frame, color: "text-amber-500" },
      { href: "/bisnis/documentation", label: "Dokumentasi", icon: Camera, color: "text-rose-500" },
    ],
  },
  {
    href: "/tools", label: "Alat & Template", icon: Store,
    children: [
      { href: "/harga", label: "List Harga", icon: Tag, color: "text-indigo-500" },
      { href: "/layanan", label: "Template Layanan", icon: MessageSquareText, color: "text-emerald-500" },
      { href: "/kalkulator", label: "Kalkulator", icon: Calculator, color: "text-amber-500" },
      { href: "/garansi", label: "Klaim Garansi", icon: ShieldCheck, color: "text-rose-500" },
    ],
  },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/keuangan", label: "Keuangan", icon: PiggyBank },
  { href: "/project", label: "Project", icon: FolderKanban },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/laporan", label: "Laporan", icon: FileBarChart },
  { href: "/catatan", label: "Catatan", icon: NotebookPen },
  { href: "/sop", label: "SOP Bisnis", icon: ClipboardList },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function Sidebar({ businessName, notifications = [], pinEnabled = false }: { businessName: string; notifications?: NotifItem[]; pinEnabled?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const { theme, toggle } = useTheme();

  const handleLock = () => {
    start(async () => {
      await lockApp();
      router.refresh();
    });
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const navContent = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
          <Store className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight">{businessName}</p>
          <p className="text-xs text-muted-foreground">Kelola 4 bisnis Anda</p>
        </div>
        <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {MENU.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
            {item.children && isActive(item.href) && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                      isActive(child.href) ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <child.icon className={`h-3.5 w-3.5 ${child.color}`} />
                    <span className="truncate">{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <button
          onClick={toggle}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === "light" ? "Mode Gelap" : "Mode Terang"}
        </button>
        {pinEnabled && (
          <button
            onClick={handleLock}
            disabled={pending}
            title="Kunci aplikasi"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
          </button>
        )}
        <NotificationBell items={notifications} />
      </div>
    </nav>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground">
          <Menu className="h-4 w-4" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Store className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold">{businessName}</span>
        </Link>
        <button onClick={toggle} className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <NotificationBell items={notifications} />
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-card shadow-2xl animate-fade-up">{navContent}</div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {[
          { href: "/", label: "Home", icon: LayoutDashboard },
          { href: "/bisnis", label: "Bisnis", icon: Briefcase },
          { href: "/transaksi", label: "Uang", icon: ArrowLeftRight },
          { href: "/project", label: "Project", icon: FolderKanban },
          { href: "/laporan", label: "Grafik", icon: FileBarChart },
        ].map((it) => (
          <Link key={it.href} href={it.href} onClick={() => setOpen(false)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${isActive(it.href) ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground"}`}>
            <it.icon className="h-5 w-5" />
            {it.label}
          </Link>
        ))}
      </nav>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-card lg:block">{navContent}</aside>
    </>
  );
}