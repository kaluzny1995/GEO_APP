export default function TopNavbar({ title, subtitle, right }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-actions">{right}</div>
    </header>
  )
}
