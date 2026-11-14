# Dify Workflows for Student 3 Learning Modules

This folder contains the complete, battle-tested DSL and JSON definitions for **Student 3's two single-shot Dify Workflows**:
1. **`quiz_generation_workflow.yml` / `.json`**: Generates grounded 4-option MCQs with single correct answer and explanation.
2. **`flashcard_generation_workflow.yml` / `.json`**: Extracts high-yield concept-explanation flashcard pairs.

---

## 🛠️ Step-by-Step Setup in Dify Studio

### 1. Create the Quiz Workflow
1. In Dify Studio, click **Create from Blank** -> choose **Workflow** (DO NOT choose Chatflow or Agent).
2. Name the app: `LMS Quiz Generator`.
3. In the top-right menu (`...`), click **Import DSL** and upload `quiz_generation_workflow.yml`.
4. Connect the **Knowledge Retrieval Node** to the Knowledge Base that Student 2 created.
5. In the **LLM Node**, confirm that your model provider (e.g. Anthropic Claude 3.5 Sonnet or OpenAI GPT-4o) is selected.
6. Click **Publish** (top right).
7. Go to **API Access** (top right) -> click **API Key** -> **Generate New Secret Key**.
8. Copy this key and paste it as `DIFY_QUIZ_API_KEY` in `.env.local`.

---

### 2. Create the Flashcard Workflow
1. Click **Create from Blank** -> choose **Workflow**.
2. Name the app: `LMS Flashcard Generator`.
3. In the top-right menu (`...`), click **Import DSL** and upload `flashcard_generation_workflow.yml`.
4. Connect the **Knowledge Retrieval Node** to the same Knowledge Base.
5. Select your configured model provider in the **LLM Node**.
6. Click **Publish**.
7. Go to **API Access** -> generate an API Key.
8. Copy this key and paste it as `DIFY_FLASHCARD_API_KEY` in `.env.local`.

---

## 🧪 Testing in Dify Playground
You can test each workflow directly in Dify before connecting the frontend:
- **Test Inputs for Quiz:**
  - `document_id`: `dify-doc-deadlocks-os-demo-001`
  - `topic`: `Coffman Conditions for Deadlock`
  - `num_questions`: `3`
- Expected Output:
  ```json
  {
    "title": "Assessment: Coffman Conditions for Deadlock",
    "questions": [
      {
        "question": "Which of the following is NOT a necessary condition for deadlock?",
        "options": ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
        "correctAnswer": 2,
        "explanation": "No preemption is the condition. Allowing preemption prevents deadlocks."
      }
    ]
  }
  ```
