import { NextRequest, NextResponse } from 'next/server';
import { createServerAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { QuizAttemptSummary } from '@/types/learning';

export async function GET(request: NextRequest) {
  try {
    const defaultUserId = '11111111-1111-1111-1111-111111111111';
    let attempts: QuizAttemptSummary[] = [];

    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          quiz_id,
          score,
          total_questions,
          percentage,
          created_at,
          quizzes (
            title,
            topic
          )
        `)
        .eq('user_id', defaultUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Quiz History API] Error fetching attempts:', error);
      } else if (data) {
        attempts = data.map((item: any) => ({
          id: item.id,
          quizId: item.quiz_id,
          quizTitle: item.quizzes?.title || 'Assessment Quiz',
          topic: item.quizzes?.topic || 'General Topic',
          score: item.score,
          totalQuestions: item.total_questions,
          percentage: Number(item.percentage) || Math.round((item.score / item.total_questions) * 100),
          createdAt: item.created_at,
        }));
      }
    }

    // If database is empty or offline, return a realistic sample attempt
    if (attempts.length === 0) {
      attempts = [
        {
          id: 'demo-attempt-001',
          quizId: '22222222-2222-2222-2222-222222222222',
          quizTitle: 'Operating Systems - Deadlocks & Resource Allocation',
          topic: 'Deadlocks',
          score: 4,
          totalQuestions: 5,
          percentage: 80,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      attempts,
    });
  } catch (error: any) {
    console.error('[Quiz History API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch quiz history' },
      { status: 500 }
    );
  }
}
