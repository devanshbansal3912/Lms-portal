# AI-Powered Personalized Learning Management System

## 48-Hour Hackathon / College Project Execution Guide

**Project type:** Standalone web application with AI-powered learning
features\
**Core features:** RAG document chat, PDF document reader, AI quiz
generation, AI flashcards\
**Team size:** 3 students\
**Target completion:** 2 days (approximately 48 hours of coordinated
work)

------------------------------------------------------------------------

# 1. Project objective

Build one working application that allows a student to:

1.  Register and sign in.
2.  Upload a PDF study document.
3.  Read the PDF inside the application.
4.  Ask questions about the uploaded document and receive answers
    grounded in its contents.
5.  Generate multiple-choice quizzes from the document.
6.  Generate flashcards from the document.
7.  Save quiz results and generated flashcards.

The final submission must be one integrated application. Three
disconnected demos do not count as completion.

## 1.1 What "standalone" means for this 2-day version

For this project, **standalone means the student uses one application
interface** and does not need to open Dify Studio, a notebook, or a
developer tool to use the learning features.

The application may use hosted services behind the scenes:

-   Next.js application: the user-facing software.
-   Supabase: authentication, database and PDF storage.
-   Dify: AI orchestration, RAG and generation workflows.
-   Claude or another configured model provider: language generation.

Dify is an internal service. Never expose Dify admin credentials,
model-provider keys, or Dify app keys in browser code.

## 1.2 Important Google Colab limitation

If the team insists on running Dify inside Google Colab, treat it as a
**temporary demonstration backend only**.

Colab sessions can disconnect or expire. A tunnel URL may change, and
the Dify services will become unavailable when the runtime stops. Do not
promise that a Colab-hosted application will be continuously available.

Before committing to Colab, test whether the complete Dify Docker
Compose stack actually starts and remains healthy in the chosen runtime.
Dify uses multiple services and may exceed available memory or runtime
constraints.

**Recommended 2-day fallback:**

1.  First choice: use an already-working Dify instance, if available.
2.  Second choice: use Dify Cloud if the project rules and account
    access permit it.
3.  Third choice: use a small cloud VM if budget and access permit.
4.  Colab: use only if the team verifies the full stack and tunnel early
    on Day 1.
5.  If Dify is unavailable, preserve the project architecture and
    demonstrate a clearly labelled mock/demo mode. Do not falsely claim
    that RAG is working.

The team must make this hosting decision in the first 30 minutes.

------------------------------------------------------------------------

# 2. Final MVP scope

Two days is not enough to build every feature in a full LMS roadmap. The
team must freeze scope and finish the core journey before adding polish.

## 2.1 Must-have features

  -----------------------------------------------------------------------
  Feature                             Minimum acceptance criteria
  ----------------------------------- -----------------------------------
  Authentication                      Student can register, sign in and
                                      sign out.

  PDF upload                          A signed-in student can upload a
                                      PDF and see it in their document
                                      library.

  Document processing                 The PDF is stored and submitted to
                                      Dify Knowledge Base, with
                                      processing status shown.

  PDF reader                          Student can open the PDF, move
                                      between pages and zoom.

  RAG chat                            Student can ask a question and
                                      receive an answer based on the
                                      selected document, with source
                                      information where available.

  Quiz generation                     Student can select a document/topic
                                      and generate MCQs with options,
                                      correct answer and explanation.

  Quiz attempt                        Student can answer questions,
                                      submit and see a score and
                                      explanations.

  Flashcard generation                Student can generate
                                      question/answer cards from a
                                      document or topic.

  Flashcard review                    Student can reveal answers and move
                                      through cards.

  Persistence                         Documents, quiz results and
                                      flashcards remain available after
                                      page refresh, subject to the
                                      configured backend.

  Integration                         All features are accessible from
                                      one application and one navigation
                                      system.
  -----------------------------------------------------------------------

## 2.2 Cut from the 48-hour MVP

Do not implement these unless every must-have feature works:

-   YouTube ingestion.
-   Website/article ingestion.
-   Adaptive teaching styles.
-   Mock examination paper generation.
-   Advanced analytics dashboards.
-   Weak-topic detection.
-   Spaced repetition algorithms.
-   Multi-language support.
-   Collaborative classrooms.
-   Payment systems.
-   Native mobile applications.
-   Windows installer or desktop packaging.
-   Complex admin panels.
-   Elaborate animations.

A reliable, narrow product is better than a broad collection of broken
features.

------------------------------------------------------------------------

# 3. Team roles and ownership

Each participant owns one module and must deliver working code, testing
evidence and documentation.

## Student 1 --- Frontend, UI/UX and application integration

**Primary ownership:** The user-facing application and integration of
the screens with backend APIs.

### Responsibilities

#### A. Project setup and shared UI foundation

-   Create or configure the Next.js App Router project using TypeScript.
-   Configure Tailwind CSS.
-   Set up a consistent layout, typography, spacing and color system.
-   Create reusable components:
    -   Button
    -   Input
    -   Modal/dialog
    -   Loading indicator
    -   Toast/error message
    -   Sidebar/navigation
    -   Empty state
    -   Status badge
-   Set up the shared Git repository and branch rules with the team.

#### B. Authentication screens

-   Build sign-in and registration screens.
-   Connect Supabase Auth.
-   Add sign-out.
-   Protect dashboard routes.
-   Display useful validation and authentication errors.

#### C. Dashboard and document library

-   Build the main dashboard.
-   Show the signed-in user's documents.
-   Build the PDF upload form and drag-and-drop area.
-   Show upload progress and processing status.
-   Show document name, upload date and status.
-   Add open/read and delete controls if time permits.

#### D. Chat interface

-   Build a document-specific chat screen.
-   Show user and AI messages.
-   Add message input and send action.
-   Show loading state while the AI responds.
-   Render formatted responses and source references returned by the
    backend.
-   Display clear errors if Dify is unavailable.

#### E. Quiz and flashcard screens

-   Build the quiz question interface.
-   Display MCQ options and selection state.
-   Show score and explanations after submission.
-   Build flashcard front/back interaction.
-   Add next/previous controls.
-   Connect these screens to Student 3's API endpoints.

#### F. Integration and polish

-   Connect the application screens to real APIs.
-   Test navigation across all features.
-   Check desktop and mobile layouts.
-   Fix UI and integration bugs.
-   Prepare screenshots for the project report.

### Student 1 deliverables

-   Working Next.js application.
-   Authentication screens.
-   Dashboard and document library.
-   Upload interface.
-   Chat interface.
-   Quiz interface.
-   Flashcard interface.
-   Integrated navigation and responsive layout.
-   README section describing frontend setup.

### Student 1 acceptance checklist

-   [ ] App starts locally using the documented command.
-   [ ] User can register, sign in and sign out.
-   [ ] Protected pages require authentication.
-   [ ] Dashboard displays actual user/document data.
-   [ ] PDF upload calls the agreed backend endpoint.
-   [ ] Chat screen calls the agreed chat endpoint.
-   [ ] Quiz screen displays generated questions and submits answers.
-   [ ] Flashcards display generated cards and reveal answers.
-   [ ] Loading, empty and error states exist.
-   [ ] No secret API keys are present in browser-side code.

------------------------------------------------------------------------

## Student 2 --- Dify, RAG, document ingestion and AI chat

**Primary ownership:** AI infrastructure, Knowledge Base ingestion,
document retrieval and grounded chat.

### Responsibilities

#### A. Dify availability and deployment

-   Decide with the team whether the project will use an existing Dify
    instance, Dify Cloud, a VM or a Colab experiment.
-   If using Docker, follow the official Dify Docker deployment
    procedure.
-   Verify that all required containers/services are healthy.
-   Configure the model provider inside Dify.
-   Configure an embedding provider/model required for Knowledge Base
    indexing.
-   Create the Dify application(s).
-   Generate app-specific API keys.
-   Keep all keys in server-side environment variables.

Do not spend the whole first day debugging Colab. Apply the fallback
plan if the complete stack is not healthy within the agreed time limit.

#### B. Knowledge Base and document ingestion

-   Create a Dify Knowledge Base.
-   Configure PDF processing and chunking.
-   Configure embeddings and indexing.
-   Choose a reasonable retrieval configuration and test it against
    sample questions.
-   Implement or coordinate the server-side upload-to-Dify process.
-   Record the Dify document/knowledge identifiers required to query the
    document later.
-   Ensure the application can associate a Dify document with the
    correct Supabase user and application document record.

#### C. RAG Chatflow

Create a Chatflow with this logical structure:

``` text
Student question
      |
Knowledge retrieval
      |
Check whether useful context was retrieved
      |
      +-----------------------+
      |                       |
Sufficient context       Insufficient context
      |                       |
LLM grounded answer      Say information was not
      |                  found in uploaded material
      |                  (optional web search only
      |                   if fully configured)
      +-----------+-----------+
                  |
          Answer + source data
```

The MVP should prefer an honest "not found in the uploaded document"
response over an unsupported answer.

#### D. Chat API integration

Implement a server-side API route or service that:

-   Accepts the signed-in user's question.
-   Accepts the selected document/knowledge identifier.
-   Validates that the user owns or can access the document.
-   Calls the correct Dify Chatflow API.
-   Passes the conversation ID when continuing a conversation.
-   Returns the answer and source/citation information.
-   Handles timeouts, invalid keys and unavailable Dify services.
-   Never returns secret Dify keys to the browser.

#### E. RAG testing

Test with at least one known PDF and a prepared set of questions:

1.  A question whose answer is clearly in the PDF.
2.  A question that requires combining two parts of the PDF.
3.  A question whose answer is not in the PDF.
4.  A question phrased differently from the source wording.
5.  A question about a different document.

Record whether the answer is grounded and whether source references are
useful.

### Student 2 deliverables

-   Running and verified Dify instance or clearly documented selected
    Dify service.
-   Configured LLM and embedding provider.
-   Knowledge Base.
-   PDF ingestion integration.
-   RAG Chatflow.
-   Server-side chat API.
-   Conversation handling.
-   Source/citation handling where returned by Dify.
-   Test cases and results.
-   README section describing AI setup and limitations.

### Student 2 acceptance checklist

-   [ ] Dify is reachable from the application backend.
-   [ ] Model provider responds successfully.
-   [ ] Embedding/indexing works.
-   [ ] A PDF can be added to the Knowledge Base.
-   [ ] The team can query the indexed document.
-   [ ] Chat answers use retrieved context.
-   [ ] Missing information is handled honestly.
-   [ ] Source information is returned where available.
-   [ ] Conversation continuation works if enabled.
-   [ ] Dify and model API keys remain server-side.
-   [ ] The team knows what happens when the Dify runtime disconnects.

------------------------------------------------------------------------

## Student 3 --- PDF reader, quiz generation, flashcards and learning data

**Primary ownership:** The student learning features and their
data/assessment logic.

### Responsibilities

#### A. PDF document reader

-   Select and configure PDF.js or a compatible React PDF library.
-   Display the PDF inside the application.
-   Implement next and previous page.
-   Display the current page and total page count.
-   Implement zoom in and zoom out.
-   Add a loading state while the PDF opens.
-   Handle invalid or unavailable PDF files.
-   Ensure the reader loads only documents the signed-in user is
    authorized to access.

Do not build a separate upload system. Student 1 owns the upload
interface and Student 2 owns Dify ingestion.

#### B. Quiz-generation Workflow

Create a separate Dify Workflow for quiz generation.

Suggested logical flow:

``` text
Inputs:
  document/knowledge identifier
  topic
  number of questions
       |
Knowledge retrieval
       |
LLM question generation
       |
Structured JSON output
       |
Backend validation
       |
Quiz UI
```

The quiz output should follow a predictable structure:

``` json
{
  "title": "Operating Systems - Deadlocks",
  "questions": [
    {
      "question": "What is a deadlock?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Explanation grounded in the study material."
    }
  ]
}
```

The exact property names may be adjusted, but the frontend and backend
must agree on one schema before implementation.

Requirements:

-   Generate questions from the selected document's content.
-   Support a topic input.
-   Support a small selectable question count, such as 5 or 10.
-   Generate four options per single-answer MCQ.
-   Ensure exactly one correct option.
-   Include a concise explanation.
-   Validate JSON before returning it to the frontend.
-   Reject or repair malformed output; do not render invalid questions.

#### C. Quiz attempt and scoring

-   Receive the student's selected answers.
-   Compare them with the validated answer key on the server.
-   Calculate the score.
-   Store the quiz attempt and result in Supabase.
-   Show correct answers and explanations after submission.
-   Show the student's previous attempts if time permits.

Do not trust a score calculated only in browser code. The backend must
perform the authoritative calculation.

#### D. Flashcard-generation Workflow

Create a separate Dify Workflow for flashcards.

Inputs:

-   Document/knowledge identifier.
-   Topic.
-   Number of cards.

Expected output:

``` json
{
  "title": "Operating Systems - Deadlocks",
  "cards": [
    {
      "front": "What is a deadlock?",
      "back": "A state where processes wait indefinitely for resources."
    }
  ]
}
```

Requirements:

-   Cards must be grounded in the selected study material.
-   Keep each front and back concise.
-   Validate the returned JSON.
-   Save generated cards in Supabase.
-   Display cards in the frontend.
-   Implement answer reveal and next/previous navigation.
-   Allow a basic Known/Need Revision status if time permits.

#### E. Database implementation

Coordinate with Student 1 and Student 2 before creating tables. Use the
existing Supabase project.

Suggested tables:

  -----------------------------------------------------------------------
  Table                               Important fields
  ----------------------------------- -----------------------------------
  documents                           id, user_id, filename,
                                      storage_path, dify_document_id,
                                      status

  quizzes                             id, user_id, document_id, title,
                                      created_at

  quiz_questions                      id, quiz_id, question, options,
                                      correct_answer, explanation

  quiz_attempts                       id, quiz_id, user_id, score,
                                      total_questions, created_at

  flashcards                          id, user_id, document_id, topic,
                                      front, back

  flashcard_progress                  id, user_id, flashcard_id, status,
                                      updated_at
  -----------------------------------------------------------------------

The `documents` table may be created jointly with Student 1. Avoid
creating duplicate document tables.

Set appropriate Row Level Security (RLS) policies. Users must not be
able to read another student's quiz, flashcard or document records.

### Student 3 deliverables

-   Working PDF reader.
-   Quiz-generation Dify Workflow.
-   Quiz-generation API.
-   JSON validation.
-   Quiz attempt and scoring logic.
-   Quiz result persistence.
-   Flashcard-generation Dify Workflow.
-   Flashcard API and persistence.
-   Flashcard review interface integration.
-   README section describing learning features and database schema.

### Student 3 acceptance checklist

-   [ ] PDF opens inside the application.
-   [ ] Page navigation works.
-   [ ] Zoom works.
-   [ ] Quiz generation uses selected study material.
-   [ ] Quiz output passes schema validation.
-   [ ] Each single-answer question has exactly one correct option.
-   [ ] Quiz submission calculates the score correctly.
-   [ ] Quiz result is saved.
-   [ ] Flashcards are generated from selected study material.
-   [ ] Flashcard output passes schema validation.
-   [ ] Flashcards remain available after refresh.
-   [ ] User data is protected by access policies.

------------------------------------------------------------------------

# 4. Shared technical decisions --- settle these before coding

The three students must agree on these decisions in the first 30
minutes.

## 4.1 Recommended stack

  Layer                        Technology
  ---------------------------- -------------------------------------------
  Frontend                     Next.js App Router
  Language                     TypeScript
  Styling                      Tailwind CSS
  Authentication               Supabase Auth
  Database                     Supabase PostgreSQL
  File storage                 Supabase Storage
  AI orchestration             Dify
  LLM                          Configured model provider, such as Claude
  PDF reader                   PDF.js / React PDF
  Version control              Git + GitHub
  Frontend deployment          Vercel, if available
  Temporary AI demonstration   Colab only after feasibility test

## 4.2 Environment variables

Create a local `.env.local` file. Never commit it.

Example:

``` env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

DIFY_API_BASE_URL=
DIFY_CHAT_API_KEY=
DIFY_QUIZ_API_KEY=
DIFY_FLASHCARD_API_KEY=
```

Important:

-   `NEXT_PUBLIC_` variables are exposed to browser code.
-   Never prefix the service role key or Dify API keys with
    `NEXT_PUBLIC_`.
-   Use service credentials only inside trusted server-side code.
-   Do not paste secrets into GitHub, screenshots, reports or public
    notebooks.
-   If a secret is accidentally committed, rotate it immediately.

## 4.3 Shared document flow

Use one document record as the source of truth.

``` text
Student uploads PDF
       |
Supabase Storage
       |
Create document record in Supabase
       |
Server sends PDF to Dify
       |
Dify processes and indexes document
       |
Save Dify document identifier
       |
Update document status to READY
       |
Student can read PDF and use AI features
```

Suggested document statuses:

-   `UPLOADING`
-   `PROCESSING`
-   `READY`
-   `FAILED`

Do not show a document as AI-ready until Dify has finished indexing it.

## 4.4 Shared API contracts

Agree on endpoint paths and JSON formats before building the
frontend/backend integration.

These are proposed application routes, not routes automatically provided
by Dify.

  ----------------------------------------------------------------------------------
  Method            Route                        Owner             Purpose
  ----------------- ---------------------------- ----------------- -----------------
  POST              `/api/documents/upload`      Student 1 + 2     Upload and start
                                                                   ingestion

  GET               `/api/documents`             Student 1         List current
                                                                   user's documents

  GET               `/api/documents/[id]`        Student 1         Get document
                                                                   metadata

  POST              `/api/chat`                  Student 2         Ask a question
                                                                   about a document

  POST              `/api/quiz/generate`         Student 3         Generate quiz

  POST              `/api/quiz/submit`           Student 3         Grade and save
                                                                   quiz attempt

  GET               `/api/quiz/history`          Student 3         Get quiz history

  POST              `/api/flashcards/generate`   Student 3         Generate
                                                                   flashcards

  GET               `/api/flashcards`            Student 3         List saved
                                                                   flashcards

  PATCH             `/api/flashcards/[id]`       Student 3         Update review
                                                                   status
  ----------------------------------------------------------------------------------

### Chat request example

``` json
{
  "documentId": "document-uuid",
  "question": "Explain deadlock prevention.",
  "conversationId": null
}
```

### Chat response example

``` json
{
  "answer": "Deadlock prevention involves...",
  "conversationId": "conversation-id",
  "sources": []
}
```

The `sources` array should contain the actual source information
returned by the Dify integration. Do not invent citation metadata.

### Quiz generation request

``` json
{
  "documentId": "document-uuid",
  "topic": "Deadlock",
  "numberOfQuestions": 5
}
```

### Flashcard generation request

``` json
{
  "documentId": "document-uuid",
  "topic": "Deadlock",
  "numberOfCards": 10
}
```

Every endpoint must:

-   Validate the signed-in user.
-   Validate the request body.
-   Verify document ownership.
-   Return predictable JSON.
-   Return useful error codes/messages.
-   Avoid exposing provider credentials.

------------------------------------------------------------------------

# 5. Exact 48-hour execution plan

This is an aggressive schedule. It assumes all three participants work
in parallel, have laptops and internet access, and can access the
required API accounts.

Use two focused workdays with short breaks. Do not spend time perfecting
visual details while core functionality is incomplete.

## DAY 1 --- Foundation and core functionality

### First 30 minutes --- Team setup (all students)

-   [ ] Confirm the final MVP scope.
-   [ ] Decide where Dify will run.
-   [ ] Verify access to Supabase and the model provider.
-   [ ] Create the shared GitHub repository.
-   [ ] Agree on the API contracts in this document.
-   [ ] Assign one owner to each module.
-   [ ] Create `.env.example`.
-   [ ] Create the first project structure.
-   [ ] Set up a shared communication channel.

**Hard deadline:** By minute 30, everyone must know what they own.

### Hours 0.5--2 --- Parallel foundation

**Student 1** - Create Next.js application. - Configure TypeScript and
Tailwind. - Create common layout and navigation. - Build login/register
screens. - Connect Supabase Auth.

**Student 2** - Start Dify deployment/availability test. - Configure
model provider. - Configure embedding provider. - Create a test
Knowledge Base. - Upload one small sample PDF. - Verify that a question
can retrieve information from it.

**Student 3** - Create database schema. - Configure RLS policies. - Set
up PDF.js/React PDF. - Build initial document reader. - Create quiz and
flashcard JSON schemas.

**Checkpoint:** A running frontend, accessible Dify service and working
database foundation.

### Hours 2--4 --- First working modules

**Student 1** - Complete protected dashboard. - Build document upload
interface. - Build document library. - Add loading and status
components.

**Student 2** - Configure actual Knowledge Base. - Implement PDF-to-Dify
ingestion integration with Student 1. - Build first Chatflow. - Test
grounded responses. - Return answer and source data through a
server-side endpoint.

**Student 3** - Finish basic PDF reader. - Implement page navigation and
zoom. - Build quiz screen. - Create quiz-generation Workflow.

**Checkpoint:** A student can sign in, upload a PDF, and the team can
verify that Dify indexes it.

### Hours 4--6 --- AI and feature integration

**Student 1** - Build chat interface. - Connect to Student 2's chat
endpoint. - Display messages and sources. - Build basic quiz and
flashcard pages.

**Student 2** - Finish chat endpoint. - Add document access
validation. - Handle conversation IDs. - Test retrieval against actual
PDF content. - Add useful error handling.

**Student 3** - Complete quiz-generation Workflow. - Build
quiz-generation endpoint. - Implement response validation. - Implement
scoring and result saving. - Start flashcard Workflow.

**Checkpoint:** A user can upload a document and ask at least one
working question through the actual application.

### Hours 6--8 --- Day 1 integration

**Student 1** - Connect document library and chat. - Integrate the quiz
screen with the API. - Test authentication and navigation.

**Student 2** - Test complete upload-to-RAG flow. - Fix ingestion
failures. - Document Dify configuration. - Ensure keys are server-side.

**Student 3** - Complete flashcard-generation Workflow. - Save generated
flashcards. - Connect the flashcard interface. - Test quiz scoring.

**End-of-Day-1 definition of done**

-   [ ] Application starts.
-   [ ] Authentication works.
-   [ ] PDF upload works.
-   [ ] Dify indexes a test PDF.
-   [ ] RAG chat works through the application.
-   [ ] PDF reader works.
-   [ ] Quiz generation works at least once.
-   [ ] Flashcard generation works at least once.

If any of these fail, prioritize fixing the broken feature before
starting optional enhancements.

------------------------------------------------------------------------

## DAY 2 --- Integration, reliability and submission

### Hours 8--10 --- Finish missing features

**Student 1** - Fix dashboard and navigation bugs. - Complete quiz UI
integration. - Complete flashcard UI integration. - Add
empty/error/loading states.

**Student 2** - Improve retrieval prompts. - Verify source
information. - Test missing-answer behavior. - Test Dify disconnection
handling. - Verify all AI keys are protected.

**Student 3** - Finish quiz history. - Finish flashcard review status. -
Verify persistence. - Test quiz and flashcard output against the same
PDF. - Fix invalid JSON cases.

### Hours 10--12 --- Full system testing

All students test the complete student journey:

1.  Register a new user.
2.  Sign in.
3.  Upload a PDF.
4.  Wait for document indexing.
5.  Open the PDF reader.
6.  Ask a question.
7.  Check the answer against the document.
8.  Generate a five-question quiz.
9.  Attempt the quiz.
10. Verify the score.
11. Generate flashcards.
12. Review the flashcards.
13. Refresh the application.
14. Verify that saved records still exist.

Record every failure. Assign one owner and a clear fix deadline to each
issue.

### Hours 12--14 --- Bug fixing and security

**Student 1** - Fix layout, responsive and navigation bugs. - Verify all
screens use actual API data. - Remove unnecessary mock data.

**Student 2** - Fix RAG and API errors. - Check Dify availability. -
Confirm that provider credentials are not exposed. - Verify
document-to-user mapping.

**Student 3** - Fix quiz schema and scoring bugs. - Check flashcard
persistence. - Check database access policies. - Verify that another
user cannot access a student's learning records.

### Hours 14--16 --- Final presentation preparation

All students:

-   [ ] Prepare a clean sample PDF.
-   [ ] Prepare one set of predictable test questions.
-   [ ] Prepare a quiz-generation demonstration.
-   [ ] Prepare a flashcard demonstration.
-   [ ] Capture screenshots.
-   [ ] Create a project architecture diagram.
-   [ ] Document technology stack.
-   [ ] Document each student's contribution.
-   [ ] Prepare limitations and future scope.
-   [ ] Verify that the demo environment is working.

### Hours 16--18 --- Final buffer

Use the remaining time for:

-   Fixing critical bugs.
-   Re-running the complete demonstration.
-   Checking the deployment URL.
-   Checking database persistence.
-   Confirming the Colab/Dify service is still reachable, if applicable.
-   Preparing a backup demonstration.

Do not introduce new features in this period.

------------------------------------------------------------------------

# 6. GitHub workflow and collaboration rules

Use one repository.

Suggested structure:

``` text
ai-learning-platform/
|
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── chat/
│   │   ├── quiz/
│   │   ├── flashcards/
│   │   └── api/
│   │       ├── documents/
│   │       ├── chat/
│   │       ├── quiz/
│   │       └── flashcards/
│   |
│   ├── components/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── dify/
│   │   └── validation/
│   |
│   └── types/
|
├── public/
├── supabase/
│   └── migrations/
├── docs/
│   ├── architecture.md
│   ├── api-contracts.md
│   └── testing.md
├── .env.example
├── .gitignore
└── README.md
```

Suggested branches:

-   `main`: stable integrated application.
-   `student-1-frontend`: Student 1's work.
-   `student-2-rag`: Student 2's work.
-   `student-3-learning-features`: Student 3's work.

Rules:

1.  Do not directly overwrite another student's work.
2.  Commit working changes regularly.
3.  Pull the latest changes before starting a task.
4.  Use pull requests for integration.
5.  Resolve conflicts immediately.
6.  Do not commit `.env.local`, secrets or private credentials.
7.  Every student must test the merged application.

------------------------------------------------------------------------

# 7. Critical integration dependencies

Some work cannot be completed independently. These are the dependencies
that must be resolved early.

  Dependency                           Required collaboration
  ------------------------------------ -----------------------------------
  PDF upload and Dify ingestion        Student 1 + Student 2
  Document metadata and Dify IDs       Student 1 + Student 2 + Student 3
  Dify Knowledge Base access           Student 2 + Student 3
  Quiz Workflow response schema        Student 1 + Student 3
  Flashcard Workflow response schema   Student 1 + Student 3
  Supabase document table              Student 1 + Student 2
  Quiz and flashcard tables            Student 3
  Final application integration        All three

**Important:** Student 3 must not wait until Day 2 to obtain Dify
access. Student 2 must provide the Dify instance URL, relevant app
IDs/API access and agreed request formats as soon as the services are
ready.

------------------------------------------------------------------------

# 8. Project quality and security requirements

These are not optional if you are presenting this as a software
application.

## Authentication and authorization

-   Every private API must verify the user's session.
-   Every document operation must check document ownership.
-   Quiz and flashcard records must be scoped to their owner.
-   Configure Supabase RLS policies.
-   Do not rely only on hiding UI elements to enforce permissions.

## File handling

-   Accept PDF files only for the MVP.
-   Enforce a reasonable file-size limit.
-   Validate MIME type and file extension.
-   Use unique storage paths.
-   Do not trust filenames as unique identifiers.
-   Handle upload and indexing failures.

## AI output handling

-   Validate every structured quiz and flashcard response.
-   Do not trust model output as executable code.
-   Do not render untrusted HTML directly.
-   Do not expose provider keys.
-   Clearly identify answers that are not supported by uploaded
    material.
-   Never fabricate source citations.

## Persistence

-   Store original PDFs in persistent storage.
-   Store quiz and flashcard results in PostgreSQL.
-   Store document-processing identifiers and statuses.
-   Do not depend on a Colab filesystem for permanent user data.
-   Have a recovery plan for rebuilding the Dify Knowledge Base.

------------------------------------------------------------------------

# 9. Final demonstration script

The project demonstration should take approximately 5--7 minutes.

## Step 1 --- Introduce the problem

Explain that students spend time searching lengthy study material and
manually preparing revision questions.

## Step 2 --- Upload a document

-   Sign in.
-   Upload an Operating Systems PDF.
-   Show the processing status.
-   Wait until the document is ready.

## Step 3 --- Demonstrate document reading

-   Open the PDF.
-   Navigate between pages.
-   Zoom in and out.

## Step 4 --- Demonstrate RAG

Ask:

-   What is a deadlock?
-   Explain the four necessary conditions for deadlock.
-   How can deadlock prevention be implemented?

Show answers and source information where available.

## Step 5 --- Demonstrate quiz generation

-   Select the uploaded document.
-   Enter the topic.
-   Generate five MCQs.
-   Attempt the quiz.
-   Submit and display the score and explanations.

## Step 6 --- Demonstrate flashcards

-   Generate flashcards from the same document.
-   Reveal answers.
-   Navigate through the cards.
-   Mark cards as Known or Need Revision, if implemented.

## Step 7 --- Demonstrate persistence

Refresh the application and show that the saved records remain
available.

------------------------------------------------------------------------

# 10. Final submission checklist

## Application

-   [ ] One integrated application.
-   [ ] Authentication works.
-   [ ] Document upload works.
-   [ ] PDF reader works.
-   [ ] RAG chat works.
-   [ ] Quiz generation works.
-   [ ] Quiz scoring works.
-   [ ] Flashcard generation works.
-   [ ] Flashcard review works.
-   [ ] User data persists.
-   [ ] Error handling exists.

## Technical documentation

-   [ ] Project abstract.
-   [ ] Problem statement.
-   [ ] Objectives.
-   [ ] System architecture.
-   [ ] Technology stack.
-   [ ] Database schema.
-   [ ] RAG workflow explanation.
-   [ ] Dify Chatflow explanation.
-   [ ] Quiz Workflow explanation.
-   [ ] Flashcard Workflow explanation.
-   [ ] API documentation.
-   [ ] Testing results.
-   [ ] Limitations.
-   [ ] Future scope.
-   [ ] Individual contribution statements.

## Individual accountability

Each student must be able to explain:

-   Their module architecture.
-   The code they implemented.
-   The APIs they used.
-   The database interactions they own.
-   The tests they performed.
-   The limitations and failure cases.

------------------------------------------------------------------------

# 11. Definition of success

The project is complete only when a new user can:

1.  Open the application.
2.  Create an account.
3.  Upload a PDF.
4.  Read the PDF.
5.  Ask questions about the PDF.
6.  Receive a grounded answer.
7.  Generate a quiz.
8.  Attempt the quiz and see the result.
9.  Generate flashcards.
10. Review flashcards.
11. Return later and access saved data.

A screenshot of a dashboard is not proof of completion. A successful
end-to-end demonstration is.

## Final team rule

**Build the complete working flow first. Improve the appearance second.
Add optional features last.**

Do not waste the two days debating frameworks, changing the UI theme
repeatedly, adding unnecessary features or waiting for another
participant to finish something that can be developed independently.

Every participant must produce a working module by the end of Day 1 and
participate in integration on Day 2.
