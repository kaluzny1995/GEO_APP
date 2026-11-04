// GEO_APP routes
import Landing from './views/Landing.jsx'
import DataSourceFilesView from './views/DataSourceFilesView.jsx'
import DataQualityView from './views/DataQualityView.jsx'
import DataQuantityView from './views/DataQuantityView.jsx'
import { EventCategoriesView, EventLocationsView } from './views/EventCountsView.jsx'
import { ROUTES } from './config.js'

const routes = [
  { path: ROUTES.overview, name: 'Overview', layout: '', element: Landing },
  { path: ROUTES.dataSourceFiles, name: 'Data Source Files', layout: '', element: DataSourceFilesView },
  { path: ROUTES.dataQuality, name: 'Data Quality', layout: '', element: DataQualityView },
  { path: ROUTES.dataQuantity, name: 'Data Quantity', layout: '', element: DataQuantityView },
  { path: ROUTES.eventCategories, name: 'Event Categories', layout: '', element: EventCategoriesView },
  { path: ROUTES.eventLocations, name: 'Event Locations', layout: '', element: EventLocationsView },
]

export default routes
