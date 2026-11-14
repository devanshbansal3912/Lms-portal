// Database schema typings matching Supabase PostgreSQL tables
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          storage_path: string;
          dify_document_id: string | null;
          status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
          file_size_bytes: number | null;
          mime_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          storage_path: string;
          dify_document_id?: string | null;
          status?: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
          file_size_bytes?: number | null;
          mime_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          storage_path?: string;
          dify_document_id?: string | null;
          status?: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
          file_size_bytes?: number | null;
          mime_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          title: string;
          topic: string;
          total_questions: number;
          difficulty: 'easy' | 'medium' | 'hard' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          title: string;
          topic: string;
          total_questions?: number;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string | null;
          title?: string;
          topic?: string;
          total_questions?: number;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          created_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          explanation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question: string;
          options: string[] | Json;
          correct_answer: number;
          explanation: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question?: string;
          options?: string[] | Json;
          correct_answer?: number;
          explanation?: string;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number;
          total_questions: number;
          percentage: number;
          answers: Record<string, number>;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          user_id: string;
          score: number;
          total_questions: number;
          answers: Record<string, number> | Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          user_id?: string;
          score?: number;
          total_questions?: number;
          answers?: Record<string, number> | Json;
          created_at?: string;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          topic: string;
          front: string;
          back: string;
          status: 'NEW' | 'KNOWN' | 'NEED_REVISION';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          topic: string;
          front: string;
          back: string;
          status?: 'NEW' | 'KNOWN' | 'NEED_REVISION';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string | null;
          topic?: string;
          front?: string;
          back?: string;
          status?: 'NEW' | 'KNOWN' | 'NEED_REVISION';
          created_at?: string;
        };
      };
      flashcard_progress: {
        Row: {
          id: string;
          user_id: string;
          flashcard_id: string;
          status: 'NEW' | 'KNOWN' | 'NEED_REVISION';
          review_count: number;
          last_reviewed_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flashcard_id: string;
          status?: 'NEW' | 'KNOWN' | 'NEED_REVISION';
          review_count?: number;
          last_reviewed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flashcard_id?: string;
          status?: 'NEW' | 'KNOWN' | 'NEED_REVISION';
          review_count?: number;
          last_reviewed_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
