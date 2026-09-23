// pdf.js is only needed once a file is picked, so it is loaded on demand.
let pdfjsPromise;

const loadPdfjs = () => {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return pdfjsPromise;
};

export class PdfReadError extends Error {}

const renderThumbnail = async (doc, width) => {
  const page = await doc.getPage(1);
  const unscaled = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / unscaled.width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.8);
};

// Reads the page count (needed to know which images to expect) and renders a
// small preview of the first page for the progress card.
export const inspectPdf = async (file) => {
  const pdfjs = await loadPdfjs();
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (error) {
    const locked = error && error.name === 'PasswordException';
    throw new PdfReadError(
      locked
        ? 'This PDF is password-protected. Remove the password and try again.'
        : "We couldn't read that PDF. It may be damaged or not a real PDF.",
    );
  }
  try {
    let thumbnail = null;
    try {
      thumbnail = await renderThumbnail(doc, 240);
    } catch {
      // A missing preview is not worth failing the conversion over.
    }
    return { numPages: doc.numPages, thumbnail };
  } finally {
    doc.destroy();
  }
};
