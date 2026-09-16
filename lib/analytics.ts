import { queryAll } from "./db";
import { getBusinessOptions } from "./business";

export interface TxRow {
  id: number;
  type: string;
  business_type: string;
  category: string | null;
  description: string | null;
  amount: number;
  tx_date: string;
  payment_method: string | null;
  storage: string | null;
  status: string;
}

export interface StorageRow {
  id: number;
  name: string;
  type: string;
  account_no: string | null;
  initial_balance: number;
  is_active: number;
}

export type StorageBalance = StorageRow & {
  income: number;
  expense: number;
  refund: number;
  balance: number;
};

export async function getStorages(): Promise<StorageRow[]> {
  return queryAll<StorageRow>("SELECT * FROM storages ORDER BY is_active DESC, id ASC");
}

export async function storageBalances(): Promise<StorageBalance[]> {
  const storages = await getStorages();
  const sums = await queryAll<{ storage: string; income: number | string; expense: number | string; refund: number | string }>(
    `SELECT COALESCE(NULLIF(storage, ''), 'Tunai') AS storage,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
            COALESCE(SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END), 0) AS refund
     FROM transactions
     GROUP BY 1`);
  const sumMap = new Map<string, { income: number; expense: number; refund: number }>();
  for (const s of sums) {
    sumMap.set(s.storage, {
      income: Number(s.income),
      expense: Number(s.expense),
      refund: Number(s.refund),
    });
  }
  const used = new Set<string>();
  return storages.map((st) => {
    const flow = sumMap.get(st.name) ?? { income: 0, expense: 0, refund: 0 };
    if (sumMap.has(st.name)) used.add(st.name);
    return {
      ...st,
      ...flow,
      balance: st.initial_balance + flow.income - flow.expense - flow.refund,
    };
  }).concat(
    [...sumMap.entries()]
      .filter(([name]) => !used.has(name))
      .map(([name, flow]) => ({
        id: 0,
        name,
        type: "other",
        account_no: null,
        initial_balance: 0,
        is_active: 1,
        ...flow,
        balance: flow.income - flow.expense - flow.refund,
      }))
  );
}

export async function getNotes() {
  return queryAll<{ id: number; title: string; content: string | null; tag: string | null; created_at: string }>(
    "SELECT * FROM notes ORDER BY id DESC");
}

export async function getTransactions(business?: string, month?: number, year?: number): Promise<TxRow[]> {
  let sql = "SELECT * FROM transactions WHERE 1=1";
  const params: (string | number)[] = [];
  if (business && business !== "all") { sql += " AND business_type = ?"; params.push(business); }
  if (month && year) { sql += " AND substr(tx_date,1,7) = ?"; params.push(`${year}-${String(month).padStart(2, "0")}`); }
  sql += " ORDER BY tx_date DESC, id DESC";
  return queryAll<TxRow>(sql, ...params);
}

export function sumByType(rows: TxRow[], type: string): number {
  return rows.filter((r) => r.type === type).reduce((s, r) => s + r.amount, 0);
}

export function calcFinance(rows: TxRow[]) {
  const income = sumByType(rows, "income");
  const expense = sumByType(rows, "expense");
  const refund = sumByType(rows, "refund");
  const receivable = sumByType(rows, "receivable");
  const debt = sumByType(rows, "debt");
  const balance = income - expense - refund;
  const receivableOpen = rows.filter((r) => r.type === "receivable" && r.status !== "paid").reduce((s, r) => s + r.amount, 0);
  const debtOpen = rows.filter((r) => r.type === "debt" && r.status !== "paid").reduce((s, r) => s + r.amount, 0);
  return { income, expense, refund, receivable, debt, balance, receivableOpen, debtOpen };
}

export async function premiumStats() {
  const rows = await queryAll<{ buy_price: number; sell_price: number; refund_amount: number; status: string; end_date: string | null }>(
    "SELECT buy_price, sell_price, refund_amount, status, end_date FROM premium_accounts");
  const active = rows.filter((r) => r.status === "active");
  const expired = rows.filter((r) => r.status === "expired");
  const revenue = rows.reduce((s, r) => s + r.sell_price, 0);
  const capital = rows.reduce((s, r) => s + r.buy_price, 0);
  const refunds = rows.reduce((s, r) => s + r.refund_amount, 0);
  const profit = revenue - capital - refunds;
  const today = new Date().toISOString().slice(0, 10);
  const expiringSoonCount = active.filter((r) => {
    if (!r.end_date) return false;
    const diff = Math.floor((new Date(r.end_date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
    return diff <= 7;
  }).length;
  return { active, expired, revenue, capital, refunds, profit, expiringSoonCount };
}

export async function frameStats() {
  const products = await queryAll<{ buy_price: number; stock: number }>("SELECT buy_price, stock FROM frame_products");
  const orders = await queryAll<{ quantity: number; price: number; paid_amount: number; production_cost: number; status: string }>(
    "SELECT quantity, price, paid_amount, production_cost, status FROM frame_orders");
  const stockValue = products.reduce((s, p) => s + p.buy_price * p.stock, 0);
  const eff = orders.filter((o) => o.status !== "cancelled");
  const revenue = eff.reduce((s, o) => s + o.price * o.quantity, 0);
  const prodCost = eff.reduce((s, o) => s + o.production_cost * o.quantity, 0);
  const paid = orders.reduce((s, o) => s + o.paid_amount, 0);
  const outstanding = eff.filter((o) => o.status !== "done").reduce((s, o) => s + o.price * o.quantity - o.paid_amount, 0);
  const profit = revenue - prodCost;
  return { stockValue, revenue, prodCost, paid, outstanding, profit, orderCount: orders.length, productCount: products.length };
}

export async function projectStats(business?: string) {
  let sql = "SELECT * FROM projects";
  const params: string[] = [];
  if (business) { sql += " WHERE business_type = ?"; params.push(business); }
  const rows = await queryAll<{
    id: number; project_no: string; business_type: string; price: number; paid_amount: number;
    operational_cost: number; status: string; deadline: string | null; event_date: string | null;
    client_name: string; service_type: string; event_type: string | null;
  }>(sql, ...params);

  const active = rows.filter((r) => !["paid", "cancelled"].includes(r.status));
  const revenue = rows.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.price, 0);
  const received = rows.reduce((s, r) => s + r.paid_amount, 0);
  const opCost = rows.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.operational_cost, 0);
  const outstanding = active.reduce((s, r) => s + r.price - r.paid_amount, 0);
  const profit = revenue - opCost;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysOf = (date: string | null) => {
    if (!date) return null;
    return Math.floor((new Date(date.slice(0, 10) + "T00:00:00").getTime() - today.getTime()) / 86400000);
  };

  const upcoming = rows
    .filter((r) => { const d = daysOf(r.deadline ?? r.event_date); return d !== null && d >= 0 && d <= 7 && !["paid", "cancelled"].includes(r.status); })
    .map((r) => ({ ...r, daysLeft: daysOf(r.deadline ?? r.event_date) }))
    .sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99));

  const overdue = rows.filter((r) => { const d = daysOf(r.deadline ?? r.event_date); return d !== null && d < 0 && !["paid", "cancelled"].includes(r.status); });

  const byStatus = new Map<string, number>();
  for (const r of rows) byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);

  return { revenue, received, opCost, outstanding, profit, count: rows.length, active: active.length, upcoming, overdue, byStatus };
}

export async function getAllBusinessSummary() {
  const options = await getBusinessOptions();
  const per = await Promise.all(options.map(async (b) => {
    if (b.slug === "premium") {
      const p = await premiumStats();
      return { slug: b.slug, label: b.name, color: b.color, revenue: p.revenue, profit: p.profit, expiring: p.expiringSoonCount, isModule: true };
    }
    if (b.slug === "frame") {
      const f = await frameStats();
      return { slug: b.slug, label: b.name, color: b.color, revenue: f.revenue, profit: f.profit, expiring: 0, isModule: false };
    }
    const s = await projectStats(b.slug);
    return { slug: b.slug, label: b.name, color: b.color, revenue: s.revenue, profit: s.profit, expiring: 0, isModule: false, active: s.active, outstanding: s.outstanding };
  }));
  const [txns, frame] = await Promise.all([getTransactions(), frameStats()]);
  const fin = calcFinance(txns);

  const byBusiness = per.map((b) => ({ key: b.slug, label: b.label, color: b.color, revenue: b.revenue, profit: b.profit }));
  const receivableOpen = fin.receivableOpen + frame.outstanding +
    per.filter((b) => "outstanding" in b && b.outstanding !== undefined).reduce((s, b) => s + (b as { outstanding: number }).outstanding, 0);
  const activeProjects = per.filter((b) => "active" in b && b.active !== undefined).reduce((s, b) => s + (b as { active: number }).active, 0);
  const expiringAccounts = per.reduce((s, b) => s + b.expiring, 0);

  return {
    totalRevenue: byBusiness.reduce((s, b) => s + b.revenue, 0) + fin.income,
    totalProfit: byBusiness.reduce((s, b) => s + b.profit, 0) - fin.expense,
    totalExpense: fin.expense,
    balance: fin.balance,
    receivableOpen,
    activeProjects,
    expiringAccounts,
    byBusiness,
  };
}