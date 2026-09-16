"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { run, queryAll, queryOne, setSetting, logActivity, generateProjectNo, generateFrameOrderNo, resetDemoData, activateApp, restoreAllData, dumpAllData, getSetting } from "@/lib/db";
import { PIN_SETTING, PIN_COOKIE } from "@/lib/pin";

export type ActionResult = { ok: boolean; error?: string; id?: number };

function num(v: FormDataEntryValue | null): number {
  const n = Number(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}
function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}
function valNum(fd: FormData, key: string): number {
  return num(fd.get(key));
}
function valStr(fd: FormData, key: string): string {
  return str(fd.get(key));
}

/* ================= AUTH ================= */

export async function login(formData: FormData): Promise<ActionResult> {
  const username = valStr(formData, "username");
  const password = valStr(formData, "password");
  if (!username || !password) return { ok: false, error: "Username dan password wajib diisi." };
  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(password).digest("hex");
  const user = await queryOne<{ password_hash: string }>("SELECT password_hash FROM users WHERE username = ?", username);
  if (!user) {
    await run("INSERT INTO users (username, password_hash) VALUES (?, ?)", username, hash);
    await logActivity("auth", "user", 0, `User baru ${username} dibuat`);
    return { ok: true };
  }
  if (user.password_hash !== hash) return { ok: false, error: "Password salah." };
  return { ok: true };
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const current = valStr(formData, "current");
  const next1 = valStr(formData, "next");
  const next2 = valStr(formData, "confirm");
  if (next1.length < 4) return { ok: false, error: "Password baru minimal 4 karakter." };
  if (next1 !== next2) return { ok: false, error: "Konfirmasi password tidak cocok." };
  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(next1).digest("hex");
  const existing = await queryOne<{ password_hash: string }>("SELECT password_hash FROM users WHERE username = 'admin'");
  if (!current) return { ok: false, error: "Password saat ini wajib diisi." };
  const curHash = createHash("sha256").update(current).digest("hex");
  if (existing && existing.password_hash !== curHash) return { ok: false, error: "Password saat ini tidak cocok." };
  await run("UPDATE users SET password_hash = ? WHERE username = 'admin'", hash);
  await logActivity("update", "user", 0, "Password admin diubah");
  return { ok: true };
}

/* ================= ACCESS PIN ================= */

async function hashPin(pin: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(pin).digest("hex");
}

export async function setPin(formData: FormData): Promise<ActionResult> {
  const existing = await getSetting(PIN_SETTING);
  const current = valStr(formData, "current");
  if (existing) {
    if (!current) return { ok: false, error: "PIN saat ini wajib diisi." };
    if ((await hashPin(current)) !== existing) return { ok: false, error: "PIN saat ini salah." };
  }
  const next1 = valStr(formData, "pin");
  const next2 = valStr(formData, "confirm");
  if (!/^\d{4,8}$/.test(next1)) return { ok: false, error: "PIN harus 4-8 digit angka." };
  if (next1 !== next2) return { ok: false, error: "Konfirmasi PIN tidak cocok." };
  await setSetting(PIN_SETTING, await hashPin(next1));
  await logActivity("update", "settings", 0, "PIN aplikasi diatur");
  revalidatePath("/pengaturan");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removePin(formData: FormData): Promise<ActionResult> {
  const existing = await getSetting(PIN_SETTING);
  if (!existing) return { ok: false, error: "PIN belum diaktifkan." };
  const current = valStr(formData, "current");
  if (!current || (await hashPin(current)) !== existing) return { ok: false, error: "PIN salah." };
  await run("DELETE FROM settings WHERE key = ?", PIN_SETTING);
  await logActivity("update", "settings", 0, "PIN aplikasi dinonaktifkan");
  revalidatePath("/pengaturan");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function unlockPin(formData: FormData): Promise<ActionResult> {
  const existing = await getSetting(PIN_SETTING);
  if (!existing) return { ok: false, error: "PIN belum diatur. Tidak perlu membuka kunci." };
  const pin = valStr(formData, "pin");
  if (!pin || (await hashPin(pin)) !== existing) return { ok: false, error: "PIN salah." };
  const store = await cookies();
  store.set(PIN_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return { ok: true };
}

export async function lockApp(): Promise<ActionResult> {
  const store = await cookies();
  store.delete(PIN_COOKIE);
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ================= CUSTOMERS ================= */

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  const name = valStr(formData, "name");
  if (!name) return { ok: false, error: "Nama pelanggan wajib diisi." };
  const r = await run(
    "INSERT INTO customers (name, phone, email, address, notes) VALUES (?, ?, ?, ?, ?)",
    name, valStr(formData, "phone"), valStr(formData, "email"), valStr(formData, "address"), valStr(formData, "notes"));
  await logActivity("create", "customer", r.lastInsertRowid, `Pelanggan ${name} ditambahkan`);
  revalidatePath("/pelanggan");
  revalidatePath("/");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateCustomer(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "Data tidak lengkap." };
  await run("UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, notes = ? WHERE id = ?",
    valStr(formData, "name"), valStr(formData, "phone"), valStr(formData, "email"), valStr(formData, "address"), valStr(formData, "notes"), id);
  await logActivity("update", "customer", id, "Pelanggan diupdate");
  revalidatePath("/pelanggan");
  return { ok: true };
}

export async function deleteCustomer(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM customers WHERE id = ?", id);
  await logActivity("delete", "customer", id, "Pelanggan dihapus");
  revalidatePath("/pelanggan");
  return { ok: true };
}

/* ================= PREMIUM ACCOUNTS ================= */

export async function createPremiumAccount(formData: FormData): Promise<ActionResult> {
  const appName = valStr(formData, "app_name");
  if (!appName) return { ok: false, error: "Nama aplikasi wajib diisi." };
  const r = await run(
    `INSERT INTO premium_accounts (app_name, email, password_acc, package_type, buy_price, sell_price, start_date, end_date, devices, status, customer_id, refund_amount, refund_reason, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    appName, valStr(formData, "email"), valStr(formData, "password_acc"), valStr(formData, "package_type") || "Bulanan",
    valNum(formData, "buy_price"), valNum(formData, "sell_price"), valStr(formData, "start_date"),
    valStr(formData, "end_date"), Math.max(1, Math.round(valNum(formData, "devices"))),
    valStr(formData, "status") || "active", Number(formData.get("customer_id")) || null,
    valNum(formData, "refund_amount"), valStr(formData, "refund_reason"), valStr(formData, "notes"));
  await logActivity("create", "premium_account", r.lastInsertRowid, `Akun ${appName} ditambahkan`);
  revalidatePath("/bisnis/premium");
  revalidatePath("/bisnis/garansi");
  revalidatePath("/");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updatePremiumAccount(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run(
    `UPDATE premium_accounts SET app_name = ?, email = ?, password_acc = ?, package_type = ?, buy_price = ?, sell_price = ?, start_date = ?, end_date = ?, devices = ?, status = ?, customer_id = ?, refund_amount = ?, refund_reason = ?, notes = ? WHERE id = ?`,
    valStr(formData, "app_name"), valStr(formData, "email"), valStr(formData, "password_acc"),
    valStr(formData, "package_type") || "Bulanan", valNum(formData, "buy_price"), valNum(formData, "sell_price"),
    valStr(formData, "start_date"), valStr(formData, "end_date"), Math.max(1, Math.round(valNum(formData, "devices"))),
    valStr(formData, "status") || "active", Number(formData.get("customer_id")) || null,
    valNum(formData, "refund_amount"), valStr(formData, "refund_reason"), valStr(formData, "notes"), id);
  await logActivity("update", "premium_account", id, "Akun premium diupdate");
  revalidatePath("/bisnis/premium");
  revalidatePath("/");
  return { ok: true };
}

export async function renewPremiumAccount(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const curr = await queryOne<{ app_name: string; end_date: string }>("SELECT app_name, end_date FROM premium_accounts WHERE id = ?", id);
  if (!curr) return { ok: false, error: "Akun tidak ditemukan." };
  const months = Math.max(1, Math.round(valNum(formData, "months")) || 1);
  const base = curr.end_date && curr.end_date >= new Date().toISOString().slice(0, 10)
    ? new Date(curr.end_date + "T00:00:00") : new Date();
  const newEnd = new Date(base);
  newEnd.setMonth(newEnd.getMonth() + months);
  await run("UPDATE premium_accounts SET end_date = ?, status = 'active', refund_amount = 0 WHERE id = ?", newEnd.toISOString().slice(0, 10), id);
  await logActivity("renew", "premium_account", id, `Akun ${curr.app_name} diperpanjang ${months} bulan`);
  revalidatePath("/bisnis/premium");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePremiumAccount(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM premium_accounts WHERE id = ?", id);
  await logActivity("delete", "premium_account", id, "Akun premium dihapus");
  revalidatePath("/bisnis/premium");
  revalidatePath("/");
  return { ok: true };
}

/* ================= FRAME PRODUCTS ================= */

export async function createFrameProduct(formData: FormData): Promise<ActionResult> {
  const name = valStr(formData, "name");
  if (!name) return { ok: false, error: "Nama produk wajib diisi." };
  const r = await run(
    `INSERT INTO frame_products (name, size, material, buy_price, sell_price, stock, min_stock, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    name, valStr(formData, "size"), valStr(formData, "material"), valNum(formData, "buy_price"),
    valNum(formData, "sell_price"), Math.round(valNum(formData, "stock")), Math.round(valNum(formData, "min_stock")), valStr(formData, "notes"));
  await logActivity("create", "frame_product", r.lastInsertRowid, `Produk frame ${name} ditambahkan`);
  revalidatePath("/bisnis/frame");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateFrameProduct(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run(
    `UPDATE frame_products SET name = ?, size = ?, material = ?, buy_price = ?, sell_price = ?, stock = ?, min_stock = ?, notes = ? WHERE id = ?`,
    valStr(formData, "name"), valStr(formData, "size"), valStr(formData, "material"), valNum(formData, "buy_price"),
    valNum(formData, "sell_price"), Math.round(valNum(formData, "stock")), Math.round(valNum(formData, "min_stock")), valStr(formData, "notes"), id);
  await logActivity("update", "frame_product", id, "Produk frame diupdate");
  revalidatePath("/bisnis/frame");
  return { ok: true };
}

export async function deleteFrameProduct(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM frame_products WHERE id = ?", id);
  await logActivity("delete", "frame_product", id, "Produk frame dihapus");
  revalidatePath("/bisnis/frame");
  return { ok: true };
}

/* ================= FRAME ORDERS ================= */

export async function createFrameOrder(formData: FormData): Promise<ActionResult> {
  const orderNo = await generateFrameOrderNo();
  const r = await run(
    `INSERT INTO frame_orders (order_no, customer_id, frame_product_id, custom_size, custom_material, custom_design, quantity, price, dp_amount, paid_amount, production_cost, deadline, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    orderNo, Number(formData.get("customer_id")) || null, Number(formData.get("frame_product_id")) || null,
    valStr(formData, "custom_size"), valStr(formData, "custom_material"), valStr(formData, "custom_design"),
    Math.max(1, Math.round(valNum(formData, "quantity"))), valNum(formData, "price"), valNum(formData, "dp_amount"),
    valNum(formData, "paid_amount"), valNum(formData, "production_cost"), valStr(formData, "deadline"),
    valStr(formData, "status") || "pending", valStr(formData, "notes"));
  await logActivity("create", "frame_order", r.lastInsertRowid, `Pesanan frame ${orderNo}`);
  revalidatePath("/bisnis/frame");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateFrameOrder(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run(
    `UPDATE frame_orders SET customer_id = ?, frame_product_id = ?, custom_size = ?, custom_material = ?, custom_design = ?, quantity = ?, price = ?, dp_amount = ?, paid_amount = ?, production_cost = ?, deadline = ?, status = ?, notes = ? WHERE id = ?`,
    Number(formData.get("customer_id")) || null, Number(formData.get("frame_product_id")) || null,
    valStr(formData, "custom_size"), valStr(formData, "custom_material"), valStr(formData, "custom_design"),
    Math.max(1, Math.round(valNum(formData, "quantity"))), valNum(formData, "price"), valNum(formData, "dp_amount"),
    valNum(formData, "paid_amount"), valNum(formData, "production_cost"), valStr(formData, "deadline"),
    valStr(formData, "status") || "pending", valStr(formData, "notes"), id);
  await logActivity("update", "frame_order", id, "Pesanan frame diupdate");
  revalidatePath("/bisnis/frame");
  return { ok: true };
}

export async function markFrameOrderLunas(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const order = await queryOne<{ price: number; quantity: number }>("SELECT price, quantity FROM frame_orders WHERE id = ?", id);
  if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };
  await run("UPDATE frame_orders SET paid_amount = ?, status = 'done' WHERE id = ?", order.price * order.quantity, id);
  await logActivity("payment", "frame_order", id, "Pesanan frame ditandai lunas");
  revalidatePath("/bisnis/frame");
  return { ok: true };
}

export async function deleteFrameOrder(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM frame_orders WHERE id = ?", id);
  await logActivity("delete", "frame_order", id, "Pesanan frame dihapus");
  revalidatePath("/bisnis/frame");
  return { ok: true };
}

/* ================= PROJECTS ================= */

export async function createProject(formData: FormData): Promise<ActionResult> {
  const projectNo = await generateProjectNo();
  const r = await run(
    `INSERT INTO projects (project_no, business_type, client_name, service_type, description, price, dp_amount, paid_amount, operational_cost, deadline, event_date, event_location, event_type, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    projectNo, valStr(formData, "business_type"), valStr(formData, "client_name"),
    valStr(formData, "service_type"), valStr(formData, "description"), valNum(formData, "price"),
    valNum(formData, "dp_amount"), valNum(formData, "paid_amount"), valNum(formData, "operational_cost"),
    valStr(formData, "deadline"), valStr(formData, "event_date"), valStr(formData, "event_location"),
    valStr(formData, "event_type"), valStr(formData, "status") || "lead");
  await logActivity("create", "project", r.lastInsertRowid, `Project ${valStr(formData, "client_name")} dibuat`);
  revalidatePath("/project");
  revalidatePath("/bisnis/editing");
  revalidatePath("/bisnis/documentation");
  revalidatePath("/");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run(
    `UPDATE projects SET business_type = ?, client_name = ?, service_type = ?, description = ?, price = ?, dp_amount = ?, paid_amount = ?, operational_cost = ?, deadline = ?, event_date = ?, event_location = ?, event_type = ?, status = ? WHERE id = ?`,
    valStr(formData, "business_type"), valStr(formData, "client_name"), valStr(formData, "service_type"),
    valStr(formData, "description"), valNum(formData, "price"), valNum(formData, "dp_amount"),
    valNum(formData, "paid_amount"), valNum(formData, "operational_cost"), valStr(formData, "deadline"),
    valStr(formData, "event_date"), valStr(formData, "event_location"), valStr(formData, "event_type"),
    valStr(formData, "status") || "lead", id);
  await logActivity("update", "project", id, "Project diupdate");
  revalidatePath("/project");
  revalidatePath("/bisnis/editing");
  revalidatePath("/bisnis/documentation");
  revalidatePath("/");
  return { ok: true };
}

export async function markProjectPaid(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const p = await queryOne<{ price: number; status: string }>("SELECT price, status FROM projects WHERE id = ?", id);
  if (!p) return { ok: false, error: "Project tidak ditemukan." };
  const next = p.status === "lead" ? "deal" : p.status === "deal" ? "processing" : p.status === "processing" ? "paid" : p.status === "done" ? "paid" : p.status;
  await run("UPDATE projects SET paid_amount = ?, status = ? WHERE id = ?", p.price, next, id);
  await logActivity("payment", "project", id, `Project berstatus ${next}`);
  revalidatePath("/project");
  revalidatePath("/bisnis/editing");
  revalidatePath("/bisnis/documentation");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProject(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM projects WHERE id = ?", id);
  await logActivity("delete", "project", id, "Project dihapus");
  revalidatePath("/project");
  revalidatePath("/bisnis/editing");
  revalidatePath("/bisnis/documentation");
  revalidatePath("/");
  return { ok: true };
}

/* ================= TRANSACTIONS ================= */

export async function createTransaction(formData: FormData): Promise<ActionResult> {
  const type = valStr(formData, "type");
  const allowed = ["income", "expense", "refund", "debt", "receivable"];
  if (!allowed.includes(type)) return { ok: false, error: "Jenis transaksi tidak valid." };
  const amount = valNum(formData, "amount");
  if (amount <= 0) return { ok: false, error: "Nominal harus lebih dari 0." };
  const r = await run(
    `INSERT INTO transactions (type, business_type, category, description, amount, tx_date, payment_method, storage, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    type, valStr(formData, "business_type") || "general", valStr(formData, "category"),
    valStr(formData, "description"), amount, valStr(formData, "tx_date") || new Date().toISOString().slice(0, 10),
    valStr(formData, "payment_method") || "Tunai", valStr(formData, "storage") || "Tunai", valStr(formData, "status") || "completed");
  await logActivity("create", "transaction", r.lastInsertRowid, `Transaksi ${type} ${amount}`);
  revalidatePath("/transaksi");
  revalidatePath("/keuangan");
  revalidatePath("/laporan");
  revalidatePath("/");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateTransaction(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const amount = valNum(formData, "amount");
  if (amount <= 0) return { ok: false, error: "Nominal harus lebih dari 0." };
  await run(
    `UPDATE transactions SET type = ?, business_type = ?, category = ?, description = ?, amount = ?, tx_date = ?, payment_method = ?, storage = ?, status = ? WHERE id = ?`,
    valStr(formData, "type"), valStr(formData, "business_type") || "general", valStr(formData, "category"),
    valStr(formData, "description"), amount, valStr(formData, "tx_date"),
    valStr(formData, "payment_method") || "Tunai", valStr(formData, "storage") || "Tunai", valStr(formData, "status") || "completed", id);
  await logActivity("update", "transaction", id, "Transaksi diupdate");
  revalidatePath("/transaksi");
  revalidatePath("/keuangan");
  revalidatePath("/laporan");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTransaction(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM transactions WHERE id = ?", id);
  await logActivity("delete", "transaction", id, "Transaksi dihapus");
  revalidatePath("/transaksi");
  revalidatePath("/keuangan");
  revalidatePath("/laporan");
  revalidatePath("/");
  return { ok: true };
}

export async function markReceivablePaid(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("UPDATE transactions SET status = 'paid' WHERE id = ?", id);
  await logActivity("payment", "transaction", id, "Piutang diterima");
  revalidatePath("/transaksi");
  revalidatePath("/");
  return { ok: true };
}

export async function markDebtPaid(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("UPDATE transactions SET status = 'paid' WHERE id = ?", id);
  await logActivity("payment", "transaction", id, "Hutang dibayar");
  revalidatePath("/transaksi");
  revalidatePath("/");
  return { ok: true };
}

/* ================= PENYIMPANAN KEUANGAN ================= */

export async function createStorage(formData: FormData): Promise<ActionResult> {
  const name = valStr(formData, "name");
  if (!name) return { ok: false, error: "Nama penyimpanan wajib diisi." };
  const r = await run(
    "INSERT INTO storages (name, type, account_no, initial_balance) VALUES (?, ?, ?, ?)",
    name, valStr(formData, "type") || "cash", valStr(formData, "account_no"), valNum(formData, "initial_balance"));
  await logActivity("create", "storage", r.lastInsertRowid, `Penyimpanan ${name} ditambahkan`);
  revalidatePath("/keuangan");
  revalidatePath("/transaksi");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateStorage(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const name = valStr(formData, "name");
  if (!name) return { ok: false, error: "Nama penyimpanan wajib diisi." };
  await run(
    "UPDATE storages SET name = ?, type = ?, account_no = ?, initial_balance = ?, is_active = ? WHERE id = ?",
    name, valStr(formData, "type") || "cash", valStr(formData, "account_no"),
    valNum(formData, "initial_balance"), valStr(formData, "is_active") === "1" ? 1 : 0, id);
  await logActivity("update", "storage", id, `Penyimpanan ${name} diupdate`);
  revalidatePath("/keuangan");
  revalidatePath("/transaksi");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteStorage(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const st = await queryOne<{ name: string }>("SELECT name FROM storages WHERE id = ?", id);
  if (!st) return { ok: false, error: "Penyimpanan tidak ditemukan." };
  const used = await queryOne<{ c: string | number }>("SELECT COUNT(*) as c FROM transactions WHERE storage = ?", st.name);
  if (Number(used?.c ?? 0) > 0) return { ok: false, error: `Masih ada ${used?.c} transaksi memakai "${st.name}". Ubah penyimpanannya dulu sebelum menghapus.` };
  await run("DELETE FROM storages WHERE id = ?", id);
  await logActivity("delete", "storage", id, `Penyimpanan ${st.name} dihapus`);
  revalidatePath("/keuangan");
  revalidatePath("/transaksi");
  revalidatePath("/");
  return { ok: true };
}

/* ================= CATATAN ================= */

export async function createNote(formData: FormData): Promise<ActionResult> {
  const title = valStr(formData, "title");
  if (!title) return { ok: false, error: "Judul catatan wajib diisi." };
  const r = await run("INSERT INTO notes (title, content, tag) VALUES (?, ?, ?)",
    title, valStr(formData, "content"), valStr(formData, "tag") || "Umum");
  await logActivity("create", "note", r.lastInsertRowid, `Catatan ${title}`);
  revalidatePath("/catatan");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateNote(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const title = valStr(formData, "title");
  if (!title) return { ok: false, error: "Judul catatan wajib diisi." };
  await run("UPDATE notes SET title = ?, content = ?, tag = ? WHERE id = ?",
    title, valStr(formData, "content"), valStr(formData, "tag") || "Umum", id);
  await logActivity("update", "note", id, `Catatan ${title} diupdate`);
  revalidatePath("/catatan");
  return { ok: true };
}

export async function deleteNote(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM notes WHERE id = ?", id);
  await logActivity("delete", "note", id, "Catatan dihapus");
  revalidatePath("/catatan");
  return { ok: true };
}

/* ================= TEMPLATE LAYANAN ================= */

export async function createTemplate(formData: FormData): Promise<ActionResult> {
  const title = valStr(formData, "step_title");
  if (!title) return { ok: false, error: "Judul langkah wajib diisi." };
  const script = valStr(formData, "script");
  if (!script) return { ok: false, error: "Isi template wajib diisi." };
  const businessType = valStr(formData, "business_type") || "premium";
  const sort = await queryOne<{ c: string | number }>("SELECT COUNT(*) as c FROM templates WHERE business_type = ?", businessType);
  const r = await run(
    "INSERT INTO templates (business_type, step_title, step_desc, step_kapan, script, sort) VALUES (?, ?, ?, ?, ?, ?)",
    businessType, title, valStr(formData, "step_desc"), valStr(formData, "step_kapan"), script, Number(sort?.c ?? 0));
  await logActivity("create", "template", r.lastInsertRowid, `Template ${title}`);
  revalidatePath("/layanan");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateTemplate(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const title = valStr(formData, "step_title");
  if (!title) return { ok: false, error: "Judul langkah wajib diisi." };
  const script = valStr(formData, "script");
  if (!script) return { ok: false, error: "Isi template wajib diisi." };
  const sort = valNum(formData, "sort");
  await run(
    "UPDATE templates SET business_type = ?, step_title = ?, step_desc = ?, step_kapan = ?, script = ?, sort = ? WHERE id = ?",
    valStr(formData, "business_type") || "premium", title, valStr(formData, "step_desc"),
    valStr(formData, "step_kapan"), script, sort, id);
  await logActivity("update", "template", id, `Template ${title} diupdate`);
  revalidatePath("/layanan");
  return { ok: true };
}

export async function deleteTemplate(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM templates WHERE id = ?", id);
  await logActivity("delete", "template", id, "Template dihapus");
  revalidatePath("/layanan");
  return { ok: true };
}

/* ================= SOP BISNIS ================= */

const SOP_COLORS = new Set(["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#f97316", "#f43f5e"]);
const SOP_ICONS = new Set([
  "smartphone", "clapperboard", "frame", "camera", "wallet", "clipboard", "truck", "store",
  "package", "sparkles", "video", "users", "banknote", "monitor", "book",
]);

export async function createBusinessLine(formData: FormData): Promise<ActionResult> {
  const name = valStr(formData, "name");
  if (!name) return { ok: false, error: "Nama lini bisnis wajib diisi." };
  const color = valStr(formData, "color") || "#8b5cf6";
  const icon = valStr(formData, "icon") || "clipboard";
  if (!SOP_COLORS.has(color)) return { ok: false, error: "Warna tidak valid." };
  if (!SOP_ICONS.has(icon)) return { ok: false, error: "Ikon tidak valid." };
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bisnis";
  const exists = await queryOne<{ c: string | number }>("SELECT COUNT(*) as c FROM business_lines WHERE slug = ?", slug);
  if (Number(exists?.c ?? 0) > 0) slug = `${slug}-${Date.now().toString().slice(-4)}`;
  const isActive = formData.get("is_active") !== null ? 1 : 0;
  const sort = await queryOne<{ c: string | number }>("SELECT COUNT(*) as c FROM business_lines");
  const r = await run(
    "INSERT INTO business_lines (name, slug, kind, description, color, icon, warn, is_active, sort) VALUES (?, ?, 'service', ?, ?, ?, ?, ?, ?)",
    name, slug, valStr(formData, "description"), color, icon, valStr(formData, "warn"), isActive, Number(sort?.c ?? 0));
  await logActivity("create", "business_line", r.lastInsertRowid, `Lini bisnis ${name}`);
  revalidatePath("/sop");
  revalidatePath("/transaksi");
  revalidatePath("/harga");
  revalidatePath("/laporan");
  revalidatePath("/layanan");
  revalidatePath("/project");
  revalidatePath("/");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateBusinessLine(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const name = valStr(formData, "name");
  if (!name) return { ok: false, error: "Nama lini bisnis wajib diisi." };
  const color = valStr(formData, "color") || "#8b5cf6";
  const icon = valStr(formData, "icon") || "clipboard";
  if (!SOP_COLORS.has(color)) return { ok: false, error: "Warna tidak valid." };
  if (!SOP_ICONS.has(icon)) return { ok: false, error: "Ikon tidak valid." };
  const sort = valNum(formData, "sort");
  const isActive = formData.get("is_active") !== null ? 1 : 0;
  await run(
    "UPDATE business_lines SET name = ?, description = ?, color = ?, icon = ?, warn = ?, is_active = ?, sort = ? WHERE id = ?",
    name, valStr(formData, "description"), color, icon, valStr(formData, "warn"), isActive, sort, id);
  await logActivity("update", "business_line", id, `Lini bisnis ${name} diupdate`);
  revalidatePath("/sop");
  revalidatePath("/transaksi");
  revalidatePath("/harga");
  revalidatePath("/laporan");
  revalidatePath("/layanan");
  revalidatePath("/project");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBusinessLine(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const line = await queryOne<{ name: string }>("SELECT name FROM business_lines WHERE id = ?", id);
  if (!line) return { ok: false, error: "Lini bisnis tidak ditemukan." };
  await run("DELETE FROM business_lines WHERE id = ?", id);
  await logActivity("delete", "business_line", id, `Lini bisnis ${line.name} dihapus`);
  revalidatePath("/sop");
  revalidatePath("/transaksi");
  revalidatePath("/harga");
  revalidatePath("/laporan");
  revalidatePath("/layanan");
  revalidatePath("/project");
  revalidatePath("/");
  return { ok: true };
}

export async function createSopStep(formData: FormData): Promise<ActionResult> {
  const lineId = valNum(formData, "line_id");
  if (!lineId) return { ok: false, error: "Lini bisnis tidak valid." };
  const title = valStr(formData, "title");
  if (!title) return { ok: false, error: "Judul langkah wajib diisi." };
  const sort = await queryOne<{ c: string | number }>("SELECT COUNT(*) as c FROM sop_steps WHERE line_id = ?", lineId);
  const r = await run(
    "INSERT INTO sop_steps (line_id, title, detail, tip, sort) VALUES (?, ?, ?, ?, ?)",
    lineId, title, valStr(formData, "detail"), valStr(formData, "tip"), Number(sort?.c ?? 0));
  await logActivity("create", "sop_step", r.lastInsertRowid, `Langkah SOP ${title}`);
  revalidatePath("/sop");
  return { ok: true, id: r.lastInsertRowid };
}

export async function updateSopStep(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  const title = valStr(formData, "title");
  if (!title) return { ok: false, error: "Judul langkah wajib diisi." };
  const sort = valNum(formData, "sort");
  await run(
    "UPDATE sop_steps SET title = ?, detail = ?, tip = ?, sort = ? WHERE id = ?",
    title, valStr(formData, "detail"), valStr(formData, "tip"), sort, id);
  await logActivity("update", "sop_step", id, `Langkah SOP ${title} diupdate`);
  revalidatePath("/sop");
  return { ok: true };
}

export async function deleteSopStep(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM sop_steps WHERE id = ?", id);
  await logActivity("delete", "sop_step", id, "Langkah SOP dihapus");
  revalidatePath("/sop");
  return { ok: true };
}

/* ================= PRICE LIST ================= */

export async function savePriceItem(formData: FormData): Promise<ActionResult> {
  const itemName = valStr(formData, "item_name");
  if (!itemName) return { ok: false, error: "Nama item wajib diisi." };
  const id = valNum(formData, "id");
  const price = valNum(formData, "price");
  if (id) {
    await run("UPDATE price_list SET business_type = ?, item_name = ?, category = ?, price = ?, unit = ?, note = ? WHERE id = ?",
      valStr(formData, "business_type"), itemName, valStr(formData, "category"), price,
      valStr(formData, "unit") || "pcs", valStr(formData, "note"), id);
    await logActivity("update", "price_list", id, `Harga ${itemName} diupdate`);
  } else {
    const r = await run("INSERT INTO price_list (business_type, item_name, category, price, unit, note) VALUES (?, ?, ?, ?, ?, ?)",
      valStr(formData, "business_type"), itemName, valStr(formData, "category"), price,
      valStr(formData, "unit") || "pcs", valStr(formData, "note"));
    await logActivity("create", "price_list", r.lastInsertRowid, `Harga ${itemName} ditambahkan`);
  }
  revalidatePath("/harga");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePriceItem(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  if (!id) return { ok: false, error: "ID tidak valid." };
  await run("DELETE FROM price_list WHERE id = ?", id);
  await logActivity("delete", "price_list", id, "Item harga dihapus");
  revalidatePath("/harga");
  revalidatePath("/");
  return { ok: true };
}

/* ================= WARRANTY CLAIMS (GARANSI PREMIUM) ================= */

export async function registerWarrantyClaim(formData: FormData): Promise<ActionResult> {
  const accountId = valNum(formData, "account_id");
  const issue = valStr(formData, "issue");
  if (!accountId || !issue) return { ok: false, error: "Akun dan kendala wajib diisi." };
  const acc = await queryOne<{ app_name: string }>("SELECT app_name FROM premium_accounts WHERE id = ?", accountId);
  if (!acc) return { ok: false, error: "Akun tidak ditemukan." };
  const date = valStr(formData, "claim_date") || new Date().toISOString().slice(0, 10);
  const r = await run("INSERT INTO warranty_claims (account_id, claim_date, issue, status) VALUES (?, ?, ?, 'pending')",
    accountId, date, issue);
  await logActivity("create", "warranty_claim", r.lastInsertRowid, `Klaim garansi ${acc.app_name}`);
  revalidatePath("/bisnis/premium");
  revalidatePath("/garansi");
  return { ok: true };
}

export async function resolveWarrantyClaim(formData: FormData): Promise<ActionResult> {
  const id = valNum(formData, "id");
  const status = valStr(formData, "status");
  if (!id || !["approved", "rejected"].includes(status)) return { ok: false, error: "Data tidak valid." };
  const note = valStr(formData, "resolution_note");
  const today = new Date().toISOString().slice(0, 10);
  await run("UPDATE warranty_claims SET status = ?, resolution_date = ?, resolution_note = ? WHERE id = ?", status, today, note, id);
  const c = await queryOne<{ account_id: number }>("SELECT account_id FROM warranty_claims WHERE id = ?", id);
  if (c) {
    await run(`UPDATE premium_accounts SET status = '${status === "approved" ? "expired" : "active"}' WHERE id = ?`, c.account_id);
  }
  await logActivity("update", "warranty_claim", id, `Klaim garansi ${status === "approved" ? "disetujui" : "ditolak"}`);
  revalidatePath("/bisnis/premium");
  revalidatePath("/garansi");
  return { ok: true };
}

/* ================= DEMO / RESET / IMPORT ================= */

export async function resetDemoAction(): Promise<void> {
  await resetDemoData();
  await logActivity("reset", "system", 0, "Data demo direset");
  revalidatePath("/", "layout");
}

export async function startFromScratchAction(): Promise<void> {
  await activateApp();
  await logActivity("reset", "system", 0, "Data dikosongkan, mulai pakai aplikasi");
  revalidatePath("/", "layout");
}

export async function restoreAction(formData: FormData): Promise<void> {
  const file = formData.get("file");
  if (!(file instanceof Blob)) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text) as Record<string, unknown[]>;
    if (!Array.isArray(json.customers) || !Array.isArray(json.premium_accounts)) return;
    await restoreAllData(json);
    const name = await getSetting("business_name");
    await setSetting("business_name", name ?? "Ilham Business Manager");
    await setSetting("demo_mode", "false");
    await logActivity("restore", "system", 0, "Data diimpor dari file backup");
    revalidatePath("/", "layout");
  } catch {
    // abaikan file rusak
  }
}

/* ================= SETTINGS ================= */

export async function updateSettings(formData: FormData): Promise<void> {
  const name = valStr(formData, "business_name");
  if (name) await setSetting("business_name", name);
  const wa = valStr(formData, "wa_number");
  await setSetting("wa_number", wa);
  await logActivity("update", "settings", 0, "Pengaturan diperbarui");
  revalidatePath("/");
  revalidatePath("/pengaturan");
}

export async function backupAction(): Promise<void> {
  try {
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const data = JSON.stringify(await dumpAllData(), null, 2);
    let location = "backup/";
    try {
      fs.mkdirSync("backup", { recursive: true });
      fs.writeFileSync(`backup/bismart-backup-${stamp}.json`, data);
    } catch {
      const tmp = path.join(os.tmpdir(), `bismart-backup-${stamp}.json`);
      fs.writeFileSync(tmp, data);
      location = "tmp";
    }
    await logActivity("backup", "system", 0, `Backup data dibuat (${location})`);
  } catch {
    await logActivity("backup", "system", 0, "Backup gagal");
  }
}