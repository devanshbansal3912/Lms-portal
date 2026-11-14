'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Brain, 
  Layers, 
  ShieldCheck, 
  Server, 
  Database, 
  Sparkles, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function Student3HubPage() {
  const modules = [
    {
      title: 'In-App PDF Reader',
      description: 'Embedded interactive document reader with page navigation, zoom in/out, fullscreen, and authorization checking.',
      href: '/reader',
      icon: BookOpen,
      badge: 'Interactive Component',
      color: 'from-blue-600 to-indigo-600',
      action: 'Open PDF Reader',
      features: ['Page Controls & Counter', 'Zoom (50% - 250%)', 'Rotation & Fullscreen', 'Embed/Object Fallback'],
    },
    {
      title: 'AI Quiz Generation & Scoring',
      description: 'Generates structured MCQs from study materials with strict schema validation and authoritative server-side scoring.',
      href: '/quiz',
      icon: Brain,
      badge: 'Dify Workflow + API',
      color: 'from-indigo-600 to-violet-600',
      action: 'Launch Quiz Engine',
      features: ['Single-Shot Workflow', 'Strict 4-Option Schema', 'Authoritative Server Grading', 'Grounded Explanations'],
    },
    {
      title: 'AI Flashcards & Mastery Tracking',
      description: 'Extracts concise front/back concept pairs, renders 3D flip card review, and records student mastery progress.',
      href: '/flashcards',
      icon: Layers,
      badge: 'Dify Workflow + Persistence',
      color: 'from-violet-600 to-purple-600',
      action: 'Open Flashcards Deck',
      features: ['3D Flip Card Animation', 'Known / Need Revision Rating', 'Deck Shuffle & Reset', 'Mastery Percentage'],
    },
  ];

  const integrationDeliverables = [
    { title: 'PostgreSQL Migration & RLS', path: 'supabase/migrations/20261114_001_student3_learning_schema.sql', status: 'Ready' },
    { title: 'Dify Quiz Workflow DSL', path: 'dify_workflows/quiz_generation_workflow.yml', status: 'Ready' },
    { title: 'Dify Flashcard Workflow DSL', path: 'dify_workflows/flashcard_generation_workflow.yml', status: 'Ready' },
    { title: 'Student 1 & 2 Handover Guide', path: 'docs/STUDENT_3_HANDOVER.md', status: 'Ready' },
    { title: 'Exhaustive API Contracts', path: 'docs/API_CONTRACTS.md', status: 'Ready' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-semibold text-indigo-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>48-Hour Hackathon Execution • Student 3 Module</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Learning Features, PDF Reader &amp; Assessment Engine
          </h1>
          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            Welcome to the Student 3 workspace. This module provides the in-app document viewer,
            AI quiz generation with server-authoritative scoring, flashcards, database schema, and Dify workflows.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/reader"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
            >
              <span>Test PDF Reader</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/quiz"
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl flex items-center space-x-2 transition"
            >
              <span>Try AI Quiz Engine</span>
            </Link>

            <Link
              href="/flashcards"
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl flex items-center space-x-2 transition"
            >
              <span>Review Flashcards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;

          return (
            <div
              key={mod.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {mod.description}
                </p>

                <div className="space-y-1.5 mb-6">
                  {mod.features.map((feat) => (
                    <div key={feat} className="flex items-center space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={mod.href}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition border border-slate-700"
              >
                <span>{mod.action}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* System Status & Resilience Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Production Deliverables &amp; Artifacts</h3>
              <p className="text-xs text-slate-400">Ready for instant integration with Student 1 &amp; Student 2</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {integrationDeliverables.map((item) => (
              <div key={item.path} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">{item.title}</span>
                  <span className="font-mono text-slate-500 text-[11px]">{item.path}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-semibold">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Resilience Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resilience Engine</h3>
                <p className="text-xs text-slate-400">Zero demo failures guaranteed</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              If Google Colab or external Dify tunnels expire during evaluation, the backend automatically
              engages <strong>Smart Mock Mode</strong> using grounded Operating Systems study material.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Supabase Connection:</span>
                <span className="text-emerald-400 font-semibold">Configured / Fallback Ready</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Dify Workflow Gateway:</span>
                <span className="text-indigo-400 font-semibold">REST Proxy Enabled</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Scoring Engine:</span>
                <span className="text-emerald-400 font-semibold">Server-Authoritative</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Student 3 Ready for Day 1 Checkpoint &amp; Day 2 Integration
          </div>
        </div>
      </div>
    </div>
  );
}
