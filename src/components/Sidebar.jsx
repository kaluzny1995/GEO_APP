import { NavLink } from 'react-router-dom'
import routes from '../routes.js'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">G</div>
        <div>
          <h2>GEO_APP</h2>
          <small>Data Quality</small>
        </div>
      </div>
      <nav className="nav">
        {routes
          .filter((r) => !r.path.includes(':'))
          .map((r) => (
            <NavLink
              key={r.path}
              to={r.layout + r.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span className="dot" />
              {r.name}
            </NavLink>
          ))}
      </nav>
      <div className="foot">
        Black Dashboard UI
        <br />
        ported to Vite · MIT
      </div>
    </aside>
  )
}
