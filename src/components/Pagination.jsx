const rangeLabel = (start, end, total) => (total === 0 ? '0 of 0' : `${start + 1}–${end} of ${total}`)

export default function Pagination({
  page = 1,
  pageCount = 1,
  total = 0,
  pageSize = 1,
  onPageChange,
  label = 'rows',
}) {
  const count = Math.max(1, pageCount)
  const current = Math.min(Math.max(1, page), count)
  const size = Math.max(1, pageSize)
  const start = total === 0 ? 0 : (current - 1) * size
  const end = Math.min(start + size, total)

  const go = (target) => {
    if (target >= 1 && target <= count && target !== current) onPageChange(target)
  }

  return (
    <div className="pagination" role="navigation" aria-label={`${label} pagination`}>
      <span className="muted">Showing {rangeLabel(start, end, total)} {label}</span>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-sm ghost"
          onClick={() => go(1)}
          disabled={current <= 1}
          aria-label={`First page of ${label}`}
        >
          « First
        </button>
        <button
          type="button"
          className="btn btn-sm ghost"
          onClick={() => go(current - 1)}
          disabled={current <= 1}
          aria-label={`Previous page of ${label}`}
        >
          ‹ Prev
        </button>
        <span className="pagination-page">Page {current} of {count}</span>
        <button
          type="button"
          className="btn btn-sm ghost"
          onClick={() => go(current + 1)}
          disabled={current >= count}
          aria-label={`Next page of ${label}`}
        >
          Next ›
        </button>
        <button
          type="button"
          className="btn btn-sm ghost"
          onClick={() => go(count)}
          disabled={current >= count}
          aria-label={`Last page of ${label}`}
        >
          Last »
        </button>
      </div>
    </div>
  )
}
