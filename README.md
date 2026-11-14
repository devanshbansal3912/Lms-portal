# Student 3: Learning Features, PDF Reader & Assessment Engine
## AI-Powered Personalized Learning Management System (LMS)

This workspace contains the complete, production-ready implementation of **Student 3's** deliverables for the 48-hour LMS project:
1. **In-App PDF Reader Component** (`PdfViewer.tsx`) with page navigation, zoom, and error handling.
2. **AI Quiz Generation & Authoritative Server-Side Scoring** (`/api/quiz/generate`, `/api/quiz/submit`, `/api/quiz/history`).
3. **AI Flashcard Generation & Study Tracking** (`/api/flashcards/generate`, `/api/flashcards`, `/api/flashcards/[id]`).
4. **PostgreSQL Database Schema & Row-Level Security (RLS)** in Supabase.
5. **Dify Workflow DSL & Specifications** for Quiz and Flashcard generation.
6. **Zod Validation & TypeScript Schemas** enforcing strict JSON contracts.
7. **Interactive UI Views** (`/reader`, `/quiz`, `/flashcards`, `/` Hub).
8. **Built-in Resilience / Mock Fallback Mode** ensuring 100% demo uptime even if Google Colab or external AI tunnels disconnect.

---

## 📁 Repository Structure

```text
├── dify_workflows/              # Dify Workflow DSLs & JSON definitions
│   ├── README.md                # Guide to importing workflows into Dify Studio
│   ├── quiz_generation_workflow.yml
│   ├── quiz_generation_workflow.json
│   ├── flashcard_generation_workflow.yml
│   └── flashcard_generation_workflow.json
├── docs/                        # Complete technical documentation & team handover
│   ├── STUDENT_3_HANDOVER.md    # Guide for Student 1 (Frontend) & Student 2 (AI/RAG)
│   ├── API_CONTRACTS.md         # Exhaustive JSON request/response contracts & curl samples
│   ├── DATABASE_SCHEMA.md       # PostgreSQL schema, ER diagram & RLS policy documentation
│   ├── DIFY_WORKFLOW_SETUP.md   # Step-by-step Dify workflow configuration guide
│   └── TESTING_AND_DEMO_GUIDE.md# 5-minute hackathon presentation demo script
├── public/                      # Static assets & sample study PDF
│   └── sample_operating_systems_notes.pdf
├── supabase/                    # Supabase database migrations & seed data
│   ├── migrations/
│   │   └── 20261114_001_student3_learning_schema.sql
│   └── seed.sql
├── src/
│   ├── app/                     # Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   ├── quiz/generate/route.ts
│   │   │   ├── quiz/submit/route.ts
│   │   │   ├── quiz/history/route.ts
│   │   │   └── flashcards/
│   │   │       ├── generate/route.ts
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── reader/page.tsx      # Standalone PDF Reader interface
│   │   ├── quiz/page.tsx        # Quiz generator, taking, results & history
│   │   ├── flashcards/page.tsx  # Flashcard generator, 3D flip card deck & mastery tracker
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx             # Student 3 Command Center / Feature Hub
│   ├── components/              # Modular UI components ready for Student 1 import
│   │   ├── Navigation.tsx
│   │   ├── pdf/PdfViewer.tsx
│   │   ├── quiz/
│   │   │   ├── QuizGenerator.tsx
│   │   │   ├── QuizPlayer.tsx
│   │   │   ├── QuizResultView.tsx
│   │   │   └── QuizHistoryView.tsx
│   │   └── flashcards/
│   │       ├── FlashcardGenerator.tsx
│   │       ├── FlashcardDeck.tsx
│   │       └── FlashcardItem.tsx
│   ├── lib/                     # Utilities, API clients, validation & scoring logic
│   │   ├── assessment/scoring.ts
│   │   ├── dify/client.ts
│   │   ├── mock/learningMockData.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   └── validation/
│   │       ├── quiz.ts
│   │       └── flashcard.ts
│   └── types/                   # Shared TypeScript definitions
│       ├── database.ts
│       └── learning.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.mjs
```

---

## 🚀 Quick Start Guide

### 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your Supabase and Dify credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

DIFY_API_BASE_URL=http://your-dify-ip-or-domain/v1
DIFY_QUIZ_API_KEY=app-yourQuizApiKey
DIFY_FLASHCARD_API_KEY=app-yourFlashcardApiKey
```
*(Note: If keys are omitted or Dify is offline, the backend automatically operates in **Smart Mock Mode** with grounded Operating Systems study material so that all features remain 100% interactive for testing and presentations).*

### 2. Database Migration
In the **Supabase Dashboard -> SQL Editor**, execute the migration script:
```text
supabase/migrations/20261114_001_student3_learning_schema.sql
```
To populate initial sample data, execute:
```text
supabase/seed.sql
```

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Feature Hub:** `http://localhost:3000/`
- **PDF Document Reader:** `http://localhost:3000/reader`
- **AI Quiz Engine:** `http://localhost:3000/quiz`
- **AI Flashcards Deck:** `http://localhost:3000/flashcards`

---

## 🤝 Integration Contracts for Teammates

### For Student 1 (Frontend Lead):
- **Embed PDF Reader:**
  ```tsx
  import { PdfViewer } from "@/components/pdf/PdfViewer";
  <PdfViewer url="/sample_operating_systems_notes.pdf" title="OS Deadlocks Notes" />
  ```
- **Call Quiz Endpoints:**
  - `POST /api/quiz/generate` -> Generates MCQs
  - `POST /api/quiz/submit` -> Authoritative grading & persistence
  - `GET /api/quiz/history` -> Returns past attempts
- **Call Flashcard Endpoints:**
  - `POST /api/flashcards/generate` -> Generates cards
  - `GET /api/flashcards?documentId=...` -> Fetches saved cards
  - `PATCH /api/flashcards/[id]` -> Updates review status (`KNOWN` / `NEED_REVISION`)

### For Student 2 (AI Infrastructure & Dify Lead):
- **Import Workflows:** Import `dify_workflows/quiz_generation_workflow.yml` and `dify_workflows/flashcard_generation_workflow.yml` into your Dify instance.
- **Pass Indexed Document IDs:** Store the Dify Knowledge document ID in the `documents.dify_document_id` column in Supabase so Student 3's workflows can query the exact document.
