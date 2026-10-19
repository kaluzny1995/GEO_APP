import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import TopNavbar from './components/TopNavbar.jsx'
import Footer from './components/Footer.jsx'
import routes from './routes.js'

export default function App() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="main-panel">
        <TopNavbar
          title="GEO_APP · Data Quality"
          subtitle="Monitor completeness, validity, uniqueness and consistency across 19 geographic dataset tables"
        />
        <main className="content">
          <Routes>
            {routes.map((r) => {
              const El = r.element
              return (
                <Route
                  key={r.layout + r.path}
                  path={r.layout + r.path}
                  element={<El />}
                />
              )
            })}
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}
