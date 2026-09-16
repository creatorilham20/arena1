"use client";

import { useState } from "react";
import { Calculator, ReceiptText, Target, RotateCcw } from "lucide-react";
import { Card, PageHeader, inputClass } from "@/components/ui/primitives";

const TABS = [
  { key: "general", label: "Umum", icon: Calculator },
  { key: "hpp", label: "HPP", icon: ReceiptText },
  { key: "bep", label: "BEP", icon: Target },
  { key: "refund", label: "Refund", icon: RotateCcw },
];

function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
const rupiah = (n: number) => n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function Field({ label, value, onChange, type = "number", placeholder, suffix }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; suffix?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      <div className="relative">
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} inputMode={type === "number" ? "decimal" : undefined} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}

function Result({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white shadow-lg shadow-indigo-500/20">
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-80">{sub}</p>}
    </div>
  );
}

function GeneralTab() {
  const [prices, setPrices] = useState<Record<string, string>>({ qty: "1", price: "", margin: "", diskon: "" });
  const set = (k: string) => (v: string) => setPrices((p) => ({ ...p, [k]: v }));
  const qty = num(prices.qty) || 1;
  const price = num(prices.price);
  const margin = num(prices.margin);
  const diskon = num(prices.diskon);
  const subtotal = price * qty;
  const markupTotal = price * (1 + margin / 100);
  const disTotal = subtotal * (1 - diskon / 100);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Qty / Jumlah" value={prices.qty} onChange={set("qty")} placeholder="1" />
        <Field label="Harga Satuan (Rp)" value={prices.price} onChange={set("price")} placeholder="50000" />
        <Field label="Margin (%)" value={prices.margin} onChange={set("margin")} placeholder="20" suffix="%" />
        <Field label="Diskon (%)" value={prices.diskon} onChange={set("diskon")} placeholder="0" suffix="%" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Result label="Subtotal (qty × harga)" value={rupiah(subtotal)} />
        <Result label="Harga Jual + Margin" value={rupiah(markupTotal * qty)} sub={`${rupiah(markupTotal)} / unit`} />
        <Result label="Total Setelah Diskon" value={rupiah(disTotal)} sub={`Hemat ${rupiah(subtotal - disTotal)}`} />
      </div>
    </div>
  );
}

function HppTab() {
  const [f, setF] = useState<Record<string, string>>({ qty: "1", buy: "", bahan: "", ops: "" });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const qty = num(f.qty) || 1;
  const buy = num(f.buy);
  const bahan = num(f.bahan);
  const ops = num(f.ops);
  const total = buy + bahan + ops;
  const perUnit = qty > 0 ? total / qty : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jumlah Unit Produk" value={f.qty} onChange={set("qty")} placeholder="1" />
        <Field label="Harga Beli Bahan (Rp)" value={f.buy} onChange={set("buy")} placeholder="15000" />
        <Field label="Biaya Bahan Tambahan (Rp)" value={f.bahan} onChange={set("bahan")} placeholder="0" />
        <Field label="Biaya Operasional (Rp)" value={f.ops} onChange={set("ops")} placeholder="0" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Result label="Total HPP" value={rupiah(total)} />
        <Result label="HPP per Unit" value={rupiah(perUnit)} sub={`untuk ${qty} unit`} />
      </div>
      <Card className="bg-muted/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tips harga jual sehat</p>
        <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
          <li>Margin 30–50%: harga jual {rupiah(perUnit * 1.3)} – {rupiah(perUnit * 1.5)}</li>
          <li>Pastikan harga jual &gt; HPP untuk cuan.</li>
        </ul>
      </Card>
    </div>
  );
}

function BepTab() {
  const [f, setF] = useState<Record<string, string>>({ jual: "", hpp: "", tetap: "" });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const jual = num(f.jual);
  const hpp = num(f.hpp);
  const tetap = num(f.tetap);
  const marginPerUnit = jual - hpp;
  const bepUnit = marginPerUnit > 0 ? Math.ceil(tetap / marginPerUnit) : 0;
  const bepRp = bepUnit * jual;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Harga Jual per Unit (Rp)" value={f.jual} onChange={set("jual")} placeholder="50000" />
        <Field label="HPP per Unit (Rp)" value={f.hpp} onChange={set("hpp")} placeholder="20000" />
        <Field label="Biaya Tetap (Rp)" value={f.tetap} onChange={set("tetap")} placeholder="500000" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Result label="Margin per Unit" value={rupiah(marginPerUnit)} />
        <Result label="BEP (unit)" value={String(bepUnit)} sub="unit agar balik modal" />
        <Result label="BEP (Rupiah)" value={rupiah(bepRp)} sub="omzet minimal" />
      </div>
      <Card className="bg-muted/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interpretasi</p>
        <p className="text-xs text-muted-foreground">Anda harus menjual minimal <b>{bepUnit}</b> unit untuk menutup biaya tetap {rupiah(tetap)}. Di atas itu = mulai untung.</p>
      </Card>
    </div>
  );
}

function RefundTab() {
  const [f, setF] = useState<Record<string, string>>({ jumlah: "", harga: "", persen: "", ongkos: "" });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const jumlah = num(f.jumlah);
  const harga = num(f.harga);
  const persen = num(f.persen);
  const ongkos = num(f.ongkos);
  const totalRefund = jumlah * harga;
  const ref = jumlah > 0 && persen > 0 ? Math.ceil(jumlah * (persen / 100)) : 0;
  const biayaRefund = ref * harga;
  const totalKerugian = biayaRefund + ongkos;
  const totalPenjualan = totalRefund;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jumlah Penjualan (unit)" value={f.jumlah} onChange={set("jumlah")} placeholder="50" />
        <Field label="Harga per Unit (Rp)" value={f.harga} onChange={set("harga")} placeholder="85000" />
        <Field label="Persen Klaim/Refund (%)" value={f.persen} onChange={set("persen")} placeholder="10" suffix="%" />
        <Field label="Ongkos Operasional Klaim (Rp)" value={f.ongkos} onChange={set("ongkos")} placeholder="0" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Result label="Total Penjualan" value={rupiah(totalPenjualan)} />
        <Result label="Total Kerugian Refund" value={rupiah(totalKerugian)} sub={`${ref} unit di-refund`} />
      </div>
      <Card className="bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">
          Bila nilai refund {persen || 0}%, sisihkan <b>{rupiah(totalKerugian)}</b> sebagai cadangan garansi. <b>Suggested:</b> sisihkan <b>{rupiah(totalPenjualan * 0.05)}</b> (5%) tiap penjualan untuk dana garansi.
        </p>
      </Card>
    </div>
  );
}

export default function KalkulatorPage() {
  const [tab, setTab] = useState("general");
  return (
    <div className="space-y-6">
      <PageHeader title="Kalkulator Bisnis" description="Umum, HPP, BEP, dan simulasi Refund" icon={<Calculator className="h-5 w-5" />} />
      <div className="grid grid-cols-4 gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs font-medium transition-all ${active ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>
      <Card className="p-5">
        {tab === "general" && <GeneralTab />}
        {tab === "hpp" && <HppTab />}
        {tab === "bep" && <BepTab />}
        {tab === "refund" && <RefundTab />}
      </Card>
    </div>
  );
}