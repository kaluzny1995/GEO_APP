// GEO_APP routes — frontpage only for now.
import Landing from './views/Landing.jsx'

const routes = [
  { path: '/overview', name: 'Overview', layout: '/admin', element: Landing },
]

export default routes
