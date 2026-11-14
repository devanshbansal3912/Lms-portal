'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { BookOpen, Brain, Layers, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MOCK_DOCUMENTS } from '@/lib/mock/learningMockData';

export default function ReaderPage() {
  const [selectedDocId, setSelectedDocId] = useState<string>(MOCK_DOCUMENTS[0].id);
  const [customPdfUrl, setCustomPdfUrl] = useState<string>('/sample_operating_systems_notes.pdf');

  const activeDoc = MOCK_DOCUMENTS.find((d) => d.id === selectedDocId) || MOCK_DOCUMENTS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Student 3 Module • Document In-App Reader</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Interactive PDF Reader</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View course notes with full page navigation, zoom scaling, and quick AI learning triggers.
          </p>
        </div>

        {/* Quick Launch Action Buttons for Current Document */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/quiz?documentId=${activeDoc.id}&topic=Deadlocks`}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
          >
            <Brain className="w-4 h-4" />
            <span>Generate Quiz</span>
          </Link>

          <Link
            href={`/flashcards?documentId=${activeDoc.id}&topic=Deadlocks`}
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md shadow-violet-600/20 transition"
          >
            <Layers className="w-4 h-4" />
            <span>Generate Flashcards</span>
          </Link>
        </div>
      </div>

      {/* Document Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-slate-400 block">Select Demo Document:</span>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setCustomPdfUrl('/sample_operating_systems_notes.pdf');
              }}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-indigo-500"
            >
              {MOCK_DOCUMENTS.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Document ID:</span>
            <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]">
              {activeDoc.id}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeDoc.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Embedded PDF Viewer */}
      <PdfViewer
        url={customPdfUrl}
        title={activeDoc.filename}
        initialPage={1}
      />
    </div>
  );
}
