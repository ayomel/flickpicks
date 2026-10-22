import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SearchDropdown } from './SearchDropdown'

afterEach(() => {
  cleanup()
})

describe('SearchDropdown', () => {
  it('opens downward by default', () => {
    render(
      <SearchDropdown listboxId="list" isOpen>
        Result
      </SearchDropdown>,
    )

    expect(screen.getByRole('listbox')).toHaveClass('top-[calc(100%+6px)]')
  })

  it('opens upward when placement is top', () => {
    render(
      <SearchDropdown listboxId="list" isOpen placement="top">
        Result
      </SearchDropdown>,
    )

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveClass('bottom-[calc(100%+6px)]')
    expect(listbox).toHaveClass('max-h-[min(20rem,60svh)]')
  })

  it('fills the mobile search panel and scrolls results in place', () => {
    render(
      <SearchDropdown listboxId="list" isOpen placement="inline">
        Result
      </SearchDropdown>,
    )

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveClass('static')
    expect(listbox).toHaveClass('min-h-0')
    expect(listbox).toHaveClass('flex-1')
    expect(listbox).toHaveClass('overscroll-contain')
  })
})
