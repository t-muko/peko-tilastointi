# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PEKO Tilastointi — a React + TypeScript training-diary app for dog handlers (search/rescue dog training log). Each user's entries (`reeni`) are private; users share aggregated yearly stats. State is managed with MobX, persistence via Firebase (Auth + Firestore), with Firestore access wrapped by the `firestorter` library.

Node.js 22+, pnpm, Vite.

## Commands

```bash
pnpm install              # install deps
pnpm dev                  # Vite dev server
pnpm dev:test             # dev server with VITE_USE_EMULATOR=true
pnpm build                # production build -> build/
pnpm preview              # preview a production build

pnpm test                 # vitest run (all unit/component tests, once)
pnpm test:watch           # vitest watch mode
pnpm test:ui              # vitest browser UI
npx vitest run path/to/file.test.ts   # single test file

pnpm test:e2e              # Playwright, headless (requires Firebase emulator running)
pnpm test:e2e:ui           # Playwright UI mode

firebase emulators:start --only firestore,auth   # required in a separate terminal before test:e2e
firebase deploy --only hosting
firebase deploy --only firestore:rules           # also: pnpm run deploy:rules
```

Env vars are Vite-style, documented in `.env.example`; copy to `.env.local`. `VITE_FIREBASE_API_KEY` is required, `VITE_USE_EMULATOR=true` switches Auth/Firestore to local emulators (used by `dev:test` and e2e tests).

## Architecture

Layered "clean enough" model — not full clean architecture, but a clear one-way dependency rule for a small app:

**UI (`src/components`) → Store (`src/stores`, MobX) → Repository/Service (Firebase adapters)**

- UI may depend on stores. Stores may depend on repository interfaces. Repositories may depend on the Firebase SDK. UI must never call Firebase/Firestorter directly.
- `src/index.tsx` builds `rootStore` and provides it through `FirebaseContext.Provider`. `src/stores/index.ts` composes `RootStore`: `sessionStore`, `messageStore`, `reeniFirestore` (constructed *before* `firebase`, since the auth callback needs it ready), `firebase`.
- Firebase app init is centralized in `src/components/Firebase/firebaseApp.ts` via `getOrCreateFirebaseApp()` — never call `initializeApp()` elsewhere.
- Auth (`src/components/Firebase/firebaseService.ts`): Google sign-in via `signInWithPopup`, `onAuthStateChanged` drives `sessionStore.setAuthUser(...)`. `sessionStore.userOk` depends only on `authUser` state. `user.getIdToken()` is wrapped in try/catch — the Firestore path swap (`reeniFirestore.changePath(...)`) happens even if it fails, falling back to the user's UID.
- Firestore path is always one of `reenit/{uid}/reenit` (signed in) or `reenit/anonyymi/reenit` (signed out); switched centrally in the auth callback.
- Firestore reads/writes for training entries go through `ReeniRepository` (interface, `src/stores/repositories/reeniRepository.ts`) with `FirestorterReeniRepository` as the production adapter; `ReeniFireStorter` (`src/stores/reeniStore.ts`) is the store that delegates to it and holds no Firebase SDK calls itself.
- UI never writes to the Firestorter collection directly — it calls store commands (`addReeni`, `addDefaultReeni`, `updateAkm`, `changePath`).
- `use-stores.ts` reads the store via `FirebaseContext` and throws if the provider is missing — don't reintroduce the old `React.useContext(rootStore as any)` pattern.

### Domain model

- A `ReeniData` entry (`src/stores/repositories/reeniRepository.ts`): `pvm` (date), `tunnit` (hours), `kommentti` (comment, may contain `#hashtags` parsed by `src/utils/hashtag.ts`), `kategoria` (one of `REENI_CATEGORIES` in `src/constants/reeniCategories.ts`), `koira` (dog), optional `akm` (ajokilometrit / driven km).
- `akm` follows a "0 = missing" convention: a value of `0` is never persisted — the field is omitted from the document entirely rather than stored as `0`. Yearly stats (`akm` total, `keskiakm` average) are computed client-side from that year's entries (`src/utils/akmStats.ts`) and written to the existing per-user stats doc at `tilastot/{uid}` — no new collection/path.
- Hashtag and akm statistics are both computed at render time in `Tilasto.tsx` from the client's already-loaded `reenit` documents — neither is a separate Firestore-backed aggregate.

### Path aliases (tsconfig + vitest, keep in sync)

`@/*` → `src/*`, `@components/*` → `src/components/*`, `@stores`/`@stores/*` → `src/stores`, `@hooks/*` → `src/hooks/*`, `@root/*` → repo root.

## Testing

Two layers — see `docs/UI-testaus.md`, `docs/UI-komponenttitestaus.md`, `docs/E2E-testaus.md`, and `docs/Firebase-mock.md` for details before writing new tests:

- **Vitest** (`vitest.config.ts`, jsdom env): store logic is tested against mock `ReeniRepository` implementations, never a real Firebase instance.
- **Playwright** (`playwright.config.ts`, `tests/e2e/`): requires the Firestore/Auth emulators running locally and `pnpm run dev:test` (started automatically as the Playwright `webServer`). Uses role-based locators and auto-retrying assertions per `.github/instructions/playwright-typescript.instructions.md`.

## Feature workflow

New features are planned before being coded. The convention (see README "Tekoälyagenttipohjainen kehittäminen" and `.github/agents/*.md`) is: write a short goal doc under `docs/`, then move through planning → TDD red phase → TDD green phase → review → doc update, one feature at a time. `docs/*.md` files often mix a "current state" section (implemented) with a preserved "historical" section describing the pre-fix analysis — check for a status/date marker at the top of a doc before treating its content as still-open work.

Full architectural conventions and Firebase-specific rules are in `.github/copilot-instructions.md` — read it when working on stores, repositories, or Firebase code.
