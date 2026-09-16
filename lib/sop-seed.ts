import type { BusinessLineInput, SopStepInput } from "./sop-meta";

export interface SopSeedLine {
  line: Omit<BusinessLineInput, "sort">;
  steps: Omit<SopStepInput, "line_id" | "sort">[];
}

export const SOP_SEED_VERSION = 2;

export const SOP_SEED: SopSeedLine[] = [
  {
    line: {
      name: "Premium Apps",
      slug: "premium",
      kind: "service",
      description: "Jual akun aplikasi premium dengan garansi & layanan cepat",
      color: "#8b5cf6",
      icon: "smartphone",
      warn: "Jangan kirim password sebelum pembayaran lunas.",
    },
    steps: [
      {
        title: "Terima Pesanan & Pembayaran",
        detail: "Tanyakan aplikasi (Netflix, Spotify, Canva, YouTube Premium, ChatGPT, dll.), paket (bulanan/tahunan), dan jangka waktu. Pastikan harga cocok dengan List Harga — jangan menawar di bawah patokan. Terima pembayaran lalu langsung catat transaksi pemasukan di aplikasi dengan memilih penyimpanan yang benar (Cash/BRI/SEABANK/DANA).",
        tip: "Kalau pelanggan minta aplikasi yang tidak ada di List Harga, cek ketersediaan supplier dulu sebelum mengonfirmasi harga.",
      },
      {
        title: "Aktivasi Akun",
        detail: "Beli/aktifkan dari supplier terpercaya. Verifikasi: masa aktif sesuai paket yang dibeli, login berhasil, dan email benar-benar milik pelanggan. Jangan pernah menjual akun pribadi, akun trial, atau akun curian.",
        tip: "Simpan bukti pembelian & ID akun supplier di catatan agar mudah saat klaim garansi.",
      },
      {
        title: "Serahkan Data Akun",
        detail: "Kirim email login, password, tanggal aktif sampai expired, dan cara login lewat WhatsApp dengan format rapi. Jelaskan aturan pemakaian (misal: jangan ganti device terlalu sering). Tandai akun Aktif di aplikasi supaya masa aktif tercatat dan notifikasi expired berjalan otomatis.",
        tip: "Setelah dikirim, minta pelanggan membalas 'sudah bisa login' — ini menghindari sengketa garansi.",
      },
      {
        title: "Pantau Notifikasi Expired",
        detail: "Aplikasi mengingatkan H-7, H-3, dan H-1 sebelum masa aktif habis. Saat notifikasi muncul, chat pelanggan dengan penawaran perpanjang yang sopan, sebutkan harga dan keuntungannya (harga lama & langsung lanjut tanpa putus).",
        tip: "Tawarkan perpanjang sebelum expired supaya masa aktif tidak putus dan pendapatan bulanan stabil.",
      },
      {
        title: "Tangani Garansi",
        detail: "Jika akun bermasalah dalam masa garansi (gagal login, kena reset, dsb.): buat klaim garansi, catat detail masalah, lalu ganti/pulihkan dalam target waktu. Tutup klaim dengan catatan penyelesaian agar riwayatnya rapi.",
        tip: "Akun pengganti harus mendapat sisa masa aktif yang sama, jangan dikurangi.",
      },
      {
        title: "Repeat Order",
        detail: "Setelah masa aktif berjalan, jadwalkan follow-up pelanggan. Tawarkan upgrade paket, aplikasi tambahan, atau perpanjang lebih awal. Buat kebiasaan pelanggan kembali setiap bulan.",
        tip: "Pelanggan langganan lebih murah akuisisi — layani dengan respon cepat agar tidak pindah ke penjual lain.",
      },
    ],
  },
  {
    line: {
      name: "Jasa Editing",
      slug: "editing",
      kind: "service",
      description: "Kelola project editing dari enquiry sampai serah terima",
      color: "#3b82f6",
      icon: "clapperboard",
      warn: "Deadline yang lewat merusak kepercayaan. Pantau fitur notifikasi pengerjaan secara rutin.",
    },
    steps: [
      {
        title: "Enquiry & Penawaran",
        detail: "Gali kebutuhan: jenis project (video, foto, desain), jumlah file, durasi/detik, style editing (referensi), dan deadline. Tanyakan budget, lalu kirim penawaran berdasarkan List Harga. Sesuaikan paket bila perlu.",
        tip: "Tampilkan 1-2 portofolio yang relevan supaya pelanggan yakin sebelum deal.",
      },
      {
        title: "Deal & DP",
        detail: "Catat project di aplikasi dengan status Deal; isi jenis layanan, harga, DP, dan deadline. Minta DP minimal 40% untuk lock slot pengerjaan, lalu catat DP sebagai transaksi pemasukan.",
        tip: "Jangan mulai pengerjaan sebelum DP masuk — pelanggan yang serius pasti membayar DP.",
      },
      {
        title: "Pengerjaan",
        detail: "Kerjakan sesuai urutan deadline (yang paling dekat dulu). Kirim update progres atau preview setiap 2-3 hari agar klien tahu perkembangan. Gunakan notifikasi deadline supaya tidak molor.",
        tip: "Kirim file besar via Google Drive atau WeTransfer, jangan lewat chat agar kualitas tidak rusak.",
      },
      {
        title: "Revisi & Persetujuan",
        detail: "Berikan revisi terbatas sesuai kesepakatan (misal 2x). Kumpulkan semua feedback sekali pertemuan, terapkan sekaligus, lalu kirim hasil akhir.",
        tip: "Buat checklist permintaan revisi supaya tidak ada yang terlewat.",
      },
      {
        title: "Serah Terima & Pelunasan",
        detail: "Kirim file final full kualitas, terima pelunasan, tandai project Lunas, dan catat pemasukan. Sampaikan ucapan terima kasih setelah lunas.",
        tip: "Sertakan 'bonus' kecil seperti thumbnail atau cover untuk kesan profesional.",
      },
      {
        title: "Follow-up",
        detail: "Minta review atau testimoni, lalu tawarkan project lanjutan: editing video bulanan, konten media sosial, foto produk, dsb.",
        tip: "Catat jadwal follow-up di kalender aplikasi supaya tidak lupa.",
      },
    ],
  },
  {
    line: {
      name: "Frame Custom",
      slug: "frame",
      kind: "service",
      description: "Order bingkai dari konsultasi ukuran sampai pengambilan",
      color: "#f59e0b",
      icon: "frame",
      warn: "",
    },
    steps: [
      {
        title: "Konsultasi & Penawaran",
        detail: "Tanyakan ukuran, bahan (kayu, aluminium, MDF, akrilik), jumlah, desain/lapis, dan budget. Hitung harga dari produk frame yang sudah disetel. Sampaikan estimasi waktu produksi.",
        tip: "Kirim foto warna/finish bahan supaya pelanggan tidak salah ekspektasi.",
      },
      {
        title: "Deal & DP",
        detail: "Buat pesanan frame dengan nomor otomatis; tandai DP masuk dan catat transaksinya. Kurangi stok bahan yang dipakai sesuai kebutuhan bingkai.",
        tip: "Konfirmasi motif dan lapis sebelum produksi — kesalahan di tahap ini paling mahal.",
      },
      {
        title: "Produksi & Update",
        detail: "Proses produksi sesuai urutan pesanan. Kirim foto progres saat 50% dan saat selesai. Deadline produksi terpantau lewat notifikasi pengerjaan.",
        tip: "Tulis antrian produksi di aplikasi, jangan mengandalkan janji manual.",
      },
      {
        title: "Pelunasan & Serah Terima",
        detail: "Kirim foto hasil jadi, terima pelunasan, lalu tandai lunas. Jadwalkan pengambilan di toko atau kirim via ekspedisi (lengkapi foto sebelum packing).",
        tip: "Untuk kirim jarak jauh, packing pakai bubble wrap dan pelindung sudut karton.",
      },
      {
        title: "Follow-up",
        detail: "Tanyakan kepuasan, minta review, lalu tawarkan bingkai tambahan, pigura hampers, atau order ulang dari keluarga/kolega.",
        tip: "Buat mini katalog dari foto 5-10 frame terbaik untuk bahan promosi.",
      },
    ],
  },
  {
    line: {
      name: "Dokumentasi Acara",
      slug: "documentation",
      kind: "service",
      description: "Booking, koordinasi, hari-H, sampai editing hasil",
      color: "#f43f5e",
      icon: "camera",
      warn: "Selalu backup file acara ke lebih dari satu media sebelum mengedit.",
    },
    steps: [
      {
        title: "Booking & DP",
        detail: "Setelah pelanggan setuju paket, catat project dokumentasi: tanggal acara, lokasi, jenis acara, dan harga. Terima DP untuk lock tanggal dan catat sebagai pemasukan. Jelaskan hal yang harus disiapkan klien (rundown, dress code, PIC).",
        tip: "Satu tanggal hanya untuk satu booking. Jangan terima double booking sebelum DP lunas.",
      },
      {
        title: "Koordinasi H-3",
        detail: "Konfirmasi rundown, jam mulai, sesi prioritas (misal ijab, panggung, keluarga), durasi cover, dan PIC di lokasi. Pastikan gawai penuh daya dan kartu memori kosong.",
        tip: "Buat daftar grab-and-go: kamera, lensa, 2 baterai, SD cadangan, tripod, mic, powerbank.",
      },
      {
        title: "Hari-H",
        detail: "Datang 30-60 menit lebih awal. Dokumentasikan sesuai rundown; ambil shot kunci lebih banyak daripada risiko kurang. Sebelum pulang, backup file di 2 media (laptop + harddisk/cloud).",
        tip: "Cek hasil foto/video setiap 1-2 jam untuk memastikan tidak ada file korup.",
      },
      {
        title: "Editing (Maksimal 7 Hari)",
        detail: "Lakukan seleksi, color grading, dan kompilasi sesuai paket. Kirim preview atau draft untuk persetujuan klien.",
        tip: "Selesaikan editing sebelum deadline acara berikutnya masuk.",
      },
      {
        title: "Revisi & Persetujuan",
        detail: "Terapkan revisi yang disepakati lalu kirim kembali. Setelah klien setuju, konfirmasi pelunasan bila belum.",
        tip: "Simpan master file di 2 tempat sampai pelunasan tuntas.",
      },
      {
        title: "Serah Terima & Follow-up",
        detail: "Kirim file full kualitas via Google Drive, terima pelunasan, lalu tandai lunas. Minta review dan tanyakan jadwal acara/event berikutnya.",
        tip: "Testimoni yang disertai foto asli sangat efektif untuk promosi.",
      },
    ],
  },
  {
    line: {
      name: "Keuangan & Operasional",
      slug: "operasional",
      kind: "internal",
      description: "Aturan pencatatan keuangan & rutinitas harian di semua lini bisnis",
      color: "#6366f1",
      icon: "wallet",
      warn: "",
    },
    steps: [
      {
        title: "Pencatatan Transaksi",
        detail: "Setiap uang masuk/keluar langsung dicatat di menu Transaksi, jangan menunda sampai akhir hari. Selalu pilih Tempat Penyimpanan (Cash/BRI/SEABANK/DANA) yang benar agar saldo keuangan sinkron. Uang yang belum diterima dicatat sebagai Piutang; uang yang belum dibayar dicatat sebagai Hutang. Gunakan kategori yang konsisten agar laporan rapi.",
        tip: "Transaksi kecil di bawah Rp50.000 pun tetap dicatat — saldo baru akurat jika semua tercatat.",
      },
      {
        title: "Rutinitas Harian",
        detail: "Pagi: cek notifikasi masa aktif & pengerjaan, susun prioritas hari ini. Siang: update progress project/pesanan yang berjalan. Sore: rekonsiliasi saldo penyimpanan dengan mutasi transaksi. Jumat: backup data via Export JSON dan cek laporan mingguan.",
        tip: "Biasakan buka Dashboard pagi dan sore — notifikasi di sana cukup untuk menjaga alur kerja.",
      },
      {
        title: "Frekuensi Review",
        detail: "1×/hari: catat semua transaksi dan update status project/pesanan. 1×/minggu: review laba per lini bisnis di menu Laporan. 1×/bulan: bandingkan saldo bank/e-wallet dengan aplikasi dan lakukan backup data.",
        tip: "Review mingguan cukup 15 menit, tapi dampaknya besar untuk menghindari kejutan arus kas.",
      },
      {
        title: "Backup & Keamanan Data",
        detail: "Export JSON di menu Pengaturan minimal 1×/minggu, simpan di Google Drive atau harddisk terpisah. Jangan bagikan kredensial login atau info penyimpanan ke siapa pun. Ganti password rekening/e-wallet secara berkala.",
        tip: "Buat jadwal tetap 'Backup Jumat Sore' supaya kebiasaan ini konsisten.",
      },
    ],
  },
];