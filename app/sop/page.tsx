import { ClipboardList, Pencil, Lightbulb } from "lucide-react";
import { Card, PageHeader, EmptyState } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import LineForm, { StepForm } from "@/components/forms/sop-form";
import { getBusinessLinesWithSteps } from "@/lib/sop";
import { LINE_ICONS } from "@/lib/sop-meta";
import { deleteBusinessLine, deleteSopStep } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function SopPage() {
  const lines = await getBusinessLinesWithSteps();

  return (
    <div className="space-y-6">
      <PageHeader
        title="SOP Bisnis"
        description="Standard Operating Procedure untuk menjaga kualitas & kecepatan kerja di setiap lini bisnis — bisa kamu ubah sendiri"
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <LineForm />
      </PageHeader>

      <Card className="flex items-start gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Lightbulb className="h-4 w-4" />
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Klik <b className="text-foreground">Ubah Lini</b> untuk mengedit nama, warna, ikon, atau peringatan lini bisnis.
          Setiap langkah juga bisa <b className="text-foreground">diubah / dihapus</b> sendiri, dan kamu bisa
          <b className="text-foreground"> menambah langkah baru</b> per lini. Mau mulai bisnis baru? Cukup klik
          <b className="text-foreground"> Tambah Lini Bisnis</b>.
        </p>
      </Card>

      {lines.length === 0 && (
        <EmptyState title="Belum ada lini bisnis" description="Klik 'Tambah Lini Bisnis' untuk mulai menyusun SOP kamu." />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {lines.map(({ line, steps }) => {
          const Icon = LINE_ICONS[line.icon] ?? LINE_ICONS.clipboard;
          return (
            <Card key={line.id} className="overflow-hidden border-t-4" style={{ borderTopColor: line.color }}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${line.color}, ${line.color}cc)` }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold">{line.name}</h2>
                      {line.description && <p className="text-xs text-muted-foreground">{line.description}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <LineForm line={line} />
                    <DeleteButton action={deleteBusinessLine} id={line.id} message={`Hapus lini bisnis "${line.name}" beserta semua langkah SOP-nya?`} />
                  </div>
                </div>

                {line.warn && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                    ⚠️ {line.warn}
                  </div>
                )}

                <ol className="mt-5 space-y-4">
                  {steps.map((s, si) => (
                    <li key={s.id} className="group flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: line.color }}>
                        {si + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{s.title}</p>
                          <div className="flex shrink-0 items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            <StepForm line={line} step={s} color={line.color} />
                            <DeleteButton action={deleteSopStep} id={s.id} message={`Hapus langkah "${s.title}"?`} />
                          </div>
                        </div>
                        {s.detail && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>}
                        {s.tip && (
                          <p className="mt-1.5 rounded-lg bg-muted px-3 py-1.5 text-[11px] text-muted-foreground">💡 {s.tip}</p>
                        )}
                      </div>
                    </li>
                  ))}
                  {steps.length === 0 && (
                    <li className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Belum ada langkah SOP — tambahkan langkah pertama di bawah.
                    </li>
                  )}
                </ol>

                <div className="mt-5 flex justify-between items-center border-t border-border pt-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Pencil className="h-3 w-3" /> {steps.length} langkah
                  </span>
                  <StepForm line={line} color={line.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}