# FlickPick

[![CI](https://github.com/ayomel/flickpicks/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ayomel/flickpicks/actions/workflows/ci.yml)

FlickPick helps you discover movies and TV shows. Browse trending titles, search both, view details and trailers, and save titles to an anonymous watchlist for this browser.

**Try it:** [Live app](https://flickpick.mel-2cb.workers.dev/) · [Frontend repository](https://github.com/ayomel/flickpicks) · [API repository](https://github.com/ayomel/flickpicks-api) · [API docs](https://flickpicks.fastapicloud.dev/docs)

## Product tour

Search shows movies and TV together. Each result is labeled by type and opens its matching detail page, with title information, trailers, and watch options where available. Save movies and shows to this browser's watchlist and return to them from the home page.

### Browse and search

![FlickPick browse and combined movie and TV search](https://github.com/user-attachments/assets/171fcf09-a5c8-4be3-bf79-ac0e1e3b1e67)

### Title details

![FlickPick title detail page with trailer playback](https://github.com/user-attachments/assets/c66e5843-8582-4ba0-9b07-18899738d6dd)

### Mixed movie and TV watchlist

![FlickPick watchlist containing movies and a TV show](https://github.com/user-attachments/assets/0de05b7b-2123-47a0-b8cb-039778d60992)

## Architecture

The React single-page app runs in the browser and is served by a Cloudflare Worker. It calls the FastAPI service using `VITE_API_URL`, and that service gets catalog data from TMDB. For watchlist requests, the browser stores an anonymous UUID in local storage and sends it as `X-Visitor-ID`; the API scopes reads and writes to that ID. There are no accounts or authentication, and clearing browser data loses access to that browser's list. Cloudflare's dashboard Git integration deploys the frontend Worker from this repository.

```mermaid
flowchart LR
  Visitor --> Worker[Cloudflare Worker<br/>serves React app]
  Worker --> Browser[React + TypeScript SPA]
  Browser -->|VITE_API_URL| API[FastAPI service]
  API --> TMDB[TMDB API]
  GitHub[GitHub repository] -->|Git integration| Worker
```

Movie and TV detail pages support direct links. For those routes, the Worker serves the app shell and the client router loads the matching page. Unknown routes return an HTTP 404 with the app shell.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

The `.env.example` file uses a local API at `http://localhost:8000/`. For a production build, set `VITE_API_URL` to `https://flickpicks.fastapicloud.dev/`. Set `VITE_WATCH_BASE_URL` to the HTTPS base URL for movie and TV watch pages, such as `https://7movies.ac`. Vite reads these values at build time. Run the checks and build commands with:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

## Deployment and routing

The `flickpick` Worker deploys through Cloudflare's dashboard Git integration. `wrangler.jsonc` sets the Worker name, the `./dist` build output, and single-page-app asset handling. GitHub Actions runs lint, typecheck, tests, and build on pushes and pull requests targeting `main`; it does not deploy the application.

| Path | HTTP status | Response |
| --- | --- | --- |
| `/` | 200 | `index.html` |
| `/movies/:digits` | 200 | `index.html` |
| `/tv/:digits` | 200 | `index.html` |
| Unknown paths | 404 | App shell, then the client `NotFound` page |
| `/assets/*` | 200 | Hashed static assets |

Optional local packaging check (does not publish):

```bash
pnpm deploy:dry
```

## Case study

Read the [published case study on melverton.com](https://melverton.com/projects/flickpick) or the [source Markdown](docs/portfolio-case-study.md). It covers the product and engineering work, with links to the [live app](https://flickpick.mel-2cb.workers.dev/), [frontend repository](https://github.com/ayomel/flickpicks), and [API repository](https://github.com/ayomel/flickpicks-api).

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
