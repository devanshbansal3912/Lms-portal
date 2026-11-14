import { 
  extractAndParseJson, 
  QuizWorkflowOutputSchema, 
  type QuizWorkflowOutput 
} from '@/lib/validation/quiz';
import { 
  extractAndParseFlashcardJson, 
  FlashcardWorkflowOutputSchema, 
  type FlashcardWorkflowOutput 
} from '@/lib/validation/flashcard';
import { 
  MOCK_QUIZ_OS_DEADLOCKS, 
  MOCK_FLASHCARDS_OS_DEADLOCKS 
} from '@/lib/mock/learningMockData';
import type { DifyWorkflowRunResponse } from '@/types/learning';

const DIFY_API_BASE_URL = (process.env.DIFY_API_BASE_URL || 'http://localhost/v1').replace(/\/+$/, '');
const DIFY_QUIZ_API_KEY = process.env.DIFY_QUIZ_API_KEY || '';
const DIFY_FLASHCARD_API_KEY = process.env.DIFY_FLASHCARD_API_KEY || '';
const FORCE_MOCK = process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK === 'true';

interface RunWorkflowParams {
  apiKey: string;
  inputs: Record<string, any>;
  user?: string;
  timeoutMs?: number;
}

/**
 * Generic runner for single-shot Dify Workflows (POST /v1/workflows/run)
 */
async function callDifyWorkflow({
  apiKey,
  inputs,
  user = 'student-3-client',
  timeoutMs = 45000,
}: RunWorkflowParams): Promise<DifyWorkflowRunResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const endpoint = `${DIFY_API_BASE_URL}/workflows/run`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs,
        response_mode: 'blocking',
        user,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Dify API error (${response.status}): ${errBody || response.statusText}`);
    }

    const data: DifyWorkflowRunResponse = await response.json();
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Executes the Dify Quiz Generation Workflow
 */
export async function runQuizWorkflow(params: {
  documentId: string;
  topic: string;
  numQuestions: number;
  userId?: string;
}): Promise<{ data: QuizWorkflowOutput; isMock: boolean; rawResult?: any }> {
  // Check if credentials are missing or mock mode is requested
  const isKeyAvailable = Boolean(DIFY_QUIZ_API_KEY && !DIFY_QUIZ_API_KEY.includes('yourQuiz'));

  if (FORCE_MOCK || !isKeyAvailable) {
    console.info('[Dify Client] Dify API key not present or mock enabled. Using grounded sample quiz.');
    return {
      data: {
        title: `Quiz: ${params.topic}`,
        questions: MOCK_QUIZ_OS_DEADLOCKS.questions.slice(0, params.numQuestions),
      },
      isMock: true,
    };
  }

  try {
    const result = await callDifyWorkflow({
      apiKey: DIFY_QUIZ_API_KEY,
      inputs: {
        document_id: params.documentId,
        topic: params.topic,
        num_questions: params.numQuestions,
      },
      user: params.userId || 'student-3-session',
    });

    // Dify workflow output can be in outputs.result or outputs.json
    const rawOutput = result.data?.outputs?.result || result.data?.outputs?.json || JSON.stringify(result.data?.outputs);
    
    if (!rawOutput) {
      throw new Error('Dify Workflow returned empty outputs');
    }

    const validatedQuiz = typeof rawOutput === 'string'
      ? extractAndParseJson(rawOutput, QuizWorkflowOutputSchema)
      : QuizWorkflowOutputSchema.parse(rawOutput);

    return {
      data: validatedQuiz,
      isMock: false,
      rawResult: result,
    };
  } catch (error) {
    console.warn('[Dify Client] Quiz Workflow failed or Colab/Dify unreachable. Falling back to grounded mock data:', error);
    return {
      data: {
        title: `Assessment: ${params.topic} (Grounded Demo)`,
        questions: MOCK_QUIZ_OS_DEADLOCKS.questions.slice(0, params.numQuestions),
      },
      isMock: true,
    };
  }
}

/**
 * Executes the Dify Flashcard Generation Workflow
 */
export async function runFlashcardWorkflow(params: {
  documentId: string;
  topic: string;
  numCards: number;
  userId?: string;
}): Promise<{ data: FlashcardWorkflowOutput; isMock: boolean; rawResult?: any }> {
  const isKeyAvailable = Boolean(DIFY_FLASHCARD_API_KEY && !DIFY_FLASHCARD_API_KEY.includes('yourFlashcard'));

  if (FORCE_MOCK || !isKeyAvailable) {
    console.info('[Dify Client] Flashcard API key missing or mock enabled. Using grounded sample flashcards.');
    return {
      data: {
        title: `Flashcards: ${params.topic}`,
        cards: MOCK_FLASHCARDS_OS_DEADLOCKS.slice(0, params.numCards).map((c) => ({
          front: c.front,
          back: c.back,
        })),
      },
      isMock: true,
    };
  }

  try {
    const result = await callDifyWorkflow({
      apiKey: DIFY_FLASHCARD_API_KEY,
      inputs: {
        document_id: params.documentId,
        topic: params.topic,
        num_cards: params.numCards,
      },
      user: params.userId || 'student-3-session',
    });

    const rawOutput = result.data?.outputs?.result || result.data?.outputs?.json || JSON.stringify(result.data?.outputs);

    if (!rawOutput) {
      throw new Error('Dify Flashcard Workflow returned empty outputs');
    }

    const validatedFlashcards = typeof rawOutput === 'string'
      ? extractAndParseFlashcardJson(rawOutput, FlashcardWorkflowOutputSchema)
      : FlashcardWorkflowOutputSchema.parse(rawOutput);

    return {
      data: validatedFlashcards,
      isMock: false,
      rawResult: result,
    };
  } catch (error) {
    console.warn('[Dify Client] Flashcard Workflow failed or Dify unreachable. Falling back to grounded mock data:', error);
    return {
      data: {
        title: `Flashcards: ${params.topic} (Grounded Demo)`,
        cards: MOCK_FLASHCARDS_OS_DEADLOCKS.slice(0, params.numCards).map((c) => ({
          front: c.front,
          back: c.back,
        })),
      },
      isMock: true,
    };
  }
}
