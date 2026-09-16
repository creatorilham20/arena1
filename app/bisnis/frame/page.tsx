import { Frame, DollarSign, TrendingUp, Package, TrendingDown } from "lucide-react";
import { Card, StatCard, Badge, PageHeader, EmptyState, Td, Th } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import InvoiceButton from "@/components/invoice-button";
import { queryAll } from "@/lib/db";
import { frameStats } from "@/lib/analytics";
import { formatIDR, formatDate, daysLeft } from "@/lib/format";
import { deleteFrameOrder, deleteFrameProduct } from "@/app/actions";
import FrameProductForm, { FrameProductInput } from "@/components/forms/frame-product-form";
import FrameOrderForm, { FrameOrderInput, MarkPaidButton } from "@/components/forms/frame-order-form";

export const dynamic = "force-dynamic";

interface Prod extends FrameProductInput { low: number; }
interface Ord {
  id: number; order_no: string; customer_id: number | null; frame_product_id: number | null;
  custom_size: string | null; custom_material: string | null; custom_design: string | null; quantity: number;
  price: number; dp_amount: number; paid_amount: number; production_cost: number; deadline: string | null; status: string;
  customer_name: string | null; product_name: string | null;
}

const STATUS_TONE: Record<string, "slate" | "blue" | "green" | "red"> = { pending: "slate", processing: "blue", done: "green", cancelled: "red" };
const STATUS_LABEL: Record<string, string> = { pending: "Menunggu", processing: "Diproses", done: "Selesai", cancelled: "Batal" };

export default async function FramePage() {
  const products = await queryAll<Prod>(`SELECT fp.*, (fp.stock - fp.min_stock) as low FROM frame_products fp ORDER BY fp.name`);
  const orders = await queryAll<Ord>(`SELECT fo.*, c.name as customer_name, fp.name as product_name FROM frame_orders fo
     LEFT JOIN customers c ON c.id = fo.customer_id LEFT JOIN frame_products fp ON fp.id = fo.frame_product_id
     ORDER BY CASE fo.status WHEN 'pending' THEN 1 WHEN 'processing' THEN 2 ELSE 3 END, fo.deadline ASC`);
  const customers = await queryAll<{ id: number; name: string }>("SELECT id, name FROM customers ORDER BY name");
  const stats = await frameStats();

  const prodOpts = products.map((p) => ({ id: p.id!, name: p.name, sell_price: p.sell_price }));
  const toOrder = (o: Ord): FrameOrderInput => ({
    id: o.id, order_no: o.order_no, customer_id: o.customer_id, frame_product_id: o.frame_product_id,
    custom_size: o.custom_size ?? undefined, custom_material: o.custom_material ?? undefined, custom_design: o.custom_design ?? undefined,
    quantity: o.quantity, price: o.price, dp_amount: o.dp_amount, paid_amount: o.paid_amount,
    production_cost: o.production_cost, deadline: o.deadline ?? undefined, status: o.status,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Frame Custom" description="Kelola produk bingkai, stok, dan pesanan custom" icon={<Frame className="h-5 w-5" />}>
        <FrameOrderForm customers={customers} products={prodOpts} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Produk Frame" value={stats.productCount} icon={<Package className="h-4 w-4" />} tone="amber" sub={`Nilai stok ${formatIDR(stats.stockValue)}`} />
        <StatCard title="Pesanan" value={stats.orderCount} icon={<Frame className="h-4 w-4" />} tone="blue" sub={`Piutang ${formatIDR(stats.outstanding)}`} />
        <StatCard title="Omzet" value={formatIDR(stats.revenue)} icon={<DollarSign className="h-4 w-4" />} tone="green" />
        <StatCard title="Laba Kotor" value={formatIDR(stats.profit)} icon={<TrendingUp className="h-4 w-4" />} tone="indigo" sub={`Biaya produksi ${formatIDR(stats.prodCost)}`} />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-sm font-semibold">Produk Frame</h3>
          <FrameProductForm />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Produk</Th><Th>Ukuran / Bahan</Th><Th>HPP</Th><Th>Harga Jual</Th><Th>Marjin</Th><Th>Stok</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <Td><p className="font-medium">{p.name}</p>{p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}</Td>
                  <Td><Badge tone="amber">{p.size} · {p.material}</Badge></Td>
                  <Td>{formatIDR(p.buy_price)}</Td>
                  <Td className="font-semibold text-emerald-600 dark:text-emerald-400">{formatIDR(p.sell_price)}</Td>
                  <Td className="text-muted-foreground">{formatIDR(p.sell_price - p.buy_price)}</Td>
                  <Td><Badge tone={(p.stock ?? 0) <= (p.min_stock ?? 0) ? "red" : "green"}>{p.stock <= p.min_stock ? "Stok menipis" : `${p.stock} stok`}</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <FrameProductForm product={{ id: p.id, name: p.name, size: p.size, material: p.material, buy_price: p.buy_price, sell_price: p.sell_price, stock: p.stock, min_stock: p.min_stock, notes: p.notes }} />
                      <DeleteButton action={deleteFrameProduct} id={p.id!} message={`Hapus produk ${p.name}?`} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && <EmptyState title="Belum ada produk frame" />}
      </Card>

      <Card>
        <div className="border-b border-border p-4"><h3 className="text-sm font-semibold">Pesanan Custom</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>No. Pesanan</Th><Th>Pelanggan</Th><Th>Item</Th><Th>Total</Th><Th>Dibayar</Th><Th>Sisa</Th><Th>Laba</Th><Th>Deadline</Th><Th>Status</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => {
                const total = o.price * o.quantity;
                const remaining = total - o.paid_amount;
                const profit = total - o.production_cost * o.quantity;
                const dl = daysLeft(o.deadline);
                const item = o.custom_size ? `${o.product_name ?? "Custom"} (${o.custom_size}${o.custom_material ? " · " + o.custom_material : ""})` : o.product_name ?? "Custom";
                return (
                  <tr key={o.id} className="transition-colors hover:bg-muted/50">
                    <Td><p className="font-medium">{o.order_no}</p></Td>
                    <Td>{o.customer_name ?? "-"}</Td>
                    <Td><p className="max-w-[140px] truncate">{item}</p><p className="text-xs text-muted-foreground">x{o.quantity}</p></Td>
                    <Td className="font-semibold">{formatIDR(total)}</Td>
                    <Td>{formatIDR(o.paid_amount)}</Td>
                    <Td>{remaining > 0 ? <span className="font-medium text-amber-600 dark:text-amber-400">{formatIDR(remaining)}</span> : <span className="text-emerald-600 dark:text-emerald-400">Lunas</span>}</Td>
                    <Td className="font-semibold text-emerald-600 dark:text-emerald-400">{formatIDR(profit)}</Td>
                    <Td>
                      {o.deadline ? (
                        <div><span className="text-xs">{formatDate(o.deadline)}</span>
                          {!["done", "cancelled"].includes(o.status) && dl !== null && <span className={`ml-1 text-xs font-semibold ${dl < 0 ? "text-rose-500" : "text-amber-500"}`}>{dl < 0 ? "Terlambat" : `H-${dl}`}</span>}
                        </div>
                      ) : "-"}
                    </Td>
                    <Td><Badge tone={STATUS_TONE[o.status] ?? "slate"}>{STATUS_LABEL[o.status] ?? o.status}</Badge></Td>
                    <Td>
                      <div className="flex flex-wrap justify-end items-center gap-1.5">
                        <MarkPaidButton id={o.id} price={total} paid={o.paid_amount} />
                        <FrameOrderForm customers={customers} products={prodOpts} order={toOrder(o)} />
                        <InvoiceButton kind="frame" id={o.id} label="Invoice" />
                        <DeleteButton action={deleteFrameOrder} id={o.id} message={`Hapus pesanan ${o.order_no}?`} />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <EmptyState title="Belum ada pesanan" description="Klik Buat Pesanan untuk mencatat pesanan custom" />}
      </Card>
    </div>
  );
}