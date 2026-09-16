import { Frame, DollarSign, TrendingUp, Package, Camera, CalendarDays, MapPin } from "lucide-react";
import { Card, StatCard, Badge, PageHeader, EmptyState, Td, Th } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import { queryAll } from "@/lib/db";
import { projectStats } from "@/lib/analytics";
import { formatIDR, formatDate, daysLeft } from "@/lib/format";
import { deleteProject } from "@/app/actions";
import ProjectForm, { ProjectStatusPill, MarkPaidProjectButton, ProjectInput } from "@/components/forms/project-form";

export const dynamic = "force-dynamic";

interface Row {
  id: number; project_no: string; client_name: string; service_type: string; description: string | null;
  price: number; dp_amount: number; paid_amount: number; operational_cost: number; event_date: string | null;
  event_location: string | null; event_type: string | null; status: string;
}

export default async function DocumentationPage() {
  const projects = await queryAll<Row>(`SELECT * FROM projects WHERE business_type = 'documentation'
    ORDER BY CASE status WHEN 'lead' THEN 1 WHEN 'deal' THEN 2 WHEN 'processing' THEN 3 WHEN 'done' THEN 4 ELSE 5 END, event_date ASC`);
  const stats = await projectStats("documentation");

  const toForm = (p: Row): ProjectInput => ({
    id: p.id, business_type: "documentation", client_name: p.client_name, service_type: p.service_type,
    description: p.description ?? undefined, price: p.price, dp_amount: p.dp_amount, paid_amount: p.paid_amount,
    operational_cost: p.operational_cost, event_date: p.event_date ?? undefined, event_location: p.event_location ?? undefined,
    event_type: p.event_type ?? undefined, status: p.status,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Jasa Dokumentasi" description="Kelola jasa dokumentasi acara & event" icon={<Camera className="h-5 w-5" />}>
        <ProjectForm businessType="documentation" />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Project Aktif" value={stats.active} icon={<Frame className="h-4 w-4" />} tone="rose" sub={`${stats.count} total`} />
        <StatCard title="Omzet" value={formatIDR(stats.revenue)} icon={<DollarSign className="h-4 w-4" />} tone="green" />
        <StatCard title="Biaya Operasional" value={formatIDR(stats.opCost)} icon={<Package className="h-4 w-4" />} tone="amber" sub="Transport & lainnya" />
        <StatCard title="Laba Bersih" value={formatIDR(stats.profit)} icon={<TrendingUp className="h-4 w-4" />} tone="indigo" />
      </div>

      {stats.upcoming.length > 0 && (
        <Card className="border-rose-200 p-4 dark:border-rose-500/30">
          <div className="mb-2 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-rose-500" /><h3 className="text-sm font-semibold">Acara Terdekat</h3></div>
          <div className="space-y-1.5">
            {stats.upcoming.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                <span className="truncate font-medium">{p.client_name} · {p.event_type ?? p.service_type}</span>
                <Badge tone={p.daysLeft! <= 1 ? "red" : p.daysLeft! <= 3 ? "amber" : "blue"}>H-{p.daysLeft} · {formatDate(p.event_date)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Project</Th><Th>Klien</Th><Th>Acara</Th><Th>Harga</Th><Th>DP</Th><Th>Sisa</Th><Th>Laba</Th><Th>Tanggal</Th><Th>Status</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => {
                const profit = p.price - p.operational_cost;
                const remaining = p.price - p.paid_amount;
                const dl = daysLeft(p.event_date);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-muted/50">
                    <Td>
                      <p className="font-medium">{p.project_no}</p>
                      {p.event_location && <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{p.event_location}</p>}
                    </Td>
                    <Td>{p.client_name}</Td>
                    <Td><Badge tone="rose">{p.event_type ?? p.service_type}</Badge></Td>
                    <Td className="font-semibold">{formatIDR(p.price)}</Td>
                    <Td>{formatIDR(p.dp_amount)}</Td>
                    <Td>{remaining > 0 ? <span className="font-medium text-amber-600 dark:text-amber-400">{formatIDR(remaining)}</span> : <span className="text-emerald-600 dark:text-emerald-400">Lunas</span>}</Td>
                    <Td className="font-semibold text-emerald-600 dark:text-emerald-400">{formatIDR(profit)}</Td>
                    <Td>
                      {p.event_date ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">{formatDate(p.event_date)}</span>
                          {!["paid", "cancelled"].includes(p.status) && dl !== null && <span className={`text-xs font-semibold ${dl < 0 ? "text-rose-500" : "text-blue-500"}`}>{dl < 0 ? "Terlambat" : `H-${dl}`}</span>}
                        </div>
                      ) : "-"}
                    </Td>
                    <Td><ProjectStatusPill status={p.status} /></Td>
                    <Td>
                      <div className="flex flex-wrap justify-end items-center gap-1.5">
                        <MarkPaidProjectButton id={p.id} price={p.price} paid={p.paid_amount} />
                        <ProjectForm businessType="documentation" project={toForm(p)} />
                        <DeleteButton action={deleteProject} id={p.id} message={`Hapus project ${p.project_no}?`} />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {projects.length === 0 && <EmptyState title="Belum ada project dokumentasi" description="Klik Tambah Project untuk memulai" />}
      </Card>
    </div>
  );
}