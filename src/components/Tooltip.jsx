import { cloneElement, useId, useState } from 'react'

export default function Tooltip({ label, children }) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  return (
    <span
      className="tooltip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === 'Escape') hide()
      }}
    >
      {cloneElement(children, visible ? { 'aria-describedby': id } : {})}
      {visible && (
        <span role="tooltip" id={id} className="tooltip">
          {label}
        </span>
      )}
    </span>
  )
}
