import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import TopNavbar from './components/TopNavbar.jsx'
import Footer from './components/Footer.jsx'
import routes from './routes.js'
import { datasets } from './data/mockData.js'
import { overallScore } from './utils/quality.js'

export default function App() {
  const [datasetId, setDatasetId] = useState(datasets[0].id)
  const dataset = datasets.find((d) => d.id === datasetId) ?? datasets[0]
  const score = overallScore(dataset.metrics)

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="main-panel">
        <TopNavbar
          title="GEO_APP · Data Quality"
          subtitle={`${dataset.name} — overall ${score}%`}
          right={
            <select value={datasetId} onChange={(e) => setDatasetId(e.target.value)}>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          }
        />
        <main className="content">
          <Routes>
            {routes.map((r) => {
              const El = r.element
              return (
                <Route
                  key={r.layout + r.path}
                  path={r.layout + r.path}
                  element={<El datasetId={datasetId} onDatasetChange={setDatasetId} />}
                />
              )
            })}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}
