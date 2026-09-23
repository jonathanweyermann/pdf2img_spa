import { apiUrl, clientUrl } from '../config';

export class UploadError extends Error {}

// Same request the original app made: POST { fileName, fileType } and get a
// presigned PUT URL back in `body.signedRequest`.
export const requestUploadUrl = async ({ fileName, fileType }, { signal } = {}) => {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileType }),
    signal,
  });
  if (!response.ok) throw new UploadError(`Upload service responded with ${response.status}`);
  const data = await response.json();
  const signedRequest = data && data.body && data.body.signedRequest;
  if (!signedRequest) throw new UploadError('Upload service did not return an upload URL');
  return clientUrl(signedRequest);
};

// XHR rather than fetch so we can report upload progress.
export const uploadFile = (url, file, fileType, { signal, onProgress } = {}) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', `application/${fileType}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new UploadError(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new UploadError('Network error during upload'));
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    if (signal) {
      if (signal.aborted) return xhr.abort();
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }
    xhr.send(file);
  });

// Public objects return 200; missing ones return 403 because the bucket does
// not allow listing. Network failures resolve to null.
export const headStatus = async (url, { signal } = {}) => {
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store', signal });
    return response.status;
  } catch {
    return null;
  }
};

export const exists = async (url, options) => (await headStatus(url, options)) === 200;

export const isGone = (status) => status === 403 || status === 404;

export const sleep = (ms, signal) =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    if (signal) signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
  });
