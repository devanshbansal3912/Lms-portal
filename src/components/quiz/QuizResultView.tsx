'use client';

import React from 'react';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  PlusCircle, 
  BookOpen, 
  Award,
  ArrowRight
} from 'lucide-react';
import type { QuizSubmissionResult } from '@/types/learning';

interface QuizResultViewProps {
  result: QuizSubmissionResult;
  quizTitle?: string;
  onRetake: () => void;
  onNewQuiz: () => void;
  onViewHistory?: () => void;
}

export function QuizResultView({
  result,
  quizTitle = 'Assessment Quiz',
  onRetake,
  onNewQuiz,
  onViewHistory,
}: QuizResultViewProps) {
  const { score, totalQuestions, percentage, passed, details } = result;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 max-w-3xl mx-auto">
      {/* Banner Card */}
      <div 
        className={`rounded-2xl p-6 mb-8 text-center border relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/40 text-emerald-100'
            : 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500/40 text-amber-100'
        }`}
      >
        <div className="inline-flex p-3 rounded-full bg-slate-950/60 border border-slate-800 mb-3 shadow-inner">
          {passed ? (
            <Trophy className="w-8 h-8 text-emerald-400" />
          ) : (
            <Award className="w-8 h-8 text-amber-400" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {passed ? 'Assessment Completed!' : 'Keep Practicing!'}
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
          {passed
            ? 'Great mastery! Your answers demonstrate solid grasp of the document concepts.'
            : 'Review the explanations below and revisit the study document to strengthen weak areas.'}
        </p>

        {/* Big Score Numbers */}
        <div className="flex items-center justify-center space-x-6 my-5">
          <div className="text-center">
            <span className="block text-4xl sm:text-5xl font-black text-white tracking-tight">
              {score} <span className="text-2xl text-slate-400 font-normal">/ {totalQuestions}</span>
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Correct Answers
            </span>
          </div>

          <div className="h-10 w-px bg-slate-700" />

          <div className="text-center">
            <span 
              className={`block text-4xl sm:text-5xl font-black tracking-tight ${
                passed ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {percentage}%
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Final Grade
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onRetake}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={onNewQuiz}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Quiz</span>
          </button>

          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl border border-slate-800 flex items-center space-x-2 transition cursor-pointer"
            >
              <span>View History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Itemized Questions Review */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Grounded Explanations & Review</span>
        </h3>

        <div className="space-y-6">
          {details.map((item, idx) => (
            <div
              key={item.questionId}
              className={`p-5 rounded-2xl border transition-all ${
                item.isCorrect
                  ? 'bg-slate-950/60 border-emerald-500/30'
                  : 'bg-slate-950/60 border-red-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  QUESTION {idx + 1}
                </span>
                {item.isCorrect ? (
                  <span className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Correct</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incorrect</span>
                  </span>
                )}
              </div>

              <h4 className="text-base font-medium text-white mb-4 leading-relaxed">
                {item.question}
              </h4>

              {/* Options breakdown */}
              <div className="space-y-2 mb-4">
                {item.options.map((optText, optIdx) => {
                  const isUserSelection = item.selectedAnswer === optIdx;
                  const isCorrectOption = item.correctAnswer === optIdx;

                  let optClass = 'bg-slate-900 border-slate-800 text-slate-400';
                  if (isCorrectOption) {
                    optClass = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 font-medium';
                  } else if (isUserSelection && !item.isCorrect) {
                    optClass = 'bg-red-950/50 border-red-500/60 text-red-200 line-through';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-sm flex items-center space-x-3 ${optClass}`}
                    >
                      <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-slate-950/80">
                        {optionLabels[optIdx]}
                      </span>
                      <span className="flex-1">{optText}</span>
                      {isCorrectOption && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Correct Answer</span>
                        </span>
                      )}
                      {isUserSelection && !item.isCorrect && (
                        <span className="text-xs text-red-400 font-semibold">Your Pick</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grounded Explanation */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-indigo-400 block mb-1">
                  Document Grounded Explanation:
                </span>
                <p className="leading-relaxed text-slate-300">{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
