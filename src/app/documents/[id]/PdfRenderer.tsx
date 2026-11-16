
"use client";

import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  "/pdfs/pdf.worker.min.mjs";

type PdfRendererProps = {
  file: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
};

export default function PdfRenderer({
  file,
  pageNumber,
  scale,
  onLoadSuccess,
  onLoadError,
}: PdfRendererProps) {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      loading={
        <p className="p-8 text-center text-slate-500">
          Loading PDF...
        </p>
      }
      error={
        <p className="p-8 text-center text-red-600">
          Unable to display this PDF.
        </p>
      }
    >
      <div className="flex justify-center">
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer
          renderAnnotationLayer
        />
      </div>
    </Document>
  );
}
