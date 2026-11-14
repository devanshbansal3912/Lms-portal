# AI-Powered Personalized LMS — Hackathon Roadmap (Self-Hosted Dify via Docker)

This is your original roadmap, updated for one key change: **Dify is self-hosted via Docker** instead of using Dify's hosted cloud Studio. Everything about the RAG pipeline, Chatflow design, and quiz-generation workflow stays conceptually the same — what changes is *where Dify lives*, how you reach it, and a few new setup/deploy steps that only apply to self-hosting.

---

## Feasibility Check: Is this doable in 24 hours?

Still yes for the MVP, with one adjustment to your risk profile: self-hosting Dify adds a real setup cost (pulling ~10 containers, first boot, provider config) that hosted Dify wouldn't have. Budget **30–45 extra minutes in Milestone 1** for this. In exchange, you get full control over the instance, no cloud account/plan limits, and the tool/plugin behavior is fully in your hands — worth it as long as you don't skip the "verify it's actually running" step before building on top of it.

## Cutting to the Real MVP

Unchanged from before:

**KEEP (MVP core):**
- Upload PDFs/notes (PDF only first)
- Document processing → embeddings → vector search (now handled inside self-hosted Dify's Knowledge Base, backed by its own internal vector store — you no longer need to hand-roll this in Supabase/pgvector)
- Chat interface grounded in uploaded docs, with source citation
- AI-generated quiz/flashcards from the uploaded material
- Basic auth + per-user workspace

**CUT for now:** YouTube/article ingestion, web-research fallback (optional — see Dify web-search tool notes below if time allows), adaptive teaching style, mock paper generation, analytics dashboards, weak-topic detection, resource recommendations.

## The Approach, in Simple Terms

Three layers, same as before — but Dify now owns the middle layer entirely:

1. **Ingestion layer** — student uploads a PDF via your Next.js app → file is forwarded to your self-hosted Dify instance's Knowledge Base API → Dify chunks it, embeds it, and stores it internally.
2. **Retrieval + reasoning layer** — your Next.js backend calls your self-hosted Dify app's API (Chatflow for chat, Workflow for quiz gen) → Dify runs retrieval + calls Claude → returns the grounded answer.
3. **Application layer** — Next.js (auth, upload UI, chat UI, quiz UI) — this stays exactly the same, it just talks to your own Dify container instead of Dify Cloud.

---

## Stack Decision (updated for Docker Dify)

**Frontend + Backend:** Next.js (App Router) + TypeScript — unchanged.

**Auth + File Storage:** Supabase (Auth + Postgres + Storage) — unchanged. You no longer need pgvector here, since Dify handles vector search internally; keep Postgres for user accounts, workspace metadata, and quiz results.

**AI Orchestration:** Self-hosted Dify (Docker Compose) — this replaces "call Claude directly from Next.js."

**LLM:** Claude API (Anthropic) — configured *inside* Dify's Model Provider settings, not called directly from your Next.js code anymore.

### Where does the Dify container actually run? (the decision that matters most now)

| Option | Setup cost | Reachable by your deployed (Vercel) frontend? | Recommendation |
|---|---|---|---|
| **Docker on a cloud VM** (DigitalOcean/Railway/Fly.io/AWS Lightsail droplet) | Medium — spin up a $6–12/mo box, install Docker, `docker compose up` | Yes, directly via the VM's public IP/domain | **Recommended.** One-time 20-minute setup, then it's just "up" for the rest of the hackathon and demo day. |
| **Docker locally + ngrok tunnel** | Low — fastest to start | Yes, but only while your laptop is on and the tunnel is running, and the URL changes if you restart ngrok on a free plan | Fine as a fallback or for early dev; risky for the live demo since your laptop becomes a single point of failure. |
| **Docker locally only, no tunnel** | Lowest | No — only reachable from `localhost` | Only acceptable if you're demoing everything from one machine, screen-shared, with nothing deployed. Not recommended since it breaks your "real product" positioning. |

**Recommendation:** spin up a small cloud VM (a $6/mo DigitalOcean droplet is plenty for a demo), run Dify there via Docker Compose, and point your Vercel-deployed Next.js app at that VM's URL. This means Dify is up the whole hackathon and on demo day, no laptop dependency, no tunnel flakiness.

**Deployment:** Vercel for Next.js (unchanged) + the VM running your Dify container (new).

This stack is: 1 repo, 1 VM, 2 external services (Supabase + Anthropic-via-Dify), 2 deploy targets (Vercel + the VM). One more moving part than the original plan, but each piece is simple.

---

## Milestone 1: Project Setup & Architecture Foundation (updated)

### What we're building
- Next.js + TypeScript project, pushed to a shared GitHub repo
- Supabase project: Auth + Postgres + Storage enabled (pgvector no longer required)
- **A running self-hosted Dify instance (via Docker Compose), reachable from the public internet**
- Anthropic API key added inside Dify's Model Provider settings, tested with a sample chat in Dify's own playground
- Environment variables shared across the team
- One deployed "hello world" on Vercel

**Time estimate:** 2–2.5 hours (up from 1.5–2, due to Docker Dify setup). With 4 people, run this in parallel.

### Step-by-step

**1. Repo & Next.js setup (Person D)** — unchanged:
```bash
npx create-next-app@latest lms-mvp --typescript --tailwind --app --src-dir
cd lms-mvp
git init && git add . && git commit -m "init"
```
Push to GitHub, add all teammates as collaborators.

**2. Provision a VM and install Docker (Person A)**
```bash
# On the VM (Ubuntu 22.04/24.04 recommended)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# log out/in, then verify:
docker --version
docker compose version
```
Open inbound ports 80 and 443 (and 3000 if you're not putting a reverse proxy in front) in your VM provider's firewall/security group — Dify won't be reachable from Vercel otherwise.

**3. Clone and start Dify (Person A)**
```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
cp .env.example .env
docker compose up -d
```
First boot pulls ~10 containers (api, worker, web, db, redis, weaviate/vector store, nginx, etc.) — this can take 5–10 minutes depending on the VM's connection. Don't panic if it's not instant.

Verify: visit `http://<your-vm-ip>` (or your domain if you've pointed one at it) — you should see the Dify setup screen asking you to create an admin account. Do this now, as a team, and share the login.

**4. Configure the Anthropic model provider inside Dify (Person B)**
- In Dify: **Settings → Model Provider → Anthropic** → paste your Anthropic API key.
- Test it immediately: create a throwaway Chatflow, add one LLM node set to a Claude model, hit "Run" with a test prompt in the playground. Confirm you get a real response *before* building anything on top of it — this is the Docker-era equivalent of the old `curl` test.

**5. Get a Dify API key for your Next.js app to call (Person B)**
- Once you build your real Chatflow/Workflow apps (Milestones 3–5), each app has its own **API access** section (top-right of the app editor) — generate a key there. This is what your Next.js backend will use to call Dify's REST API, not your Anthropic key directly.

**6. Supabase setup (Person A, in parallel with step 2–4)** — go to supabase.com, create a free project:
- Authentication → Providers → enable Email
- Note the Project URL and anon public key from Settings → API
- (pgvector no longer needed unless you want a Supabase-side fallback store)

**7. Install core dependencies (whoever finishes first)**
```bash
npm install @supabase/supabase-js @supabase/ssr
```
(No `@anthropic-ai/sdk` needed in Next.js anymore — Dify is your LLM gateway. Keep it only if you want a direct-Claude fallback path.)

**8. Environment variables** — `.env.local` (gitignored):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DIFY_API_BASE_URL=http://your-vm-ip-or-domain/v1
DIFY_CHAT_API_KEY=your_dify_chatflow_app_key
DIFY_QUIZ_API_KEY=your_dify_workflow_app_key
```
Share via a private channel — never commit this file, and don't put Dify's admin credentials in it either.

**9. Deploy skeleton to Vercel (Person D)** — connect the GitHub repo, add the env vars above in Vercel's dashboard, deploy, confirm the default page loads.

### File structure to agree on now
```
lms-mvp/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/              # thin proxy routes calling Dify's REST API
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   └── dify.ts           # Dify API client wrapper (replaces anthropic.ts)
│   └── components/
├── .env.local                 # NOT committed
└── package.json
```
(The `dify/` Docker Compose checkout lives on the VM, not in this repo — keep infra and app code separate.)

### Common mistakes to avoid (Docker-specific additions)
- Forgetting to open ports 80/443 on the VM firewall — Dify runs fine but nothing outside the VM can reach it
- Not waiting for all containers to report healthy before testing (`docker compose ps` — check status column) and assuming it's broken when it's just still starting
- Running `docker compose down` instead of `docker compose stop` and accidentally dropping volumes — this deletes your uploaded knowledge base and chat history; use `docker compose down -v` only when you actually mean to wipe data
- Everyone spinning up their own separate Dify instance instead of sharing one VM — same "one shared DB" mistake as before, just for Dify now
- Skipping HTTPS entirely if your demo setup allows it — not critical for a hackathon demo but worth a reverse proxy (Caddy/nginx + Let's Encrypt) with 20 spare minutes, since some browsers/security policies warn on mixed content if your Vercel app is HTTPS and Dify isn't
- Leaking the Dify admin password or API keys in the shared repo — same rule as the old Anthropic key mistake, now with one more secret to protect

### Testing steps
- [ ] `npm run dev` runs locally for all teammates
- [ ] Supabase project live, Email auth enabled
- [ ] VM provisioned, Docker + Docker Compose installed and verified
- [ ] `docker compose up -d` in the `dify/docker` folder — all containers healthy
- [ ] Dify reachable at the public VM URL, admin account created
- [ ] Anthropic model provider added inside Dify and tested in the playground
- [ ] `.env.local` confirmed gitignored, not in git history
- [ ] Vercel deploy live at a public URL

### Definition of Done
All teammates can pull the repo and run it locally. Supabase is verified working. **A self-hosted Dify instance is live on a public VM URL, with Claude configured and tested inside its own playground** — independent of your Next.js app. A public Vercel URL exists.

---

## Milestone 2 onward (unchanged in substance)

Milestones 2–6 (Auth + workspace + upload → Chat grounded in docs → Quiz/flashcard generation → Polish/deploy/demo) proceed exactly as before, with one substitution throughout: anywhere the original plan says "call the Anthropic API from Next.js," read that as **"call your self-hosted Dify app's REST API from Next.js,"** using the app-specific API keys from `.env.local`.

---

## Dify Configuration — Chatflow & Workflow Design (same logic, self-hosted notes added)

### 1. App type: Chatflow (not Workflow, Agent, or Basic Chatbot)
Same reasoning as before — Chatflow gives you conversation memory plus the visual branching you need for the retrieval-confidence → web-fallback path. This works identically whether Dify is cloud-hosted or self-hosted; the app builder UI is the same.

### 2. Knowledge Base settings
Same settings apply — **Knowledge → Create Knowledge Base**, upload demo PDFs:
- Chunking: Automatic (switch to Custom only if a demo PDF has dense tables)
- Indexing: High Quality (embeddings), not Economy
- Retrieval: Semantic search, Top-K 3–5
- Score threshold: ~0.5 to start, tune against your actual demo docs

One self-hosted-specific note: embeddings also need a **Model Provider** set (usually the same Anthropic/OpenAI provider, or a separate embedding model) — check **Settings → Model Provider** and make sure an embedding model is configured, or Knowledge Base creation will fail silently on "high quality" indexing.

### 3. Chatflow node graph (unchanged)
```
Start → Knowledge Retrieval → IF/ELSE → [high confidence] → LLM (grounded prompt) → Answer
                                       → [low confidence]  → Tool (web search) → LLM (web-fallback prompt) → Answer
```
- **Knowledge Retrieval** — attach your Knowledge Base
- **IF/ELSE** — condition on retrieval score / empty result — your core differentiator
- **LLM (grounded)** — "Answer only using the provided context. If you cannot find the answer, say so explicitly. Always mention which source document your answer came from."
- **Tool (fallback)** — web search, see note below
- **LLM (web-fallback)** — "Answer using the web search results provided. Explicitly state this came from the web, not the student's materials."
- **Answer** — both branches converge here

### 4. Web search tool — one self-hosted caveat
On Dify Cloud, tools like DuckDuckGo are available out of the box. **On self-hosted Dify, confirm the tool plugin is actually installed and enabled** under **Studio → Tools → Marketplace/Plugins** — self-hosted instances start with a smaller default plugin set and may need it added explicitly. Also confirm the Dify container itself has outbound internet access (it should, by default, on a normal VM) since the search call happens from inside the container, not from the browser.

| Tool | Setup cost | Recommendation |
|---|---|---|
| DuckDuckGo | Zero — no API key | Use this for the hackathon; just double-check it's enabled in your self-hosted instance's plugin list |
| Tavily | Needs API key | Only if a key is already on hand |
| SerpAPI | Needs API key, often paid | Skip |

### 5. Quiz generation — separate app, Workflow type
Same as before: **Create a second app → Workflow**, since quiz generation is single-shot with no conversation memory.
```
Start (inputs: topic, documentIds, numQuestions) → Knowledge Retrieval → LLM (strict JSON output) → End
```
LLM node system prompt: *"Output ONLY valid JSON matching this schema, no other text: `{ questions: [{ question, options: string[4], correctAnswer, explanation }] }`"* — test repeatedly in Dify's playground before wiring it into your Next.js API layer.

### Time-crunch fallback (unchanged)
If you're short on time, skip IF/ELSE + Tool branching entirely and use one LLM node: *"Answer from context if possible, otherwise say `[Not found in materials]` and answer from general knowledge, labeled accordingly."* Less impressive in the builder, but it's one node instead of five and still produces labeled-source behavior.

---

## Quick Summary of What Changed vs. the Original Plan

| Area | Original plan | Docker Dify plan |
|---|---|---|
| LLM calls | Direct from Next.js via `@anthropic-ai/sdk` | Via Dify's REST API, Dify calls Claude internally |
| Vector search | Supabase + pgvector | Dify's built-in Knowledge Base/vector store |
| New infra | None beyond Supabase + Vercel | A VM running Docker + Dify, publicly reachable |
| Milestone 1 time | 1.5–2 hrs | 2–2.5 hrs (Docker/VM setup adds ~30–45 min) |
| New setup risk | Anthropic key not tested early | Containers not fully healthy, ports closed, model provider not configured |
| API keys to manage | Supabase + Anthropic | Supabase + Anthropic (inside Dify) + Dify app keys (in Next.js) |
