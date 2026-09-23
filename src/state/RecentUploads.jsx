import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { readHistory, upsertEntry, writeHistory } from '../lib/history';
import { headStatus, isGone } from '../lib/s3';
import { pdfUrl } from '../lib/files';
import { imageBucket } from '../config';

const RecentUploadsContext = createContext(null);

export function RecentUploadsProvider({ children, validate = true }) {
  const [uploads, setUploads] = useState(readHistory);
  const uploadsRef = useRef(uploads);

  const commit = useCallback((next) => {
    uploadsRef.current = next;
    writeHistory(next);
    setUploads(next);
  }, []);

  // Files are deleted from S3 after 30 days; drop entries whose PDF is gone.
  // Only definite "missing" answers prune - network errors keep the entry.
  useEffect(() => {
    if (!validate || uploadsRef.current.length === 0) return undefined;
    const controller = new AbortController();
    const snapshot = uploadsRef.current;
    Promise.all(
      snapshot.map((item) => headStatus(pdfUrl(imageBucket, item.s3SafeFileName), { signal: controller.signal })),
    ).then((statuses) => {
      if (controller.signal.aborted) return;
      const gone = new Set(snapshot.filter((_, i) => isGone(statuses[i])).map((item) => item.s3SafeFileName));
      if (gone.size) commit(uploadsRef.current.filter((item) => !gone.has(item.s3SafeFileName)));
    });
    return () => controller.abort();
  }, [validate, commit]);

  const add = useCallback(
    (entry) => {
      const { list, index } = upsertEntry(uploadsRef.current, entry);
      commit(list);
      return index;
    },
    [commit],
  );

  const remove = useCallback(
    (s3SafeFileName) => commit(uploadsRef.current.filter((item) => item.s3SafeFileName !== s3SafeFileName)),
    [commit],
  );

  const clear = useCallback(() => commit([]), [commit]);

  const value = useMemo(() => ({ uploads, add, remove, clear }), [uploads, add, remove, clear]);

  return <RecentUploadsContext.Provider value={value}>{children}</RecentUploadsContext.Provider>;
}

export const useRecentUploads = () => {
  const context = useContext(RecentUploadsContext);
  if (!context) throw new Error('useRecentUploads must be used inside RecentUploadsProvider');
  return context;
};

// Newest first, keeping each entry's index so links stay /uploaded/:index.
export const useRecentList = () => {
  const { uploads } = useRecentUploads();
  return useMemo(
    () => uploads.map((item, index) => ({ ...item, index })).reverse(),
    [uploads],
  );
};
