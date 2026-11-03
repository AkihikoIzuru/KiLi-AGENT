# Orbit AI

> Web app chat AI bergaya Claude: bertema **Material UI**, punya mode **AI Agent**, dan terhubung ke **API / model / endpoint milikmu sendiri**. Siap di-deploy ke **Vercel**.

*"Orbit AI" hanya nama sementara — ganti sesukamu.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FUSERNAME%2FREPO&env=AI_BASE_URL,AI_API_KEY,AI_DEFAULT_MODEL,ACCESS_PASSWORD,SESSION_SECRET&envDescription=Endpoint%20AI%2C%20API%20key%2C%20model%20default%2C%20dan%20password%20akses)

> Ganti `USERNAME/REPO` pada tombol di atas dengan repo GitHub-mu.

## Daftar Isi

- [Cara Memakai Dokumen Ini](#cara-memakai-dokumen-ini)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Koneksi ke Backend](#koneksi-ke-backend)
- [Mode AI Agent](#mode-ai-agent)
- [Artifacts](#artifacts)
- [Tema dan UI](#tema-dan-ui)
- [Penyimpanan Data](#penyimpanan-data)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Troubleshooting](#troubleshooting)
- [Keamanan](#keamanan)
- [Urutan Pembangunan](#urutan-pembangunan)
- [Definition of Done](#definition-of-done)
- [Roadmap](#roadmap)
- [Referensi](#referensi)

---

## Cara Memakai Dokumen Ini

Dokumen ini punya dua fungsi:

1. **README repo**: penjelasan proyek, cara menjalankan, dan cara deploy ke Vercel.
2. **Spesifikasi untuk AI builder** (v0, Claude Code, Cursor, dll.): berikan dokumen ini sebagai prompt/konteks supaya AI membangun seluruh aplikasinya.

**Instruksi untuk AI builder:** bangun aplikasi lengkap sesuai bagian [Fitur](#fitur), [Koneksi ke Backend](#koneksi-ke-backend), [Mode AI Agent](#mode-ai-agent), [Artifacts](#artifacts), dan [Tema dan UI](#tema-dan-ui). Kerjakan berurutan menurut [Urutan Pembangunan](#urutan-pembangunan) dan anggap proyek selesai hanya jika semua poin [Definition of Done](#definition-of-done) terpenuhi.

Gunakan **versi stabil terbaru** dari setiap paket dan ikuti dokumentasi resmi versi yang terpasang. Nama API (terutama AI SDK, Next.js, dan MUI) bisa berbeda antar versi, jadi jangan menebak dari ingatan.

---

## Fitur

### Chat inti

- Streaming token-per-token dengan tombol **Stop**
- Render Markdown (GFM: tabel, task list), code block dengan syntax highlighting + tombol **Salin**, dan LaTeX (KaTeX)
- **Regenerate**, edit pesan lalu kirim ulang, salin pesan, beri 👍/👎 (disimpan lokal)
- Composer: textarea auto-grow, `Enter` kirim, `Shift+Enter` baris baru, drag & drop / paste file
- Auto-scroll cerdas (berhenti saat pengguna scroll ke atas) + tombol "Ke bawah"
- Judul percakapan dibuat otomatis oleh model setelah pesan pertama

### Fitur ala Claude

- **Sidebar riwayat**: cari, ganti nama, pin, hapus; dikelompokkan *Hari ini / Kemarin / 7 hari terakhir / Lebih lama*
- **Projects**: kumpulan percakapan dengan instruksi khusus dan file konteks sendiri
- **Artifacts**: panel samping untuk pratinjau HTML, SVG, Markdown, Mermaid, dan kode (lihat [Artifacts](#artifacts))
- **Extended thinking**: blok "Berpikir…" yang bisa dilipat bila model mengirim reasoning
- **Lampiran**: gambar (vision) dan dokumen teks/PDF
- **Instruksi kustom** global dan per-project
- **Pilih model** per percakapan + parameter lanjutan (temperature, max tokens)
- **Pencarian web** (opsional, lewat tool)
- Palet perintah dan shortcut: `Ctrl/Cmd+K` cari/perintah, `Ctrl/Cmd+Shift+O` chat baru, `Esc` hentikan respons
- Ekspor / impor seluruh data (JSON) dan ekspor percakapan ke Markdown

### Mode AI Agent

Agent yang bisa merencanakan, memakai tool, dan meminta persetujuan sebelum aksi berisiko. Detail ada di [Mode AI Agent](#mode-ai-agent).

### Akses dan privasi

- Seluruh app dikunci dengan password (`ACCESS_PASSWORD`) supaya kuota endpoint-mu tidak dipakai orang lain
- Riwayat chat disimpan di perangkat (IndexedDB), bukan di server

---

## Tech Stack

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Material UI (`@mui/material`, `@mui/icons-material`) + Emotion; integrasi App Router lewat `@mui/material-nextjs` |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/react`) + `@ai-sdk/openai-compatible` |
| Validasi | Zod |
| Markdown | `react-markdown`, `remark-gfm`, `remark-math` + `rehype-katex`, `rehype-sanitize`, highlighter (`shiki` atau `rehype-highlight`) |
| Penyimpanan klien | IndexedDB lewat Dexie |
| State UI | Zustand |
| Sesi | Cookie httpOnly bertanda tangan (`jose`) |
| Hosting | Vercel (Route Handlers / Functions) |
| Test | Vitest (unit) + Playwright (e2e dasar) |
| Package manager | pnpm |

---

## Arsitektur

```
Browser (UI MUI + IndexedDB)
   │  fetch /api/*  (cookie sesi)
   ▼
Vercel Route Handlers
   ├─ /api/auth      login password → set cookie sesi
   ├─ /api/models    daftar model (proxy GET {AI_BASE_URL}/models, cache singkat)
   ├─ /api/chat      streaming chat + agent loop + tools
   └─ /api/title     judul percakapan otomatis
   │  AI SDK (@ai-sdk/openai-compatible)
   ▼
Endpoint-mu (OpenAI-compatible, URL publik HTTPS)
   └─ ke model / provider di belakangnya
```

Browser **tidak pernah** memanggil endpoint secara langsung: API key tetap di server dan tidak perlu mengatur CORS.

### Struktur folder

```
.
├─ app/
│  ├─ (app)/                   # area ter-proteksi
│  │  ├─ layout.tsx            # shell: sidebar + appbar + panel artifact
│  │  ├─ page.tsx              # chat baru
│  │  └─ c/[id]/page.tsx       # percakapan
│  ├─ login/page.tsx
│  └─ api/
│     ├─ auth/route.ts
│     ├─ models/route.ts
│     ├─ chat/route.ts
│     └─ title/route.ts
├─ components/
│  ├─ chat/                    # MessageList, Message, Composer, ThinkingBlock, AgentSteps, ToolApprovalCard
│  ├─ artifacts/               # ArtifactPanel, SandboxFrame
│  ├─ layout/                  # Sidebar, TopBar, ModelPicker, SettingsDialog
│  └─ theme/                   # ThemeProvider, theme.ts, ColorModeToggle
├─ lib/
│  ├─ ai/                      # provider.ts, models.ts, system-prompt.ts
│  ├─ agent/                   # registry.ts, guards.ts, tools/*.ts
│  ├─ db/                      # dexie.ts + repository per entitas
│  ├─ auth/                    # session.ts
│  └─ env.ts                   # validasi env dengan Zod
├─ middleware / proxy          # proteksi route (nama file sesuai versi Next.js)
├─ messages/                   # id.json, en.json
├─ vercel.json
├─ .env.example
└─ README.md
```

`lib/ai/system-prompt.ts` menyusun system prompt: bahasa mengikuti pengguna, format Markdown, aturan artifact, aturan agent, ditambah instruksi kustom pengguna/project.

---

## Koneksi ke Backend

Bagian ini menghubungkan app ke **API, model, dan endpoint** milikmu.

### Variabel lingkungan

| Variabel | Wajib | Contoh | Keterangan |
|---|---|---|---|
| `AI_BASE_URL` | ya | `https://ai.domainmu.com/v1` | Base URL endpoint OpenAI-compatible (sudah termasuk `/v1`) |
| `AI_API_KEY` | ya | `sk-...` | Hanya dibaca server. **Jangan** pakai awalan `NEXT_PUBLIC_` |
| `AI_DEFAULT_MODEL` | ya | `nama-model` | Model default; boleh nama model asli atau alias/combo dari router-mu |
| `AI_MODELS` | tidak | JSON satu baris | Daftar model manual + kemampuannya; dipakai jika `/models` tidak tersedia atau ingin override |
| `AI_EXTRA_HEADERS` | tidak | `{"X-Foo":"bar"}` | Header tambahan ke endpoint (di-parse jadi objek di `lib/env.ts`) |
| `ACCESS_PASSWORD` | ya (produksi) | | Password login app |
| `SESSION_SECRET` | ya (produksi) | | Rahasia penanda tangan cookie: `openssl rand -base64 32` |
| `AGENT_MAX_STEPS` | tidak | `10` | Batas langkah mode Agent |
| `SEARCH_PROVIDER` | tidak | `tavily` | `tavily` / `brave` / `none`; mengaktifkan tool `web_search` |
| `SEARCH_API_KEY` | tidak | | API key provider pencarian |

Validasi semua variabel di `lib/env.ts` dengan Zod dan gagalkan build/start dengan pesan jelas bila ada yang wajib tapi kosong.

### `.env.example`

```bash
# Endpoint OpenAI-compatible.
# Contoh lokal: router di Docker port 20128.
# Di Vercel WAJIB URL publik HTTPS (lihat peringatan di bawah).
AI_BASE_URL=http://localhost:20128/v1
AI_API_KEY=isi-api-key-endpoint-mu
AI_DEFAULT_MODEL=nama-model-atau-alias

# Opsional: daftar model manual (satu baris JSON)
# AI_MODELS=[{"id":"nama-model","label":"Nama Tampil","vision":false,"reasoning":false,"tools":true}]
# AI_EXTRA_HEADERS={"X-Foo":"bar"}

# Akses (wajib di produksi)
ACCESS_PASSWORD=ganti-dengan-password-kuat
SESSION_SECRET=ganti-dengan-string-acak-minimal-32-karakter

# Agent
AGENT_MAX_STEPS=10
# SEARCH_PROVIDER=tavily
# SEARCH_API_KEY=
```

### Kontrak endpoint

App mengharapkan endpoint yang kompatibel dengan API OpenAI, misalnya 9router, LiteLLM, Ollama, vLLM, atau OpenRouter:

- `POST {AI_BASE_URL}/chat/completions`: mendukung `stream: true` (SSE) dan, untuk mode Agent, tool calling
- `GET {AI_BASE_URL}/models`: opsional
- Autentikasi: `Authorization: Bearer ${AI_API_KEY}`

### Membuat provider

```ts
// lib/ai/provider.ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { env } from '@/lib/env';

export const myProvider = createOpenAICompatible({
  name: 'my-endpoint',
  baseURL: env.AI_BASE_URL,
  apiKey: env.AI_API_KEY,
  headers: env.AI_EXTRA_HEADERS, // opsional
});

// Pemakaian: myProvider(modelId)  atau  myProvider.chatModel(modelId)
```

### Daftar model

- `/api/models` memanggil `GET /models` dan menyimpan hasilnya beberapa menit.
- Jika gagal atau kosong, pakai `AI_MODELS`; jika itu juga tidak ada, tampilkan hanya `AI_DEFAULT_MODEL`.
- Setiap model punya flag kemampuan `vision`, `reasoning`, `tools`. UI menyesuaikan: lampiran gambar nonaktif bila `vision: false`, toggle Agent nonaktif bila `tools: false`.

### ⚠️ Vercel tidak bisa menjangkau jaringan privat

Fungsi Vercel berjalan di cloud, jadi **tidak bisa** mengakses `localhost`, IP LAN (`192.168.x.x`), atau alamat yang hanya ada di tailnet Tailscale. Kalau backend-mu berjalan di rumah / Docker / komputer lokal, ekspos dulu sebagai URL publik HTTPS:

| Opsi | Catatan |
|---|---|
| Cloudflare Tunnel | Tunnel permanen + domain sendiri (disarankan). Uji cepat: `cloudflared tunnel --url http://localhost:PORT` (URL sementara, berubah setiap dijalankan) |
| Tailscale Funnel | Membuka layanan di tailnet ke internet lewat HTTPS publik; aktifkan Funnel untuk port layananmu |
| VPS / reverse proxy | Nginx/Caddy + domain + TLS di server publik; matikan buffering agar streaming SSE tidak tertahan |

Setelah endpoint publik:

1. **Wajibkan API key** di endpoint. Jangan membukanya tanpa autentikasi.
2. Uji dari luar jaringan rumah:

```bash
curl https://ai.domainmu.com/v1/models -H "Authorization: Bearer $AI_API_KEY"
```

### Penanganan error

| Respons endpoint | Perilaku app |
|---|---|
| 401 / 403 | "API key salah atau ditolak" + petunjuk cek `AI_API_KEY` |
| 404 | "Model tidak ditemukan" + buka model picker |
| 429 | Retry dengan exponential backoff (maks 3×), tampilkan hitung mundur |
| 5xx / timeout | Pesan ramah + tombol **Coba lagi** |
| Stream terputus | Simpan teks parsial + opsi **Lanjutkan** |

Atur `export const maxDuration` pada `/api/chat` sesuai batas plan Vercel-mu (cek dokumentasi Vercel Functions).

---

## Mode AI Agent

Toggle **Agent** di composer mengubah chat biasa menjadi agent yang merencanakan dan memakai tool secara mandiri sampai tujuan tercapai.

### Alur

1. Pengguna menulis tujuan (mis. "Bandingkan 3 laptop gaming di bawah 15 juta dan buat tabelnya").
2. Agent menyusun **rencana** singkat; tampil sebagai checklist yang ter-update real-time.
3. Agent mengulang **pikir → panggil tool → baca hasil** sampai selesai atau mencapai batas langkah.
4. Jawaban akhir ditulis di chat; semua langkah tetap bisa dibuka lagi (dilipat secara default).

### Tool bawaan

| Tool | Fungsi | Risiko |
|---|---|---|
| `web_search` | Cari web lewat provider yang dikonfigurasi | `safe` |
| `fetch_url` | Ambil dan ringkas isi halaman (teks) | `safe` (dengan guard SSRF) |
| `calculator` | Hitung ekspresi matematika secara deterministik | `safe` |
| `get_datetime` | Tanggal dan waktu sekarang (zona waktu pengguna) | `safe` |
| `read_attachment` | Baca isi lampiran yang diunggah | `safe` |
| `update_plan` | Perbarui checklist rencana di UI | `safe` |
| `create_artifact` | Buat/ubah artifact di panel samping | `safe` |

Tool baru ditambahkan lewat registry di `lib/agent/tools/` tanpa menyentuh UI.

### Kontrak tool

```ts
// lib/agent/registry.ts
import type { ZodTypeAny } from 'zod';

export type AgentTool = {
  name: string;
  description: string;       // dibaca model, tulis jelas dan singkat
  input: ZodTypeAny;         // skema input
  risk: 'safe' | 'confirm';  // 'confirm' → butuh persetujuan pengguna di UI
  timeoutMs?: number;        // default 15000
  run: (input: unknown, ctx: { signal: AbortSignal }) => Promise<unknown>;
};
```

Sediakan adapter yang mengubah registry ini ke format tool milik AI SDK versi terpasang, supaya kode tool tidak terikat pada satu versi SDK.

### Loop agent

- Gunakan abstraksi agent/tool-loop bawaan AI SDK: `ToolLoopAgent` (v6 ke atas; di v5 bernama `Experimental_Agent`) dengan stop condition batas langkah dari `AGENT_MAX_STEPS` (default SDK 20, di sini 10). **Nama helper stop condition berbeda antar versi** (`stepCountIs` di v5/v6, `isStepCount` di dokumentasi terbaru), jadi ikuti dokumentasi versi yang terpasang.
- Satu panggilan model dalam satu waktu (serial) agar ramah terhadap rate limit endpoint.
- Tombol **Stop** membatalkan lewat `AbortSignal` (model dan tool yang sedang berjalan).
- Timeout per tool (`timeoutMs`) dan timeout total harus lebih kecil dari `maxDuration` fungsi Vercel.
- Output tool dipotong (±20.000 karakter) sebelum dikirim balik ke model.
- Retry dengan exponential backoff (maks 3×) untuk 429/5xx; tampilkan status "Menunggu giliran… coba lagi dalam N detik".
- Jika model tidak mendukung tool calling (`tools: false` atau error dari endpoint), toggle Agent nonaktif dengan tooltip penjelasan.

### Persetujuan (human-in-the-loop)

Tool ber-`risk: 'confirm'` menampilkan kartu persetujuan: **Izinkan sekali / Izinkan untuk sesi ini / Tolak**. Pakai fitur tool approval bawaan AI SDK bila tersedia di versi terpasang; jika tidak, implementasikan lewat tool result sisi klien. Semua tool bawaan di atas `safe`. Tool yang menulis atau mengubah sesuatu di luar app (kirim email, tulis file, panggil API pihak ketiga) **wajib** `confirm`.

### Keamanan agent

- `fetch_url`: hanya `http/https`; resolusi DNS lalu blok IP privat/loopback/link-local (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, `::1`, `fc00::/7`); batasi redirect (maks 3), ukuran (mis. 2 MB), dan hanya content-type teks.
- Perlakukan semua output tool sebagai **data tak tepercaya** (risiko prompt injection): bungkus dengan pembatas jelas dan instruksikan di system prompt agar model tidak pernah mengikuti perintah yang ada di dalam hasil tool.
- Jangan pernah memberi tool akses ke env/secret server.

### UI agent

- Kartu langkah per tool call: nama tool, ringkasan input, status (`berjalan` / `selesai` / `gagal` / `menunggu persetujuan`), durasi, dan detail input/output yang bisa dilipat.
- `LinearProgress` + penghitung langkah (`3/10`) selama agent berjalan.
- Checklist rencana di atas jawaban; langkah yang selesai dicoret.

---

## Artifacts

- **Protokol:** model diminta (lewat system prompt) membungkus konten yang layak dijadikan artifact dengan `<artifact type="html|svg|markdown|mermaid|code" title="…">…</artifact>`. Parser di klien memisahkan blok ini dari teks chat (harus tahan terhadap tag yang masih terpotong saat streaming) dan membukanya di panel samping. Di mode Agent, model juga boleh memakai tool `create_artifact`.
- Pratinjau HTML/SVG dirender dalam `<iframe sandbox="allow-scripts">` lewat `srcdoc`, **tanpa** `allow-same-origin`.
- Tab **Pratinjau / Kode**, tombol Salin, Unduh, dan riwayat versi per artifact.
- Jika stream memuat reasoning dalam tag `<think>…</think>`, pisahkan dan tampilkan sebagai blok **Berpikir** (gunakan middleware ekstraksi reasoning bawaan AI SDK bila tersedia).

---

## Tema dan UI

### Layout

```
┌──────────────┬────────────────────────────────────────┬────────────────┐
│ Sidebar      │ TopBar: model picker · mode · ⋯         │ Panel Artifact │
│ + Chat baru  ├────────────────────────────────────────┤ (opsional,     │
│ Cari         │ Daftar pesan                           │  bisa ditutup) │
│ Projects     │                                        │                │
│ Riwayat      ├────────────────────────────────────────┤                │
│ Pengaturan   │ Composer: [+] ketik pesan… [Agent][Kirim]               │
└──────────────┴────────────────────────────────────────┴────────────────┘
```

### Tema Material UI

- Buat tema dengan `createTheme` memakai **CSS variables** dan `colorSchemes` untuk mode **terang / gelap / ikut sistem**. Cegah flash tema saat load pertama (SSR-safe, mis. `InitColorSchemeScript` dari MUI) dan ikuti panduan integrasi Next.js App Router resmi MUI (mis. `AppRouterCacheProvider`).
- Gaya mengikuti **Material Design 3**: permukaan bertingkat (tonal surface), sudut membulat besar, tombol pill, elevasi minim.
- Warna default (baseline M3). Opsional: generate palet dari *seed color* pilihan pengguna dengan `@material/material-color-utilities`.

| Token | Terang | Gelap |
|---|---|---|
| primary | `#6750A4` | `#D0BCFF` |
| secondary | `#625B71` | `#CCC2DC` |
| tertiary | `#7D5260` | `#EFB8C8` |
| error | `#B3261E` | `#F2B8B5` |
| surface | `#FEF7FF` | `#141218` |
| surface container | `#F3EDF7` | `#211F26` |
| outline | `#79747E` | `#938F99` |

- **Bentuk:** `shape.borderRadius` 12; Card/Paper 16; Composer, Dialog, Menu 28; Button dan Chip pill (`999px`).
- **Tipografi:** Roboto (atau Roboto Flex) lewat `next/font`; teks chat 16px / line-height 1.6; kode memakai font monospace (mis. Roboto Mono / JetBrains Mono).
- **Komponen MUI:** `Drawer` (permanent ≥ `md`, temporary di bawahnya), `AppBar` (flat), `Menu`/`Autocomplete` untuk model picker, `ToggleButton` untuk mode Agent, `Dialog` untuk Pengaturan, `Snackbar` untuk notifikasi, `Skeleton` saat memuat, `LinearProgress` untuk progres agent, `Accordion` untuk blok Berpikir dan langkah agent, `Tooltip`, `Chip` untuk saran prompt.
- **Ikon:** `@mui/icons-material` varian *Rounded*.
- **Motion:** transisi 200–300 ms dengan easing M3 `cubic-bezier(0.2, 0, 0, 1)`; hormati `prefers-reduced-motion`.
- **Responsif:** mobile-first; sidebar jadi drawer sementara di mobile; composer menempel di bawah dan memperhatikan `env(safe-area-inset-bottom)`; panel artifact jadi layar penuh di mobile.
- **Aksesibilitas:** kontras WCAG AA, fokus terlihat, navigasi keyboard penuh, `aria-label` pada tombol ikon, area streaming memakai `aria-live="polite"` (jangan per token).
- **Empty state:** sapaan singkat + beberapa chip saran prompt.
- **Bahasa UI:** Indonesia sebagai default dan siap i18n (teks di `messages/id.json` dan `messages/en.json`).

---

## Penyimpanan Data

- **Default:** IndexedDB (Dexie) dengan tabel `conversations`, `messages`, `projects`, `attachments` (Blob), dan `settings`. Data tetap di perangkat pengguna.
- Data bersifat per-browser: menghapus data situs berarti menghapus riwayat. Sediakan **Ekspor / Impor JSON** dan ingatkan pengguna untuk ekspor berkala.
- Opsi lanjutan (lihat [Roadmap](#roadmap)): Postgres (mis. Neon lewat Vercel Marketplace) + autentikasi untuk sinkron antar perangkat.

---

## Menjalankan Secara Lokal

Prasyarat: Node.js LTS terbaru dan pnpm.

```bash
pnpm install
cp .env.example .env.local   # lalu isi nilainya
pnpm dev                     # http://localhost:3000
```

Skrip yang harus tersedia: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`.

---

## Deploy ke Vercel

### Lewat dashboard

1. Push repo ke GitHub.
2. Di Vercel: **Add New → Project** → impor repo (framework Next.js terdeteksi otomatis).
3. Isi **Environment Variables**: `AI_BASE_URL`, `AI_API_KEY`, `AI_DEFAULT_MODEL`, `ACCESS_PASSWORD`, `SESSION_SECRET` (+ opsional lainnya). Isi untuk environment **Production dan Preview**.
4. Klik **Deploy**.
5. Mengubah env var hanya berlaku untuk deployment baru, jadi **redeploy** setelah mengubahnya.

### Lewat CLI

```bash
npm i -g vercel
vercel login
vercel                              # deploy preview pertama + link project
vercel env add AI_BASE_URL production
vercel env add AI_API_KEY production
vercel env add AI_DEFAULT_MODEL production
vercel env add ACCESS_PASSWORD production
vercel env add SESSION_SECRET production
vercel --prod
```

### Region fungsi

Pilih region fungsi yang dekat dengan endpoint-mu supaya latensi kecil (untuk pengguna di Indonesia umumnya Singapore, `sin1`):

```json
{
  "regions": ["sin1"]
}
```

### Checklist sebelum go-live

- [ ] `AI_BASE_URL` adalah URL **publik** HTTPS (bukan `localhost`, LAN, atau tailnet-only)
- [ ] Endpoint mewajibkan API key
- [ ] `ACCESS_PASSWORD` dan `SESSION_SECRET` sudah kuat dan terisi di Production dan Preview
- [ ] `maxDuration` `/api/chat` sesuai batas plan Vercel

---

## Troubleshooting

| Gejala | Kemungkinan penyebab | Solusi |
|---|---|---|
| `fetch failed` / `ECONNREFUSED` / timeout ke endpoint | Endpoint tidak publik (localhost, LAN, tailnet-only) | Ekspos lewat Cloudflare Tunnel / Tailscale Funnel / reverse proxy |
| 401 dari endpoint | API key salah, atau env belum diisi di environment yang benar | Cek `AI_API_KEY` untuk Production/Preview, lalu redeploy |
| Daftar model kosong | Endpoint tidak punya `/models` | Isi `AI_MODELS` |
| 504 / respons terpotong | `maxDuration` terlalu kecil atau agent terlalu panjang | Naikkan `maxDuration`, turunkan `AGENT_MAX_STEPS`, pakai model lebih cepat |
| Streaming tersendat lalu keluar sekaligus | Reverse proxy mem-buffer SSE | Matikan buffering di proxy (mis. Nginx `proxy_buffering off`) |
| 429 sering muncul di mode Agent | Rate limit endpoint/provider | Turunkan `AGENT_MAX_STEPS`, pastikan panggilan serial, biarkan backoff bekerja |
| Toggle Agent nonaktif | Model ditandai `tools: false` atau tidak mendukung tool calling | Pilih model yang mendukung tool calling atau perbaiki flag di `AI_MODELS` |

---

## Keamanan

- API key **hanya** di environment server; jangan pernah memakai awalan `NEXT_PUBLIC_` dan jangan di-commit (`.env*` masuk `.gitignore`).
- Gate akses (password + cookie httpOnly, `Secure`, `SameSite=Lax`) aktif di semua environment. Semua route selain `/login` dan aset statis diproteksi lewat middleware/proxy Next.js (sesuai versi terpasang).
- Validasi semua input API dengan Zod; batasi ukuran body dan lampiran.
- Rate limit per sesi/IP, misalnya lewat Vercel Firewall atau Redis dari Vercel Marketplace.
- Render Markdown tanpa HTML mentah (atau lewat `rehype-sanitize`); artifact hanya di iframe sandbox tanpa `allow-same-origin`.
- Guard SSRF pada `fetch_url` dan perlakuan "data tak tepercaya" untuk output tool (lihat [Keamanan agent](#keamanan-agent)).
- Jangan log isi prompt atau data pribadi.
- Pasang security headers (termasuk CSP) di `next.config`.

---

## Urutan Pembangunan

Untuk AI builder, kerjakan berurutan dan pastikan `build` lolos di setiap tahap:

1. **Scaffold:** Next.js (TypeScript, App Router) + MUI + tema (terang/gelap/sistem) + layout shell kosong (sidebar, topbar, area pesan, composer).
2. **Backend chat:** `lib/env.ts`, `lib/ai/provider.ts`, `/api/chat` streaming, `/api/models`, halaman chat dasar dengan model picker.
3. **Persistensi:** Dexie + sidebar riwayat (cari, rename, pin, hapus) + judul otomatis (`/api/title`).
4. **Pesan kaya:** Markdown, code block + salin, LaTeX, regenerate, edit pesan, lampiran gambar/dokumen.
5. **Akses:** login password, cookie sesi, proteksi route, rate limit.
6. **Artifacts dan thinking:** parser artifact (tahan streaming), panel samping, iframe sandbox, blok Berpikir.
7. **Mode Agent:** registry tool, adapter ke AI SDK, loop dengan batas langkah, kartu langkah, checklist rencana, kartu persetujuan, guard SSRF, retry/backoff.
8. **Projects dan pengaturan:** instruksi kustom, file konteks, parameter model, ekspor/impor, i18n (id/en).
9. **Polish dan rilis:** aksesibilitas, responsif, state error/empty/loading, test unit + e2e dasar, `vercel.json`, deploy.

---

## Definition of Done

- [ ] `pnpm build`, `pnpm lint`, dan `pnpm typecheck` lolos tanpa error
- [ ] Login password berfungsi; semua route selain `/login` terkunci tanpa sesi
- [ ] Mengirim pesan menghasilkan respons streaming dari endpoint; tombol Stop menghentikan stream
- [ ] Model picker terisi dari `/models` (atau `AI_MODELS`) dan model per percakapan tersimpan
- [ ] Riwayat tersimpan di IndexedDB dan bertahan setelah refresh; ekspor/impor JSON berfungsi
- [ ] Markdown, code block + salin, dan LaTeX tampil benar; HTML mentah dari model **tidak** dieksekusi
- [ ] Artifact HTML/SVG tampil di iframe sandbox dan tidak bisa mengakses cookie/storage app
- [ ] Mode Agent: minimal 3 langkah tool berjalan end-to-end (mis. `web_search` → `fetch_url` → jawaban); batas langkah dan tombol Stop bekerja
- [ ] Tool ber-`risk: 'confirm'` memunculkan kartu persetujuan; **Tolak** menghentikan eksekusi tool itu
- [ ] Error 401/404/429/5xx menampilkan pesan yang tepat; 429 melakukan retry dengan backoff
- [ ] Tema terang/gelap/sistem tanpa flash; tampilan rapi di 360 px, 768 px, dan ≥ 1280 px
- [ ] API key tidak muncul di bundle klien, tab Network browser, maupun log
- [ ] Deploy Vercel berhasil dan chat bekerja dengan endpoint publik

---

## Roadmap

- Sinkron riwayat antar perangkat (Postgres + auth)
- Klien MCP untuk menyambungkan tool eksternal
- Fallback agent berbasis prompt (ReAct) untuk model tanpa tool calling native
- Berbagi percakapan lewat tautan read-only
- Input suara, PWA, dan memori jangka panjang

---

## Referensi

- [AI SDK: OpenAI Compatible Providers](https://ai-sdk.dev/providers/openai-compatible-providers)
- [AI SDK: Agents, Loop Control](https://ai-sdk.dev/docs/agents/loop-control)
- [Material UI](https://mui.com/material-ui/)
- [Vercel Docs](https://vercel.com/docs)

## Lisensi

MIT (ganti sesuai kebutuhan).
