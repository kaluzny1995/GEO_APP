import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Pagination from './Pagination.jsx'

const renderPagination = (props = {}) => {
  const onPageChange = vi.fn()
  render(
    <Pagination
      page={2}
      pageCount={4}
      total={35}
      pageSize={10}
      onPageChange={onPageChange}
      label="CSV files"
      {...props}
    />
  )
  return onPageChange
}

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the current range and page count', () => {
    renderPagination()

    expect(screen.getByText('Showing 11–20 of 35 CSV files')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument()
  })

  it('navigates to first, previous, next and last page', () => {
    const onPageChange = renderPagination()

    fireEvent.click(screen.getByRole('button', { name: 'First page of CSV files' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous page of CSV files' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next page of CSV files' }))
    fireEvent.click(screen.getByRole('button', { name: 'Last page of CSV files' }))

    expect(onPageChange.mock.calls.map(([page]) => page)).toEqual([1, 1, 3, 4])
  })

  it('disables backward controls on the first page and forward controls on the last', () => {
    const { unmount } = render(
      <Pagination
        page={1}
        pageCount={4}
        total={35}
        pageSize={10}
        onPageChange={vi.fn()}
        label="CSV files"
      />
    )

    expect(screen.getByRole('button', { name: 'First page of CSV files' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous page of CSV files' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page of CSV files' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Last page of CSV files' })).toBeEnabled()
    unmount()

    render(
      <Pagination
        page={4}
        pageCount={4}
        total={35}
        pageSize={10}
        onPageChange={vi.fn()}
        label="CSV files"
      />
    )

    expect(screen.getByRole('button', { name: 'First page of CSV files' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Previous page of CSV files' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page of CSV files' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Last page of CSV files' })).toBeDisabled()
  })

  it('handles an empty table as a single empty page', () => {
    renderPagination({ page: 1, pageCount: 1, total: 0, pageSize: 10 })

    expect(screen.getByText('Showing 0 of 0 CSV files')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page of CSV files' })).toBeDisabled()
  })
})
