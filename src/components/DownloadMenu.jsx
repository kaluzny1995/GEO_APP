import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { DOWNLOAD_FORMATS } from '../config.js'
import { downloadTable } from '../utils/tableExport.js'

export default function DownloadMenu({ table }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const closeTimerRef = useRef(null)

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), [])

  useEffect(() => {
    if (!open) return undefined

    const closeOutside = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  const cancelClose = () => window.clearTimeout(closeTimerRef.current)

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 150)
  }

  const choose = (formatId) => {
    cancelClose()
    downloadTable(table, formatId)
    setOpen(false)
  }

  return (
    <span
      className="download-wrap"
      ref={wrapRef}
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return
        const wrap = event.currentTarget
        window.setTimeout(() => {
          if (!wrap.contains(document.activeElement)) setOpen(false)
        }, 0)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          cancelClose()
          setOpen(false)
          buttonRef.current?.focus()
        }
      }}
    >
      <button
        type="button"
        ref={buttonRef}
        className="btn btn-sm ghost download-btn"
        aria-label={`Download ${table.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(true)}
      >
        <span className="download-icon">
          <Icon name="download" />
        </span>
      </button>
      {open && (
        <div id={id} className="download-menu" role="menu" aria-label={`Download ${table.title}`}>
          {DOWNLOAD_FORMATS.map((format) => (
            <button
              key={format.id}
              type="button"
              role="menuitem"
              className={`download-item download-item-${format.id}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(format.id)}
            >
              <Icon name={`file-${format.id}`} className="download-file-icon" />
              <span>{format.label}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  )
}
