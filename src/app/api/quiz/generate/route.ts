import { NextRequest, NextResponse } from 'next/server';
import { QuizGenerateRequestSchema } from '@/lib/validation/quiz';
import { runQuizWorkflow } from '@/lib/dify/client';
import { createServerAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = QuizGenerateRequestSchema.parse(body);

    const { documentId, topic, numberOfQuestions, difficulty } = validatedInput;

    // 1. Trigger the Dify Workflow (with automatic fallback to grounded mock if Dify is offline)
    const workflowResponse = await runQuizWorkflow({
      documentId,
      topic,
      numQuestions: numberOfQuestions,
    });

    const quizId = randomUUID();
    const defaultUserId = '11111111-1111-1111-1111-111111111111'; // Fallback demo user ID

    const formattedQuestions = workflowResponse.data.questions.map((q) => ({
      id: randomUUID(),
      quizId,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));

    // 2. Persist in Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();

      // Insert quiz record
      const { error: quizError } = await supabase.from('quizzes').insert({
        id: quizId,
        user_id: defaultUserId,
        document_id: documentId,
        title: workflowResponse.data.title,
        topic,
        total_questions: formattedQuestions.length,
        difficulty: difficulty || 'medium',
      });

      if (quizError) {
        console.error('[Quiz Generate API] Error persisting quiz in Supabase:', quizError);
      } else {
        // Insert quiz questions
        const questionsPayload = formattedQuestions.map((q) => ({
          id: q.id,
          quiz_id: quizId,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
        }));

        const { error: questionsError } = await supabase.from('quiz_questions').insert(questionsPayload as any);
        if (questionsError) {
          console.error('[Quiz Generate API] Error inserting questions:', questionsError);
        }
      }
    }

    // 3. Return the generated quiz to the frontend
    return NextResponse.json({
      success: true,
      quiz: {
        id: quizId,
        title: workflowResponse.data.title,
        topic,
        documentId,
        totalQuestions: formattedQuestions.length,
        difficulty: difficulty || 'medium',
        isMock: workflowResponse.isMock,
        questions: formattedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          // Hide correctAnswer from frontend if client only takes the test,
          // but include for demonstration purposes so client can verify
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
    });
  } catch (error: any) {
    console.error('[Quiz Generate API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate quiz',
      },
      { status: 400 }
    );
  }
}
