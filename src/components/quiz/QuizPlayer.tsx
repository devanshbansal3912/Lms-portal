'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Clock, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import type { Quiz, QuizSubmissionResult } from '@/types/learning';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (result: QuizSubmissionResult) => void;
  onCancel: () => void;
}

export function QuizPlayer({ quiz, onComplete, onCancel }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: selectedAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      onComplete(data.result);
    } catch (err: any) {
      console.error('[QuizPlayer] Submission error:', err);
      setErrorMessage(err.message || 'Error grading quiz');
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-300">
        <p>No questions found in this quiz.</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-sm">
          Return
        </button>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 max-w-3xl mx-auto">
      {/* Quiz Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            {quiz.topic}
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">{quiz.title}</h2>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Untimed Practice</span>
          </span>
          <span className="bg-indigo-950/80 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-800/60 font-semibold">
            {answeredCount} / {totalQuestions} answered
          </span>
        </div>
      </div>

      {/* Question Progress Dots */}
      <div className="flex items-center space-x-1.5 my-5 overflow-x-auto pb-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = selectedAnswers[q.id] !== undefined;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-1 min-w-[28px] h-2 rounded-full transition-all duration-200 ${
                isCurrent 
                  ? 'bg-indigo-500 scale-105' 
                  : isAnswered 
                  ? 'bg-emerald-500/80' 
                  : 'bg-slate-800'
              }`}
              title={`Question ${idx + 1}`}
            />
          );
        })}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center space-x-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Question Box */}
      <div className="my-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>QUESTION {currentIndex + 1} OF {totalQuestions}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-white leading-relaxed">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((optionText, optIdx) => {
          const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(optIdx)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start space-x-3.5 group cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                }`}
              >
                {optionLabels[optIdx]}
              </span>
              <span className="text-sm pt-0.5 leading-snug flex-1">{optionText}</span>
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation & Submission Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl flex items-center space-x-1.5 transition disabled:opacity-30 disabled:hover:bg-slate-800 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 shadow-lg transition cursor-pointer ${
                isAllAnswered
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Grading Answers...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isAllAnswered ? 'Submit & Grade' : 'Submit Quiz'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
