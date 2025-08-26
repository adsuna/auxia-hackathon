# Repository Guidelines

## Project Structure & Module Organization
- Backend (`backend/`): TypeScript Express API.
  - Source: `backend/src/` with `controllers/`, `routes/`, `services/`, `middleware/`, `utils/`, `lib/`.
  - Data: `prisma/` (schema, seed), `sql/` (raw SQL), `.env` for config.
  - Build output: `dist/`.
- Frontend (`frontend/`): Next.js (TypeScript) app.
  - Source: `frontend/src/` with `app/`, `components/`, `contexts/`, `hooks/`, `lib/`.
  - Public assets: `frontend/public/`.

## Build, Test, and Development Commands
- Install deps (run once per package):
  - `cd backend && npm install`
  - `cd frontend && npm install`
- Backend:
  - `npm run dev` — start API with hot-reload.
  - `npm run build && npm start` — compile to `dist/` and run.
  - `npm run db:push|db:migrate|db:seed|db:reset|db:studio` — Prisma workflows.
- Frontend:
  - `npm run dev` — start Next.js locally.
  - `npm run build && npm start` — production build/serve.
  - `npm run lint` — ESLint check.

## Coding Style & Naming Conventions
- TypeScript everywhere; prefer 2-space indent and semicolons.
- Backend: kebab-case for files (`routes/auth.ts`), camelCase for variables/functions, PascalCase for classes/types.
- Frontend: PascalCase for React components in `components/`, file co-location under feature folders in `src/app/*`.
- Linting: Frontend uses ESLint (`frontend/eslint.config.mjs`). Backend has no linter configured; match existing style.

## Testing Guidelines
- No formal test runner is configured. Ad-hoc scripts exist in `backend/` (e.g., `node test-job-system.js`).
- Prefer adding small, reproducible scripts alongside the feature under test, or introduce a lightweight runner (e.g., Vitest/Jest) in follow-ups.
- Keep tests deterministic; mock external services; document setup in file header.

## Commit & Pull Request Guidelines
- Use Conventional Commits style: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- PRs must include: concise description, linked issue (if any), setup/run notes, and screenshots or API diffs when applicable.
- Keep changes scoped; separate frontend vs backend changes into clear commits.

## Security & Configuration
- Do not commit secrets. Copy examples: `backend/.env.example -> backend/.env` and `frontend/.env.local.example -> frontend/.env.local`.
- Run `npm run db:setup` (backend) and `npm run db:seed` as needed to populate local data.
