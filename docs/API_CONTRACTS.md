# Student 3 API Contracts & Schema Documentation

All endpoints are built using Next.js App Router route handlers located under `src/app/api/`.

---

## 1. POST `/api/quiz/generate`
Generates a structured multiple choice quiz grounded in the specified study document.

### Request Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "documentId": "00000000-0000-0000-0000-000000000001",
  "topic": "Coffman Conditions for Deadlock",
  "numberOfQuestions": 5,
  "difficulty": "medium"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `documentId` | String (UUID) | Yes | Identifier of the uploaded document |
| `topic` | String | Yes | Specific chapter or focus topic (min 2 chars) |
| `numberOfQuestions` | Integer | No (default: 5) | Count of questions (1-20) |
| `difficulty` | String | No (default: 'medium') | `'easy'` \| `'medium'` \| `'hard'` |

### Success Response (`200 OK`)
```json
{
  "success": true,
  "quiz": {
    "id": "c1f7b882-6f29-4e08-9df2-47d341998592",
    "title": "Assessment: Coffman Conditions for Deadlock",
    "topic": "Coffman Conditions for Deadlock",
    "documentId": "00000000-0000-0000-0000-000000000001",
    "totalQuestions": 5,
    "difficulty": "medium",
    "isMock": false,
    "questions": [
      {
        "id": "q-101",
        "question": "Which of the following is NOT one of Coffman's four necessary conditions for deadlock?",
        "options": [
          "Mutual Exclusion",
          "Hold and Wait",
          "Preemption Allowed",
          "Circular Wait"
        ],
        "correctAnswer": 2,
        "explanation": "No preemption is the condition. Allowing preemption prevents deadlocks."
      }
    ]
  }
}
```

---

## 2. POST `/api/quiz/submit`
Authoritatively evaluates a student's quiz answers against server-side answer keys, calculates score and percentage, and logs the attempt.

### Request Body
```json
{
  "quizId": "c1f7b882-6f29-4e08-9df2-47d341998592",
  "answers": {
    "q-101": 2,
    "q-102": 1,
    "q-103": 0
  }
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "result": {
    "attemptId": "a9d8c7b6-5e4f-3a2b-1c0d-e9f8a7b6c5d4",
    "quizId": "c1f7b882-6f29-4e08-9df2-47d341998592",
    "score": 4,
    "totalQuestions": 5,
    "percentage": 80,
    "passed": true,
    "submittedAt": "2026-11-14T10:30:00.000Z",
    "details": [
      {
        "questionId": "q-101",
        "question": "Which of the following is NOT one of Coffman's four necessary conditions for deadlock?",
        "options": [
          "Mutual Exclusion",
          "Hold and Wait",
          "Preemption Allowed",
          "Circular Wait"
        ],
        "selectedAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "explanation": "No preemption is the condition. Allowing preemption prevents deadlocks."
      }
    ]
  }
}
```

---

## 3. GET `/api/quiz/history`
Returns past quiz attempts for the signed-in user.

### Success Response (`200 OK`)
```json
{
  "success": true,
  "attempts": [
    {
      "id": "attempt-uuid",
      "quizId": "quiz-uuid",
      "quizTitle": "Operating Systems - Deadlocks & Resource Allocation",
      "topic": "Deadlocks",
      "score": 4,
      "totalQuestions": 5,
      "percentage": 80,
      "createdAt": "2026-11-14T09:45:00.000Z"
    }
  ]
}
```

---

## 4. POST `/api/flashcards/generate`
Extracts high-yield concept-explanation pairs from the document.

### Request Body
```json
{
  "documentId": "00000000-0000-0000-0000-000000000001",
  "topic": "Deadlocks",
  "numberOfCards": 5
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "title": "Study Deck: Deadlocks",
  "isMock": false,
  "cards": [
    {
      "id": "fc-101",
      "userId": "user-uuid",
      "documentId": "doc-uuid",
      "topic": "Deadlocks",
      "front": "What is a Deadlock in an Operating System?",
      "back": "A permanent state where two or more processes are blocked because each is waiting for a resource held by another.",
      "status": "NEW",
      "createdAt": "2026-11-14T10:00:00.000Z"
    }
  ]
}
```

---

## 5. PATCH `/api/flashcards/[id]`
Updates review status for spaced repetition / self-assessment tracking.

### Request Body
```json
{
  "status": "KNOWN"
}
```
*(Options: `'NEW'` | `'KNOWN'` | `'NEED_REVISION'`)*

### Success Response (`200 OK`)
```json
{
  "success": true,
  "cardId": "fc-101",
  "status": "KNOWN",
  "updatedAt": "2026-11-14T10:15:00.000Z"
}
```
