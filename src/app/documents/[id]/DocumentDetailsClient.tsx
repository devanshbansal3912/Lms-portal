"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

type UploadedDocument = {
  id: string;
  name: string;
  size: number;
  status: string;
  file_path: string;
};

const PdfRenderer = dynamic(() => import("./PdfRenderer"), {
  ssr: false,
  loading: () => (
    <p className="p-8 text-center text-slate-500">Loading PDF viewer...</p>
  ),
});

export default function DocumentDetailsClient({
  id,
}: {
  id: string;
}) {
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadDocument() {
      setLoading(true);
      setPdfError("");
      setDocument(null);
      setPdfUrl(null);

      try {
        // Confirm the current session before requesting a document.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          throw new Error("Please log in to view this document.");
        }

        // RLS ensures the query can return only this student's own row.
        const { data: row, error: documentError } = await supabase
          .from("documents")
          .select("id, user_id, file_name, file_size, status, file_path")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (documentError) throw documentError;
        if (!row) throw new Error("Document not found or access denied.");
        if (cancelled) return;

        const loadedDocument: UploadedDocument = {
          id: row.id,
          name: row.file_name,
          size: row.file_size ?? 0,
          status: row.status === "uploaded" ? "Ready" : row.status,
          file_path: row.file_path,
        };
        setDocument(loadedDocument);

        // Download from the private bucket. Storage RLS checks the user's folder.
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from("documents")
          .download(row.file_path);

        if (downloadError) throw downloadError;
        if (!fileBlob) throw new Error("The PDF file was not returned by storage.");
        if (cancelled) return;

        objectUrl = URL.createObjectURL(fileBlob);
        setPdfUrl(objectUrl);
      } catch (error) {
        console.error("Unable to load document from Supabase:", error);
        if (!cancelled) {
          setPdfError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve this PDF. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError("");
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF loading error:", error);
    setPdfError("Unable to display this PDF. Please check the file.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading document...</p>
      </main>
    );
  }

  if (!document) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Document not found</h1>
        <p className="mt-2 text-slate-500">
          {pdfError || "This document may have been deleted or is unavailable."}
        </p>
        <a
          href="/documents"
          className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Documents
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <a
          href="/documents"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to My Documents
        </a>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="rounded-xl bg-red-50 p-4 text-3xl">📕</div>
              <div className="min-w-0">
                <h1 className="break-all text-2xl font-bold">{document.name}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  PDF Document · {(document.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              {document.status}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">PDF Reader</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScale((previous) => Math.max(0.5, previous - 0.2))}
                disabled={scale <= 0.5}
                className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-100 disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-14 text-center text-sm font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale((previous) => Math.min(2, previous + 0.2))}
                disabled={scale >= 2}
                className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-100 disabled:opacity-40"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setScale(1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 border-y border-slate-200 py-4">
            <button
              type="button"
              onClick={() => setPageNumber((previous) => Math.max(1, previous - 1))}
              disabled={pageNumber <= 1}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm font-medium">
              Page {pageNumber} of {numPages || "..."}
            </span>
            <button
              type="button"
              onClick={() => setPageNumber((previous) => Math.min(numPages, previous + 1))}
              disabled={pageNumber >= numPages || numPages === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
            >
              Next →
            </button>
          </div>

          <div className="mt-5 overflow-auto rounded-lg bg-slate-100 p-3 sm:p-5">
            {pdfError ? (
              <p className="p-8 text-center text-red-600">{pdfError}</p>
            ) : pdfUrl ? (
              <PdfRenderer
                file={pdfUrl}
                pageNumber={pageNumber}
                scale={scale}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              />
            ) : (
              <p className="p-8 text-center text-slate-500">Preparing PDF...</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <a
            href="/chat"
            className="rounded-xl bg-blue-600 p-6 text-white transition hover:bg-blue-700"
          >
            <h3 className="text-lg font-bold">Ask AI Assistant</h3>
            <p className="mt-2 text-sm text-blue-100">
              Ask questions about your study material.
            </p>
            <p className="mt-5 text-sm font-semibold">Open Assistant →</p>
          </a>
          <a
            href="/quiz"
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:bg-slate-50"
          >
            <h3 className="text-lg font-bold">Generate Quiz</h3>
            <p className="mt-2 text-sm text-slate-500">
              Test your understanding of the document.
            </p>
            <p className="mt-5 text-sm font-semibold text-blue-600">Open Quizzes →</p>
          </a>
        </div>
      </div>
    </main>
  );
}
