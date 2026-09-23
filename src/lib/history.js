// Recent conversions live in localStorage under the same key and shape the
// original app used ({ uploadFileName, numPages, s3SafeFileName }), so
// existing visitors keep their history. `convertedAt` is an optional addition.

const HISTORY_KEY = 'previous_uploads';
const ID_KEY = 'pcid';

const isEntry = (item) =>
  item &&
  typeof item.s3SafeFileName === 'string' &&
  typeof item.uploadFileName === 'string' &&
  Number(item.numPages) > 0;

export const readHistory = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
};

export const writeHistory = (list) => {
  try {
    if (list.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } else {
      localStorage.removeItem(HISTORY_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
};

// Re-uploading the same file overwrites the same S3 key, so reuse its slot.
export const upsertEntry = (list, entry) => {
  const index = list.findIndex(
    (item) => item.s3SafeFileName === entry.s3SafeFileName && item.numPages === entry.numPages,
  );
  if (index === -1) {
    return { list: [...list, entry], index: list.length };
  }
  const next = [...list];
  next[index] = { ...list[index], ...entry };
  return { list: next, index };
};

export const localIdentifier = () => {
  try {
    const existing = localStorage.getItem(ID_KEY);
    if (existing) return existing;
    const id = String(Math.floor(Math.random() * 100000000));
    localStorage.setItem(ID_KEY, id);
    return id;
  } catch {
    return String(Math.floor(Math.random() * 100000000));
  }
};
