# Ilham Business Manager

Satu aplikasi untuk mengontrol seluruh bisnis **Ilham** secara real-time.

## 4 Lini Bisnis

| Bisnis | Menu utama | Fitur |
|---|---|---|
| **Premium Apps** | `/bisnis/premium` | Akun aplikasi premium, paket, tanggal aktif/expired, renewal, modal, harga jual, keuntungan, refund, reminder H-7/H-3/H-1 |
| **Jasa Editing** | `/bisnis/editing` | Project editing video/foto/desain, klien, deadline, DP/pelunasan, biaya operasional, laba bersih |
| **Frame Custom** | `/bisnis/frame` | Produk bingkai (ukuran/bahan/stok/HPP), pesanan custom, biaya produksi, keuntungan |
| **Dokumentasi** | `/bisnis/documentation` | Klien, jenis/lokasi/tanggal acara, paket dokumentasi, DP/pelunasan, transport, status project |

## Fitur Utama

- Dashboard gabungan + dashboard per bisnis
- Pencatatan pemasukan, pengeluaran, refund, hutang & piutang
- Otomatis hitung omzet, modal, HPP, laba kotor, laba bersih, piutang, hutang & saldo kas
- Filter per bisnis, tanggal, bulan, tahun + pencarian
- Grafik pendapatan, pengeluaran & keuntungan (bar + donut chart)
- Manajemen pelanggan/klien dengan status antar-bisnis
- Penyimpanan keuangan (Cash, BRI, SEABANK, DANA) — saldo tiap penyimpanan sinkron otomatis dari transaksi
- Notifikasi masa aktif & pengerjaan (H-7/H-3/H-1) di bell navigasi
- Template layanan (customer journey) yang bisa diedit & ditambah, siap kirim via WhatsApp
- SOP bisnis untuk seluruh lini + operasional keuangan
- Catatan & pengingat
- Nomor project & pesanan otomatis
- Status pembayaran: Belum bayar → DP → Lunas / Refund
- Notifikasi deadline project & akun expired (H-7, H-3, H-1)
- Laporan harian, bulanan, tahunan, per bisnis
- Riwayat aktivitas & backup data
- Dark & light mode, mobile-first, bottom navigation responsif

## Teknologi

- Next.js 16 + React 19 + TypeScript 5 (App Router)
- Tailwind CSS v4
- Supabase PostgreSQL (via session pooler IPv4 + `pg`), dengan seed otomatis data demo
- Server Actions untuk seluruh CRUD
- Ikon: lucide-react

## Menjalankan Lokal

1. Buat file `.env.local` di root proyek (isi dari halaman **Supabase → Project Settings → Database → Connection string**; wajib pakai **Session pooler**):

```
DATABASE_URL=postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require&uselibpqcompat=true
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

2. Jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Skema tabel dibuat otomatis saat pertama kali dipakai (data demo di-seed bila kosong). Backup manual tersedia di menu **Pengaturan → Backup**.

## Deploy ke Netlify

1. Push proyek ke GitHub/GitLab, lalu di dashboard Netlify pilih **Add new site → Import from Git** dan pilih repo tersebut. Build command otomatis terdeteksi (`npm run build`); **tidak perlu konfigurasi tambahan** (runtime Next.js dipasang otomatis oleh Netlify via `@netlify/plugin-nextjs`).
2. Di **Site settings → Environment variables**, tambahkan variabel yang sama seperti `.env.local` di atas (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
3. Klik **Deploy site**. Setelah selesai, verifikasi beberapa halaman (Dashboard, Transaksi, dan `/tools`).

Catatan:
- Koneksi ke Supabase memakai session pooler sehingga berfungsi di serverless (tanpa IPv6 requirement).
- Data disimpan di Supabase, bukan di filesystem Netlify. Gunakan **Export File JSON** di menu Pengaturan untuk mencadangkan data.
- Backend-only file (`app/api/*`, server actions) berjalan sebagai Netlify Functions secara otomatis.

## Struktur

```
app/
  page.tsx          # Dashboard gabungan
  actions.ts        # Seluruh server actions (CRUD)
  bisnis/           # Index + Premium, Editing, Frame, Dokumentasi
  transaksi/        # Pemasukan/pengeluaran/refund/hutang/piutang
  project/          # Semua project + deadline
  pelanggan/        # Database pelanggan
  laporan/          # Laporan & grafik
  pengaturan/       # Profil, backup, riwayat
components/
  ui/               # Card, Badge, Modal, tabel, dll
  forms/            # Form CRUD tiap entitas
  charts.tsx        # Bar & donut chart (SVG murni)
  sidebar.tsx       # Navigasi + dark mode
lib/
  db.ts             # Koneksi Supabase PostgreSQL, skema + seed demo
  analytics.ts      # Kalkulasi omzet/laba/piutang/dll
  format.ts         # Format Rupiah & tanggal
```