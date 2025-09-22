## Chatify Forge Architecture

### Overview
Chatify Forge is a SPA built with React + Vite that communicates with a Supabase backend (Postgres, Auth, Edge Functions). It orchestrates OpenAI for chat completions and proxies file uploads via secure serverless functions.

### Frontend (`/src`)
- **Frameworks**: React + TypeScript, React Router, TanStack Query, Tailwind CSS, shadcn/ui.
- **Structure**
  - Pages (`src/pages`): `Auth`, `Dashboard`, `Chat`, `ProjectSettings`, `Works`, `NotFound`.
  - UI components (`src/components/ui`): shadcn/ui-based reusable building blocks.
  - Supabase integration (`src/integrations/supabase`): typed client and DB types.
  - Bootstrapping: `src/main.tsx`; global styles: `src/index.css`, `src/App.css`.
- **State & Data**
  - Server state via TanStack Query (fetching, caching, invalidation).
  - Local UI state via React hooks.
  - Data access with `supabase-js` for CRUD on projects, sessions, and messages.
- **Routing**
  - SPA routes for auth, dashboard, project settings, and chat sessions.

### Backend (Supabase, `/supabase`)
- **Auth**: Supabase Auth (OTP email verification, session management).
- **Database (Postgres)**: Tables for users, projects, sessions, messages with RLS enforcing per-user isolation; schema in `supabase/migrations/20250921114831_052c63ae-51f3-4090-826b-d000c1e01e61.sql`.
- **Edge Functions (Deno)**
  - `chat-completion` (`supabase/functions/chat-completion/index.ts`): Loads system prompt and chat history, calls OpenAI (`gpt-4o-mini`), persists user and assistant messages, returns reply.
  - `upload-file` (`supabase/functions/upload-file/index.ts`): Proxies file uploads to the OpenAI Files API to avoid exposing API keys client-side.
- **Configuration**: `supabase/config.toml`; secrets in Supabase project settings:
  - `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### AI Integration
- OpenAI used for message completion. Prompts combine per-project system instructions with session history.
- Optional knowledge enrichment via file uploads through the `upload-file` function.

### Security
- RLS on all tables; queries scoped by authenticated user.
- Edge Functions use server-only secrets; browser uses only the `anon` key.
- No direct OpenAI calls from the browser; uploads and completions run server-side.

### Data Flow
1. User authenticates via Supabase Auth from `src/pages/Auth.tsx`.
2. Dashboard loads user projects (TanStack Query + Supabase).
3. In Chat, a user message is sent to the `chat-completion` Edge Function with project/session IDs.
4. The function fetches history and system prompt, calls OpenAI, stores both user and assistant messages, and returns the reply.
5. UI renders the assistant response and updates cached data.
6. Optional: knowledge files uploaded via `upload-file` to enhance responses.

### Deployment
- **Frontend**: Any static host for Vite builds.
- **Backend**: Supabase project with migrations applied, RLS enabled, Edge Functions deployed with required secrets.
- **Env/Secrets**: Set in Supabase → Project Settings → Edge Functions.


