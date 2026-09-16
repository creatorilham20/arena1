import { FolderKanban, Timer, Clock } from "lucide-react";
import { Card, StatCard, ColorPill, PageHeader, EmptyState, Td, Th, inputClass } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import InvoiceButton from "@/components/invoice-button";
import { queryAll } from "@/lib/db";
import { getBusinessOptions, getBusinessMap, resolveBiz } from "@/lib/business";
import { formatIDR, formatDate, daysLeft } from "@/lib/format";
import { deleteProject } from "@/app/actions";
import ProjectForm, { ProjectStatusPill, MarkPaidProjectButton, ProjectInput } from "@/components/forms/project-form";

export const dynamic = "force-dynamic";

interface Row {
  id: number; project_no: string; business_type: string; client_name: string; service_type: string;
  description: string | null; price: number; dp_amount: number; paid_amount: number; operational_cost: number;
  deadline: string | null; event_date: string | null; event_location: string | null; event_type: string | null; status: string;
}

export default async function ProjectPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "all";
  const business = typeof sp.business === "string" ? sp.business : "all";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const deadline = typeof sp.deadline === "string" ? sp.deadline : "all";

  const [options, bizMap] = await Promise.all([getBusinessOptions(), getBusinessMap()]);
  const optionList = options.map((b) => ({ value: b.slug, label: b.name }));

  const all = await queryAll<Row>("SELECT * FROM projects ORDER BY CASE status WHEN 'lead' THEN 1 WHEN 'deal' THEN 2 WHEN 'processing' THEN 3 WHEN 'done' THEN 4 ELSE 5 END, COALESCE(deadline, event_date) ASC");

  let projects = all;
  if (status !== "all") projects = projects.filter((p) => p.status === status);
  if (business !== "all") projects = projects.filter((p) => p.business_type === business);
  if (q) projects = projects.filter((p) => `${p.client_name} ${p.project_no} ${p.service_type} ${p.event_type ?? ""}`.toLowerCase().includes(q));
  if (deadline === "upcoming") projects = projects.filter((p) => { const d = daysLeft(p.deadline ?? p.event_date); return d !== null && d >= 0 && d <= 7 && !["paid", "cancelled"].includes(p.status); });
  if (deadline === "overdue") projects = projects.filter((p) => { const d = daysLeft(p.deadline ?? p.event_date); return d !== null && d < 0 && !["paid", "cancelled"].includes(p.status); });

  const activeCount = all.filter((p) => !["paid", "cancelled"].includes(p.status)).length;
  const upcoming = all.filter((p) => { const d = daysLeft(p.deadline ?? p.event_date); return d !== null && d >= 0 && d <= 7 && !["paid", "cancelled"].includes(p.status); }).length;
  const overdue = all.filter((p) => { const d = daysLeft(p.deadline ?? p.event_date); return d !== null && d < 0 && !["paid", "cancelled"].includes(p.status); }).length;
  const totalRevenue = all.filter((p) => p.status !== "cancelled").reduce((s, p) => s + p.price, 0);
  const totalOutstanding = all.filter((p) => !["paid", "cancelled"].includes(p.status)).reduce((s, p) => s + p.price - p.paid_amount, 0);

  const toForm = (p: Row): ProjectInput => ({
    id: p.id, business_type: p.business_type as "editing" | "documentation", client_name: p.client_name,
    service_type: p.service_type, description: p.description ?? undefined, price: p.price, dp_amount: p.dp_amount,
    paid_amount: p.paid_amount, operational_cost: p.operational_cost, deadline: p.deadline ?? undefined,
    event_date: p.event_date ?? undefined, event_location: p.event_location ?? undefined,
    event_type: p.event_type ?? undefined, status: p.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Project" description="Timeline pengerjaan editing, frame, dokumentasi & lini lainnya" icon={<FolderKanban className="h-5 w-5" />} />
        <ProjectForm businessType="editing" bizOptions={optionList} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Project Aktif" value={activeCount} icon={<FolderKanban className="h-4 w-4" />} tone="indigo" sub={`${all.length} total`} />
        <StatCard title="Deadline 7 Hari" value={upcoming} icon={<Timer className="h-4 w-4" />} tone="amber" />
        <StatCard title="Terlambat" value={overdue} icon={<Clock className="h-4 w-4" />} tone="red" />
        <StatCard title="Piutang Project" value={formatIDR(totalOutstanding)} icon={<FolderKanban className="h-4 w-4" />} tone="blue" sub={`Omzet ${formatIDR(totalRevenue)}`} />
      </div>

      <Card className="p-4">
        <form method="get" className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <select name="status" defaultValue={status} className={inputClass}>
            <option value="all">Semua Status</option>
            <option value="lead">Lead</option><option value="deal">Deal</option><option value="processing">Diproses</option>
            <option value="done">Selesai</option><option value="paid">Lunas</option><option value="cancelled">Batal</option>
          </select>
          <select name="business" defaultValue={business} className={inputClass}>
            <option value="all">Semua Bisnis</option>
            {optionList.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <select name="deadline" defaultValue={deadline} className={inputClass}>
            <option value="all">Semua Deadline</option><option value="upcoming">Akan Datang (7 hari)</option><option value="overdue">Terlambat</option>
          </select>
          <input type="text" name="q" defaultValue={q} placeholder="Cari klien/no. project..." className={inputClass} />
          <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Terapkan</button>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Project</Th><Th>Bisnis</Th><Th>Klien</Th><Th>Layanan</Th><Th>Harga</Th><Th>Sisa</Th><Th>Deadline</Th><Th>Status</Th><Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => {
                const dateStr = p.deadline ?? p.event_date;
                const dl = daysLeft(dateStr);
                const remaining = p.price - p.paid_amount;
                return (
                  <tr key={p.id} className="transition-colors hover:bg-muted/50">
                    <Td><p className="font-medium">{p.project_no}</p><p className="max-w-[150px] truncate text-xs text-muted-foreground">{p.description ?? ""}</p></Td>
                    <Td><ColorPill label={resolveBiz(bizMap, p.business_type).name} color={resolveBiz(bizMap, p.business_type).color} /></Td>
                    <Td>{p.client_name}</Td>
                    <Td><span className="text-xs">{p.event_type ?? p.service_type}</span></Td>
                    <Td className="font-semibold">{formatIDR(p.price)}</Td>
                    <Td>{remaining > 0 ? <span className="font-medium text-amber-600 dark:text-amber-400">{formatIDR(remaining)}</span> : <span className="text-emerald-600 dark:text-emerald-400">Lunas</span>}</Td>
                    <Td>
                      {dateStr ? (
                        <div><span className="text-xs">{formatDate(dateStr)}</span>
                          {!["paid", "cancelled"].includes(p.status) && dl !== null && <span className={`ml-1 text-xs font-semibold ${dl < 0 ? "text-rose-500" : dl <= 3 ? "text-amber-500" : "text-blue-500"}`}>{dl < 0 ? `+${-dl}h terlambat` : `H-${dl}`}</span>}
                        </div>
                      ) : "-"}
                    </Td>
                    <Td><ProjectStatusPill status={p.status} /></Td>
                    <Td>
                      <div className="flex flex-wrap justify-end items-center gap-1.5">
                        <MarkPaidProjectButton id={p.id} price={p.price} paid={p.paid_amount} />
                        <ProjectForm businessType={p.business_type} project={toForm(p)} />
                        <InvoiceButton kind="project" id={p.id} label="Invoice" />
                        <DeleteButton action={deleteProject} id={p.id} message={`Hapus project ${p.project_no}?`} />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {projects.length === 0 && <EmptyState title="Tidak ada project" description="Sesuaikan filter project" />}
      </Card>
    </div>
  );
}