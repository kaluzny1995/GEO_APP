// Mock data-quality datasets — replace with GEO_API responses.
export const datasets = [
  {
    id: 'geo-places',
    name: 'GEO Places',
    metrics: { completeness: 92, validity: 88, uniqueness: 97, consistency: 81 },
    trend: [
      { month: 'Jun', score: 78 },
      { month: 'Jul', score: 81 },
      { month: 'Aug', score: 84 },
      { month: 'Sep', score: 86 },
      { month: 'Oct', score: 89 },
    ],
    rules: [
      { id: 'R-101', rule: 'latitude in [-90, 90]', scope: 'places', passRate: 99.2, fails: 412, status: 'pass' },
      { id: 'R-102', rule: 'longitude in [-180, 180]', scope: 'places', passRate: 99.6, fails: 208, status: 'pass' },
      { id: 'R-103', rule: 'name not null', scope: 'places', passRate: 92.4, fails: 3910, status: 'warn' },
      { id: 'R-104', rule: 'country_code ISO-3166', scope: 'places', passRate: 88.1, fails: 6120, status: 'warn' },
      { id: 'R-105', rule: 'no duplicate place_id', scope: 'places', passRate: 97.3, fails: 1390, status: 'pass' },
      { id: 'R-106', rule: 'admin hierarchy consistent', scope: 'places', passRate: 71.5, fails: 14680, status: 'fail' },
    ],
  },
  {
    id: 'geo-rivers',
    name: 'GEO Rivers (NWIS)',
    metrics: { completeness: 84, validity: 91, uniqueness: 95, consistency: 76 },
    trend: [
      { month: 'Jun', score: 74 },
      { month: 'Jul', score: 79 },
      { month: 'Aug', score: 82 },
      { month: 'Sep', score: 84 },
      { month: 'Oct', score: 87 },
    ],
    rules: [
      { id: 'R-201', rule: 'flow >= 0', scope: 'rivers', passRate: 98.9, fails: 132, status: 'pass' },
      { id: 'R-202', rule: 'station_id unique', scope: 'rivers', passRate: 95.1, fails: 588, status: 'pass' },
      { id: 'R-203', rule: 'unit = cfs|m3s', scope: 'rivers', passRate: 91.7, fails: 996, status: 'warn' },
      { id: 'R-204', rule: 'timestamp monotonic', scope: 'rivers', passRate: 76.4, fails: 2832, status: 'fail' },
    ],
  },
  {
    id: 'geo-volcano',
    name: 'GEO Volcanoes (GVP)',
    metrics: { completeness: 96, validity: 94, uniqueness: 99, consistency: 90 },
    trend: [
      { month: 'Jun', score: 88 },
      { month: 'Jul', score: 90 },
      { month: 'Aug', score: 92 },
      { month: 'Sep', score: 93 },
      { month: 'Oct', score: 95 },
    ],
    rules: [
      { id: 'R-301', rule: 'elevation in [-500, 7000]', scope: 'volcanoes', passRate: 99.8, fails: 4, status: 'pass' },
      { id: 'R-302', rule: 'morphology known', scope: 'volcanoes', passRate: 93.5, fails: 132, status: 'warn' },
      { id: 'R-303', rule: 'last_eruption <= today', scope: 'volcanoes', passRate: 99.1, fails: 18, status: 'pass' },
    ],
  },
]

export const kpis = [
  { id: 'rows', label: 'Rows scanned', value: '2.4M', delta: '+3.1%', up: true },
  { id: 'rules', label: 'Rules evaluated', value: '48', delta: '+4', up: true },
  { id: 'fail-rate', label: 'Fail rate', value: '6.8%', delta: '-1.2pp', up: true },
  { id: 'datasets', label: 'Datasets', value: '12', delta: '+2', up: true },
]

export function gaugesFor(dataset) {
  const m = dataset.metrics
  return [
    { id: 'completeness', label: 'Completeness', value: m.completeness },
    { id: 'validity', label: 'Validity', value: m.validity },
    { id: 'uniqueness', label: 'Uniqueness', value: m.uniqueness },
    { id: 'consistency', label: 'Consistency', value: m.consistency },
  ]
}
