# pdf2jpgs.com frontend

React single-page app for [pdf2jpgs.com](https://pdf2jpgs.com): drop in a PDF, get every page back as a JPG,
preview them in a grid, open them full size, and download one page or a ZIP of all of them.

The conversion itself happens in the [pdf2img](https://github.com/jonathanweyermann/pdf2img) lambda. This app:

1. reads the page count locally with pdf.js,
2. asks the API (`REACT_APP_API_URL`) for a presigned S3 URL and PUTs the PDF to `pdfs/<pcid><name>.pdf`,
3. polls the bucket (`REACT_APP_IMAGE_BUCKET`) for `<base>/image<N>.jpg` and `<base>.zip` as the lambda writes them.

Recent conversions are stored in `localStorage` under `previous_uploads` (same format as the original site).

## Development

```sh
yarn install
yarn start        # http://localhost:3000
yarn test         # vitest, run once
yarn test:watch
yarn build        # outputs to build/ (what `amplify publish` deploys)
```

`yarn start` needs no `.env`. The API and bucket only allow `https://pdf2jpgs.com` via CORS, so in dev the Vite
server proxies them (`/__api`, `/__s3`, see `vite.config.js`). **Local uploads go to the production bucket.**
Set `REACT_APP_API_URL` in a `.env` file to target another API, or `VITE_DIRECT=true` to skip the proxy.

To smoke-test a production bundle locally: `VITE_USE_PROXY=true yarn build && yarn preview`.

## Deploy

`dev_deploy.sh` / `prod_deploy.sh` copy `envs/<env>/.env` into place and run `amplify publish`, which runs
`yarn build` and uploads `build/`. Environment variables keep their `REACT_APP_` prefix.

## Stack

Vite, React 19, React Router 7, pdf.js, lucide icons, and plain CSS (design tokens in `src/index.css`, modeled on
jonathanweyermann.com).
