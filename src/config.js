// Central configuration for GEO_APP — tune values here instead of editing
// components or the API client.

// --- GEO_API ---
// Override the API location with VITE_API_BASE at build/dev time.
export const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:8000'
export const API_TIMEOUT_MS = 8000
// Rolling window probed to discover snapshot dates (the API has no list-dates
// endpoint).
export const PROBE_WINDOW_DAYS = 120

// --- Data-quality domain ---
export const OVERALL_DATE = 'overall'
export const DEFAULT_TABLE = 'avalanche_org'

// 19 tables: 9 plain data source tables, 9 ETL tables, 1 union table.
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
  'union_etl',
]

// --- Scoring ---
// DAMA dimension scores are 0-100: >= good is ok, >= warn needs attention.
export const SCORE_THRESHOLDS = { good: 90, warn: 75 }
// Rule-level bad_pct thresholds in percent: >= fail -> fail, >= warn -> warn.
export const RULE_THRESHOLDS = { warn: 1, fail: 10 }
// Nominal rows used to translate a bad percentage into an estimated fail count.
export const FAIL_ESTIMATE_ROWS = 1000
// Number-formatting locale (explicit so output does not depend on environment).
export const LOCALE = 'en-US'

// --- Event counts ---
// The shared severity scale's four danger levels. Ratings outside this list
// (`none`, `no_rating`, null) only contribute to overall counts.
export const DANGER_LEVELS = ['low', 'medium', 'high', 'extreme']
export const UNRATED_DANGER_RATINGS = ['none', 'no_rating']

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
