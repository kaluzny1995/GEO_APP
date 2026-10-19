// GEO_APP routes
import Landing from './views/Landing.jsx'
import DataQualityView from './views/DataQualityView.jsx'

const routes = [
  { path: '/overview', name: 'Overview', layout: '', element: Landing },
  { path: '/data-quality', name: 'Data Quality', layout: '', element: DataQualityView },
]

export default routes
