// Domain types for Student 3: Learning Features, PDF Reader, Quizzes & Flashcards

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type FlashcardReviewStatus = 'NEW' | 'KNOWN' | 'NEED_REVISION';

export interface DocumentReference {
  id: string;
  userId: string;
  filename: string;
  storagePath: string;
  difyDocumentId?: string | null;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  fileSizeBytes?: number;
  mimeType?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Quiz Types
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  id: string;
  quizId?: string;
  question: string;
  options: [string, string, string, string] | string[];
  correctAnswer: number; // 0, 1, 2, or 3
  explanation: string;
}

export interface Quiz {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  topic: string;
  totalQuestions: number;
  difficulty?: DifficultyLevel;
  createdAt: string;
  questions?: QuizQuestion[];
}

export interface QuizGenerateRequest {
  documentId: string;
  topic: string;
  numberOfQuestions?: number;
  difficulty?: DifficultyLevel;
}

export interface QuizSubmissionRequest {
  quizId: string;
  // Map of question id to chosen answer index (0-3)
  answers: Record<string, number>;
}

export interface QuestionGradingDetail {
  questionId: string;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmissionResult {
  attemptId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  details: QuestionGradingDetail[];
}

export interface QuizAttemptSummary {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Flashcard Types
// ---------------------------------------------------------------------------

export interface Flashcard {
  id: string;
  userId: string;
  documentId: string;
  topic: string;
  front: string; // Question or concept prompt
  back: string;  // Concise grounded explanation
  status: FlashcardReviewStatus;
  createdAt: string;
}

export interface FlashcardGenerateRequest {
  documentId: string;
  topic: string;
  numberOfCards?: number;
}

export interface FlashcardDeckSummary {
  topic: string;
  totalCards: number;
  knownCards: number;
  needRevisionCards: number;
  newCards: number;
  cards: Flashcard[];
}

// ---------------------------------------------------------------------------
// Dify Workflow Schemas
// ---------------------------------------------------------------------------

export interface DifyWorkflowRunRequest {
  inputs: Record<string, any>;
  response_mode: 'blocking' | 'streaming';
  user: string;
}

export interface DifyWorkflowRunResponse {
  log_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'succeeded' | 'failed' | 'stopped';
    outputs: {
      result?: string;
      json?: any;
      [key: string]: any;
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}
