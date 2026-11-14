# Student 3 Handover Guide: Learning Features & Assessment Engine
**Module Owner:** Student 3  
**Components:** In-App PDF Reader, AI Quiz Generator & Authoritative Scoring, AI Flashcards, Database Migrations & Dify Workflows  
**Target Audience:** Student 1 (Frontend Lead) & Student 2 (AI & Dify Lead)  

---

## 1. Quick Summary of Student 3 Deliverables
All features assigned to Student 3 have been implemented with production-level TypeScript, Zod schema validation, and server-side authoritative scoring:
- **PDF Reader:** Embedded interactive viewer component (`src/components/pdf/PdfViewer.tsx`) with zoom, page navigation, fullscreen, and authorization guard.
- **Quiz Engine:** Route handlers (`/api/quiz/generate`, `/api/quiz/submit`, `/api/quiz/history`) that call Dify Workflow, validate JSON, grade submissions authoritatively on the server, and persist records in Supabase.
- **Flashcards:** Route handlers (`/api/flashcards/generate`, `/api/flashcards`, `/api/flashcards/[id]`) that extract concepts, track mastery, and persist progress.
- **Database Migrations:** SQL script (`supabase/migrations/20261114_001_student3_learning_schema.sql`) with full table definitions, foreign keys, and Row Level Security (RLS) policies.
- **Dify Workflows:** Tested YAML and JSON workflows for both Quiz and Flashcard generation under `dify_workflows/`.
- **Zero Demo Downtime Guarantee:** Built-in Smart Mock Fallback ensures that if Google Colab disconnects or Dify is unreachable during evaluation, the app continues to generate grounded test material seamlessly.

---

## 2. Integration Guide for Student 1 (Frontend Lead)

### A. How to embed the PDF Reader in your dashboard
You can import `PdfViewer` directly into your document detail or workspace view:

```tsx
import { PdfViewer } from "@/components/pdf/PdfViewer";

export default function DocumentViewPage({ document }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{document.filename}</h2>
      
      {/* Student 3 PDF Viewer Component */}
      <PdfViewer
        url={document.storagePath} // Supabase public/signed URL or local /sample.pdf
        title={document.filename}
        initialPage={1}
        onPageChange={(page) => console.log(`User navigated to page ${page}`)}
      />
    </div>
  );
}
```

### B. Calling the Quiz API Endpoints
1. **Generate Quiz (`POST /api/quiz/generate`):**
   ```ts
   const res = await fetch('/api/quiz/generate', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       documentId: selectedDoc.id,
       topic: "Coffman Conditions for Deadlock",
       numberOfQuestions: 5,
       difficulty: "medium" // 'easy' | 'medium' | 'hard'
     })
   });
   const { quiz } = await res.json();
   // quiz contains { id, title, questions: [{ id, question, options: string[4] }] }
   ```

2. **Submit Quiz for Authoritative Grading (`POST /api/quiz/submit`):**
   ```ts
   const res = await fetch('/api/quiz/submit', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       quizId: quiz.id,
       answers: {
         "q1-uuid": 2, // 0-based option index selected by student
         "q2-uuid": 1
       }
     })
   });
   const { result } = await res.json();
   // result contains { score, totalQuestions, percentage, passed, details: [...] }
   ```

3. **Get Student's Quiz History (`GET /api/quiz/history`):**
   ```ts
   const res = await fetch('/api/quiz/history');
   const { attempts } = await res.json();
   ```

### C. Calling the Flashcard API Endpoints
1. **Generate Cards (`POST /api/flashcards/generate`):**
   ```ts
   const res = await fetch('/api/flashcards/generate', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       documentId: selectedDoc.id,
       topic: "Deadlocks",
       numberOfCards: 5
     })
   });
   const { cards } = await res.json();
   ```

2. **Update Card Review Status (`PATCH /api/flashcards/[id]`):**
   ```ts
   await fetch(`/api/flashcards/${cardId}`, {
     method: 'PATCH',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ status: 'KNOWN' }) // 'KNOWN' | 'NEED_REVISION' | 'NEW'
   });
   ```

---

## 3. Integration Guide for Student 2 (AI Infrastructure Lead)

### A. Dify Setup Checklist
1. Open Dify Studio -> Workflows -> Create New App -> **Mode: Workflow** (not Chatflow).
2. Import `dify_workflows/quiz_generation_workflow.yml`.
3. Import `dify_workflows/flashcard_generation_workflow.yml`.
4. Ensure your **Knowledge Base** is attached to the Knowledge Retrieval node.
5. In each app, open **API Access** and generate an API key.
6. Provide these keys to the team:
   - `DIFY_QUIZ_API_KEY=app-...`
   - `DIFY_FLASHCARD_API_KEY=app-...`
   - `DIFY_API_BASE_URL=http://<your-vm-or-colab-tunnel>/v1`

### B. Shared Document Identifier
When you process an uploaded document and index it in Dify Knowledge Base, save the returned Dify Document ID in the Supabase table:
```sql
UPDATE public.documents
SET dify_document_id = 'dify-dataset-or-document-uuid', status = 'READY'
WHERE id = 'supabase-doc-uuid';
```
Student 3's workflows automatically use this ID to constrain quiz and flashcard extraction to the exact document.

---

## 4. Shared Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DIFY_API_BASE_URL=http://your-dify-ip/v1
DIFY_QUIZ_API_KEY=app-your-quiz-key
DIFY_FLASHCARD_API_KEY=app-your-flashcard-key
NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=true
```
