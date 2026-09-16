import { Pool, type QueryResult } from "pg";
import { TEMPLATE_SEED } from "./template-seed";
import { SOP_SEED, SOP_SEED_VERSION } from "./sop-seed";

let _pool: Pool | undefined;

function getPool(): Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL belum diatur di .env.local (string koneksi Supabase).");
    }
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 15000,
    });
  }
  return _pool;
}

export type SQLValue = string | number | null | boolean | Date | bigint | Uint8Array;

function toPg(sql: string, params: SQLValue[] = []) {
  let i = 0;
  const text = sql.replace(/\?/g, () => `$${++i}`);
  return { text, values: params };
}

function normalizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v !== null && typeof v === "string" && /^(id|entity_id|reference_id|customer_id|account_id|frame_product_id|line_id)$/.test(k) && /^-?\d+$/.test(v)) {
        out[k] = Number(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  });
}

async function execQuery(sql: string, params: SQLValue[] = []): Promise<QueryResult> {
  const { text, values } = toPg(sql, params);
  try {
    return await getPool().query(text, values);
  } catch (e) {
    if (!/^[\s(]*SELECT/i.test(sql) && !/current transaction/i.test(String(e))) {
      throw e;
    }
    throw e;
  }
}

/* ---------- Schema ---------- */

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS premium_accounts (
    id BIGSERIAL PRIMARY KEY,
    app_name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_acc TEXT,
    package_type TEXT NOT NULL DEFAULT 'Bulanan',
    buy_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    sell_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    devices INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    refund_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    refund_reason TEXT,
    warranty_days INTEGER NOT NULL DEFAULT 0,
    warranty_end TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS warranty_claims (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT REFERENCES premium_accounts(id) ON DELETE CASCADE,
    claim_date TEXT NOT NULL,
    issue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    resolution_date TEXT,
    resolution_note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS frame_products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    size TEXT NOT NULL DEFAULT 'A4',
    material TEXT NOT NULL DEFAULT 'Kayu',
    buy_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    sell_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS price_list (
    id BIGSERIAL PRIMARY KEY,
    business_type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pcs',
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    project_no TEXT NOT NULL UNIQUE,
    business_type TEXT NOT NULL,
    client_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    dp_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    paid_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    operational_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
    deadline TEXT,
    event_date TEXT,
    event_location TEXT,
    event_type TEXT,
    status TEXT NOT NULL DEFAULT 'lead',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS frame_orders (
    id BIGSERIAL PRIMARY KEY,
    order_no TEXT NOT NULL UNIQUE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    frame_product_id BIGINT REFERENCES frame_products(id) ON DELETE SET NULL,
    custom_size TEXT,
    custom_material TEXT,
    custom_design TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    dp_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    paid_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    production_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
    deadline TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('income','expense','refund','debt','receivable')),
    business_type TEXT NOT NULL DEFAULT 'general',
    reference_type TEXT,
    reference_id BIGINT,
    category TEXT,
    description TEXT,
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    tx_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT DEFAULT 'Tunai',
    storage TEXT DEFAULT 'Tunai',
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS storages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'cash',
    account_no TEXT,
    initial_balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    tag TEXT DEFAULT 'Umum',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS templates (
    id BIGSERIAL PRIMARY KEY,
    business_type TEXT NOT NULL,
    step_title TEXT NOT NULL,
    step_desc TEXT,
    step_kapan TEXT,
    script TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS business_lines (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#8b5cf6',
    icon TEXT NOT NULL DEFAULT 'clipboard',
    warn TEXT,
    kind TEXT NOT NULL DEFAULT 'service',
    is_active INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sop_steps (
    id BIGSERIAL PRIMARY KEY,
    line_id BIGINT NOT NULL REFERENCES business_lines(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    detail TEXT,
    tip TEXT,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS activity_log (
    id BIGSERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id BIGINT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

const MIGRATIONS: [string, string][] = [
  ["premium_accounts", "warranty_days INTEGER NOT NULL DEFAULT 0"],
  ["premium_accounts", "warranty_end TEXT"],
  ["transactions", "storage TEXT DEFAULT 'Tunai'"],
  ["business_lines", "slug TEXT"],
  ["business_lines", "kind TEXT NOT NULL DEFAULT 'service'"],
  ["business_lines", "is_active INTEGER NOT NULL DEFAULT 1"],
];

const SLUG_MAP: Record<string, { slug: string; kind: string }> = {
  "Premium Apps": { slug: "premium", kind: "service" },
  "Jasa Editing": { slug: "editing", kind: "service" },
  "Frame Custom": { slug: "frame", kind: "service" },
  "Dokumentasi Acara": { slug: "documentation", kind: "service" },
  "Keuangan & Operasional": { slug: "operasional", kind: "internal" },
};

async function backfillBusinessSlugs(pool: ReturnType<typeof getPool>) {
  const rows = await pool.query<{ id: number; name: string; slug: string | null; kind: string | null }>(
    "SELECT id, name, slug, kind FROM business_lines");
  const used = new Set<string>();
  for (const r of rows.rows) if (r.slug) used.add(r.slug);
  for (const r of rows.rows) {
    if (!r.slug) {
      let slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bisnis";
      let base = slug;
      let i = 1;
      while (used.has(slug)) { slug = `${base}-${i++}`; }
      used.add(slug);
      const kind = SLUG_MAP[r.name]?.kind ?? (r.kind ?? "service");
      await pool.query("UPDATE business_lines SET slug = $1, kind = $2 WHERE id = $3", [slug, kind, r.id]);
    } else if (SLUG_MAP[r.name] && r.kind !== SLUG_MAP[r.name].kind) {
      await pool.query("UPDATE business_lines SET kind = $1 WHERE id = $2", [SLUG_MAP[r.name].kind, r.id]);
    }
  }
  const mapped = await pool.query<{ id: number; name: string; slug: string | null }>(
    "SELECT id, name, slug FROM business_lines");
  for (const [lineName, map] of Object.entries(SLUG_MAP)) {
    const row = mapped.rows.find((r) => r.name === lineName);
    if (!row || row.slug === map.slug) continue;
    const clash = mapped.rows.some((x) => x.id !== row.id && x.slug === map.slug);
    if (clash) continue;
    await pool.query("UPDATE business_lines SET slug = $1, kind = $2 WHERE id = $3", [map.slug, map.kind, row.id]);
  }
}

async function initDb() {
  const pool = getPool();
  for (const ddl of SCHEMA) await pool.query(ddl);
  for (const [table, col] of MIGRATIONS) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col}`);
  }
  await backfillBusinessSlugs(pool);
}

let ready: Promise<void> | null = null;
function ensureReady(): Promise<void> {
  if (!ready) ready = (async () => {
    await initDb();
    await seedStoragesI();
    await seedTemplatesI();
    await seedSopI();
    const users = await queryAllI<{ c: number }>("SELECT COUNT(*) as c FROM users", []);
    const demo = await getSettingI("demo_mode");
    if (users.length === 0 || (Number(users[0]?.c ?? 0) === 0 && demo !== "false")) {
      await clearAllDataInternal();
      await seedDemoDataI();
    }
  })();
  return ready;
}

const STORAGE_SEED: [string, string, string, number][] = [
  ["Tunai", "cash", "", 0],
  ["BRI", "bank", "", 0],
  ["SEABANK", "bank", "", 0],
  ["DANA", "ewallet", "", 0],
];

async function seedStoragesI() {
  for (const [name, type, accountNo, initial] of STORAGE_SEED) {
    await runI(
      "INSERT INTO storages (name, type, account_no, initial_balance) VALUES (?, ?, ?, ?) ON CONFLICT (name) DO NOTHING",
      [name, type, accountNo, initial]);
  }
}

async function seedTemplatesI() {
  const c = await queryAllI<{ c: string | number }>("SELECT COUNT(*) as c FROM templates", []);
  if (Number(c[0]?.c ?? 0) > 0) return;
  for (let i = 0; i < TEMPLATE_SEED.length; i++) {
    const t = TEMPLATE_SEED[i];
    await runI(
      "INSERT INTO templates (business_type, step_title, step_desc, step_kapan, script, sort) VALUES (?, ?, ?, ?, ?, ?)",
      [t.business_type, t.step_title, t.step_desc, t.step_kapan, t.script, i]);
  }
}

async function seedSopI() {
  const ver = await getSettingI("sop_seed_version");
  if (ver === String(SOP_SEED_VERSION)) return;
  const lines = await queryAllI<{ id: number; name: string; slug: string | null }>(
    "SELECT id, name, slug FROM business_lines", []);
  const bySlug = new Map<string, number>();
  const byName = new Map<string, number>();
  for (const l of lines) {
    if (l.slug) bySlug.set(l.slug, l.id);
    byName.set(l.name, l.id);
  }
  let lineSort = lines.length * 10;
  for (const entry of SOP_SEED) {
    let lineId = bySlug.get(entry.line.slug ?? "") ?? byName.get(entry.line.name);
    if (lineId !== undefined) {
      await runI("DELETE FROM sop_steps WHERE line_id = ?", [lineId]);
    } else {
      const r = await runI(
        "INSERT INTO business_lines (name, slug, kind, description, color, icon, warn, is_active, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [entry.line.name, entry.line.slug ?? null, entry.line.kind ?? "service", entry.line.description ?? null,
         entry.line.color, entry.line.icon, entry.line.warn || null, 1, lineSort]);
      lineId = r.lastInsertRowid;
      lineSort += 10;
    }
    let stepSort = 0;
    for (const s of entry.steps) {
      await runI(
        "INSERT INTO sop_steps (line_id, title, detail, tip, sort) VALUES (?, ?, ?, ?, ?)",
        [lineId, s.title, s.detail ?? null, s.tip ?? null, stepSort]);
      stepSort += 10;
    }
  }
  await setSettingI("sop_seed_version", String(SOP_SEED_VERSION));
}

/* ---------- Internal cores (no ensureReady, used inside the init IIFE) ---------- */

async function queryAllI<T>(sql: string, params: SQLValue[]): Promise<T[]> {
  const r = await execQuery(sql, params);
  return normalizeRows(r.rows as Record<string, unknown>[]) as T[];
}

async function queryOneI<T>(sql: string, params: SQLValue[]): Promise<T | undefined> {
  return (await queryAllI<T>(sql, params))[0];
}

async function runI(sql: string, params: SQLValue[]): Promise<{ lastInsertRowid: number; changes: number }> {
  const isInsert = /^\s*INSERT/i.test(sql);
  const hasId =
    !/^\s*INSERT\s+INTO\s+(settings)\b/i.test(sql);
  const addReturning = isInsert && hasId && !/\sRETURNING\s/i.test(sql);
  const { text, values } = toPg(addReturning ? sql + " RETURNING id" : sql, params);
  const r = await getPool().query(text, values);
  return { lastInsertRowid: addReturning ? Number((r.rows[0] as { id?: unknown })?.id ?? 0) : 0, changes: r.rowCount ?? 0 };
}

async function getSettingI(key: string): Promise<string | null> {
  const rows = await queryAllI<{ value: string | null }>("SELECT value FROM settings WHERE key = ?", [key]);
  return rows[0]?.value ?? null;
}

async function setSettingI(key: string, value: string) {
  await runI("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value", [key, value]);
}

async function logActivityI(action: string, entityType: string, entityId: number, details: string) {
  await runI("INSERT INTO activity_log (action, entity_type, entity_id, details) VALUES (?, ?, ?, ?)", [action, entityType, entityId || null, details]);
}

/* ---------- Public API ---------- */

export async function queryAll<T>(sql: string, ...params: SQLValue[]): Promise<T[]> {
  await ensureReady();
  return queryAllI<T>(sql, params);
}

export async function queryOne<T>(sql: string, ...params: SQLValue[]): Promise<T | undefined> {
  await ensureReady();
  return queryOneI<T>(sql, params);
}

export async function run(sql: string, ...params: SQLValue[]): Promise<{ lastInsertRowid: number; changes: number }> {
  await ensureReady();
  return runI(sql, params);
}

export async function getSetting(key: string): Promise<string | null> {
  await ensureReady();
  return getSettingI(key);
}

export async function setSetting(key: string, value: string) {
  await ensureReady();
  await setSettingI(key, value);
}

export async function logActivity(action: string, entityType: string, entityId: number, details: string) {
  await ensureReady();
  await logActivityI(action, entityType, entityId, details);
}

/* ---------- Internal data helpers ---------- */

async function clearTable(name: string) {
  await getPool().query(`TRUNCATE TABLE ${name} RESTART IDENTITY CASCADE`);
}

async function clearAllDataInternal() {
  const tables = ["activity_log", "transactions", "warranty_claims", "frame_orders", "projects", "price_list", "frame_products", "premium_accounts", "customers", "notes"];
  for (const t of tables) await clearTable(t);
}

export async function clearAllData() {
  await ensureReady();
  await clearAllDataInternal();
}

export async function seedDemoData() {
  await ensureReady();
  await seedDemoDataI();
}

async function seedDemoDataI() {
  await seedStoragesI();
  await seedTemplatesI();
  await seedSopI();
  async function insCust(name: string, phone: string, email: string): Promise<number> {
    const r = await runI("INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)", [name, phone, email]);
    return r.lastInsertRowid;
  }
  const c1 = await insCust("Rina Susanti", "081234567890", "rina@email.com");
  const c2 = await insCust("Ahmad Fauzi", "082345678901", "ahmad@email.com");
  const c3 = await insCust("Dewi Lestari", "083456789012", "dewi@email.com");
  const c4 = await insCust("Budi Prasetyo", "084567890123", "budi@email.com");

  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = iso(now);
  const addDays = (n: number) => iso(new Date(now.getTime() + n * 86400000));

  await runI(`INSERT INTO premium_accounts (app_name, email, package_type, buy_price, sell_price, start_date, end_date, devices, status, customer_id, warranty_days, warranty_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Netflix", "netflix@email.com", "Bulan", 55000, 85000, addDays(-10), today, 2, "expired", c1, 7, addDays(-3)]);
  await runI(`INSERT INTO premium_accounts (app_name, email, package_type, buy_price, sell_price, start_date, end_date, devices, status, customer_id, warranty_days, warranty_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Spotify", "spotify@email.com", "Bulan", 25000, 45000, today, addDays(30), 1, "active", c2, 7, addDays(30)]);
  await runI(`INSERT INTO premium_accounts (app_name, email, package_type, buy_price, sell_price, start_date, end_date, devices, status, customer_id, warranty_days, warranty_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["Canva Pro", "canva@email.com", "Tahun", 180000, 280000, today, addDays(3), 1, "active", c3, 14, addDays(3)]);
  await runI(`INSERT INTO premium_accounts (app_name, email, package_type, buy_price, sell_price, start_date, end_date, devices, status, customer_id, warranty_days, warranty_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["YouTube Premium", "yt@email.com", "Bulan", 30000, 55000, addDays(-10), addDays(7), 3, "active", c4, 7, addDays(7)]);

  async function insPrice(b: string, name: string, cat: string, price: number, unit: string, note: string) {
    await runI("INSERT INTO price_list (business_type, item_name, category, price, unit, note) VALUES (?, ?, ?, ?, ?, ?)", [b, name, cat, price, unit, note]);
  }
  await insPrice("premium", "Netflix 1 Bulan", "Akun Premium", 85000, "akun", "Free screen 4");
  await insPrice("premium", "Spotify 1 Bulan", "Akun Premium", 45000, "akun", "1 device");
  await insPrice("premium", "Canva Pro 1 Tahun", "Akun Premium", 280000, "akun", "Dengan garansi 14 hari");
  await insPrice("editing", "Editing Video Dasar", "Jasa Editing", 150000, "video", "1-3 menit");
  await insPrice("editing", "Editing Foto (5 pcs)", "Jasa Editing", 100000, "paket", "Color grading");
  await insPrice("editing", "Desain Feed IG", "Desain Grafis", 75000, "post", "Stories + feed");
  await insPrice("documentation", "Dokumentasi Pernikahan", "Paket Dokumentasi", 2500000, "acara", "Foto + video s/d 40 jam durasi");
  await insPrice("documentation", "Dokumentasi Acara Klub", "Paket Dokumentasi", 1200000, "acara", "3 jam durasi");
  await insPrice("frame", "Bingkai Kayu A4", "Bingkai Custom", 35000, "pcs", "Variasi kayu");
  await insPrice("frame", "Bingkai Aluminium A3", "Bingkai Custom", 55000, "pcs", "Tahan karat");

  async function insFrame(name: string, size: string, material: string, buy: number, sell: number, stock: number, min: number) {
    await runI("INSERT INTO frame_products (name, size, material, buy_price, sell_price, stock, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, size, material, buy, sell, stock, min]);
  }
  await insFrame("Bingkai Kayu A4", "A4", "Kayu", 15000, 35000, 20, 5);
  await insFrame("Bingkai Aluminium A3", "A3", "Aluminium", 25000, 55000, 12, 3);
  await insFrame("Bingkai Minimalis 4R", "4R", "MDF", 8000, 20000, 50, 10);
  await insFrame("Bingkai Premium 10R", "10R", "Kayu Jati", 45000, 95000, 8, 2);

  async function insProject(no: string, b: string, client: string, svc: string, price: number, dp: number, paid: number, opc: number, deadline: string | null, evDate: string | null, evLoc: string | null, evType: string | null, status: string) {
    await runI(`INSERT INTO projects (project_no, business_type, client_name, service_type, price, dp_amount, paid_amount, operational_cost, deadline, event_date, event_location, event_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [no, b, client, svc, price, dp, paid, opc, deadline, evDate, evLoc, evType, status]);
  }
  await insProject("PRJ-20260915-0001", "editing", "Rina Susanti", "Editing Video", 500000, 200000, 200000, 50000, addDays(7), null, null, null, "processing");
  await insProject("PRJ-20260915-0002", "editing", "Ahmad Fauzi", "Editing Foto", 300000, 100000, 100000, 30000, addDays(3), null, null, null, "deal");
  await insProject("PRJ-20260915-0003", "documentation", "Dewi Lestari", "Dokumentasi Pernikahan", 2500000, 1000000, 1000000, 300000, null, addDays(30), "Gedung Serbaguna", "Pernikahan", "deal");
  await insProject("PRJ-20260915-0004", "documentation", "Budi Prasetyo", "Dokumentasi Acara", 1500000, 500000, 500000, 200000, null, addDays(7), "Hotel Grand", "Seminar", "processing");

  async function insOrder(no: string, cust: number, prod: number, qty: number, price: number, dp: number, paid: number, cost: number, dl: string | null, status: string) {
    await runI(`INSERT INTO frame_orders (order_no, customer_id, frame_product_id, quantity, price, dp_amount, paid_amount, production_cost, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [no, cust, prod, qty, price, dp, paid, cost, dl, status]);
  }
  await insOrder("FRM-20260915-0001", c1, 1, 2, 70000, 35000, 35000, 30000, addDays(7), "processing");
  await insOrder("FRM-20260915-0002", c3, 3, 5, 100000, 50000, 50000, 40000, addDays(3), "pending");

  async function insTx(type: string, b: string, cat: string, desc: string, amount: number, date: string, method: string, storage = "Tunai") {
    await runI("INSERT INTO transactions (type, business_type, category, description, amount, tx_date, payment_method, storage, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')",
      [type, b, cat, desc, amount, date, method, storage]);
  }
  await insTx("expense", "general", "Operasional", "Sewa tempat bulanan", 2000000, addDays(-10), "Transfer", "BRI");
  await insTx("expense", "editing", "Transport", "Transport client meeting", 50000, today, "Tunai");
  await insTx("expense", "frame", "Bahan", "Pembelian kaca bingkai", 200000, today, "Transfer", "BRI");
  await insTx("income", "premium", "Penjualan", "Top up Netflix 1 bulan", 85000, today, "QRIS", "DANA");
  await insTx("income", "editing", "Service", "DP editing video Rina", 200000, addDays(-10), "Transfer", "BRI");
  await insTx("income", "frame", "Penjualan", "Penjualan bingkai kayu A4", 70000, today, "Tunai");
  await insTx("income", "documentation", "Service", "DP dokumentasi pernikahan", 1000000, addDays(-10), "Transfer", "SEABANK");

  await logActivityI("create", "premium_account", 1, "Demo: Akun Netflix ditambahkan");
  await logActivityI("create", "project", 1, "Demo: Project editing Rina");
  await logActivityI("create", "frame_order", 1, "Demo: Pesanan frame Rina");
  await logActivityI("create", "transaction", 4, "Demo: Pemasukan Netflix");

  await setSettingI("demo_mode", "true");
  await setSettingI("business_name", "Ilham Business Manager");
  await setSettingI("wa_number", "");
}

export async function resetDemoData() {
  await ensureReady();
  await clearAllDataInternal();
  await seedDemoDataI();
}

export async function activateApp() {
  await ensureReady();
  await setSetting("demo_mode", "false");
  await clearAllDataInternal();
  await run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON CONFLICT (username) DO NOTHING", "admin", "admin", "admin");
  await setSetting("business_name", "Ilham Business Manager");
  await setSetting("wa_number", "");
}

export { getPool };

export async function generateProjectNo(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const row = await queryOne<{ c: string | number }>("SELECT COUNT(*) as c FROM projects WHERE project_no LIKE ?", `PRJ-${today}-%`);
  return `PRJ-${today}-${String(Number(row?.c ?? 0) + 1).padStart(4, "0")}`;
}

export async function generateFrameOrderNo(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const row = await queryOne<{ c: string | number }>("SELECT COUNT(*) as c FROM frame_orders WHERE order_no LIKE ?", `FRM-${today}-%`);
  return `FRM-${today}-${String(Number(row?.c ?? 0) + 1).padStart(4, "0")}`;
}

export async function dumpAllData(): Promise<Record<string, unknown[]>> {
  await ensureReady();
  const tables = ["settings", "storages", "templates", "business_lines", "sop_steps", "customers", "premium_accounts", "warranty_claims", "frame_products", "price_list", "projects", "frame_orders", "transactions", "notes", "activity_log"];
  const out: Record<string, unknown[]> = {};
  for (const t of tables) out[t] = await queryAll(`SELECT * FROM ${t}`);
  return out;
}

export async function restoreAllData(data: Record<string, unknown[]>) {
  await ensureReady();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const tables = ["activity_log", "transactions", "warranty_claims", "frame_orders", "projects", "price_list", "frame_products", "premium_accounts", "customers", "notes", "sop_steps", "business_lines"];
    for (const t of tables) await client.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE`);
    const order = ["storages", "templates", "business_lines", "sop_steps", "customers", "premium_accounts", "warranty_claims", "frame_products", "price_list", "projects", "frame_orders", "transactions", "notes", "activity_log"];
    for (const t of order) {
      const rows = data[t];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const first = rows[0] as Record<string, unknown>;
      const keys = Object.keys(first).filter((k) => k !== "id");
      if (keys.length === 0) continue;
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      for (const r of rows) {
        const row = r as Record<string, unknown>;
        const values = keys.map((k) => (row[k] === undefined ? null : (row[k] as SQLValue)));
        await client.query(`INSERT INTO ${t} (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}