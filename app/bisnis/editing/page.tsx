import { Clapperboard, DollarSign, TrendingUp, TrendingDown, FolderKanban, Timer } from "lucide-react";
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
  price: number; dp_amount: number; paid_amount: number; operational_cost: number; deadline: string | null;
  status: string;
}

export default async function EditingPage() {
  const projects = await queryAll<Row>(`SELECT * FROM projects WHERE business_type = 'editing'
    ORDER BY CASE status WHEN 'lead' THEN 1 WHEN 'deal' THEN 2 WHEN 'processing' THEN 3 WHEN 'done' THEN 4 ELSE 5 END, deadline ASC`);
  const stats = await projectStats("editing");

  const toForm = (p: Row): ProjectInput => ({
    id: p.id, business_type: "editing", client_name: p.client_name, service_type: p.service_type,
    description: p.description ?? undefined, price: p.price, dp_amount: p.dp_amount, paid_amount: p.paid_amount,
    operational_cost: p.operational_cost, deadline: p.deadline ?? undefined, status: p.status,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Jasa Editing" description="Kelola project editing video, foto, dan desain" icon={<Clapperboard className="h-5 w-5" />}>
        <ProjectForm businessType="editing" />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Project Aktif" value={stats.active} icon={<FolderKanban className="h-4 w-4" />} tone="blue" sub={`${stats.count} total`} />
        <StatCard title="Omzet" value={formatIDR(stats.revenue)} icon={<DollarSign className="h-4 w-4" />} tone="green" />
        <StatCard title="Biaya Operasional" value={formatIDR(stats.opCost)} icon={<TrendingDown className="h-4 w-4" />} tone="amber" />
        <StatCard title="Laba Bersih" value={formatIDR(stats.profit)} icon={<TrendingUp className="h-4 w-4" />} tone="indigo" />
      </div>

      {stats.upcoming.length > 0 && (
        <Card className="border-blue-200 p-4 dark:border-blue-500/30">
          <div className="mb-2 flex items-center gap-2"><Timer className="h-4 w-4 text-blue-500" /><h3 className="text-sm font-semibold">Deadline Terdekat</h3></div>
          <div className="space-y-1.5">
            {stats.upcoming.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                <span className="font-medium">{p.client_name} · {p.service_type}</span>
                <Badge tone={p.daysLeft! <= 1 ? "red" : p.daysLeft! <= 3 ? "amber" : "blue"}>H-{p.daysLeft} · {formatDate(p.deadline ?? p.event_date)}</Badge>
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
                <Th>Project</Th><Th>Klien</Th><Th>Jasa</Th><Th>Harga</Th><Th>DP</Th><Th>Sisa</Th><Th>Laba</Th><Th>Deadline</Th><Th>Status</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => {
                const profit = p.price - p.operational_cost;
                const remaining = p.price - p.paid_amount;
                const dl = daysLeft(p.deadline);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-muted/50">
                    <Td><p className="font-medium">{p.project_no}</p><p className="max-w-[160px] truncate text-xs text-muted-foreground">{p.description ?? ""}</p></Td>
                    <Td>{p.client_name}</Td>
                    <Td><Badge tone="blue">{p.service_type}</Badge></Td>
                    <Td className="font-semibold">{formatIDR(p.price)}</Td>
                    <Td>{formatIDR(p.dp_amount)}</Td>
                    <Td>{remaining > 0 ? <span className="font-medium text-amber-600 dark:text-amber-400">{formatIDR(remaining)}</span> : <span className="text-emerald-600 dark:text-emerald-400">Lunas</span>}</Td>
                    <Td className="font-semibold text-emerald-600 dark:text-emerald-400">{formatIDR(profit)}</Td>
                    <Td>
                      {p.deadline ? (
                        <div><span className="text-xs">{formatDate(p.deadline)}</span>
                          {!["paid", "cancelled"].includes(p.status) && dl !== null && <span className={`ml-1 text-xs font-semibold ${dl < 0 ? "text-rose-500" : "text-blue-500"}`}>{dl < 0 ? "Terlambat" : `H-${dl}`}</span>}
                        </div>
                      ) : "-"}
                    </Td>
                    <Td><ProjectStatusPill status={p.status} /></Td>
                    <Td>
                      <div className="flex flex-wrap justify-end items-center gap-1.5">
                        <MarkPaidProjectButton id={p.id} price={p.price} paid={p.paid_amount} />
                        <ProjectForm businessType="editing" project={toForm(p)} />
                        <DeleteButton action={deleteProject} id={p.id} message={`Hapus project ${p.project_no}?`} />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {projects.length === 0 && <EmptyState title="Belum ada project editing" description="Klik Tambah Project untuk memulai" />}
      </Card>
    </div>
  );
}