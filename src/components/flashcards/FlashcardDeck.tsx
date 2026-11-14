'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Shuffle, 
  RotateCcw,
  Sparkles,
  Trophy
} from 'lucide-react';
import { FlashcardItem } from './FlashcardItem';
import type { Flashcard, FlashcardReviewStatus } from '@/types/learning';

interface FlashcardDeckProps {
  cards: Flashcard[];
  onNewDeckRequest?: () => void;
}

export function FlashcardDeck({ cards: initialCards, onNewDeckRequest }: FlashcardDeckProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex];

  const knownCount = cards.filter((c) => c.status === 'KNOWN').length;
  const needRevisionCount = cards.filter((c) => c.status === 'NEED_REVISION').length;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  const handleUpdateStatus = async (status: FlashcardReviewStatus) => {
    if (!currentCard || isUpdatingStatus) return;

    setIsUpdatingStatus(true);

    // Optimistic UI update
    const updatedCards = cards.map((c, i) =>
      i === currentIndex ? { ...c, status } : c
    );
    setCards(updatedCards);

    try {
      await fetch(`/api/flashcards/${currentCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('[FlashcardDeck] Error updating card review status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }

    // Auto-advance to next card after marking
    if (currentIndex < totalCards - 1) {
      setTimeout(() => {
        handleNext();
      }, 300);
    }
  };

  if (!currentCard) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 max-w-xl mx-auto">
        <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Deck is Empty</h3>
        <p className="text-sm text-slate-400 mb-4">No flashcards currently available in this deck.</p>
        {onNewDeckRequest && (
          <button
            onClick={onNewDeckRequest}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl"
          >
            Generate New Deck
          </button>
        )}
      </div>
    );
  }

  const masteryPercentage = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Deck Header & Mastery Bar */}
      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white text-sm">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{knownCount} Known</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{needRevisionCount} Need Revision</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Mastery:</span>
          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
          <span className="font-mono font-bold text-emerald-400">{masteryPercentage}%</span>
        </div>
      </div>

      {/* Flip Card Container */}
      <FlashcardItem
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped((prev) => !prev)}
      />

      {/* Action Buttons: Status Rating */}
      <div className="grid grid-cols-2 gap-3 my-6">
        <button
          onClick={() => handleUpdateStatus('NEED_REVISION')}
          disabled={isUpdatingStatus}
          className="py-3 px-4 bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 text-amber-300 text-sm font-semibold rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Need Revision</span>
        </button>

        <button
          onClick={() => handleUpdateStatus('KNOWN')}
          disabled={isUpdatingStatus}
          className="py-3 px-4 bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-emerald-300 text-sm font-semibold rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Mark as Known</span>
        </button>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center justify-between pt-2 text-slate-400">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm flex items-center space-x-1.5 transition disabled:opacity-30 cursor-pointer text-slate-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev Card</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShuffle}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition cursor-pointer text-slate-300"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition cursor-pointer text-slate-300"
            title="Restart Deck"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex >= totalCards - 1}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm flex items-center space-x-1.5 transition disabled:opacity-30 cursor-pointer text-slate-300"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
