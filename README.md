# FlickPick (frontend)

React + Vite SPA for browsing trending movies and a shared watchlist.

- Live site: [flickpick.mel-2cb.workers.dev](https://flickpick.mel-2cb.workers.dev/)
- API: [flickpicks.fastapicloud.dev](https://flickpicks.fastapicloud.dev/) via `VITE_API_URL`

## Local development

```bash
pnpm install
pnpm dev
```

Set `VITE_API_URL` to `https://flickpicks.fastapicloud.dev/` (see `.env`).

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

## Deploy (Cloudflare Workers Git integration)

Production deploys through the Cloudflare dashboard Git integration for the `flickpick` Worker. There is no CI pipeline in this repo.

`wrangler.jsonc` is the config that integration uses:

- Worker name: `flickpick` (same as the live script on `mel-2cb.workers.dev`)
- Assets directory: `./dist` (Vite build output)
- `not_found_handling`: `single-page-application` (same SPA fallback the live Worker uses today)

The Worker script returns HTTP 404 for unknown paths while still serving `index.html`, so the client `NotFound` page can render. Valid `/`, `/movies/:digits`, and `/tv/:digits` deep links stay on 200.

Optional local packaging check (does not publish):

```bash
pnpm deploy:dry
```

## Edge routing

| Path          | HTTP status | Body                                |
| ------------- | ----------- | ----------------------------------- |
| `/`           | 200         | `index.html`                        |
| `/movies/123` | 200         | `index.html`                        |
| `/tv/123`     | 200         | `index.html`                        |
| other paths   | 404         | `index.html` (SPA shell / NotFound) |
| `/assets/*`   | 200         | hashed static files                 |
