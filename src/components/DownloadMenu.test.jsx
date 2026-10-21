import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DownloadMenu from './DownloadMenu.jsx'
import { downloadTable } from '../utils/tableExport.js'

vi.mock('../utils/tableExport.js', () => ({
  downloadTable: vi.fn(),
}))

const TABLE = {
  title: 'Categories by source',
  filename: 'categories-by-source',
  columns: ['Source', 'Count'],
  rows: [['GDACS', 10]],
}

describe('DownloadMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens on hover, lists all formats and downloads the selected one', async () => {
    const user = userEvent.setup()
    render(<DownloadMenu table={TABLE} />)

    const button = screen.getByRole('button', { name: 'Download Categories by source' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'menu')

    await user.hover(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu', { name: 'Download Categories by source' })).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
    for (const label of ['.csv', '.json', '.xml', '.txt']) {
      expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument()
    }

    const icons = document.querySelectorAll('.download-file-icon')
    expect(icons).toHaveLength(4)
    expect(icons[0]).toHaveClass('icon-file-csv')
    expect(icons[1]).toHaveClass('icon-file-json')
    expect(icons[2]).toHaveClass('icon-file-xml')
    expect(icons[3]).toHaveClass('icon-file-txt')

    await user.click(screen.getByRole('menuitem', { name: '.csv' }))

    expect(downloadTable).toHaveBeenCalledWith(TABLE, 'csv')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens on focus and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<DownloadMenu table={TABLE} />)

    const button = screen.getByRole('button', { name: 'Download Categories by source' })
    await user.tab()
    expect(button).toHaveFocus()
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('closes when the pointer leaves the menu area', async () => {
    const user = userEvent.setup()
    render(<DownloadMenu table={TABLE} />)

    const button = screen.getByRole('button', { name: 'Download Categories by source' })
    await user.hover(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.unhover(button)
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('closes when clicking outside', async () => {
    const user = userEvent.setup()
    render(<DownloadMenu table={TABLE} />)

    await user.click(screen.getByRole('button', { name: 'Download Categories by source' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
