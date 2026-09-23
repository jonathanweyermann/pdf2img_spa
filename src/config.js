const env = import.meta.env;

// In `vite` dev mode requests go through the dev-server proxy (see
// vite.config.js) because the API and bucket only allow the production origin.
// Set VITE_DIRECT=true to talk to AWS directly instead, or VITE_USE_PROXY=true
// to keep the proxy in a production build served by `vite preview`.
export const useDevProxy =
  (Boolean(env.DEV) || env.VITE_USE_PROXY === 'true') && env.VITE_DIRECT !== 'true' && env.MODE !== 'test';

export const apiUrl = useDevProxy ? '/__api' : env.REACT_APP_API_URL;
export const imageBucket = useDevProxy ? '/__s3/' : env.REACT_APP_IMAGE_BUCKET;

// Signed upload URLs point straight at S3; route them through the proxy in dev.
export const clientUrl = (url) => {
  if (!useDevProxy) return url;
  const parsed = new URL(url);
  return `/__s3${parsed.pathname}${parsed.search}`;
};
