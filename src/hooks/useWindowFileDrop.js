import { useEffect, useRef, useState } from 'react';

const hasFiles = (event) =>
  Boolean(event.dataTransfer) && Array.from(event.dataTransfer.types || []).includes('Files');

// Lets people drop a file anywhere on the page, not just on the dropzone.
export function useWindowFileDrop(enabled, onFile) {
  const [active, setActive] = useState(false);
  const onFileRef = useRef(onFile);
  onFileRef.current = onFile;

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return undefined;
    }
    let depth = 0;
    const enter = (event) => {
      if (!hasFiles(event)) return;
      depth += 1;
      setActive(true);
    };
    const leave = (event) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setActive(false);
    };
    const over = (event) => {
      if (hasFiles(event)) event.preventDefault();
    };
    const drop = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setActive(false);
      const file = event.dataTransfer.files[0];
      if (file) onFileRef.current(file);
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragleave', leave);
    window.addEventListener('dragover', over);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('dragover', over);
      window.removeEventListener('drop', drop);
    };
  }, [enabled]);

  return active;
}
