
import { Suspense } from "react";
import DocumentDetailsClient from "./DocumentDetailsClient";

async function DocumentContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DocumentDetailsClient id={id} />;
}

export default function DocumentDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">Loading document...</p>
        </main>
      }
    >
      <DocumentContent params={params} />
    </Suspense>
  );
}
