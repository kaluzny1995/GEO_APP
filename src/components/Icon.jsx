const ICONS = {
  'circular-arrows-couple': (
    <>
      <path d="M20.5 8.5A8.5 8.5 0 0 0 5.6 6.4L3 9" />
      <polyline points="3 4 3 9 8 9" />
      <path d="M3.5 15.5A8.5 8.5 0 0 0 18.4 17.6L21 15" />
      <polyline points="21 20 21 15 16 15" />
    </>
  ),
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
      className={['icon', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths}
    </svg>
  )
}
