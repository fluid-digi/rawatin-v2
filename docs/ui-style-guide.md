# Rawatin — usulan style guide UI

Status: untuk review sebelum implementasi. Ini adaptasi empat gambar lampiran ke operasional outlet, **bukan menyalin aplikasi Daily List atau aset ilustrasinya**. “Neon” pada PRD merujuk database Neon Postgres, bukan instruksi menggunakan warna neon menyala.

## 1. Pemetaan referensi

| Referensi lampiran | Yang diadopsi | Penerapan di Rawatin |
|---|---|---|
| Board “Design System” (2702×1820) | Card putih/pastel, purple CTA, chip, radio, progress, bottom sheet, toast dan navbar dengan tombol tengah | Komponen dasar, filter order, formulir, ringkasan intake, sheet pembayaran, progress resi |
| Board multi-screen “Daily List” (2252×1790) | Ritme spacing mobile, onboarding ringan, list card, profil dan grafik sederhana | Onboarding outlet, papan kerja, pengaturan, laporan; kalender hanya sebagai date picker/filter |
| Board “Font: Outfit / Color Styles” (2784×1640) | Outfit; warna `#F5B7FA`, `#82ACFF`, `#55D8C1`, `#FF6FB5` | Font dan palet dasar; tidak menyalin teks putih di pastel bila kontras kurang |
| Mockup dua ponsel/hero (2214×1708) | Tampilan ramah, card membulat, hierarki ringan, aksen ungu dan grafik batang | Karakter visual aplikasi; glow dekoratif hanya onboarding/empty state, tidak pada data operasional |

Tidak menambah fitur notes, kalender agenda, social login Google/Apple, OTP, task priority, atau to-do checklist hanya karena muncul di gambar. Foto, logo, ilustrasi dan ikon produksi harus milik sendiri atau berlisensi sesuai penggunaan.

## 2. Arah visual

**Ramah, bersih, lembut, tetapi cepat dibaca saat melayani pelanggan.** Foto barang dan aksi berikutnya lebih penting daripada dekorasi/grafik. Status pembayaran dan risiko terlambat harus terlihat jelas tanpa UI terasa ramai.

- Background putih hangat/lilac sangat muda; card putih dan pastel tipis; garis pembatas halus; shadow ringan.
- Purple untuk CTA utama dan navigasi aktif. Warna status semantik tetap konsisten, bukan warna acak per kartu.
- Ilustrasi sederhana hanya bila membantu onboarding/empty/success. Hindari hero besar pada dashboard.
- Satu aksi primer per konteks: “Simpan Order”, “Lanjut ke Finishing”, atau “Konfirmasi Pengambilan”.

## 3. Design tokens

Warna pada baris referensi diambil dari teks hex lampiran. Warna tambahan adalah **usulan** yang perlu review kontras dan tampilan, bukan hasil ekstraksi warna persis dari semua gambar.

| Token | Usulan | Penggunaan |
|---|---|---|
| `brand.soft` | `#F5B7FA` | Referensi primary pastel; highlight/dekorasi, bukan default tombol berteks putih |
| `brand.action` | `#A640CE` | Tombol utama, nav aktif, progress utama |
| `brand.actionHover` | `#8931AD` | Hover/pressed desktop |
| `accent.blue` | `#82ACFF` | Referensi biru; aksen informasi |
| `accent.mint` | `#55D8C1` | Referensi turquoise; aksen sukses |
| `accent.pink` | `#FF6FB5` | Referensi pink; badge hasil/aksen share card |
| `surface.page` | `#FCF8FD` | Background utama |
| `surface.card` | `#FFFFFF` | Form, modal, card |
| `surface.purple` / `.blue` | `#FCF0FE` / `#F0F6FF` | Tinted status cards |
| `surface.mint` / `.pink` | `#E6FFF3` / `#FFF0F6` | Tinted success/share cards |
| `text.primary` / `.secondary` | `#252A38` / `#626776` | Judul/body dan deskripsi |
| `border.subtle` | `#E7E8EE` | Pembatas dekoratif; batas input/focus harus punya kontras memadai |
| `semantic.success` | `#18764B` | Lunas/berhasil dengan label dan ikon |
| `semantic.warning` | `#8A5700` | DP, mendekati tenggat, perlu perhatian |
| `semantic.danger` | `#B4233D` | Belum bayar, terlambat, destructive/error |
| `semantic.info` | `#285EA8` | Informasi/koneksi/sinkronisasi |

- Outfit di-host sendiri/subset latin, lisensi font disertakan. Fallback `system-ui, sans-serif`; font tidak memblokir data resi.
- Heading halaman 24/32 semibold; section 18/26 semibold; card title 16/24 semibold; body/input/button 16/24; helper 14/20; badge non-kritis minimal 12/16.
- Skala spacing: 4, 8, 12, 16, 20, 24, 32 px. Padding halaman mobile 16 px; card 16 px; jarak section 24 px.
- Radius: input/button 10–12 px, card 16 px, sheet atas 24 px, chip pill. Tidak semua elemen dibuat bulat berlebihan.
- Touch target minimum 44×44 px, tombol utama/form sekitar 48 px tinggi. Floating add sekitar 56 px dengan label aksesibel.
- Ikon line-style konsisten 20–24 px, satu keluarga ikon. Teks penting tidak diganti ikon saja.
- Animasi 150–200 ms, ringan, tidak menghambat intake; hormati `prefers-reduced-motion`.

## 4. Layout responsif

- Lebar review: 360, 390, 430, 768, dan 1280+ px. Tidak ada horizontal scroll seluruh halaman; tab status/papan boleh scroll di area terkontrol.
- Mobile <768 px: satu kolom, navbar bawah, filter sheet, sticky primary CTA sesuai kebutuhan. Hormati `env(safe-area-inset-bottom)` dan keyboard.
- Tablet: daftar/detail dapat dua panel jika cukup ruang; tetap gunakan target sentuh besar.
- Desktop ≥1024 px: sidebar, content max-width sekitar 1280 px; detail utama + ringkasan samping, kanban beberapa kolom, tabel laporan bila lebih mudah dibaca.
- Form intake tetap punya urutan vertikal yang sama. Di desktop summary bisa sticky di kanan tanpa mengubah urutan keyboard/screen reader.
- Resi pelanggan tidak memakai sidebar/navbar staf. Lebar baca maksimum sekitar 640 px, hero outlet ringkas, status dan estimasi langsung terlihat.
- Tombol “+ Order” hilang dari shell ketika sudah di intake agar tidak membuat draft ganda. Sticky submit tidak menumpuk di atas bottom nav.

## 5. Anatomi layar prioritas

### Beranda dan kartu order

Header outlet + tanggal + scan/cari. Ringkasan kecil: masuk hari ini, harus dikerjakan, siap diambil; perhatian untuk telat/belum lunas. Bukan dashboard grafik besar.

```text
RWT-0412                         [Belum Lunas]
Kak Sari · 2 item
[thumbnail] Nike putih · Deep Clean
Siap Kamis, 24 Sep               [Terlambat 1 hari]
[Dikerjakan]                         [Lihat →]
```

Gunakan badge status pekerjaan, bayar dan tenggat yang berbeda fungsi; jangan mengganti semuanya dengan label “High Priority” dari referensi. Kartu selesai menampilkan review eligible; kartu ready menampilkan konfirmasi ambil.

### Intake

Satu halaman: **Pelanggan → Item → Pembayaran → Persetujuan**. Bukan wizard panjang yang menambah tap.

- Nomor WA paling atas, autocomplete pelanggan lama; saran merek/warna dan chip kondisi mengurangi ketik.
- Card per item dengan foto, layanan/add-on, subtotal dan tombol tambah item jelas.
- Izin publikasi foto opsional, terpisah dari persetujuan layanan, tidak dicentang otomatis.
- Sticky footer: total + “Simpan Order”. “Tersimpan di perangkat” berbeda dari “Order tersinkron”.
- Error tepat di field; ringkasan atas hanya jika perlu. Jangan menghapus input saat upload gagal.

### Detail dan pengambilan

Header kode/status/bayar → barang/foto → aksi berikutnya → timeline. Pelunasan sheet ringkas; serah-terima halaman fokus kamera. Tidak ada tombol completed alternatif di overflow, bulk action, atau edit status.

Foto bukti disertai panduan “Foto barang saat diserahkan; hindari wajah dan identitas sensitif.” Preview/retake sebelum submit; tombol disabled menjelaskan alasan. Owner override tetap meminta alasan, tidak menjadi tombol bypass tersembunyi.

### Resi dan share card

Logo/nama outlet → status/progress → estimasi → item/before-after → pembayaran → bukti ambil bila berlaku → CTA chat/share. Hindari WA/alamat pelanggan, nama lengkap pengambil, atau tanda tangan pada respons publik.

Share card: satu template pastel/ungu, before-after paling dominan, badge hasil, merek/layanan, identitas outlet, streak dan watermark sesuai paket. Foto pickup tidak pernah menjadi sumber share. Jangan memotong bagian kondisi barang yang penting; pengguna dapat memilih foto per item. Hasil siap diunduh 1:1 dan 9:16.

### Laporan dan pengaturan

Laporan mengikuti grafik batang sederhana pada referensi: lima angka dan tiga daftar, tanpa dashboard BI kompleks. Pengaturan memakai section/card dan navigasi sederhana, bukan semua field dalam satu layar panjang. Batas paket/retensi dan dampak menonaktifkan bukti selalu dijelaskan.

## 6. State, aksesibilitas, dan microcopy

- Target WCAG 2.2 AA: teks normal ≥4.5:1, teks besar ≥3:1, indikator kontrol/focus ≥3:1; validasi pasangan warna nyata saat build.
- Status memakai warna **dan** teks/ikon. Focus terlihat, dialog focus-trap/restore, Escape/Back bekerja, label input selalu ada; toast penting diumumkan screen reader.
- Skeleton mengikuti bentuk card. Empty state punya aksi yang relevan. Jangan menampilkan Rp0 seolah laporan sukses bila API gagal.
- Format Indonesia: `Rp45.000`, tanggal jelas, waktu dengan zona outlet. Nama barang/satuan/status berasal dari konfigurasi, bukan hard-code “sepatu/pasang”.
- Contoh microcopy: “Disimpan di perangkat. Akan disinkronkan saat online.”, “Foto bukti belum ditambahkan.”, “WhatsApp dibuka. Tandai setelah pesan benar-benar dikirim.”, “Belum ada izin publikasi foto dari pelanggan.”
- Pakai “Review diminta” atau “Permintaan dikonfirmasi terkirim”, bukan “Review berhasil masuk”. Native share cancellation tidak menampilkan toast sukses.

## 7. Kriteria persetujuan visual

Style guide lulus bila konsisten pada galeri komponen, beranda, intake, detail, pickup, resi, kartu share dan laporan; kontras/keterbacaan baik; operasional tidak terasa seperti aplikasi to-do yang hanya diganti nama. Bukti persetujuan diambil dari preview berjalan, bukan hanya contoh gambar atau dokumen ini.
