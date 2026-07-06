# Triwid mui | Horror Archive

A premium, cinematic horror-themed website that showcases Triwid mui's horror short stories (Read) and YouTube horror videos (Watch), pulling live content from external feeds — no database.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, mounted at `/api`)
- `pnpm --filter @workspace/triwid-mui run dev` — run the frontend (Vite, port 21254, mounted at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No database required — all content is fetched live from external sources with in-memory caching

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (no DB — in-memory cached fetches from YouTube RSS, Blogger JSON feed, Pixiv ajax API)
- Frontend: React + Vite, wouter (routing), framer-motion (animation), Tailwind
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec) — `useListVideos`, `useListStories` hooks

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for `/videos` and `/stories` endpoints
- `artifacts/api-server/src/lib/youtube.ts` — resolves @triwidmui channel ID, parses YouTube RSS feed (5-min cache)
- `artifacts/api-server/src/lib/stories.ts` — Blogger JSON feed (id/en) + Pixiv ajax API best-effort (ja), 10-min cache
- `artifacts/api-server/src/routes/videos.ts`, `stories.ts` — API routes
- `artifacts/triwid-mui/src/pages/` — Intro, Home, Watch, Read pages
- `artifacts/triwid-mui/src/lib/store.tsx` — app state (intro seen, language, audio) via sessionStorage
- `artifacts/triwid-mui/src/components/effects/` — Atmosphere (fog/noise), GlitchText

## Architecture decisions

- No database: all content (videos, stories) is fetched live from third-party feeds (YouTube RSS, Blogger, Pixiv) with in-memory TTL caching in the API server, since content is externally managed and doesn't need persistence.
- No YouTube Data API key: relies on the public YouTube RSS feed for @triwidmui (capped at ~15 most recent videos) to avoid requiring API credentials — acceptable per product spec's fallback allowance.
- Pixiv novel fetching is best-effort; when it fails (e.g. blocked/changed API), the `/stories?lang=ja` endpoint returns `{ stories: [], available: false }` rather than erroring, so the Read page can show a graceful "not available" state.
- Intro-seen state uses `sessionStorage` (not persisted across browser sessions) so returning visitors within the same session skip the intro, but a fresh session always sees the cinematic intro.

## Product

- Cinematic intro animation (glitch text reveal) shown once per session, then redirects to Home.
- Home: menu with Read / Watch options.
- Watch: paginated grid of @triwidmui YouTube videos (thumbnail, title, date) that open real YouTube links in a new tab — no embeds.
- Read: language selector (Indonesia / English / 日本語) showing horror stories pulled live from Blogger (id/en) or Pixiv (ja, best-effort).
- Floating nav (Home/Read/Watch/Language/Music) and ambient horror atmosphere effects (fog, flicker, glitch), muted by default.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API server's `dev` script does a one-shot `build && start`, not a watcher — after editing any `artifacts/api-server/src/**` file, you must restart the "API Server" workflow for changes to take effect (stale `dist/` otherwise serves old routes).
- Always import generated API types/hooks from the `@workspace/api-client-react` barrel, never from deep `/src/generated/...` paths.
- `useListStories`/other Orval hooks with `query.enabled` need an explicit `queryKey` (via `getListStoriesQueryKey(...)`) passed alongside `enabled`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
