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

// --- User-facing status labels per tone ---
export const SCORE_LABELS = { ok: 'Healthy', warn: 'Needs attention', bad: 'Critical' }
export const GAUGE_LABELS = { ok: 'Good', warn: 'Warning', bad: 'Critical', neutral: 'No data' }
