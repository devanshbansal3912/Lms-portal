'use client';

import React, { useState, useEffect } from 'react';
import { FlashcardGenerator } from '@/components/flashcards/FlashcardGenerator';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { Layers, Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import type { Flashcard } from '@/types/learning';
import { MOCK_DOCUMENTS, MOCK_FLASHCARDS_OS_DEADLOCKS } from '@/lib/mock/learningMockData';

type FlashcardViewMode = 'deck' | 'generate';

export default function FlashcardsPage() {
  const [viewMode, setViewMode] = useState<FlashcardViewMode>('deck');
  const [cards, setCards] = useState<Flashcard[]>(MOCK_FLASHCARDS_OS_DEADLOCKS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const defaultDoc = MOCK_DOCUMENTS[0];

  const fetchSavedCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/flashcards?documentId=${defaultDoc.id}`);
      const data = await response.json();
      if (data.success && data.cards && data.cards.length > 0) {
        setCards(data.cards);
      }
    } catch (err) {
      console.warn('[FlashcardsPage] Could not fetch saved cards, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const handleFlashcardsGenerated = (newCards: Flashcard[]) => {
    setCards(newCards);
    setViewMode('deck');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Student 3 Module • AI Flashcards &amp; Mastery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Study Flashcard Decks</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dify single-shot extraction of concise concept-explanation pairs with 3D flip card review and mastery tracking.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('deck')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'deck'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Review Deck ({cards.length})</span>
          </button>

          <button
            onClick={() => setViewMode('generate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'generate'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Deck</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="py-2">
        {viewMode === 'generate' ? (
          <div className="max-w-xl mx-auto">
            <FlashcardGenerator
              documentId={defaultDoc.id}
              documentTitle={defaultDoc.filename}
              onFlashcardsGenerated={handleFlashcardsGenerated}
            />
          </div>
        ) : (
          <div>
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
                <p className="text-sm">Loading flashcard deck...</p>
              </div>
            ) : (
              <FlashcardDeck
                cards={cards}
                onNewDeckRequest={() => setViewMode('generate')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
