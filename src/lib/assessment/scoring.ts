import type { 
  QuizQuestion, 
  QuizSubmissionResult, 
  QuestionGradingDetail 
} from '@/types/learning';

export interface AuthoritativeScoringParams {
  attemptId: string;
  quizId: string;
  submittedAnswers: Record<string, number>;
  questions: QuizQuestion[];
  passingScorePercentage?: number;
}

/**
 * Authoritative Server-Side Scoring Engine
 * Never calculates or trusts quiz scores on the client browser!
 */
export function calculateAuthoritativeScore({
  attemptId,
  quizId,
  submittedAnswers,
  questions,
  passingScorePercentage = 60,
}: AuthoritativeScoringParams): QuizSubmissionResult {
  let score = 0;
  const totalQuestions = questions.length;
  const details: QuestionGradingDetail[] = [];

  for (const question of questions) {
    const selectedAnswer = submittedAnswers[question.id] ?? -1;
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      score += 1;
    }

    details.push({
      questionId: question.id,
      question: question.question,
      options: question.options,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
    });
  }

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= passingScorePercentage;

  return {
    attemptId,
    quizId,
    score,
    totalQuestions,
    percentage,
    passed,
    submittedAt: new Date().toISOString(),
    details,
  };
}
