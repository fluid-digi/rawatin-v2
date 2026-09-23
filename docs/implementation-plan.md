# Rawatin — rencana implementasi FE-first

Disusun: 23 September 2026. Status: **rencana untuk disetujui; belum dieksekusi**.

## 1. Hasil yang dituju dan batas persetujuan

Membangun Rawatin sebagai sistem operasional barang titipan, bukan aplikasi kasir generik. Prioritas: intake cepat, bukti kondisi masuk dan keluar, status yang mudah dilacak, serta tindak lanjut manual tanpa biaya WhatsApp API.

```text
A. Kunci scope + design system
   ↓
B. Frontend lengkap dengan data simulasi dan interaksi nyata
   ↓
C. Anda mencoba UI/UX → perbaikan → persetujuan eksplisit
   ═════════════ GATE WAJIB ═════════════
D. Backend + database + storage + integrasi frontend
   ↓
E. E2E terintegrasi + perangkat asli + kesiapan operasional
   ↓
F. Pilot 3–5 outlet → evaluasi → rilis
```

- Fase sekarang hanya menyusun rencana. Tidak membuat backend, resource cloud, atau aplikasi tanpa masuk tahap implementasi.
- Tahap FE menghasilkan aplikasi yang bisa dicoba, **bukan gambar statis/Figma**. Semua hasil simulasi diberi label agar tidak disangka transaksi sungguhan.
- Checkpoint tampilan awal boleh dilakukan untuk mengurangi revisi; persetujuan akhir seluruh alur tetap wajib sebelum backend.
- Definisi DTO, validasi bersama, dan rancangan API boleh disiapkan selama FE. Implementasi server, autentikasi nyata, migrasi, Neon/R2, dan sinkronisasi server menunggu gate.
- Unit/component test FE dilakukan sejak awal. Suite E2E terintegrasi dijalankan setelah backend tersedia; mock FE tidak dianggap bukti keberhasilan end-to-end.

## 2. Scope MVP dan penelusuran ke PRD

Baseline rencana: **seluruh Modul 1–12 pada spesifikasi MVP**, termasuk laporan sederhana. Roadmap PRD menunda sebagian laporan/operasional; konflik ini perlu dikunci, bukan menyebabkan fitur diam-diam hilang.

| Modul PRD | Deliverable frontend | Deliverable backend / aturan utama |
|---|---|---|
| M1 Onboarding | Login WA + PIN; wizard 4 langkah; cek slug simulasi; default; lewati; install PWA | Sesi, outlet, slug unik/reserved, konfigurasi default; verifikasi nomor sesuai keputusan autentikasi |
| M2 Katalog | Daftar, tambah/edit/nonaktifkan layanan; add-on; harga, durasi, kategori, satuan | CRUD tenant-scoped; snapshot harga dan add-on pada transaksi |
| M3 Intake | Satu halaman scroll, autocomplete pelanggan, multi-item, kamera, chip kondisi, pembayaran, persetujuan, autosave | Simpan order atomik, customer dedup, validasi consent/foto, idempotensi dan sinkronisasi |
| M4 Label | Preview A4, pilih batch, download/cetak, kode besar untuk tulis manual, masuk melalui scan | PDF A4 `pdf-lib` + QR; detail staf tetap memerlukan sesi dan akses outlet |
| M5 Papan kerja | Tab status mobile, kolom desktop, filter/search, seleksi massal, riwayat | State machine, audit, concurrency guard; endpoint status tidak boleh menyelesaikan order |
| M6 Resi publik | Status, estimasi, item, galeri before/after, pembayaran, bukti ambil, CTA WA/share | DTO publik minimal, token tidak mudah ditebak, akses media terbatas, tanpa WA/alamat pelanggan |
| M7 WA manual | Enam template editable, preview pesan, antrean buka satu per satu, konfirmasi sudah dikirim | Log tindakan manual; membuka WhatsApp tidak berarti pesan terkirim |
| M8 Pembayaran & barang tertahan | Lunas/DP/belum; cicilan; total piutang; filter umur >7/14/30/60 hari | Ledger pembayaran, saldo server, umur sejak `ready_at`; tanpa denda/kepemilikan otomatis |
| M9 Laporan/export | Lima angka, grafik batang, tiga daftar, periode, CSV | Agregasi scoped, definisi angka konsisten, export aman |
| M10 Review Maps | CTA hanya Selesai + link tersedia + paket mendukung; kembali dari WA; tandai; badge; filter | Log siapa/kapan, anti-duplikasi, reset oleh owner dengan audit, statistik permintaan |
| M11 Bukti ambil | Pelunasan/override, kamera, retake, nama pengambil opsional, konfirmasi | Foto terverifikasi tersimpan sebelum completed; pelaku/waktu, aturan owner dan audit |
| M12 Share lite | Satu template, format 1:1 dan 9:16, ganti foto, badge/streak, caption, share/download | Entitlement + consent outlet, data penghitung akurat, event tanpa mengklaim posting sosmed |

**Lintas modul:** PWA, aksesibilitas, mobile-first, error/empty/loading/offline states, batas paket, privasi, retensi, telemetry, dan backup. Paket Free/Solo/Outlet menjadi skenario MVP; paket Multi/Enterprise tidak mengaktifkan fitur masa depan.

**Tidak termasuk:** storefront penuh/order online, payment gateway, WA API/blast otomatis, thermal Bluetooth, multi-cabang, peran kustom/teknisi lengkap, generator konten pro/video, loyalitas poin, pickup/antar, kas harian/tutup kasir, biaya penitipan otomatis, status barang menjadi milik outlet, AI, inventori, aplikasi native. Landing pemasaran dan langganan QRIS manual disiapkan sebelum pendaftaran publik, bukan syarat review UI operasional pertama.

## 3. Arsitektur informasi dan layar

### Navigasi

- Mobile: **Beranda · Pesanan · + Order · Laporan · Akun**. Tombol tengah adalah aksi intake, bukan tab kosong. Pada akun tanpa akses laporan, slot tersebut menjadi **Tindak lanjut**.
- Desktop: sidebar tetap, header pencarian/scan, area kerja lebih lebar; bukan tampilan HP yang dibesarkan.
- Beranda: ringkasan tindakan hari ini, jatuh tempo, siap diambil, piutang, dan review yang belum diminta. Omzet hanya untuk peran yang diizinkan.
- Pesanan: papan kerja + daftar alternatif; chip status, bayar, umur, staf; pilihan massal. Tidak mewajibkan drag-and-drop.
- Akun: identitas outlet, katalog, status/label barang, disclaimer, template WA, link Maps, PWA, paket/retensi, pengaturan bukti, pusat sinkronisasi.

### Route yang direncanakan

| Route | Tujuan |
|---|---|
| `/login`, `/onboarding` | Masuk dan setup awal; login dapat menyertakan konteks outlet |
| `/{slug}/dashboard` | Beranda outlet |
| `/{slug}/orders`, `/{slug}/orders/new` | Papan/daftar dan intake |
| `/{slug}/orders/{id}` | Detail, foto, timeline, pembayaran, WA |
| `/{slug}/orders/{id}/pickup` | Konfirmasi pengambilan, kamera, ringkasan |
| `/{slug}/orders/{id}/share` | Pembuat kartu hasil milik outlet |
| `/{slug}/labels`, `/{slug}/follow-ups` | Cetak batch; pengingat/review |
| `/{slug}/reports`, `/{slug}/settings/*`, `/{slug}/sync` | Laporan, konfigurasi, queue |
| `/r/{token}` | Resi pelanggan tanpa login; token terpisah dari kode pendek staf |
| `/{slug}` | Reserved untuk storefront; perilaku minimal MVP perlu keputusan D10 |
| `/dev/ui`, `/dev/scenarios` | Hanya build review: komponen, fixture, reset, error/offline/role/paket |

Drawer/bottom sheet dipakai untuk filter, pembayaran cepat, opsi order, dan konfirmasi. Alur kamera/intake/pengambilan yang panjang mempunyai halaman sendiri agar tombol Back, refresh, dan deep link tetap masuk akal. Route publik dan staf dipisah agar bundle admin tidak ikut memberatkan resi.

## 4. Tahap A–B: implementasi frontend

### FE-0 — fondasi dan kontrak (1–2 hari kerja)

- Scaffold Vite + React + TypeScript, router, lint/format/typecheck, struktur fitur, script build/test, environment contoh tanpa secret.
- Kunci pilihan basis UI pada D1. Rekomendasi: Tailwind + komponen accessible bertema Rawatin; adaptasi blok Saasable yang sesuai, bukan mengimpor dua design system sekaligus.
- Siapkan `packages/contracts`: tipe, enum, skema validasi, format error/pagination, dan interface `RawatinClient`; belum ada API server.
- Implementasi mock adapter async dengan fixture deterministik dan penyimpanan lokal untuk demo. Pilihan mode mock/API di satu boundary, bukan `if (mock)` tersebar di halaman.
- Manifest PWA, ikon milik Rawatin, service worker app shell, install guidance Android/iOS, dan draft IndexedDB sejak awal. Mock handler dan service worker PWA tidak boleh berebut scope.
- Data demo sintetis; semua nomor/konten eksternal dibatasi atau diarahkan ke nomor uji yang disetujui. Tidak ada data pelanggan nyata.

**Selesai jika:** build/lint/typecheck lulus; route dasar, mode demo, reset fixture, dan draft dapat digunakan tanpa backend.

### FE-1 — design system dan app shell (2–3 hari)

- Terapkan [style guide](./ui-style-guide.md): Outfit, pastel, CTA ungu, cards, typography, spacing, status, dan aksesibilitas.
- Buat tombol, input/PIN/WA, checkbox/radio/switch, chips, badge, dialog/sheet, toast, skeleton, error/empty, timeline, photo tile, order card, camera panel, bottom navigation, date range.
- Bangun shell mobile/desktop, onboarding, account/settings dasar dan galeri komponen.
- Checkpoint visual awal: kirim preview + screenshot mobile/desktop untuk memastikan arah desain sebelum memperbanyak layar.

**Selesai jika:** komponen punya state default/focus/disabled/error/loading; keyboard dan safe area tidak menutup CTA.

### FE-2 — alur inti operasional (4–5 hari)

- Katalog + onboarding lengkap; preset layanan, status dan disclaimer.
- Intake satu halaman: WA autocomplete, multi-item, chip kondisi, kamera dan kompresi nyata, persetujuan terpisah, ringkasan pembayaran, draft restore.
- Success state: kode, label PDF lokal untuk review layout, preview pesan WA, order berikutnya. PDF produksi nanti berasal dari API dengan layout yang sama.
- Papan/status/detail: pencarian, filter, seleksi minimal 20 order, timeline, foto after, pembayaran bertahap, scan QR dengan fallback cari kode.
- Resi publik dari dataset demo yang sama: perubahan mock di admin tercermin pada resi demo, tidak menggunakan data acak per halaman.
- Guard FE: tidak bisa melewati pengambilan; harga dan jumlah konsisten; submit ganda dilindungi.

**Selesai jika:** satu skenario intake → label → papan → resi dapat dicoba dari awal hingga akhir tanpa tombol buntu.

### FE-3 — bukti pengambilan dan growth lite (3–4 hari)

- Pengambilan: sisa bayar, override owner dengan alasan, kamera langsung, preview/retake, minimal satu bukti bila diwajibkan, penerima alternatif, sukses.
- Review: eligible, link Maps belum diisi, paket terkunci, WA dibuka, kembali tanpa konfirmasi, terkirim, reset owner.
- Share card: canvas nyata, 1080×1080 dan 1080×1920, pilihan foto per item, badge/streak/counter sesuai paket, caption/copy/download dan native share bila didukung.
- Consent: pelanggan dari resi dan outlet dari dashboard dibedakan; outlet dilarang membuat/download konten tanpa izin publikasi. Kartu tidak pernah memuat foto serah-terima, WA pelanggan, atau rincian bayar.
- Piutang, umur barang, antrean follow-up, laporan sederhana dan CSV fixture; konfigurasi paket dan retensi ditampilkan transparan.
- Laporan: omzet, jumlah item/satuan, rata-rata per order, total piutang, barang belum diambil; daftar layanan terlaris, pelanggan teratas dan order per staf. Tidak menambah laba-rugi/HPP atau dashboard kustom.

**Selesai jika:** intake → siap → bukti ambil → selesai → review/share dapat diuji, termasuk skenario ditolak/gagal.

### FE-4 — PWA, resilience, dan paket review (2–3 hari)

- Draft + Blob foto di IndexedDB sungguhan; queue lokal dan simulasi ACK server, retry, konflik, sesi habis, serta kuota. Label selalu membedakan tersimpan lokal dari tersinkron.
- State per layar: loading, empty, error, offline, foto kedaluwarsa, izin kamera ditolak, upload tertunda, item paket terkunci, session expired, token resi tidak valid.
- Fixture: minimal dua outlet, persona owner/staf, tiga tier, 200 order aktif, multi-item, DP, lewat 7/14/30/60 hari, consent on/off, ready tanpa after, completed dengan bukti.
- Unit/component test: total/DP, validasi form, guard pickup/review/consent, navigasi, draft, format WA, kompresi dan render kartu.
- Inspeksi browser pada mobile/desktop, screenshot terkini, daftar keterbatasan mock, dan [checklist UAT](./uiux-review-checklist.md).

**Selesai jika:** preview dapat dibuka tanpa cloud backend; fixture dapat di-reset; masalah blocking internal telah diperbaiki. Simulasi queue belum membuktikan sinkronisasi server.

## 5. Tahap C: verifikasi manual UI/UX Anda

Handoff berisi URL preview HTTPS, cara masuk demo, cara reset, daftar skenario, screenshot, nomor versi/commit, dan batasan fitur simulasi. Nomor WA uji dipilih sebelum mencoba pengiriman keluar.

1. Review tampilan, keterbacaan, navigasi, ergonomi kamera, dan kelengkapan informasi.
2. Jalankan alur normal serta alur gagal pada checklist; ukur intake dan pengambilan sebagai baseline UX.
3. Catat temuan dengan format layar → aksi → hasil saat ini → hasil yang diinginkan → prioritas.
4. Agent memperbaiki, melakukan regression check, lalu menyerahkan preview baru.
5. Anda memberikan **persetujuan eksplisit UI/UX pada versi tertentu**. Screenshot atau diamnya reviewer bukan persetujuan.

**Syarat gate:** semua alur inti dapat dilalui, tidak ada masalah P0/P1, desain mobile dan resi disetujui, keputusan D1–D10 yang relevan dikunci. P2 dapat diterima hanya bila dicatat. Perubahan layout material setelah integrasi meminta review ulang pada bagian terdampak.

## 6. Tahap D: backend dan integrasi setelah gate

### BE-1 — fondasi aman (2–3 hari)

- Hono TypeScript di Cloudflare Workers, Neon Postgres + Drizzle migrations, binding/env tervalidasi, staging terpisah produksi.
- Pages frontend + Worker API di origin yang sama melalui `/api/*`; satu repo/release workflow dengan dua target deploy, bukan klaim satu proses runtime. Tentukan routing dan cookie sebelum deploy.
- Auth WA + PIN dengan hash password yang sesuai runtime, PIN tidak disimpan plaintext; session cookie `HttpOnly`, `Secure`, `SameSite`, expiry/rotation/revoke/logout.
- Rate limit percobaan login dan recovery, CSRF/origin check untuk mutation, response anti-enumeration. Pemulihan PIN tidak boleh cukup dengan mengetahui nomor WA.
- Resolve slug → tenant, lalu validasi keanggotaan sesi. Slug bukan otorisasi. Owner/staf mengikuti keputusan D2; jangan percaya `tenant_id`, role, harga, atau entitlement dari client.
- Branch migrasi dan backup/restore aktif **sebelum** data pelanggan riil masuk. Infrastructure secrets lewat jalur platform yang berizin, bukan chat/git.

### BE-2 — domain order, foto, dan pembayaran (4–5 hari)

- Implementasi kontrak FE: katalog, pelanggan, intake, draft/sync, item, foto, status, pembayaran, pickup dan audit.
- Total dihitung server memakai snapshot harga/layanan/add-on; nominal rupiah integer; jumlah/satuan dan diskon tervalidasi. Timestamp server + zona waktu outlet, bukan hard-code semua outlet WIB.
- Upload R2 private: otorisasi presign → upload → finalisasi/verifikasi objek (jenis, ukuran, dimensi, kepemilikan) → status siap dipakai. Metadata upload dari browser bukan bukti objek valid.
- Pickup transaction: kunci/version-check order, cek pembayaran/override, cek bukti tersimpan, tulis status + pelaku + log atomik. Trigger DB atau mekanisme DB setara melindungi invariant lintas tabel; bukan `CHECK` yang meng-query tabel foto.
- `require_pickup_proof` default `true`; hanya owner dapat mengubahnya dengan alasan/audit dan peringatan dampak. Simpan snapshot kebijakan pada konfirmasi; pengecualian tampil di audit/compliance. Override pembayaran tidak otomatis membebaskan foto. Saat foto diwajibkan dan kamera gagal, jangan diam-diam menggantinya dengan galeri atau menyelesaikan order.
- Transisi massal tidak pernah menuju `completed`; hasil per order terlihat untuk partial failure. Idempotency key melindungi intake, pembayaran, pickup, dan mark-review dari retry/double tap.
- Sesudah foto retensi dihapus, audit historis pickup tetap ada dan order tidak dibatalkan. Validasi bukti dilakukan saat transisi, bukan mewajibkan objek hidup selamanya.

### BE-3 — resi, label, laporan, WA dan share (2–3 hari)

- Endpoint publik hanya mengeluarkan field yang disetujui. Token random berentropi tinggi unik global, terpisah dari kode order manusia; kode QR staf mengarah ke route terautentikasi.
- Tetapkan masa akses resi, mekanisme revoke/rotate token saat bocor, dan halaman link kedaluwarsa. Kebijakan akses resi dan retensi foto terpisah; rotasi tidak mengubah kode order internal.
- R2 tidak dibuka sebagai bucket publik. Akses media via handler berotorisasi atau URL pendek umur sesuai konteks resi; referrer policy, noindex, dan cache policy mencegah kebocoran tidak sengaja. Tidak ada klaim bahwa noindex adalah kontrol akses.
- Consent publikasi, hak paket dan state order diverifikasi server untuk konten outlet. Resi berupa bearer link: siapa pun yang memegang link bisa mengakses data terbatasnya; tidak membuktikan identitas pemilik.
- PDF label A4 5×3 cm, batch, QR dan satuan barang konfigurabel; PDF mengandung PII pelanggan untuk penggunaan staf sehingga tidak dipublikasikan tanpa auth.
- Enam template WA, logs dibuka/dikonfirmasi terpisah; mark-review atomik, reset owner dengan alasan. Tidak memantau WhatsApp atau mengklaim review Google benar-benar masuk.
- Laporan tepat 5 angka + 3 daftar; laporan permintaan review mini terpisah dari metrik review yang benar-benar diposting. CSV tenant-scoped, escaped, aman dari formula injection.
- Entitlement sesuai plan, batas order/foto dan retensi; langganan manual bukan payment gateway.

### BE-4 — mengganti mock dan operasi (2–3 hari)

- Ganti adapter, bukan layout; contract test memastikan FE dan API sejalan. Build produksi tidak memuat fixture/mock switch/dev routes.
- Selesaikan queue real, retry, optimistic rollback, timeout, konflik dua staf, upload terputus, sesi kedaluwarsa, dan quota exceeded. Data lokal belum di-ACK tidak dihapus.
- Monitoring error/upload/sync tanpa PIN, cookie, token resi penuh, nomor pelanggan atau foto dalam log. Retention job dengan dry-run, audit dan alert kegagalan.
- Backup `pg_dump` harian di runner yang mendukung executable Postgres (misalnya GitHub Actions), bukan menjalankan binary tersebut di Worker Cron. Simpan terenkripsi ke bucket backup terpisah, akses terbatas, dan kebijakan expiry.
- R2 tidak diasumsikan mendukung S3 bucket versioning. Pakai object key immutable dan salinan backup foto dengan kredensial terpisah; uji restore metadata **dan** foto, serta propagasi penghapusan sesuai kebijakan privasi.
- Neon PITR/history window dan biaya diperiksa sesuai paket yang dibeli; jangan menganggap fitur berbayar tersedia gratis. Uji restore ke branch terisolasi sebelum pilot; tetapkan RPO/RTO dengan pemilik produk.

**Gate backend selesai:** kontrak terintegrasi, invariant/security/integration test lulus, migrasi dan restore terbukti, tidak ada jalur mutasi yang bisa melewati tenant atau bukti ambil.

## 7. Model data dan kontrak minimum

### Entitas

- `tenants`, konfigurasi status/label/consent/WA/share, `users`, membership bila diperlukan, `sessions`.
- `services`, `addons`, relasi layanan-add-on, `customers` (nomor normalisasi unik per tenant).
- `orders`, `order_items`, `order_item_services`, price/duration/label snapshot, `payments`, `status_logs`.
- `photos` (before/after/issue/signature/pickup_proof, object key, upload state, capture/server time, expiry), consent snapshot/version, pickup audit, overrides.
- `notifications_log`, `share_events`, `subscriptions`/entitlements, `resi_views`, idempotency/sync operation records.

Semua relasi memvalidasi tenant induk; FK/unique index mencegah referensi lintas tenant. Indeks utama: tenant+status+tenggat, tenant+ready_at, tenant+payment status, token publik unik, tenant+customer phone, tenant+idempotency key. Uang, tanggal dan counters tidak bergantung state client. Penghapusan data tidak boleh merusak audit atau snapshot transaksi.

ID status kanonik tetap `received → in_progress → finishing → ready → completed`; label tampil dapat diganti dari konfigurasi. Mengganti nama status tidak boleh mengubah hak akses, memicu review terlalu awal, atau melewati pickup. Pembuatan order selalu mulai `received`, bukan menerima status final dari client.

### Kelompok endpoint yang direncanakan

```text
/api/auth/*                                     sesi, login, logout, recovery
/api/outlets/*                                  onboarding, slug, konfigurasi
/api/t/{slug}/services, /addons, /customers      referensi tenant
/api/t/{slug}/orders                            list, intake, detail
/api/t/{slug}/orders/{id}/status                 transisi biasa
/api/t/{slug}/orders/{id}/payments               pembayaran bertahap
/api/t/{slug}/orders/{id}/pickup                 satu-satunya transisi completed
/api/t/{slug}/orders/{id}/photos/*               presign, finalize, metadata
/api/t/{slug}/orders/{id}/review-request         mark/reset manual
/api/t/{slug}/labels, /reports, /exports         output staf/owner
/api/t/{slug}/sync                              operasi offline idempoten
/api/public/receipts/{token}                    read-only DTO publik
/api/public/receipts/{token}/share-events        event terbatas/rate-limited
```

Kontrak menetapkan request/response tervalidasi, error code (`AUTH_REQUIRED`, `FORBIDDEN`, `CONFLICT`, `PROOF_REQUIRED`, `PLAN_LIMIT`, dll.), pesan Indonesia, pagination, `version`, idempotency key, dan request ID. Route akhir dikunci sebelum integrasi; tidak perlu GraphQL atau microservice.

## 8. Aturan offline dan konsistensi

1. Offline dijamin untuk **intake setelah perangkat pernah online/login dan data dasar tersedia**. Login pertama dan akses resi baru tetap butuh jaringan. PWA tidak berarti semua layar bisa bekerja offline.
2. IndexedDB menyimpan draft/order, Blob foto terkompresi, client ID, tenant/user asal dan operation key. Local order diberi kode sementara yang jelas.
3. State queue: `draft → queued → uploading → syncing → synced`; cabang `retryable_error`, `needs_attention`, `auth_required`. UI menampilkan jumlah, sebab dan tindakan, bukan spinner tanpa akhir.
4. Resi publik dan label QR final baru dianggap valid setelah server ACK. Saat offline, tampilkan kode sementara untuk label tulisan tangan; jangan membagikan link resi palsu.
5. Retry aman memakai idempotency; ACK hilang tidak membuat duplikat. Foto terunggah sebagian direkonsiliasi; orphan upload dibersihkan setelah grace period, bukan langsung.
6. Sinkron saat app dibuka, kembali foreground, atau event online; tombol retry manual tersedia. Background Sync hanya enhancement, tidak dijanjikan saat aplikasi ditutup di semua browser.
7. Conflict version mengharuskan refresh/review, terutama pembayaran dan pickup; jangan last-write-wins pada data uang/bukti. Kuota/paket berubah → `needs_attention`, draft/foto tetap ada.
8. MVP offline mutation dibatasi intake. Pembayaran tambahan, pickup, perubahan status dan penandaan review perlu konfirmasi server; UI menjelaskan kebutuhan online. Perluasan offline serah-terima adalah keputusan terpisah.
9. Logout dengan queue tertunda memberi peringatan; queue terkunci ke tenant/user asal, tidak terlihat bagi akun lain. Penghapusan draft harus eksplisit. Storage penuh/eviction diperlakukan sebagai risiko yang terlihat, bukan janji data lokal tidak pernah hilang.
10. Cache service worker dipisah untuk app shell/data, tidak memasukkan respons authenticated atau foto sensitif ke cache generik; pembaruan service worker tidak memaksa reload saat form aktif.

## 9. Tahap E: strategi test dan kriteria rilis

Estimasi 6–8 hari termasuk perbaikan. Gunakan Vitest + React Testing Library untuk unit/component, integration test API + Postgres terisolasi, dan Playwright untuk E2E. Versi dipin saat setup; tidak ada dependency terpasang saat rencana ini ditulis.

### Matriks E2E minimum

| ID | Skenario | Bukti hasil wajib |
|---|---|---|
| E01 | Daftar, slug bentrok/reserved, wizard/skip, login salah, logout | Default usable, validasi benar, sesi dan tenant tepat |
| E02 | Intake pelanggan baru/lama, multi-item, add-on, diskon, consent | Total/foto/snapshot tersimpan; refresh tidak kehilangan draft |
| E03 | DP → cicilan → lunas; double tap/retry pembayaran | Saldo akurat, tidak ada pembayaran ganda |
| E04 | Papan, filter, 200 order, bulk ≥20, dua staf bersamaan | Transisi sah, konflik terdeteksi, audit benar |
| E05 | Pickup tanpa foto/belum lunas/override/objek upload belum valid | Ditolak FE **dan API langsung**; hanya alur sah menjadi completed |
| E06 | Resi token valid/invalid, foto expired, tenant lain | Tidak ada PII terlarang, enumerasi/IDOR/akses silang ditolak |
| E07 | Offline intake, reload, online, timeout setelah commit, sesi habis | Order tepat satu, foto lengkap, queue tidak hilang/bercampur |
| E08 | WA diterima/siap/pengingat/lunas, batal, konfirmasi manual | Pesan/encoding/nomor benar; opening tidak menandai terkirim |
| E09 | Review sebelum selesai/link kosong/tier, mark dua kali, owner reset | Eligibility benar, anti-duplikasi dan audit reset |
| E10 | Share 2 rasio, consent false, file share ditolak/dibatalkan | Outlet diblokir tanpa izin; fallback; cancel bukan sukses |
| E11 | Paket Free/Solo/Outlet, batas order/foto, rename status/item label | Guard server konsisten; renaming tidak membypass completion |
| E12 | CSV, laporan, label PDF, scan, snapshot harga setelah edit katalog | Data benar, CSV aman, QR terbaca dan auth tetap berlaku |
| E13 | PWA update, queue, quota storage, logout/ganti tenant | Form/queue tidak rusak, data lintas sesi tidak bocor |
| E14 | Retensi, backup/restore, simulasi storage error | Audit terjaga, media expired jelas, restore dapat dibuka |

E2E utama memakai API + database + storage uji sungguhan, bukan mock frontend. Stub hanya boundary eksternal/non-deterministik: kamera fixture, OS share, WhatsApp dan Google Maps. CI memverifikasi niat membuka/isi URL, **bukan** bahwa pesan WA terkirim atau konten sudah diposting.

- PR checks: lint, typecheck, unit/component, build; setelah BE: migration/integration tests + critical E2E Chromium. Artefak trace/screenshot/video hanya fixture aman.
- Nightly/pre-release: suite penuh, Firefox/WebKit dan viewport mobile/desktop. WebKit desktop bukan pengganti iPhone asli.
- Preview/staging menggunakan Neon branch/database dan bucket/prefix test terisolasi; seed dua tenant; cleanup; tidak memakai production customer data.
- Uji manual di 3 HP Android mid-range + 1 iPhone: install PWA, kamera, permissions, WA/WA Business, share sheet, cetak/scan fisik, dan reconnect. Jika perangkat belum tersedia, laporkan sebagai belum terverifikasi dan jangan centang selesai.
- Snapshot visual dapat menangkap regresi setelah UI disetujui, tidak menggantikan review manusia dan tidak di-update sekadar agar test hijau.

### Target performa dan usability dari PRD

| Target | Cara verifikasi |
|---|---|
| Daftar sampai order pertama <10 menit | Stopwatch onboarding pada pengguna baru |
| Intake satu item <60 detik; maksimal 2 field wajib diketik | Tiga orang berbeda dengan preset; bedakan pelanggan baru/lama, foto dan persetujuan ikut dihitung |
| Scan sampai pickup selesai <30 detik | Perangkat asli; jalur sudah lunas diukur terpisah dari waktu pelanggan membayar |
| Kamera <2 detik | Warm/cold permission dicatat terpisah, tidak menyembunyikan waktu izin awal |
| Foto ≤150 KB, sisi terpanjang ≤1200 px | Test beragam foto/orientasi; iterasi kualitas/ukuran, bukan asumsi quality 70% selalu cukup |
| Papan 200 order <2 detik; resi <2 detik di 4G lemah | Profil jaringan/perangkat dan cold/warm load ditulis dalam laporan |
| Perubahan status biasa maksimal 2 tap | Dari kartu → aksi lanjut; pengecualian pickup memang melalui pemeriksaan bukti dan pembayaran |
| Resi initial transfer <100 KB | Budget response + critical assets terkompresi sebelum galeri; lazy-load foto, font subset dan bundle terpisah; ukur kelayakannya sejak FE |
| Share card <3 detik | HP mid-range; font/foto siap, render dua format, CORS canvas tidak rusak |
| Scan QR / membuka WA <3 detik | Ukur app dan handoff OS terpisah; validasi pesan dan QR fisik |

**Go-live gate:** E01–E14 lulus sesuai cakupan, tidak ada P0/P1, manual perangkat terverifikasi, backup+restore berhasil, retensi aktif, monitoring/alert aktif, rollback runbook siap, persetujuan privasi/ToS dan disclaimer tersedia. Kegagalan target performa ditindaklanjuti, bukan diubah diam-diam.

## 10. Keputusan yang perlu dikunci

Rekomendasi berikut merupakan **usulan**, terutama bila berbeda dari PRD. FE boleh menggunakan fixture kedua alternatif sampai disepakati; tidak boleh diam-diam menjadikannya aturan produksi.

| ID | Ambiguitas/risiko | Rekomendasi | Batas keputusan |
|---|---|---|---|
| D1 | PRD menyebut Tailwind + Saasable; admin Vite Saasable memakai MUI | Utamakan Vite/TS/Tailwind dan desain lampiran; reuse blok Tailwind yang cocok. Jika base admin Saasable wajib, gunakan MUI yang di-theme, jangan gabungkan dua sistem komponen penuh | Sebelum FE-0 dikunci |
| D2 | M13 multi-user ditunda tetapi flow staf, laporan per staf dan paket sudah ada | MVP minimal owner+staf dengan hak tetap; staf intake/status/bayar/pickup/review, tanpa omzet/settings/override. Invitation/teknisi/peran kustom F2. Ini penambahan kecil yang perlu persetujuan; alternatif pilot owner-only dengan batasan eksplisit | Sebelum UI final dan BE auth |
| D3 | Spesifikasi M9 MVP, roadmap menunda laporan; M8 parsial | Masukkan laporan sederhana dan bagian M8 bertanda MVP; tidak membangun kas harian/denda otomatis. Estimasi mencakup scope ini | Sebelum persetujuan scope |
| D4 | Intake min 1 maks 4 per item vs batas foto 2/4/8 per order; Free tanpa after | Satu before minimum per item, limit paling ketat per item dan total plan; pickup quota terpisah. Bila item melampaui batas, jelaskan sebelum simpan; offline conflict tidak menghapus draft. `ready` tetap boleh tanpa after, share baru eligible saat before+after tersedia | Sebelum FE-2 |
| D5 | Camera `capture` dianggap menjamin foto baru | `getUserMedia` live capture untuk bukti, tanpa galeri dalam UI utama; fallback capture hanya pada perangkat yang telah diuji/disetujui. Browser tidak memberi bukti anti-pemalsuan absolut; timestamp server mencatat upload/konfirmasi, bukan jaminan waktu pemotretan | Sebelum pickup disetujui |
| D6 | PRD menampilkan foto pengambil dan nama staf pada resi bearer link | Arahkan foto barang di tangan tanpa wajah/identitas sensitif; jelaskan akses link dan retensi. Tetapkan versi publik yang aman vs bukti asli khusus staf; penggunaan nama staf publik disetujui. Jika butuh akses hanya pemilik, diperlukan faktor verifikasi tambahan | Sebelum resi/bukti disetujui |
| D7 | WA deeplink onboarding bukan bukti kepemilikan nomor | Pilot: verifikasi manual oleh operator + status verified. Pendaftaran/recovery publik butuh mekanisme verifikasi sah yang disetujui; jangan tandai nomor verified hanya karena WA dibuka | Sebelum BE auth/pilot |
| D8 | “Omzet”, streak, counter dan tanggal retensi belum didefinisikan tunggal | Omzet = total nilai order masuk pada periode; penerimaan pembayaran terpisah; piutang = sisa semua order relevan. Streak = urutan kunjungan/order valid pelanggan termasuk order ini, bukan hari berturut-turut; counter menghitung kuantitas item. Retensi diusulkan mulai saat upload dan aturan untuk order masih aktif disepakati | Sebelum BE laporan/retensi |
| D9 | Contoh pesan hanya pelanggan puas dan meminta bintang lima | Gunakan ajakan ulasan jujur/netral untuk semua pelanggan selesai yang eligible; tanpa seleksi sentimen, insentif, atau kewajiban bintang lima | Sebelum template WA final |
| D10 | Share card mengarah ke `/{slug}` tetapi storefront belum MVP | Usulan halaman identitas minimal + Chat WA, tanpa katalog/order online/SEO storefront penuh, agar watermark tidak menuju 404. Alternatif gunakan URL resi sementara. Setujui pilihan sebelum kartu final | Sebelum FE-3 |

Pemilik produk memutuskan cakupan, kebijakan privasi, wording legal, serta persetujuan UI. Agent mengimplementasikan, memverifikasi dan menyediakan bukti. Provisioning cloud, domain, secret dan perangkat uji mengikuti akses yang benar-benar tersedia; tidak meminta token ditempel di chat.

## 11. Estimasi dan urutan delivery

| Tahap | Estimasi kerja aktif | Output / dependensi |
|---|---:|---|
| FE-0–FE-1 | 3–5 hari | Fondasi + design system + checkpoint visual |
| FE-2 | 4–5 hari | Intake, papan, detail, resi, label |
| FE-3 | 3–4 hari | Pickup, review, share, laporan dan setting |
| FE-4 | 2–3 hari | PWA/mock resilience + preview review lengkap |
| Review UI/UX | Bergantung waktu Anda dan revisi | Gate eksplisit; backend tetap menunggu |
| BE-1–BE-4 | 10–14 hari | Backend terintegrasi + backup/retensi |
| E2E + hardening | 6–8 hari | Bukti test, perangkat, performa dan release candidate |
| Pilot | 2–3 minggu kalender | 3–5 outlet; iterasi dari penggunaan nyata |

Total sebelum pilot: **28–39 hari kerja aktif** (sekitar 6–8 minggu kerja), di luar waktu tunggu persetujuan, revisi besar, provisioning dan ketersediaan perangkat. Angka ini kisaran perencanaan, bukan janji tanggal. Target empat minggu PRD menggabungkan FE/BE dan wedge lebih sempit; jangan menyamakan dengan 12 modul penuh + gate FE-first. Estimasi diperbarui setelah FE-2 dan keputusan scope.

Urutan PR/delivery yang disarankan bila implementasi dimulai: fondasi UI → inti operasional → pickup/growth → UI freeze → backend foundation → domain/integrasi → E2E/release. Setiap PR punya scope, cara test, screenshot jika UI berubah, dan pemeriksaan CI; tidak membuat satu PR raksasa.

Pilot mengukur intake, adopsi ≥5 hari/minggu, retensi minggu ketiga ≥80%, kelengkapan bukti, share intent dan permintaan review. Request review bukan jumlah review Google; aksi share bukan jaminan posting. Sebelum pendaftaran publik: QRIS langganan manual, free-tier enforcement, landing “anti-ribet & anti-komplain”, tutorial dan dukungan, serta gate pilot disetujui.

## 12. Referensi

- PRD Rawatin v2 dan empat gambar lampiran pengguna: sumber scope dan arah visual; lihat pemetaan pada [style guide](./ui-style-guide.md).
- [Saasable UI](https://github.com/phoenixcoded/saasable-ui) dan [package admin Vite](https://github.com/phoenixcoded/saasable-ui/blob/main/admin/vite/package.json): varian Vite tersedia, menggunakan MUI; bukan admin Tailwind siap pakai. Versi aktual dipilih dan dipin saat implementasi.
- [MDN: capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture): dukungan bervariasi, input capture tidak menjadi jaminan anti-file-lama.
- [MDN: Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API): HTTPS, dukungan perangkat, user activation dan target share pilihan pengguna; tidak menjamin posting ke IG Story tertentu.
- [MDN: Background Synchronization](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API): limited availability, sehingga foreground retry wajib.
- [Cloudflare R2 S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/): tidak semua kemampuan S3 tersedia; `GetBucketVersioning`/`PutBucketVersioning` tidak diimplementasikan pada dokumentasi yang diperiksa.
- [Google Maps content policy](https://support.google.com/contributionpolicy/answer/7400114): larangan insentif dan selektif meminta review positif.

Rujukan teknis diperiksa saat perencanaan; kompatibilitas/version/plan layanan tetap divalidasi lagi saat setup. Belum ada hasil benchmark, test aplikasi, atau persetujuan pengguna yang diklaim dalam dokumen ini.
