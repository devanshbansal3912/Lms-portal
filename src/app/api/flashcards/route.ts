import { NextRequest, NextResponse } from 'next/server';
import { createServerAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { MOCK_FLASHCARDS_OS_DEADLOCKS } from '@/lib/mock/learningMockData';
import type { Flashcard } from '@/types/learning';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const topic = searchParams.get('topic');
    const defaultUserId = '11111111-1111-1111-1111-111111111111';

    let cards: Flashcard[] = [];

    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();
      let query = supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', defaultUserId)
        .order('created_at', { ascending: false });

      if (documentId) {
        query = query.eq('document_id', documentId);
      }
      if (topic) {
        query = query.eq('topic', topic);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Flashcards API] Error fetching flashcards:', error);
      } else if (data && data.length > 0) {
        cards = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          documentId: row.document_id,
          topic: row.topic,
          front: row.front,
          back: row.back,
          status: row.status,
          createdAt: row.created_at,
        }));
      }
    }

    // Fallback if empty or Supabase not yet seeded
    if (cards.length === 0) {
      cards = MOCK_FLASHCARDS_OS_DEADLOCKS;
    }

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error: any) {
    console.error('[Flashcards API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}
