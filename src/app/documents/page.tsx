"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UploadedDocument = {
  id: string;
  name: string;
  size: number;
  status: string;
  file_path: string;
};

const DATABASE_NAME = "learnai-pdf-storage";
const STORE_NAME = "documents";

// Keep a local copy temporarily so the existing PDF viewer continues to work
// while we update it to read directly from private Supabase Storage.
function openDocumentDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePdfFile(id: string, file: File): Promise<void> {
  const database = await openDocumentDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ id, file });

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function deletePdfFile(id: string): Promise<void> {
  const database = await openDocumentDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      setLoadingDocuments(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          if (isMounted) setUploadedDocuments([]);
          return;
        }

        const { data, error } = await supabase
          .from("documents")
          .select("id, file_name, file_size, status, file_path")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const documents: UploadedDocument[] = (data ?? []).map((document) => ({
          id: document.id,
          name: document.file_name,
          size: document.file_size ?? 0,
          status: document.status === "uploaded" ? "Ready" : document.status,
          file_path: document.file_path,
        }));

        if (isMounted) {
          setUploadedDocuments(documents);
          localStorage.setItem("learnai-documents", JSON.stringify(documents));
          window.dispatchEvent(new Event("documentsUpdated"));
        }
      } catch (error) {
        console.error("Could not load documents from Supabase:", error);
        if (isMounted) {
          alert("Could not load your documents from Supabase. Please refresh and try again.");
        }
      } finally {
        if (isMounted) setLoadingDocuments(false);
      }
    }

    loadDocuments();
    return () => {
      isMounted = false;
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);
  }

  async function handleUpload() {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadComplete(false);

    let uploadedStoragePath: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error("You must be logged in to upload a document.");
      }

      const documentId = crypto.randomUUID();
      const storagePath = `${user.id}/${documentId}.pdf`;
      uploadedStoragePath = storagePath;

      // 1. Upload the actual PDF into the private Supabase Storage bucket.
      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(storagePath, selectedFile, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (storageError) throw storageError;

      // 2. Save the document metadata in PostgreSQL.
      const { error: databaseError } = await supabase.from("documents").insert({
        id: documentId,
        user_id: user.id,
        file_name: selectedFile.name,
        file_path: storagePath,
        file_size: selectedFile.size,
        status: "uploaded",
      });

      if (databaseError) {
        // Avoid leaving an untracked PDF in Storage if metadata insertion fails.
        await supabase.storage.from("documents").remove([storagePath]);
        uploadedStoragePath = null;
        throw databaseError;
      }

      // 3. Keep a temporary browser copy for the existing PDF viewer.
      try {
        await savePdfFile(documentId, selectedFile);
      } catch (localError) {
        console.warn("Cloud upload succeeded, but local PDF caching failed:", localError);
      }
      // 4. Send the uploaded PDF to Dify for AI processing.
try {
  const difyResponse = await fetch("/api/documents/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: documentId,
    }),
  });

  const difyResult = await difyResponse.json();

  if (!difyResponse.ok) {
    console.error("Dify ingestion failed:", difyResult);
    alert(
      "PDF saved in Supabase, but AI processing failed: " +
        (difyResult.error || "Unknown error")
    );
  } else {
    console.log("Dify ingestion successful:", difyResult);
  }
} catch (difyError) {
  console.error("Could not connect to Dify:", difyError);
  alert("PDF saved in Supabase, but Dify could not be reached.");
}

      const newDocument: UploadedDocument = {
        id: documentId,
        name: selectedFile.name,
        size: selectedFile.size,
        status: "Ready",
        file_path: storagePath,
      };

      const updatedDocuments = [newDocument, ...uploadedDocuments];
      setUploadedDocuments(updatedDocuments);
      localStorage.setItem("learnai-documents", JSON.stringify(updatedDocuments));
      window.dispatchEvent(new Event("documentsUpdated"));

      setSelectedFile(null);
      setUploadComplete(true);
    } catch (error) {
      console.error("PDF upload failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Could not upload this PDF: ${message}`);

      // Best-effort cleanup if an error happened after the Storage upload.
      if (uploadedStoragePath) {
        await supabase.storage.from("documents").remove([uploadedStoragePath]);
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(index: number) {
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (!confirmed) return;

    const documentToDelete = uploadedDocuments[index];
    if (!documentToDelete) return;

    try {
      // Remove the private Storage object first.
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([documentToDelete.file_path]);

      if (storageError) throw storageError;

      // Then remove its metadata. RLS also checks ownership in the database.
      const { error: databaseError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentToDelete.id);

      if (databaseError) throw databaseError;

      try {
        await deletePdfFile(documentToDelete.id);
      } catch (localError) {
        console.warn("Could not remove the temporary local PDF copy:", localError);
      }

      const updatedDocuments = uploadedDocuments.filter(
        (document) => document.id !== documentToDelete.id
      );

      setUploadedDocuments(updatedDocuments);
      localStorage.setItem("learnai-documents", JSON.stringify(updatedDocuments));
      window.dispatchEvent(new Event("documentsUpdated"));
    } catch (error) {
      console.error("Document deletion failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Could not delete this document: ${message}`);
    }
  }

  const filteredDocuments = uploadedDocuments.filter((document) =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <a href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
          <h1 className="mt-3 text-3xl font-bold">My Documents</h1>
          <p className="mt-2 text-slate-500">Manage your study materials in one place.</p>
        </div>

        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          Student Workspace
        </span>
      </header>

      {/* Upload Section */}
      <section className="mb-8 rounded-2xl border-2 border-dashed border-blue-300 bg-white p-8 text-center">
        <div className="text-4xl">📄</div>
        <h2 className="mt-4 text-xl font-bold">Upload study material</h2>
        <p className="mt-2 text-sm text-slate-500">
          Select a PDF document from your device. Maximum size: 10 MB.
        </p>

        <label className="mt-6 inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          Choose PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {selectedFile && (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-left">
            <p className="font-medium text-green-800">✓ PDF selected successfully</p>
            <p className="mt-2 break-all text-sm text-slate-700">{selectedFile.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setUploadComplete(false);
              }}
              disabled={uploading}
              className="mt-3 text-sm font-semibold text-red-600 hover:underline"
            >
              Remove selected file
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 block w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Uploading to Supabase..." : "Upload PDF"}
            </button>
          </div>
        )}

        {uploadComplete && (
          <p className="mt-4 text-sm font-medium text-green-700">
            ✓ PDF uploaded successfully to Supabase Storage!
          </p>
        )}
      </section>

      {/* Document Library */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Recent Documents</h2>
          <span className="text-sm text-slate-400">
            {uploadedDocuments.length} uploaded
          </span>
        </div>

        <input
          type="text"
          placeholder="Search documents by filename..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {loadingDocuments ? (
          <p className="py-6 text-center text-sm text-slate-400">Loading your documents...</p>
        ) : uploadedDocuments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No documents uploaded yet. Select a PDF to get started.
          </p>
        ) : filteredDocuments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No matching documents found.</p>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-red-50 p-3">📕</span>
                  <div className="min-w-0">
                    <a
                      href={`/documents/${document.id}`}
                      className="break-all font-medium text-slate-900 hover:text-blue-600 hover:underline"
                    >
                      {document.name}
                    </a>
                    <p className="text-sm text-slate-400">
                      {(document.size / (1024 * 1024)).toFixed(2)} MB · PDF
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    {document.status}
                  </span>
                  <a
                    href={`/documents/${document.id}`}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Open →
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(uploadedDocuments.findIndex((item) => item.id === document.id))}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
