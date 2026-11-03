# KiLi AGENT

> Web app chat AI bergaya Claude: bertema **Material UI**, punya mode **AI Agent**, dan terhubung ke **API / model / endpoint milikmu sendiri**. Siap di-deploy ke **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FUSERNAME%2FREPO&env=AI_BASE_URL,AI_API_KEY,AI_DEFAULT_MODEL,ACCESS_PASSWORD,SESSION_SECRET&envDescription=Endpoint%20AI%2C%20API%20key%2C%20model%20default%2C%20dan%20password%20akses)

> Ganti `USERNAME/REPO` pada tombol di atas dengan repo GitHub-mu.

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local dengan kredensial endpoint AI Anda

# Run development server
pnpm dev
# Buka http://localhost:3000
# Login dengan password dari .env.local
```

## Status Implementasi

✅ **Phase 1-2 Complete**: Foundation & Core Chat
- Login dengan password protection
- Streaming chat dengan token-by-token
- Markdown, LaTeX, code highlighting
- Conversation history di IndexedDB
- Auto title generation
- Model picker
- Material Design 3 theme (light/dark/system)

🚧 **Next Phases**: 
- Phase 3: Enhanced persistence features
- Phase 4: Rich messages (regenerate, edit, attachments)
- Phase 5: Artifacts & thinking blocks
- Phase 6: Agent mode dengan tools
- Phase 7: Projects
- Phase 8-9: Polish & deployment

Lihat [README.md](./README.md) untuk spesifikasi lengkap.

## Development

```bash
pnpm dev        # Development server
pnpm build      # Production build
pnpm start      # Production server
pnpm lint       # Lint check
pnpm typecheck  # TypeScript check
pnpm test       # Unit tests
pnpm test:e2e   # E2E tests
```

## Struktur Proyek

```
.
├── app/
│   ├── (app)/              # Protected area
│   │   ├── layout.tsx      # Main app layout
│   │   ├── page.tsx        # Home (new chat)
│   │   ├── c/[id]/         # Conversation page
│   │   └── settings/       # Settings page
│   ├── login/              # Login page
│   └── api/                # API routes
├── components/
│   ├── chat/               # Chat components
│   ├── layout/             # Layout components
│   └── theme/              # Theme setup
├── lib/
│   ├── ai/                 # AI provider & models
│   ├── agent/              # Agent tools (TODO)
│   ├── auth/               # Session management
│   └── db/                 # IndexedDB (Dexie)
└── messages/               # i18n (id, en)
```

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Yang wajib:

- `AI_BASE_URL` - Endpoint OpenAI-compatible
- `AI_API_KEY` - API key endpoint
- `AI_DEFAULT_MODEL` - Model default
- `ACCESS_PASSWORD` - Password aplikasi
- `SESSION_SECRET` - Secret untuk JWT (min 32 karakter)

## License

MIT
