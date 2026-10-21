// GEO_APP routes
import Landing from './views/Landing.jsx'
import DataQualityView from './views/DataQualityView.jsx'
import { EventCategoriesView, EventLocationsView } from './views/EventCountsView.jsx'

const routes = [
  { path: '/overview', name: 'Overview', layout: '', element: Landing },
  { path: '/data-quality', name: 'Data Quality', layout: '', element: DataQualityView },
  { path: '/event-categories', name: 'Event Categories', layout: '', element: EventCategoriesView },
  { path: '/event-locations', name: 'Event Locations', layout: '', element: EventLocationsView },
]

export default routes
