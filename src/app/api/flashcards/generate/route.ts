import { NextRequest, NextResponse } from 'next/server';
import { FlashcardGenerateRequestSchema } from '@/lib/validation/flashcard';
import { runFlashcardWorkflow } from '@/lib/dify/client';
import { createServerAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';
import type { Flashcard } from '@/types/learning';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = FlashcardGenerateRequestSchema.parse(body);

    const { documentId, topic, numberOfCards } = validatedInput;
    const defaultUserId = '11111111-1111-1111-1111-111111111111';

    // 1. Run Dify Flashcard Workflow
    const workflowResponse = await runFlashcardWorkflow({
      documentId,
      topic,
      numCards: numberOfCards,
    });

    const generatedCards: Flashcard[] = workflowResponse.data.cards.map((card) => ({
      id: randomUUID(),
      userId: defaultUserId,
      documentId,
      topic,
      front: card.front,
      back: card.back,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    }));

    // 2. Persist in Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();
      const insertPayload = generatedCards.map((c) => ({
        id: c.id,
        user_id: defaultUserId,
        document_id: documentId,
        topic,
        front: c.front,
        back: c.back,
        status: 'NEW',
      }));

      const { error: insertError } = await supabase.from('flashcards').insert(insertPayload as any);
      if (insertError) {
        console.error('[Flashcards Generate API] Error persisting flashcards:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      title: workflowResponse.data.title,
      isMock: workflowResponse.isMock,
      cards: generatedCards,
    });
  } catch (error: any) {
    console.error('[Flashcards Generate API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate flashcards' },
      { status: 400 }
    );
  }
}
