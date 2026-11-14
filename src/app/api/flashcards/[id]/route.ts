import { NextRequest, NextResponse } from 'next/server';
import { FlashcardUpdateStatusSchema } from '@/lib/validation/flashcard';
import { createServerAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const cardId = params.id;
    const body = await request.json();
    const { status } = FlashcardUpdateStatusSchema.parse(body);
    const defaultUserId = '11111111-1111-1111-1111-111111111111';

    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();

      // Update flashcard status
      const { error: cardError } = await supabase
        .from('flashcards')
        .update({ status })
        .eq('id', cardId);

      if (cardError) {
        console.error('[Flashcard PATCH] Error updating card:', cardError);
      }

      // Upsert progress tracking record
      const { error: progressError } = await supabase
        .from('flashcard_progress')
        .upsert(
          {
            user_id: defaultUserId,
            flashcard_id: cardId,
            status,
            last_reviewed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,flashcard_id' }
        );

      if (progressError) {
        console.warn('[Flashcard PATCH] Progress tracking upsert notice:', progressError);
      }
    }

    return NextResponse.json({
      success: true,
      cardId,
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Flashcard PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update flashcard' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const cardId = params.id;

    if (isSupabaseConfigured) {
      const supabase = createServerAdminClient();
      const { error } = await supabase.from('flashcards').delete().eq('id', cardId);
      if (error) {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      cardId,
      deleted: true,
    });
  } catch (error: any) {
    console.error('[Flashcard DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete flashcard' },
      { status: 400 }
    );
  }
}
