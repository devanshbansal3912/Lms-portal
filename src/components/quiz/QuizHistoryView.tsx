'use client';

import React, { useState, useEffect } from 'react';
import { History, Award, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import type { QuizAttemptSummary } from '@/types/learning';

interface QuizHistoryViewProps {
  onSelectQuiz?: (quizId: string) => void;
}

export function QuizHistoryView({ onSelectQuiz }: QuizHistoryViewProps) {
  const [history, setHistory] = useState<QuizAttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/history');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch history');
      }

      setHistory(data.attempts || []);
    } catch (err: any) {
      console.error('[QuizHistoryView] Error:', err);
      setError(err.message || 'Error loading history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Quiz Attempt History</h3>
            <p className="text-xs text-slate-400">Past assessment scores and verified performance</p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center space-x-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading your test records...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm">No quiz attempts recorded yet.</p>
          <p className="text-xs text-slate-500 mt-1">Generate and complete a quiz to see your scores here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((attempt) => {
            const isPassing = attempt.percentage >= 60;
            const formattedDate = new Date(attempt.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={attempt.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {attempt.topic}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{attempt.quizTitle}</h4>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">
                      Score: {attempt.score} / {attempt.totalQuestions}
                    </span>
                    <span
                      className={`text-base font-bold ${
                        isPassing ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {attempt.percentage}%
                    </span>
                  </div>

                  {onSelectQuiz && (
                    <button
                      onClick={() => onSelectQuiz(attempt.quizId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                    >
                      Retake
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
