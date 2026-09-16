import { NotebookPen, StickyNote } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState, type Tone } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/ui/delete-button";
import { getNotes } from "@/lib/analytics";
import { formatDate } from "@/lib/format";
import { deleteNote } from "@/app/actions";
import NoteForm, { type NoteInput } from "@/components/forms/note-form";

export const dynamic = "force-dynamic";

const TAG_TONE: Record<string, Tone> = {
  Umum: "slate", Ide: "violet", Bisnis: "blue", Kontak: "green", Urgent: "red",
};

export default async function CatatanPage() {
  const notes = await getNotes();

  return (
    <div className="space-y-6">
      <PageHeader title="Catatan" description="Ide, pengingat, dan hal penting lainnya agar tidak terlewat" icon={<NotebookPen className="h-5 w-5" />}>
        <NoteForm />
      </PageHeader>

      {notes.length === 0 ? (
        <EmptyState title="Belum ada catatan" description="Klik 'Tambah Catatan' untuk membuat catatan pertama" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => {
            const tone = TAG_TONE[n.tag ?? "Umum"] ?? "slate";
            return (
              <Card key={n.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={tone}>{n.tag ?? "Umum"}</Badge>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <StickyNote className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold">{n.title}</h3>
                {n.content && <p className="mt-1.5 flex-1 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{n.content}</p>}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground">{formatDate(n.created_at)}</span>
                  <div className="flex gap-1.5">
                    <NoteForm note={n as unknown as NoteInput} />
                    <DeleteButton action={deleteNote} id={n.id} message={`Hapus catatan "${n.title}"?`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}