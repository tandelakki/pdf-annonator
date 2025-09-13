import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import API from "../services/api";

// ✅ Configure pdf.js worker (no Worker component needed)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer() {
  const { fileUuid } = useParams();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [highlights, setHighlights] = useState([]);
  const containerRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  // 1) fetch saved highlights
  useEffect(() => {
    async function loadHighlights() {
      try {
        const res = await API.get(`/highlights/${fileUuid}`);
        const hs = res.data.map((h) => ({
          ...h,
          bbox: typeof h.bbox === "string" ? JSON.parse(h.bbox) : h.bbox,
        }));
        setHighlights(hs);
      } catch (err) {
        console.error(err);
      }
    }
    if (fileUuid) loadHighlights();
  }, [fileUuid]);

  // 2) fetch PDF as blob so axios can send Authorization header
  useEffect(() => {
    let objectUrl = null;
    async function fetchPdf() {
      try {
        const resp = await API.get(`/pdfs/${fileUuid}/file`, {
          responseType: "blob",
        });
        objectUrl = URL.createObjectURL(resp.data);
        setPdfUrl(objectUrl);
      } catch (err) {
        console.error("Failed to fetch PDF", err);
      }
    }
    if (fileUuid) fetchPdf();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPdfUrl(null);
    };
  }, [fileUuid]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  async function handleMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().trim();
    if (!text) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const pageEl = containerRef.current.querySelector(
      `.react-pdf__Page[data-page-number="${pageNumber}"]`
    );
    if (!pageEl) return;
    const pageRect = pageEl.getBoundingClientRect();

    // bbox as percentages relative to page element
    const bbox = {
      x: (rect.left - pageRect.left) / pageRect.width,
      y: (rect.top - pageRect.top) / pageRect.height,
      width: rect.width / pageRect.width,
      height: rect.height / pageRect.height,
    };

    const payload = {
      page: pageNumber,
      text,
      bbox,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await API.post(`/highlights/${fileUuid}`, payload);
      setHighlights((hs) => [...hs, { uuid: res.data.uuid, ...payload }]);
      sel.removeAllRanges();
    } catch (err) {
      console.error(err);
      alert("Failed to save highlight");
    }
  }

  function renderHighlightsForPage(pageIdx) {
    return highlights
      .filter((h) => h.page === pageIdx)
      .map((h) => {
        const style = {
          position: "absolute",
          left: `${h.bbox.x * 100}%`,
          top: `${h.bbox.y * 100}%`,
          width: `${h.bbox.width * 100}%`,
          height: `${h.bbox.height * 100}%`,
          background: h.color || "yellow",
          opacity: 0.5,
          pointerEvents: "none",
        };
        return <div key={h.uuid} className="hl" style={style} />;
      });
  }

  return (
    <div className="viewer-wrapper">
      <div className="controls">
        <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}>
          -
        </button>
        <span>Zoom: {(scale * 100).toFixed(0)}%</span>
        <button onClick={() => setScale((s) => s + 0.25)}>+</button>

        <button onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <span>
          Page {pageNumber} / {numPages || "—"}
        </span>
        <button
          onClick={() =>
            setPageNumber((p) => Math.min(numPages || 1, p + 1))
          }
        >
          Next
        </button>
      </div>

      <div
        className="pdf-container"
        ref={containerRef}
        onMouseUp={handleMouseUp}
      >
        {!pdfUrl ? (
          <div>Loading PDF...</div>
        ) : (
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Page pageNumber={pageNumber} scale={scale} />
              <div
                className="highlight-layer"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                }}
              >
                {renderHighlightsForPage(pageNumber)}
              </div>
            </div>
          </Document>
        )}
      </div>
    </div>
  );
}
