# Rawatin — checklist review manual UI/UX

Status seluruh checklist: **belum diuji**. Digunakan ketika frontend demo sudah tersedia; dokumen ini bukan laporan hasil test.

## 1. Paket yang diserahkan agent

- [ ] URL preview HTTPS dan versi/commit yang diperiksa.
- [ ] Petunjuk masuk demo owner/staf dan memilih paket Free/Solo/Outlet.
- [ ] Dataset sintetis dua outlet; tidak ada nomor/foto pelanggan asli.
- [ ] Tombol reset, daftar skenario, dan kontrol simulasi loading/error/offline/conflict.
- [ ] Penjelasan apa yang nyata (kamera, kompresi, draft, render kartu) dan apa yang simulasi (auth, pembayaran, API, sinkronisasi).
- [ ] Screenshot terbaru mobile dan desktop; isu tersisa dan cara mereproduksi.
- [ ] Nomor WhatsApp uji yang disetujui sebelum tes deeplink; membuka WA tidak boleh mengirim otomatis.

## 2. Urutan review oleh pemilik produk

### A. Tampilan dan navigasi

- [ ] Outfit, ungu/pastel, radius, icon, chip dan spacing terasa konsisten dengan referensi.
- [ ] Teks/status/angka terbaca, termasuk di layar HP kecil; warna bukan satu-satunya indikator.
- [ ] Beranda mengutamakan pekerjaan/tenggat, bukan grafik dekoratif.
- [ ] Bottom nav dan + Order jelas; desktop memiliki layout yang cocok, bukan frame HP.
- [ ] Keyboard/safe area tidak menutupi CTA; Back, refresh, deep link dan focus masuk akal.
- [ ] Peran staf tidak menampilkan omzet/settings/override yang tidak diizinkan pada usulan peran.

### B. Onboarding dan katalog

- [ ] Wizard 4 langkah, default, lewati, logo opsional, link Maps dan slug jelas.
- [ ] Slug bentrok/reserved punya pesan yang bisa ditindaklanjuti.
- [ ] Harga, durasi, unit, add-on dan nonaktif layanan mudah dikelola.
- [ ] Ubah nama status/label barang tanpa merusak alur atau mencampur istilah.
- [ ] Prompt install tidak memaksa; petunjuk Android/iPhone sesuai kemampuan browser.

### C. Intake — prioritas tertinggi

- [ ] Buat pelanggan baru dan pakai ulang pelanggan lama; nomor WA terformat benar.
- [ ] Tambah dua item dengan kondisi/foto/layanan berbeda; hapus item tidak salah sasaran.
- [ ] Kamera, retake, kompresi dan preview dapat digunakan; izin ditolak punya arahan aman.
- [ ] Lunas, DP, bayar nanti, diskon dan add-on memperbarui total dengan benar.
- [ ] Persetujuan wajib dan izin publikasi opsional benar-benar terpisah.
- [ ] Refresh/keluar lalu kembali memulihkan draft dan foto; tidak menghapus input saat error.
- [ ] Save ganda tidak membuat dua order demo; sukses menunjukkan aksi label/WA/order baru.
- [ ] Intake satu item diuji dengan stopwatch, target <60 detik; catat jumlah field yang harus diketik.

### D. Papan, detail, label dan resi

- [ ] Search/filter status, pembayaran, umur dan staf mudah dipahami; reset filter jelas.
- [ ] Bulk ≥20 order terlihat aman; tidak ada jalur bulk menuju Selesai.
- [ ] Detail menunjukkan barang, layanan, foto, sisa bayar, estimasi dan riwayat pelaku/waktu.
- [ ] Label A4 readable, kode besar tersedia tanpa printer; scan/cari kode bisa membuka detail.
- [ ] Resi tanpa login menunjukkan status dan estimasi terlebih dahulu, tidak memuat WA/alamat pelanggan.
- [ ] Foto after hanya tampil bila ada; foto expired/token invalid punya state yang wajar.
- [ ] Link publik tidak memberi akses admin atau mengubah status.

### E. Pelunasan, pengambilan dan bukti

- [ ] Order belum lunas meminta pelunasan; override hanya owner dan wajib alasan.
- [ ] Tanpa bukti, tombol selesai terkunci saat kewajiban aktif; status board tidak dapat membypass.
- [ ] Pengaturan wajib bukti default aktif; hanya owner dapat menonaktifkan dengan alasan/peringatan. Override pembayaran tidak ikut menonaktifkan kewajiban foto.
- [ ] Kamera langsung, preview, retake, nama pengambil alternatif dan konfirmasi mudah digunakan.
- [ ] Panduan privasi foto jelas; versi publik bukti sesuai keputusan yang Anda setujui.
- [ ] Setelah selesai, bukti/waktu tampil pada konteks yang tepat dan CTA review baru eligible.
- [ ] Scan sampai selesai pada order sudah lunas ditargetkan <30 detik; catat waktu aktual.

### F. Review dan kartu hasil

- [ ] Review tidak tersedia sebelum selesai, saat link Maps kosong, atau paket tidak mendukung.
- [ ] WhatsApp terbuka dengan pesan netral/link benar; batal/kembali tidak otomatis menandai terkirim.
- [ ] “Tandai Terkirim”, badge, filter belum diminta dan reset owner dapat dipahami.
- [ ] Dua rasio share card dapat dilihat/download; gambar, brand, caption, watermark dan badge tidak terpotong.
- [ ] Outlet tanpa izin publikasi diblokir; aksi pelanggan di resi dijelaskan berbeda.
- [ ] Cancel share bukan sukses; browser tanpa file share menawarkan download.
- [ ] Tidak mengklaim pesan terkirim, ulasan masuk, atau posting IG berhasil tanpa bukti.

### G. Laporan, paket, offline dan error

- [ ] Lima angka + tiga daftar menjawab kebutuhan sederhana; omzet/piutang tidak tertukar.
- [ ] CSV dan fixture konsisten; filter >7/14/30/60 hari mudah dimengerti.
- [ ] Feature gate menjelaskan alasan dan upgrade tanpa menyembunyikan data yang sudah dimiliki.
- [ ] Offline intake tersimpan lokal, refresh tetap ada, status queue jelas; kode sementara tidak dianggap resi final.
- [ ] Retry/sesi habis/konflik/kuota penuh tidak menghapus draft dan memiliki next action.
- [ ] Loading, kosong, server gagal, kamera ditolak, foto expired dan koneksi buruk diuji.

## 3. Format feedback

| ID | Versi/perangkat | Layar dan langkah | Hasil saat ini | Yang diharapkan | Prioritas | Status |
|---|---|---|---|---|---|---|
| UI-001 | Isi saat review | Isi saat review | Isi saat review | Isi saat review | P0/P1/P2 | Baru / diperbaiki / diverifikasi / diterima |

- **P0:** risiko data/privasi/keuangan atau jalur bukti dapat dilewati.
- **P1:** alur utama tidak selesai, CTA tidak terjangkau, informasi wajib tidak terbaca atau salah.
- **P2:** polish visual/microcopy/spacing yang tidak memblokir; boleh ditunda hanya dengan persetujuan.

Review mobile utama dahulu: intake → detail → ready → pickup → resi → review/share. Sesudah itu desktop, settings, laporan dan semua state error. Temuan teknis pada layanan simulasi tidak dianggap membuktikan keamanan backend.

## 4. Catatan persetujuan

Isi hanya setelah review:

```text
Versi/commit:
URL preview:
Tanggal dan reviewer:
Perangkat/browser:
Skenario yang diuji:
P0/P1 terbuka:
P2 yang diterima dan tindak lanjut:
Keputusan D1–D10:
Bagian yang belum dapat diuji:

Keputusan: PERLU REVISI / UI-UX DISETUJUI UNTUK MULAI BACKEND
```

Persetujuan UI/UX **bukan persetujuan rilis produksi**. Backend tetap harus lulus pengujian otorisasi, persistence, upload, sinkronisasi, retensi, restore, E2E, performa dan perangkat nyata sesuai rencana implementasi.
