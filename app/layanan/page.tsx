import { MessageCircle, ChevronRight, PenLine } from "lucide-react";
import { Card, PageHeader, ColorPill, EmptyState } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import { queryAll } from "@/lib/db";
import { getBusinessOptions } from "@/lib/business";
import { waLink } from "@/lib/wa";
import { deleteTemplate } from "@/app/actions";
import TemplateForm, { type TemplateInput } from "@/components/forms/template-form";

export const dynamic = "force-dynamic";

interface TemplateRow {
  id: number;
  business_type: string;
  step_title: string;
  step_desc: string | null;
  step_kapan: string | null;
  script: string;
  sort: number;
}

export default async function LayananPage() {
  const [options, rows] = await Promise.all([
    getBusinessOptions(),
    queryAll<TemplateRow>("SELECT * FROM templates ORDER BY sort ASC"),
  ]);

  const grouped = options
    .map((b) => ({ meta: b, steps: rows.filter((r) => r.business_type === b.slug) }))
    .filter((g) => g.steps.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Template Customer Journey" description="Alur dari promosi, transaksi, sampai repeat order — siap pakai via WA, bisa diedit & ditambah" icon={<ChevronRight className="h-5 w-5" />}>
        <TemplateForm bizOptions={options.map((b) => ({ value: b.slug, label: b.name }))} />
      </PageHeader>

      <Card className="bg-muted/50 p-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <PenLine className="h-3.5 w-3.5 text-indigo-500" />
          Template tersimpan di database — gunakan "Ubah" untuk menyesuaikan kata-kata, atau "Tambah Template" untuk langkah baru sesuai alur bisnis Anda.
        </p>
      </Card>

      {grouped.length === 0 && <EmptyState title="Belum ada template" description="Klik 'Tambah Template' untuk membuat template pertama" />}

      {grouped.map(({ meta, steps }) => (
        <Card key={meta.slug} className="overflow-hidden border-t-4" style={{ borderTopColor: meta.color }}>
          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <h2 className="text-base font-bold">{meta.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{steps.length} langkah — salin & kirim via WhatsApp</p>
            </div>
            <ColorPill label={meta.name} color={meta.color} />
          </div>
          <div className="divide-y divide-border border-t border-border">
            {steps.map((step, i) => (
              <div key={step.id} className="group p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: meta.color }}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{step.step_title}</p>
                        <div className="flex gap-1.5">
                          <TemplateForm tpl={step as unknown as TemplateInput} bizOptions={options.map((b) => ({ value: b.slug, label: b.name }))} />
                          <DeleteButton action={deleteTemplate} id={step.id} message={`Hapus template "${step.step_title}"?`} />
                        </div>
                      </div>
                      {step.step_desc && <p className="mt-0.5 text-xs text-muted-foreground">{step.step_desc}</p>}
                      {step.step_kapan && <p className="mt-1 text-[10px] text-muted-foreground">📅 {step.step_kapan}</p>}
                      <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-muted p-3 text-xs leading-relaxed">{step.script}</pre>
                    </div>
                  </div>
                  <a href={waLink(step.script)} target="_blank" rel="noopener noreferrer"
                    className="sticky top-2 inline-flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl">
                    <MessageCircle className="h-3.5 w-3.5" /> WA
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}