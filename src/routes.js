// GEO_APP routes
import Landing from './views/Landing.jsx'
import DataQualityView from './views/DataQualityView.jsx'

const routes = [
  { path: '/overview', name: 'Overview', layout: '/admin', element: Landing },
  { path: '/data-quality/:tableName/:fileDate', name: 'Data Quality', layout: '/admin', element: DataQualityView },
]

export default routes
