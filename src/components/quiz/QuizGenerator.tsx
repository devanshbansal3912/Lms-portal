'use client';

import React, { useState } from 'react';
import { Sparkles, Brain, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import type { Quiz } from '@/types/learning';

interface QuizGeneratorProps {
  documentId: string;
  documentTitle?: string;
  onQuizGenerated: (quiz: Quiz) => void;
}

export function QuizGenerator({
  documentId,
  documentTitle = 'Operating Systems Notes',
  onQuizGenerated,
}: QuizGeneratorProps) {
  const [topic, setTopic] = useState<string>('Deadlocks and Resource Allocation');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          topic: topic.trim(),
          numberOfQuestions,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      onQuizGenerated(data.quiz);
    } catch (err: any) {
      console.error('[QuizGenerator] Generation error:', err);
      setErrorMessage(err.message || 'Error communicating with quiz workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Quiz Generator</h3>
          <p className="text-xs text-slate-400">Generate verified MCQs grounded in your study document</p>
        </div>
      </div>

      <div className="mb-4 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-center space-x-2 text-xs text-slate-300">
        <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <span className="text-slate-400">Target Document:</span>
        <span className="font-semibold text-slate-200 truncate">{documentTitle}</span>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center space-x-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Study Topic / Focus Area
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Coffman Conditions, Banker's Algorithm, Safe States"
            required
            disabled={isGenerating}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Question Count
            </label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              disabled={isGenerating}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value={3}>3 Questions (Quick check)</option>
              <option value={5}>5 Questions (Recommended)</option>
              <option value={10}>10 Questions (Deep dive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              disabled={isGenerating}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="easy">Easy (Concept definitions)</option>
              <option value="medium">Medium (Application & logic)</option>
              <option value="hard">Hard (Analysis & scenarios)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Document & Generating MCQs...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Generate Quiz Questions</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
