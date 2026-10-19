/** App shell routes that should return HTTP 200 with index.html. */
export const isAppShellPath = (pathname: string): boolean => {
  if (pathname === '/') return true
  if (/^\/movies\/\d+$/.test(pathname)) return true
  return /^\/tv\/\d+$/.test(pathname)
}

/** Static files Vite emits under /assets keep asset-first routing. */
export const isStaticAssetPath = (pathname: string): boolean =>
  /\.\w+$/.test(pathname) && !pathname.endsWith('.html')
