import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  ArrowLeft,
  ExternalLink,
  Download,
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type PdfViewerProps = {
  fileUrl: string;
  fileName?: string;
  onBack?: () => void;
  backLabel?: string;
};

type FitMode = 'width' | 'page' | 'custom';

export default function PdfViewer({ fileUrl, fileName, onBack, backLabel = 'Kembali' }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null);
  const pageScalesRef = useRef<Map<number, number>>(new Map());
  const visiblePagesRef = useRef<Set<number>>(new Set());

  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [fitMode, setFitMode] = useState<FitMode>('width');
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setNumPages(0);
      pageScalesRef.current.clear();
      visiblePagesRef.current.clear();

      try {
        const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Gagal memuat dokumen PDF. Silakan coba membuka file di tab baru.');
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy();
        loadingTaskRef.current = null;
      }
      pdfDocRef.current = null;
    };
  }, [fileUrl]);

  // Compute fit-to-width / fit-to-page scale based on container size
  const computeFitScale = useCallback(async (mode: FitMode) => {
    const pdf = pdfDocRef.current;
    const container = containerRef.current;
    if (!pdf || !container || pdf.numPages === 0) return;

    const containerWidth = container.clientWidth - 32;
    const containerHeight = container.clientHeight - 32;
    const page = await pdf.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });

    let newScale = 1.2;
    if (mode === 'width') {
      newScale = containerWidth / baseViewport.width;
    } else if (mode === 'page') {
      newScale = Math.min(
        containerWidth / baseViewport.width,
        containerHeight / baseViewport.height
      );
    }
    newScale = Math.max(0.5, Math.min(3, newScale));
    setScale(newScale);
    pageScalesRef.current.clear();
  }, []);

  // Recompute on fullscreen toggle or fit mode change
  useEffect(() => {
    if (!loading && !error) {
      computeFitScale(fitMode);
    }
  }, [fullscreen, fitMode, loading, error, computeFitScale]);

  // Recompute on window resize
  useEffect(() => {
    if (loading || error) return;
    const handleResize = () => computeFitScale(fitMode);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMode, loading, error, computeFitScale]);

  const zoomIn = () => {
    setFitMode('custom');
    setScale((s) => Math.min(3, s + 0.25));
    pageScalesRef.current.clear();
  };
  const zoomOut = () => {
    setFitMode('custom');
    setScale((s) => Math.max(0.5, s - 0.25));
    pageScalesRef.current.clear();
  };
  const fitWidth = () => setFitMode('width');
  const fitPage = () => setFitMode('page');
  const toggleFullscreen = () => setFullscreen((f) => !f);

  // Track current page via scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container || numPages === 0) return;

    const handleScroll = () => {
      const pageEls = container.querySelectorAll('[data-page-num]');
      const containerTop = container.scrollTop + container.clientHeight / 3;
      for (let i = 0; i < pageEls.length; i++) {
        const el = pageEls[i] as HTMLElement;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (containerTop >= top && containerTop < bottom) {
          const num = parseInt(el.dataset.pageNum || '1', 10);
          setCurrentPage(num);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [numPages, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-accent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Memuat dokumen PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Buka PDF di Tab Baru
        </a>
      </div>
    );
  }

  const toolbarClass = fullscreen
    ? 'flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 bg-gray-800 text-white shrink-0'
    : 'flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50';

  const btnClass = fullscreen
    ? 'p-1.5 text-white hover:bg-gray-700 rounded transition-colors'
    : 'p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors';

  const btnActiveClass = fullscreen
    ? 'p-1.5 text-accent bg-gray-700 rounded transition-colors'
    : 'p-1.5 text-accent bg-blue-50 rounded transition-colors';

  const labelClass = fullscreen ? 'text-xs text-gray-300' : 'text-xs text-gray-500';

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[100] bg-gray-900 flex flex-col' : ''}>
      <div className={`flex flex-col min-h-0 ${fullscreen ? 'flex-1' : 'bg-white border border-gray-200 rounded-lg overflow-hidden h-[75vh]'}`}>
        {/* Toolbar */}
        <div className={toolbarClass}>
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors shrink-0 ${
                  fullscreen ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:text-accent hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </button>
            )}
            <span className={`text-sm font-medium truncate max-w-[200px] ${fullscreen ? 'text-white' : 'text-gray-700'}`}>
              {fileName || 'Dokumen PDF'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={zoomOut} className={btnClass} title="Zoom keluar">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`${labelClass} w-12 text-center`}>
              {Math.round(scale * 100)}%
            </span>
            <button onClick={zoomIn} className={btnClass} title="Zoom masuk">
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className={`w-px h-5 ${fullscreen ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />
            <button
              onClick={fitWidth}
              className={fitMode === 'width' ? btnActiveClass : btnClass}
              title="Sesuaikan lebar halaman"
            >
              <span className="text-xs font-medium px-0.5">W</span>
            </button>
            <button
              onClick={fitPage}
              className={fitMode === 'page' ? btnActiveClass : btnClass}
              title="Sesuaikan halaman ke area baca"
            >
              <span className="text-xs font-medium px-0.5">P</span>
            </button>
            <div className={`w-px h-5 ${fullscreen ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />
            <span className={`${labelClass} w-16 text-center`}>
              {currentPage} / {numPages}
            </span>
            <div className={`w-px h-5 ${fullscreen ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={btnClass}
              title="Buka di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={toggleFullscreen} className={btnClass} title={fullscreen ? 'Keluar layar penuh' : 'Layar penuh'}>
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable page area */}
        <div
          ref={containerRef}
          className={`flex-1 overflow-auto ${fullscreen ? 'bg-gray-700' : 'bg-gray-100'}`}
        >
          <div className="flex flex-col items-center gap-3 py-4 px-4">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <PdfPage
                key={pageNum}
                pdfDoc={pdfDocRef.current}
                pageNum={pageNum}
                scale={scale}
                containerRef={containerRef}
              />
            ))}
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Individual page with lazy rendering via IntersectionObserver ---
function PdfPage({
  pdfDoc,
  pageNum,
  scale,
  containerRef,
}: {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  pageNum: number;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [rendered, setRendered] = useState(false);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  // Get page dimensions for placeholder sizing
  useEffect(() => {
    let cancelled = false;
    if (!pdfDoc) return;

    pdfDoc.getPage(pageNum).then((page) => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      setDimensions({ w: viewport.width, h: viewport.height });
    });

    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  // Lazy render when page scrolls into view
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container || !pdfDoc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !rendered) {
            renderPage();
          }
        }
      },
      { root: container, rootMargin: '200px 0px', threshold: 0 }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [pdfDoc, pageNum, rendered, containerRef]);

  const renderPage = useCallback(async () => {
    const pdf = pdfDoc;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.scale(dpr, dpr);

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderTask = page.render({ canvas, canvasContext: context, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      setRendered(true);
    } catch (e: unknown) {
      if (!(e instanceof Error && e.name === 'RenderingCancelledException')) {
        // ignore other render errors silently
      }
    }
  }, [pdfDoc, pageNum]);

  return (
    <div
      ref={wrapperRef}
      data-page-num={pageNum}
      className="relative bg-white shadow-lg rounded"
      style={dimensions ? { width: dimensions.w, height: dimensions.h } : { minHeight: 400 }}
    >
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-accent rounded-full animate-spin" />
        </div>
      )}
      <canvas ref={canvasRef} className="block rounded" />
    </div>
  );
}
