"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
        &#9888;
      </div>
      <h2 className="text-lg font-semibold">Oops, halaman gagal dimuat</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ada gangguan saat mengambil data. Data Anda tetap aman. Coba muat ulang,
        atau ketik ulang PIN lalu buka lagi.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Muat ulang
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium"
        >
          Ke beranda
        </button>
      </div>
    </div>
  );
}
