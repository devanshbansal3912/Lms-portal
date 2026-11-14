import { NextRequest, NextResponse } from 'next/server';
import { QuizSubmissionRequestSchema } from '@/lib/validation/quiz';
import { calculateAuthoritativeScore } from '@/lib/assessment/scoring';
import { createServerAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { MOCK_QUIZ_OS_DEADLOCKS } from '@/lib/mock/learningMockData';
import { randomUUID } from 'crypto';
import type { QuizQuestion } from '@/types/learning';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, answers } = QuizSubmissionRequestSchema.parse(body);

    let questions: QuizQuestion[] = [];
    const defaultUserId = '11111111-1111-1111-1111-111111111111';

    // 1. Fetch official questions and correct answers from Supabase
    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (error) {
        console.error('[Quiz Submit API] Error querying quiz questions:', error);
      } else if (data && data.length > 0) {
        questions = data.map((q: any) => ({
          id: q.id,
          quizId: q.quiz_id,
          question: q.question,
          options: q.options as string[],
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
        }));
      }
    }

    // Fallback: If questions not found in DB (e.g. testing with sample quiz), use mock questions
    if (questions.length === 0) {
      questions = MOCK_QUIZ_OS_DEADLOCKS.questions.map((q) => ({
        id: q.id,
        quizId,
        question: q.question,
        options: q.options as [string, string, string, string],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
    }

    const attemptId = randomUUID();

    // 2. Authoritative server-side grading
    const gradingResult = calculateAuthoritativeScore({
      attemptId,
      quizId,
      submittedAnswers: answers,
      questions,
      passingScorePercentage: 60,
    });

    // 3. Persist attempt in Supabase
    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();
      const { error: attemptError } = await supabase.from('quiz_attempts').insert({
        id: attemptId,
        quiz_id: quizId,
        user_id: defaultUserId,
        score: gradingResult.score,
        total_questions: gradingResult.totalQuestions,
        answers: answers as any,
      });

      if (attemptError) {
        console.error('[Quiz Submit API] Failed to persist quiz attempt:', attemptError);
      }
    }

    return NextResponse.json({
      success: true,
      result: gradingResult,
    });
  } catch (error: any) {
    console.error('[Quiz Submit API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to grade quiz attempt',
      },
      { status: 400 }
    );
  }
}
