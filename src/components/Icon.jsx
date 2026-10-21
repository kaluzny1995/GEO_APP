const fileIcon = (label) => (
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <text
      x="12"
      y="18"
      textAnchor="middle"
      fontSize="5"
      fontWeight="700"
      fontFamily="Inter, sans-serif"
      fill="currentColor"
      stroke="none"
    >
      {label}
    </text>
  </>
)

const ICONS = {
  'circular-arrows-couple': (
    <>
      <path d="M20.5 8.5A8.5 8.5 0 0 0 5.6 6.4L3 9" />
      <polyline points="3 4 3 9 8 9" />
      <path d="M3.5 15.5A8.5 8.5 0 0 0 18.4 17.6L21 15" />
      <polyline points="21 20 21 15 16 15" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <polyline points="7 10 12 15 17 10" />
      <path d="M5 21h14" />
    </>
  ),
  'file-csv': fileIcon('CSV'),
  'file-json': fileIcon('JSON'),
  'file-xml': fileIcon('XML'),
  'file-txt': fileIcon('TXT'),
}

export default function Icon({ name, size = 18, className = '', ...rest }) {
  const paths = ICONS[name]
  if (!paths) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['icon', `icon-${name}`, className].filter(Boolean).join(' ')}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths}
    </svg>
  )
}
