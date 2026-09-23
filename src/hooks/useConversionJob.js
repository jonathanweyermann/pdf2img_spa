import { useCallback, useEffect, useRef, useState } from 'react';
import { inspectPdf, PdfReadError } from '../lib/pdf';
import { requestUploadUrl, uploadFile } from '../lib/s3';
import { displayName, fileExtension, isPdf, safeFileName } from '../lib/files';
import { localIdentifier } from '../lib/history';

const IDLE = { phase: 'idle' };

const isAbort = (error) => error && error.name === 'AbortError';

// Drives a single upload: read the PDF locally -> get a signed URL -> PUT to
// S3. Conversion itself is kicked off by the S3 event on the backend.
export function useConversionJob({ onUploaded }) {
  const [job, setJob] = useState(IDLE);
  const controllerRef = useRef(null);
  const onUploadedRef = useRef(onUploaded);
  onUploadedRef.current = onUploaded;

  useEffect(() => () => controllerRef.current && controllerRef.current.abort(), []);

  const start = useCallback(async (file) => {
    if (!isPdf(file)) {
      setJob({ phase: 'idle', error: `"${file ? file.name : 'That file'}" isn't a PDF. Choose a file ending in .pdf.` });
      return;
    }
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const { signal } = controller;
    const update = (patch) => {
      if (!signal.aborted) setJob((current) => ({ ...current, ...patch }));
    };

    setJob({ phase: 'reading', file });
    let step = 'reading';
    try {
      const { numPages, thumbnail } = await inspectPdf(file);
      if (signal.aborted) return;
      step = 'uploading';
      update({ phase: 'uploading', numPages, thumbnail, progress: 0 });

      const s3SafeFileName = safeFileName(localIdentifier(), file.name);
      const fileType = fileExtension(file.name);
      const signedUrl = await requestUploadUrl({ fileName: s3SafeFileName, fileType }, { signal });
      await uploadFile(signedUrl, file, fileType, {
        signal,
        onProgress: (progress) => update({ progress }),
      });
      if (signal.aborted) return;

      update({ phase: 'done', progress: 1 });
      onUploadedRef.current({
        uploadFileName: displayName(file.name),
        numPages,
        s3SafeFileName,
        convertedAt: Date.now(),
      });
    } catch (error) {
      if (isAbort(error) || signal.aborted) return;
      update({
        phase: 'error',
        failedStep: step,
        error:
          error instanceof PdfReadError
            ? error.message
            : 'Upload failed. Check your connection and try again.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = null;
    setJob(IDLE);
  }, []);

  const retry = useCallback(() => {
    if (job.file) start(job.file);
  }, [job.file, start]);

  return { job, start, reset, retry };
}
