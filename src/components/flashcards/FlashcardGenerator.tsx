'use client';

import React, { useState } from 'react';
import { Layers, Sparkles, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import type { Flashcard } from '@/types/learning';

interface FlashcardGeneratorProps {
  documentId: string;
  documentTitle?: string;
  onFlashcardsGenerated: (cards: Flashcard[]) => void;
}

export function FlashcardGenerator({
  documentId,
  documentTitle = 'Operating Systems Notes',
  onFlashcardsGenerated,
}: FlashcardGeneratorProps) {
  const [topic, setTopic] = useState<string>('Deadlocks and Resource Allocation');
  const [numberOfCards, setNumberOfCards] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          topic: topic.trim(),
          numberOfCards,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      onFlashcardsGenerated(data.cards);
    } catch (err: any) {
      console.error('[FlashcardGenerator] Error:', err);
      setError(err.message || 'Error generating cards');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Flashcard Generator</h3>
          <p className="text-xs text-slate-400">Extract high-yield concepts & definitions from your document</p>
        </div>
      </div>

      <div className="mb-4 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-center space-x-2 text-xs text-slate-300">
        <BookOpen className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <span className="text-slate-400">Source Document:</span>
        <span className="font-semibold text-slate-200 truncate">{documentTitle}</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center space-x-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Study Concept / Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Coffman Conditions, Resource Allocation Graphs"
            required
            disabled={isGenerating}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Number of Cards
          </label>
          <select
            value={numberOfCards}
            onChange={(e) => setNumberOfCards(Number(e.target.value))}
            disabled={isGenerating}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition"
          >
            <option value={3}>3 Cards (Micro revision)</option>
            <option value={5}>5 Cards (Standard deck)</option>
            <option value={10}>10 Cards (Complete chapter)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-violet-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Synthesizing Flashcard Deck...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-violet-200" />
              <span>Generate Flashcards</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
