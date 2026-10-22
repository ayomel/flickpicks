import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  VISITOR_ID_STORAGE_KEY,
  withVisitorIdHeader,
} from '../../services/visitorId'

beforeEach(() => {
  localStorage.setItem(
    VISITOR_ID_STORAGE_KEY,
    '11111111-1111-4111-8111-111111111111',
  )
})

afterEach(() => localStorage.clear())

const makeConfig = (url: string) =>
  ({
    url,
    baseURL: 'https://api.example.test/',
    headers: new AxiosHeaders(),
  }) as InternalAxiosRequestConfig

describe('withVisitorIdHeader', () => {
  it.each(['/entry', '/entry/1', 'https://api.example.test/entry'])(
    'adds the visitor ID to %s',
    (url) => {
      const config = withVisitorIdHeader(makeConfig(url))
      expect(config.headers.get('X-Visitor-ID')).toBe(
        '11111111-1111-4111-8111-111111111111',
      )
    },
  )

  it('does not send the visitor ID for public catalog requests', () => {
    const config = withVisitorIdHeader(makeConfig('/movies/42'))
    expect(config.headers.has('X-Visitor-ID')).toBe(false)
  })

  it('does not send the visitor ID to another origin', () => {
    const config = withVisitorIdHeader(
      makeConfig('https://other.example.test/entry'),
    )
    expect(config.headers.has('X-Visitor-ID')).toBe(false)
  })
})
