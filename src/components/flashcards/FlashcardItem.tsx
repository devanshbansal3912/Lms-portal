'use client';

import React from 'react';
import { RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Flashcard } from '@/types/learning';

interface FlashcardItemProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export function FlashcardItem({
  card,
  isFlipped,
  onFlip,
  className = '',
}: FlashcardItemProps) {
  return (
    <div
      onClick={onFlip}
      className={`w-full h-80 cursor-pointer select-none [perspective:1000px] ${className}`}
    >
      <div
        className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-700/80 rounded-3xl p-8 flex flex-col justify-between shadow-2xl [backface-visibility:hidden]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
              {card.topic}
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to reveal answer</span>
            </div>
          </div>

          <div className="my-auto text-center px-4">
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase block mb-3">
              Concept / Question
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {card.front}
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/60">
            <span>Status: {card.status}</span>
            <span className="text-indigo-400 font-medium">Flip Card ↻</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
              Grounded Explanation
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to view question</span>
            </div>
          </div>

          <div className="my-auto overflow-y-auto max-h-48 px-2 text-center">
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal whitespace-pre-line">
              {card.back}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/60">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified against document</span>
            </span>
            <span className="text-indigo-300 font-medium">Flip Back ↺</span>
          </div>
        </div>
      </div>
    </div>
  );
}
