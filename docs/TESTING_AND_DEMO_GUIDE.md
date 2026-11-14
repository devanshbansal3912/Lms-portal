# Student 3 Testing & 5-Minute Live Demo Guide

This document prepares Student 3 for project testing and the live college evaluation / hackathon jury presentation.

---

## 1. Five-Minute Live Demo Script for Student 3

### Minute 1: Introduce Your Ownership & Architecture
> *"Good morning professors / judges. I am Student 3 on the team, and I own the Learning Features, In-App Document Reader, and Assessment Logic. My responsibility is to take the study documents uploaded by Student 1 and indexed by Student 2, and turn them into an active, verifiable learning environment with in-app PDF reading, structured AI quiz generation with server-authoritative grading, and flashcards."*

### Minute 2: Demonstrate the In-App PDF Reader
1. Navigate to `http://localhost:3000/reader`.
2. Show the embedded document:
   - Click **Zoom In** (+25%) and **Zoom Out**.
   - Navigate from Page 1 to Page 2 using the next button.
   - Point out: *"The PDF reader is embedded directly into the application, so students don't need external desktop tools like Adobe Acrobat."*

### Minute 3: Demonstrate AI Quiz Generation & Server-Side Grading
1. Click **Generate Quiz** on the document.
2. Select Topic: *"Deadlocks and Resource Allocation"*, Count: *5 Questions*.
3. Click **Generate Quiz Questions**.
4. Show the interactive question player:
   - Select option **C** on Question 1 (*"Preemption Allowed"*).
   - Select option **B** on Question 2 (*"Banker's Algorithm"*).
   - Answer the remaining questions.
5. Hit **Submit & Grade**.
6. Highlight the Result Screen:
   - Point out the **Score Banner** (e.g. 4/5 - 80%).
   - Point out the **Grounded Explanations**: *"Notice that each question provides a specific explanation grounded directly in the study material."*
   - Crucial technical point: *"The scoring calculation is strictly authoritative on the server inside `/api/quiz/submit`. We never trust a client-calculated score."*

### Minute 4: Demonstrate AI Flashcard Deck & Mastery Tracking
1. Navigate to `/flashcards`.
2. Click on a card to demonstrate the **3D Flip Animation**.
3. Front: *"What is the formal definition of a Deadlock in an OS?"*
4. Flip back: *"A permanent situation where two or more processes are blocked..."*
5. Click **Mark as Known** (Green).
6. Note: *"The system updates the student's mastery percentage and persists review status into PostgreSQL in Supabase."*

### Minute 5: Explain Security & Database Schema
1. Open `supabase/migrations/20261114_001_student3_learning_schema.sql`.
2. Explain:
   - Tables: `quizzes`, `quiz_questions`, `quiz_attempts`, `flashcards`, `flashcard_progress`.
   - Security: *"All learning tables are protected by Row-Level Security (RLS) policies ensuring students can only access their own quiz results and cards."*

---

## 2. Common Evaluation Questions & How to Answer

### Q1: "Why did you use single-shot Workflows instead of Chatflows for quizzes?"
**Answer:** *"A Chatflow maintains conversational memory, which is essential for multi-turn chats. However, quiz generation is an idempotent, single-shot task requiring a deterministic output schema. A single-shot Workflow with a strict JSON system prompt produces reliable, parseable MCQs without chat hallucination or conversational filler."*

### Q2: "How do you prevent students from cheating on the client side?"
**Answer:** *"The browser only sends `{ quizId, answers: { [questionId]: selectedIndex } }`. The server route `/api/quiz/submit` queries the true `correct_answer` values from the database, authoritatively grades the answers, calculates the score and percentage, and logs the attempt. The client has zero authority over scoring."*

### Q3: "What happens if Google Colab or your Dify server disconnects?"
**Answer:** *"We built a Smart Mock Fallback in `src/lib/dify/client.ts`. If Dify times out or is unreachable, the system catches the error and smoothly serves grounded sample material with a clear status notice, ensuring the software remains functional and responsive."*
