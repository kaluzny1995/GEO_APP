// GEO_APP routes — Black Dashboard-style Admin layout, Vite port.
import Dashboard from './views/Dashboard.jsx'
import Tables from './views/Tables.jsx'
import ChartsView from './views/ChartsView.jsx'
import Gauges from './views/Gauges.jsx'
import Badges from './views/Badges.jsx'

const routes = [
  { path: '/dashboard', name: 'Dashboard', layout: '/admin', element: Dashboard },
  { path: '/tables', name: 'Tables', layout: '/admin', element: Tables },
  { path: '/charts', name: 'Charts', layout: '/admin', element: ChartsView },
  { path: '/gauges', name: 'Gauges', layout: '/admin', element: Gauges },
  { path: '/badges', name: 'Badges', layout: '/admin', element: Badges },
]

export default routes
