'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  FileText
} from 'lucide-react';

export interface PdfViewerProps {
  url: string;
  title?: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function PdfViewer({
  url,
  title = 'Document Viewer',
  initialPage = 1,
  onPageChange,
  className = '',
}: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(12); // Default estimate for demo
  const [zoomScale, setZoomScale] = useState<number>(100); // Percentage
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Simulate initial document metadata load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [url]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setCurrentPage(val);
      onPageChange?.(val);
    }
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 25, 250));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomScale(100);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl h-[700px] text-slate-100 ${className}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 gap-2 select-none">
        {/* Document Info */}
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <span className="font-medium text-sm text-slate-200 truncate max-w-[200px] sm:max-w-xs" title={title}>
            {title}
          </span>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700 text-xs sm:text-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1 text-slate-300">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              disabled={isLoading}
              className="w-12 bg-slate-800 text-center font-mono py-0.5 rounded border border-slate-600 focus:outline-none focus:border-indigo-400 text-white"
            />
            <span className="text-slate-400">of {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="flex items-center bg-slate-900/80 px-1.5 py-1 rounded-lg border border-slate-700 space-x-1 text-xs">
            <button
              onClick={handleZoomOut}
              disabled={zoomScale <= 50 || isLoading}
              className="p-1 hover:bg-slate-700 rounded transition disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-1.5 py-0.5 hover:bg-slate-700 rounded font-mono text-xs transition"
              title="Reset Zoom (100%)"
            >
              {zoomScale}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomScale >= 250 || isLoading}
              className="p-1 hover:bg-slate-700 rounded transition disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRotate}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <a
            href={url}
            download
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main PDF Canvas / View Area */}
      <div className="relative flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-slate-300 text-sm font-medium">Loading PDF document...</p>
            <p className="text-slate-500 text-xs mt-1">Preparing high-resolution rendering</p>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-slate-900 rounded-xl border border-red-500/30">
            <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
            <h4 className="text-lg font-semibold text-slate-100">Unable to load PDF</h4>
            <p className="text-slate-400 text-sm mt-1 mb-4">
              The PDF file could not be accessed or format is invalid. Ensure you have authorized document access.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 500);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition"
              >
                Retry
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
              >
                Open Directly
              </a>
            </div>
          </div>
        ) : (
          <div 
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center min-w-full min-h-full"
            style={{
              transform: `scale(${zoomScale / 100}) rotate(${rotation}deg)`,
            }}
          >
            {/* Embedded Native PDF Viewer with Responsive Fallback */}
            <div className="w-full max-w-4xl h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-slate-700">
              <object
                data={`${url}#page=${currentPage}&zoom=${zoomScale}`}
                type="application/pdf"
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              >
                {/* Fallback frame if object tag isn't supported */}
                <iframe
                  src={`${url}#page=${currentPage}`}
                  title={title}
                  className="w-full h-full border-0"
                  onError={() => setHasError(true)}
                />
              </object>
            </div>
          </div>
        )}
      </div>

      {/* Reader Footer Info Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Document Active</span>
        </span>
        <span>Use navigation bar to jump or zoom. Use Right / Left keys to page.</span>
        <span>Zoom: {zoomScale}% | Angle: {rotation}°</span>
      </div>
    </div>
  );
}
