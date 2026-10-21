/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WATCH_BASE_URL: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
