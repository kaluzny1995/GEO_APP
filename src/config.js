// Central configuration for GEO_APP — tune values here instead of editing
// components or the API client.

// --- Branding ---
export const APP_NAME = 'GEO_APP'
export const APP_TAGLINE = 'Data Quality & Quantity'
export const APP_TITLE = `${APP_NAME} · ${APP_TAGLINE}`
export const APP_OVERVIEW_SUBTITLE = 'Geographic data quality & quantity overview'

// --- App routes ---
export const ROUTES = {
  overview: '/overview',
  dataQuality: '/data-quality',
  dataQuantity: '/data-quantity',
  eventCategories: '/event-categories',
  eventLocations: '/event-locations',
}
export const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

// Download options shown for every downloadable table.
export const DOWNLOAD_FORMATS = [
  { id: 'csv', label: '.csv', mime: 'text/csv;charset=utf-8' },
  { id: 'json', label: '.json', mime: 'application/json;charset=utf-8' },
  { id: 'xml', label: '.xml', mime: 'application/xml;charset=utf-8' },
  { id: 'txt', label: '.txt', mime: 'text/plain;charset=utf-8' },
]

// --- GEO_API ---
// Override the API location with VITE_API_BASE at build/dev time.
export const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:8000'
export const API_TIMEOUT_MS = 8000
// Rolling window probed by the data-quality view to discover snapshot dates.
// The data-quantity view uses the authoritative /data-quantity/dates endpoint.
export const PROBE_WINDOW_DAYS = 120
// GEO_API rejects /data-quality/{table}/file-dates with more than 100 dates
// (422 "At most 100 file_dates may be requested."), so the probe is split into
// batches of at most this many dates and the responses are merged.
export const FILE_DATES_LIMIT = 100
export const API_DOWN_MESSAGE = 'API server is down! Please check the API server.'
export const API_PATHS = {
  dataQuality: '/data-quality',
  dataQualityFileDates: 'file-dates',
  dataQuantity: '/data-quantity',
  dataQuantityDates: 'dates',
  eventCountsCategory: '/event-counts/category',
  eventCountsLocation: '/event-counts/location',
}
export const API_QUERY_PARAMS = { fileDates: 'file_dates' }

// --- Data-quality domain ---
export const OVERALL_DATE = 'overall'
export const DEFAULT_TABLE = 'avalanche_org'

// 19 tables: 9 plain data source tables, 9 ETL tables, 1 union table.
export const ETL_SUFFIX = '_etl'
export const UNION_TABLE = 'union_etl'
export const TABLE_NAMES = [
  // Plain data source tables (9)
  'eonet_event',
  'nifc_fire',
  'ibtracs_cyclone',
  'usgs_earthquake',
  'usgs_volcano',
  'openmeteo_flood',
  'gdacs_event',
  'usgs_nwis',
  'avalanche_org',
  // ETL tables (9)
  'eonet_event_etl',
  'nifc_fire_etl',
  'ibtracs_cyclone_etl',
  'usgs_earthquake_etl',
  'usgs_volcano_etl',
  'openmeteo_flood_etl',
  'gdacs_event_etl',
  'usgs_nwis_etl',
  'avalanche_org_etl',
  // Union table (1)
  UNION_TABLE,
]

// Plain → ETL pairs shown in the Data Quantity flow diagram.
export const PLAIN_TABLE_NAMES = TABLE_NAMES.filter(
  (table) => table !== UNION_TABLE && !table.endsWith(ETL_SUFFIX)
)
export const ETL_TABLE_NAMES = TABLE_NAMES.filter(
  (table) => table !== UNION_TABLE && table.endsWith(ETL_SUFFIX)
)
export const TABLE_FLOW = PLAIN_TABLE_NAMES.map((plain) => ({
  plain,
  etl: `${plain}${ETL_SUFFIX}`,
}))

export const APP_SUBTITLE = `Monitor data quality and event quantity across ${TABLE_NAMES.length} geographic dataset tables`

// --- Scoring ---
// DAMA dimension scores are 0-100: >= good is ok, >= warn needs attention.
export const SCORE_THRESHOLDS = { good: 90, warn: 75 }
// Rule-level bad_pct thresholds in percent: >= fail -> fail, >= warn -> warn.
export const RULE_THRESHOLDS = { warn: 1, fail: 10 }
// Nominal rows used to translate a bad percentage into an estimated fail count.
export const FAIL_ESTIMATE_ROWS = 1000
// Number-formatting locale (explicit so output does not depend on environment).
export const LOCALE = 'en-US'
export const SCORE_DECIMALS = 1
export const PERCENT_DECIMALS = 1
// Changes smaller than this percentage-point delta are displayed as unchanged.
export const CHANGE_EPSILON = 0.05

// Long-format metric names and prefixes returned by GEO_API.
export const QUALITY_METRICS = {
  totalRecords: 'total_records',
  badRowPct: 'bad_row_pct',
  dupRowPct: 'dup_row_pct',
  nullPctPrefix: 'null_pct__',
  badPctPrefix: 'bad_pct__',
  notBlank: 'not_blank__',
}

// Rule IDs shown in the data-quality rule table.
export const RULE_IDS = {
  rowValidity: 'R-101',
  rowUniqueness: 'R-102',
  completenessPrefix: 'R-20',
  validityPrefix: 'R-30',
}

export const RULE_STATUSES = ['pass', 'warn', 'fail']
export const RULE_STATUS_LABELS = { pass: 'Pass', warn: 'Warn', fail: 'Fail' }

export const KPI_LABELS = {
  rows: 'Rows scanned',
  rules: 'Rules evaluated',
  failRate: 'Fail rate',
  datasets: 'Datasets',
}

// DAMA dimensions and their plain-language gauge descriptions.
export const QUALITY_DIMENSIONS = [
  { id: 'completeness', label: 'Completeness', description: 'avg % of non-NULL values across fields' },
  { id: 'validity', label: 'Validity', description: '% of rows passing all rules' },
  { id: 'uniqueness', label: 'Uniqueness', description: '% of unique (non-duplicate) rows' },
  { id: 'consistency', label: 'Consistency', description: 'avg % of domain/range rules passing' },
]

// --- Event counts ---
// The shared severity scale's four danger levels. Ratings outside this list
// (`none`, `no_rating`, null) only contribute to overall counts.
export const DANGER_LEVELS = ['low', 'medium', 'high', 'extreme']
export const UNRATED_DANGER_RATINGS = ['none', 'no_rating']

// Initial row/column orientation per heatmap (true = transposed).
export const DEFAULT_MATRIX_TRANSPOSED = { category: false, location: false }

// --- Country code -> region groups (Event Locations matrix) ---
// Column order in the source × region heatmap. Codes outside these groups
// fall back to DEFAULT_REGION.
export const REGION_ORDER = [
  'USA',
  'Canada',
  'South and Central America',
  'Europe',
  'Asia',
  'Africa',
  'Oceania',
  'Waters/Oceans',
  'Antarctica',
]

export const COUNTRY_REGIONS = {
  USA: ['US', 'PR', 'GU', 'MP', 'AS', 'VI', 'UM'],
  Canada: ['CA'],
  'South and Central America': [
    'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU', 'DO', 'HT', 'JM', 'BS', 'TT', 'BB',
    'DM', 'GD', 'LC', 'VC', 'KN', 'AG', 'AI', 'MS', 'VG', 'KY', 'TC', 'AW', 'CW', 'BQ', 'SX',
    'MF', 'BL', 'GP', 'MQ', 'BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY',
    'SR', 'GF', 'FK', 'GS',
  ],
  Europe: [
    'AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO',
    'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'UA', 'GB', 'VA', 'XK',
    'GI', 'FO', 'GG', 'IM', 'JE', 'AX', 'SJ', 'CY',
  ],
  Asia: [
    'AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'GE', 'HK', 'IN', 'ID', 'IR', 'IQ',
    'IL', 'JP', 'JO', 'KZ', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'KP',
    'OM', 'PK', 'PH', 'QA', 'SA', 'SG', 'KR', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM',
    'AE', 'UZ', 'VN', 'YE',
  ],
  Africa: [
    'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ',
    'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG',
    'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO',
    'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW', 'RE', 'YT', 'SH', 'EH',
  ],
  Oceania: [
    'AU', 'NZ', 'PG', 'FJ', 'VU', 'NC', 'SB', 'TO', 'WF', 'PF', 'WS', 'KI', 'TV', 'NR', 'FM',
    'MH', 'PW', 'CK', 'NU', 'TK', 'PN',
  ],
  'Waters/Oceans': ['ZZ'],
  Antarctica: ['AQ', 'BV', 'HM'],
}

export const DEFAULT_REGION = 'Other'

// --- User-facing status labels per tone ---
export const SCORE_LABELS = { ok: 'Healthy', warn: 'Needs attention', bad: 'Critical' }
export const GAUGE_LABELS = { ok: 'Good', warn: 'Warning', bad: 'Critical', neutral: 'No data' }
