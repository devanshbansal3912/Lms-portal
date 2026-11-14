'use client';

import React, { useState } from 'react';
import { QuizGenerator } from '@/components/quiz/QuizGenerator';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import { QuizResultView } from '@/components/quiz/QuizResultView';
import { QuizHistoryView } from '@/components/quiz/QuizHistoryView';
import { Brain, History, Sparkles, BookOpen } from 'lucide-react';
import type { Quiz, QuizSubmissionResult } from '@/types/learning';
import { MOCK_DOCUMENTS } from '@/lib/mock/learningMockData';

type QuizViewMode = 'generate' | 'taking' | 'result' | 'history';

export default function QuizPage() {
  const [viewMode, setViewMode] = useState<QuizViewMode>('generate');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResult | null>(null);

  const defaultDoc = MOCK_DOCUMENTS[0];

  const handleQuizGenerated = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setViewMode('taking');
  };

  const handleQuizCompleted = (result: QuizSubmissionResult) => {
    setSubmissionResult(result);
    setViewMode('result');
  };

  const handleRetake = () => {
    setViewMode('taking');
  };

  const handleNewQuiz = () => {
    setCurrentQuiz(null);
    setSubmissionResult(null);
    setViewMode('generate');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Student 3 Module • AI Quiz &amp; Assessment Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Interactive Assessment Quizzes</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Single-shot Dify Workflow generation with authoritative server-side grading and persistent score history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('generate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'generate' || viewMode === 'taking' || viewMode === 'result'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quiz Practice</span>
          </button>

          <button
            onClick={() => setViewMode('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'history'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Score History</span>
          </button>
        </div>
      </div>

      {/* View Switcher Container */}
      <div className="py-2">
        {viewMode === 'generate' && (
          <div className="max-w-xl mx-auto">
            <QuizGenerator
              documentId={defaultDoc.id}
              documentTitle={defaultDoc.filename}
              onQuizGenerated={handleQuizGenerated}
            />
          </div>
        )}

        {viewMode === 'taking' && currentQuiz && (
          <QuizPlayer
            quiz={currentQuiz}
            onComplete={handleQuizCompleted}
            onCancel={handleNewQuiz}
          />
        )}

        {viewMode === 'result' && submissionResult && (
          <QuizResultView
            result={submissionResult}
            quizTitle={currentQuiz?.title}
            onRetake={handleRetake}
            onNewQuiz={handleNewQuiz}
            onViewHistory={() => setViewMode('history')}
          />
        )}

        {viewMode === 'history' && (
          <div className="max-w-3xl mx-auto">
            <QuizHistoryView
              onSelectQuiz={() => setViewMode('generate')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
