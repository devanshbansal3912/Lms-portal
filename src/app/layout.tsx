import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI LMS - Student 3 Learning Features',
  description: 'In-app PDF Reader, AI Quiz Generator & Authoritative Scoring, AI Flashcards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>AI-Powered Personalized Learning Management System • Student 3 Module</p>
            <p className="mt-1 text-slate-600">Built for Next.js App Router, Supabase & Dify AI Orchestration</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
