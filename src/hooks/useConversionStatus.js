import { useCallback, useEffect, useState } from 'react';
import { exists, headStatus, isGone, sleep } from '../lib/s3';
import { imageUrl, pdfUrl, zipUrl } from '../lib/files';
import { imageBucket } from '../config';

const FAST = 1000;
const SLOW = 5000;
// The lambda times out after 3 minutes; give it some slack before warning.
const STALL_AFTER = 4 * 60 * 1000;
const PROBES_PER_TICK = 10;

// Tracks server-side progress for one conversion. The lambda uploads
// image1..imageN in order and then the ZIP, so "pages ready" is simply the
// highest consecutive image that exists.
export function useConversionStatus(entry) {
  const [status, setStatus] = useState({ readyPages: 0, zipReady: false, stalled: false, expired: false });
  const [attempt, setAttempt] = useState(0);

  const s3SafeFileName = entry ? entry.s3SafeFileName : null;
  const numPages = entry ? Number(entry.numPages) : 0;

  useEffect(() => {
    if (!s3SafeFileName) return undefined;
    const controller = new AbortController();
    const { signal } = controller;
    const page = (n) => imageUrl(imageBucket, s3SafeFileName, n);
    const set = (patch) => !signal.aborted && setStatus((s) => ({ ...s, ...patch }));

    const run = async () => {
      set({ stalled: false });
      const pdfStatus = await headStatus(pdfUrl(imageBucket, s3SafeFileName), { signal });
      if (signal.aborted) return;
      if (isGone(pdfStatus)) {
        set({ expired: true });
        return;
      }

      let ready = 0;
      let delay = FAST;
      let lastProgress = Date.now();
      const stalled = () => Date.now() - lastProgress > STALL_AFTER;

      while (!signal.aborted && ready < numPages) {
        const before = ready;
        if (await exists(page(numPages), { signal })) {
          ready = numPages;
        } else {
          for (let i = 0; i < PROBES_PER_TICK && ready < numPages - 1; i += 1) {
            if (!(await exists(page(ready + 1), { signal }))) break;
            ready += 1;
          }
        }
        if (signal.aborted) return;
        if (ready > before) {
          lastProgress = Date.now();
          delay = FAST;
          set({ readyPages: ready });
        } else {
          delay = Math.min(delay * 1.4, SLOW);
        }
        if (ready >= numPages) break;
        if (stalled()) return set({ stalled: true });
        await sleep(delay, signal);
      }

      delay = FAST;
      lastProgress = Date.now();
      while (!signal.aborted) {
        if (await exists(zipUrl(imageBucket, s3SafeFileName), { signal })) return set({ zipReady: true });
        if (stalled()) return set({ stalled: true });
        delay = Math.min(delay * 1.4, SLOW);
        await sleep(delay, signal);
      }
    };

    run();
    return () => controller.abort();
  }, [s3SafeFileName, numPages, attempt]);

  const keepWaiting = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...status, keepWaiting };
}
