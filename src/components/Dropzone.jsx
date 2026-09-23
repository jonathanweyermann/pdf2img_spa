import { useId, useRef, useState } from 'react';
import { CircleAlert, FileUp } from 'lucide-react';

export default function Dropzone({ onFile, error, inputId = 'pdf-input' }) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const hintId = useId();

  const handleDragEnter = (event) => {
    event.preventDefault();
    depth.current += 1;
    setDragging(true);
  };

  const handleDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    depth.current = 0;
    setDragging(false);
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (event) => {
    const file = event.target.files && event.target.files[0];
    // Reset so choosing the same file again still fires a change.
    event.target.value = '';
    if (file) onFile(file);
  };

  return (
    <div className="dropzone-wrap">
      <label
        className={`dropzone${dragging ? ' is-dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          className="visually-hidden"
          onChange={handleChange}
          aria-describedby={hintId}
        />
        <span className="dropzone__art" aria-hidden="true">
          <span className="dropzone__sheet dropzone__sheet--back" />
          <span className="dropzone__sheet dropzone__sheet--mid" />
          <span className="dropzone__sheet dropzone__sheet--front">
            <FileUp />
          </span>
        </span>
        <span className="dropzone__title">
          {dragging ? (
            'Release to convert'
          ) : (
            <>
              <span className="only-pointer">Drop your PDF here</span>
              <span className="only-touch">Tap to choose a PDF</span>
            </>
          )}
        </span>
        <span className="dropzone__sub only-pointer">
          or <span className="dropzone__browse">browse your files</span>
        </span>
        <span className="dropzone__sub only-touch">
          from your <span className="dropzone__browse">files</span>
        </span>
        <span className="dropzone__hint" id={hintId}>
          PDF files only · converts every page to JPG
        </span>
      </label>
      {error && (
        <div className="alert" role="alert">
          <CircleAlert aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
