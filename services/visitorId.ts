import type { InternalAxiosRequestConfig } from 'axios'

export const VISITOR_ID_STORAGE_KEY = 'flickpicks.visitorId'

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

let inMemoryVisitorId: string | undefined

export const getVisitorId = () => {
  try {
    const storedId = localStorage.getItem(VISITOR_ID_STORAGE_KEY)
    if (storedId && UUID_V4_PATTERN.test(storedId)) return storedId
  } catch {
    if (inMemoryVisitorId) return inMemoryVisitorId
  }

  const visitorId = crypto.randomUUID()
  try {
    localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId)
  } catch {
    inMemoryVisitorId = visitorId
  }
  return visitorId
}

export const withVisitorIdHeader = (config: InternalAxiosRequestConfig) => {
  const baseUrl = new URL(config.baseURL ?? 'http://localhost')
  const url = new URL(config.url ?? '', baseUrl)
  if (
    url.origin === baseUrl.origin &&
    (url.pathname === '/entry' || url.pathname.startsWith('/entry/'))
  ) {
    config.headers.set('X-Visitor-ID', getVisitorId())
  }
  return config
}
