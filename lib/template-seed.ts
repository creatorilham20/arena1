export interface TemplateSeed {
  business_type: string;
  step_title: string;
  step_desc: string;
  step_kapan: string;
  script: string;
}

export const TEMPLATE_SEED: TemplateSeed[] = [
  /* ================= PREMIUM APPS ================= */
  {
    business_type: "premium", step_title: "Promosi Akun", step_desc: "Kirim info produk + harga via broadcast/katalog WA.",
    step_kapan: "Saat awal kenal, atau setiap 2 minggu ulang promo",
    script: "Halo Kak! 👋\nIlham Apps menyediakan *Akun Premium* dengan harga terjangkau:\n• Netflix 1 Bulan — *Rp85.000*\n• Spotify 1 Bulan — *Rp45.000*\n• Canva Pro 1 Tahun — *Rp280.000*\n• YouTube Premium — *Rp55.000*\n\n✅ Bisa langsung aktif hari ini!\nMinat? Balas chat ini ya 🙏",
  },
  {
    business_type: "premium", step_title: "Follow-up / Pemanasan", step_desc: "Pastikan akun berjalan baik, tawarkan top up ulang.",
    step_kapan: "H-5 sebelum akun expired",
    script: "Halo Kak [NAMA], bagaimana akun [APLIKASI]-nya? Semoga lancar ya 🙏\nKalau butuh perpanjang/bantu, langsung chat aja ya!",
  },
  {
    business_type: "premium", step_title: "Peringatan Expired + Penawaran Perpanjang", step_desc: "Kirim reminder H-3 sebelum expired.",
    step_kapan: "H-3 sebelum akun expired",
    script: "Halo Kak [NAMA]! 👋\nAkun *[APLIKASI]* akan expired pada *[TGL]*.\nIngin perpanjang? Berikut harganya:\n• 1 Bulan — *Rp[harga]*\n• 3 Bulan — *Rp[harga3]*\n\n✅ Kami bisa langsung aktifkan saat konfirmasi 🙏",
  },
  {
    business_type: "premium", step_title: "Pembelian / Perpanjang", step_desc: "Setelah bayar, kirim data login/akun via WA.",
    step_kapan: "Setelah pembayaran dikonfirmasi",
    script: "Terima kasih Kak [NAMA]! ✅\nBerikut data akun Anda:\n📧 [EMAIL]\n🔑 [PASSWORD]\n📅 Masa aktif: [TGL AKTIF] s/d [TGL AKHIR]\n\nKalau ada masalah, langsung chat kami ya 🙏",
  },
  {
    business_type: "premium", step_title: "After-Service & Minta Rating", step_desc: "Follow-up 3-5 hari setelah penggunaan.",
    step_kapan: "3-5 hari setelah perpanjang",
    script: "Halo Kak [NAMA], bagaimana layanan kami? 🙏\nKalau puas, boleh tolong rekomendasikan ke teman ya!\nJika ada masalah, kami siap bantu kapan saja 😊",
  },
  {
    business_type: "premium", step_title: "Repeat Order & Loyalitas", step_desc: "Tawarkan harga khusus pelanggan lama.",
    step_kapan: "Bulanan, atau saat ada promo khusus",
    script: "Halo Kak [NAMA]! 🎁\nKamu adalah pelanggan setia kami, berikut *Spesial Price*:\n• Netflix 1 bulan — *Rp80.000* (hemat Rp5.000)\n• Canva Pro 1 tahun — *Rp270.000*\n\nSilakan langsung balas chat ini untuk order! 🙏",
  },

  /* ================= JASA EDITING ================= */
  {
    business_type: "editing", step_title: "Promosi Jasa", step_desc: "Tawarkan portofolio + daftar harga editing.",
    step_kapan: "Setiap awal bulan, atau saat dapat lead baru",
    script: "Halo! 🎬 *Ilham Editing* melayani:\n• Editing Video — mulai Rp150.000\n• Editing Foto (5 pcs) — Rp100.000\n• Desain Feed IG — Rp75.000/post\n\n✅ Free revisi 2x | Deadline cepat\nPortofolio: [LINK]\nMau order? Langsung chat kami!",
  },
  {
    business_type: "editing", step_title: "Konsultasi & Penawaran", step_desc: "Tanya kebutuhan, kirim penawaran harga.",
    step_kapan: "Langsung saat ada inquiry",
    script: "Halo Kak [NAMA]! 🙏\nTerima kasih sudah menghubungi kami.\nUntuk memastikan penawaran yang pas:\n1. Jenis project: video/foto/desain?\n2. Durasi/jumlah file?\n3. Deadline?\n4. Referensi (kalau ada)?\n\nSetelah info ini, kami kirim penawaran harga terbaik ya!",
  },
  {
    business_type: "editing", step_title: "Deal & DP", step_desc: "Setelah deal, ambil DP lalu mulai pengerjaan.",
    step_kapan: "Saat klien sepakat harga",
    script: "Deal ya Kak! 🎉\n💰 Harga: *Rp[HARGA]*\nDP: *Rp[DP]* (minimal 40%)\n📅 Deadline: *[TGL]*\n\nSetelah DP masuk, kami langsung eksekusi ya!\n\nTransfer ke: [REKENING]\nAtau: [QRIS]",
  },
  {
    business_type: "editing", step_title: "Proses Pengerjaan", step_desc: "Update progress ke klien.",
    step_kapan: "H-2 atau saat milestone mencapai 50%",
    script: "Halo Kak [NAMA]! 📸\nProject editing Anda sedang dalam proses.\nProgress: [STATUS]\nEstimasi selesai: *[TGL]*\n\nKalau ada perubahan arahan, silakan kabari kami ya 🙏",
  },
  {
    business_type: "editing", step_title: "Selesai & Serah Terima", step_desc: "Kirim hasil final + minta pelunasan.",
    step_kapan: "Saat hasil final siap",
    script: "Halo Kak [NAMA]! ✅\nProject editing sudah SELESAI! 🎉\nBerikut hasil finalnya: [LINK]\n\nMohon untuk pelunasan: *Rp[SISA]*\n\nSetelah lunas, file bisa diunduh permanen ya 🙏",
  },
  {
    business_type: "editing", step_title: "Follow-up & Repeat Order", step_desc: "Follow-up hasil + tawarkan kerja sama lanjutan.",
    step_kapan: "1 minggu setelah selesai",
    script: "Halo Kak [NAMA], bagaimana hasil editing-nya? 🙏\nKalau puas, kami bisa bantu editing berikutnya ya!\nAda project baru lagi? Langsung chat aja 😊",
  },

  /* ================= FRAME CUSTOM ================= */
  {
    business_type: "frame", step_title: "Promosi Produk Frame", step_desc: "Tampilkan katalog bingkai via status WA / brosur.",
    step_kapan: "Setiap minggu tampilkan status produk terbaru",
    script: "Halo! 🖼️ *Ilham Frame Custom*\nBingkai custom sesuai keinginan:\n• Ukuran: 4R s/d 10R+\n• Bahan: Kayu, Aluminium, MDF\n• Harga mulai *Rp35.000/pcs*\n\n✅ Bisa custom ukuran & desain\n✅ Stok ready | Pengiriman cepat\nMinat? Chat kami ya!",
  },
  {
    business_type: "frame", step_title: "Konsultasi & Penawaran", step_desc: "Tanya ukuran, bahan, desain, kalkulasi harga.",
    step_kapan: "Saat ada inquiry dari pelanggan",
    script: "Halo Kak [NAMA]! 🙏\nMau pesan frame ya? Untuk kalkulasi harga, mohon info:\n1. Ukuran frame?\n2. Bahan (kayu/aluminium/MDF)?\n3. Jumlah pcs?\n4. Ada desain khusus?\n\nKami hitungkan harganya segera!",
  },
  {
    business_type: "frame", step_title: "Deal & DP", step_desc: "Setelah DP, pesanan mulai diproduksi.",
    step_kapan: "Saat pelanggan setuju harga",
    script: "Pesanan dikonfirmasi ya Kak! 🎉\n📦 *[NO. PESANAN]*\n💰 Harga: *Rp[HARGA]*\n📅 Deadline produksi: *[TGL]*\n\nDP masuk, kami langsung eksekusi! 🙏\nTransfer ke: [REKENING / QRIS]",
  },
  {
    business_type: "frame", step_title: "Proses Produksi", step_desc: "Kirim foto progres produksi.",
    step_kapan: "Saat produksi sudah 50% selesai",
    script: "Halo Kak [NAMA]! 📸\nFrame pesanan Anda sedang diproses:\nProgress: [STATUS]\nEstimasi selesai: *[TGL]*\n\nSebentar lagi jadi! 🙏",
  },
  {
    business_type: "frame", step_title: "Selesai & Serah Terima", step_desc: "Kirim foto frame jadi + minta pelunasan & ambil/antar.",
    step_kapan: "Produksi selesai",
    script: "Halo Kak [NAMA]! ✅\nFrame pesanan sudah SELESAI! 🖼️🎉\n\n💰 Sisa pembayaran: *Rp[SISA]*\n📍 Pengambilan: [ALAMAT]\n\nBisa diambil kapan saja ya. Atau ingin diantar? 🙏",
  },
  {
    business_type: "frame", step_title: "Follow-up & Repeat Order", step_desc: "Follow-up kualitas + tawarkan untuk order lagi.",
    step_kapan: "1 minggu setelah serah terima",
    script: "Halo Kak [NAMA], bagaimana frame-nya? 🖼️\nSemoga cocok ya! Kalau mau order lagi atau untuk hadiah, langsung chat kami ya 🙏\nTerima kasih sudah mempercayai Ilham Frame!",
  },

  /* ================= DOKUMENTASI ================= */
  {
    business_type: "documentation", step_title: "Promosi Jasa Dokumentasi", step_desc: "Tawarkan paket dokumentasi untuk acara.",
    step_kapan: "Setiap awal musim nikahan, atau promosi bareng wedding organizer",
    script: "Halo! 📸🎬 *Ilham Dokumentasi*\nLayanan dokumentasi profesional:\n• Pernikahan — mulai Rp2.500.000\n• Acara/Seminar — mulai Rp1.200.000\n\n✅ Foto + Video profesional\n✅ Editing selesai ≤ 7 hari\n✅ Termasuk album cetak (paket tertentu)\n\nMau booking tanggal? Langsung chat kami!",
  },
  {
    business_type: "documentation", step_title: "Konsultasi & Penawaran", step_desc: "Tanya detail acara, kirim penawaran paket.",
    step_kapan: "Saat ada inquiry klien",
    script: "Halo Kak [NAMA]! 🙏\nTerima kasih sudah menghubungi *Ilham Dokumentasi*.\nUntuk penawaran yang pas, mohon info:\n1. Jenis acara?\n2. Tanggal & lokasi?\n3. Durasi?\n4. Yang dibutuhkan (foto/video/both)?\n5. Budget?\n\nKami kirim penawaran terbaik ya!",
  },
  {
    business_type: "documentation", step_title: "Deal & DP", step_desc: "Setelah deal, ambil DP untuk lock tanggal.",
    step_kapan: "Saat klien setuju paket",
    script: "Alhamdulillah deal ya Kak! 🎉\n📸 *Dokumentasi: [JENIS]*\n📅 Tanggal: *[TGL]*\n📍 Lokasi: *[LOKASI]*\n💰 Total: *Rp[HARGA]*\nDP: *Rp[DP]* (untuk lock tanggal)\n\nTransfer ke: [REKENING]\nAtau: [QRIS]\n\nSetelah DP, tanggal sudah locked ya! 🙏",
  },
  {
    business_type: "documentation", step_title: "Koordinasi Pra-Acara", step_desc: "Diskusi teknis sebelum hari-H.",
    step_kapan: "H-3 sebelum hari acara",
    script: "Halo Kak [NAMA]! 📋\nTgl *[HARI-H]* sudah dekat! 🎉\nUntuk koordinasi, mohon info:\n1. Rundown acara?\n2. Foto/video prioritas yang harus diambil?\n3. Durasi dokumentasi?\n4. NPHP / PIC di lokasi?\n\nKami siap memberikan yang terbaik! 🙏",
  },
  {
    business_type: "documentation", step_title: "Hari Acara", step_desc: "Kirim momen dokumentasi via WA agar excited.",
    step_kapan: "Pagi hari acara",
    script: "Selamat pagi Kak [NAMA]! 🎉📸\nHari ini hari spesial! Kami sudah siap di lokasi.\nNantikan beberapa momen dokumentasi hari ini ya! 🙏",
  },
  {
    business_type: "documentation", step_title: "Selesai & Serah Terima", step_desc: "Kirim hasil edit + minta pelunasan.",
    step_kapan: "Setelah editing selesai (≤ 7 hari setelah acara)",
    script: "Halo Kak [NAMA]! ✅\nDokumentasi acara sudah selesai diedit! 🎉📸\nBerikut preview: [LINK]\n\n💰 Sisa pembayaran: *Rp[SISA]*\n📁 File full kualitas setelah pelunasan.\n\nSemoga hasilnya memuaskan ya! 🙏",
  },
  {
    business_type: "documentation", step_title: "Minta Review & Repeat Order", step_desc: "Minta review + tawarkan untuk dokumentasi lain.",
    step_kapan: "2 minggu setelah serah terima",
    script: "Halo Kak [NAMA], bagaimana dokumentasinya? 🙏\nKalau puas, tolong bantu review/point ke teman ya!\nAda acara lagi? Kami siap dokumentasi kapan saja 😊📸",
  },
];