# Data Quality Metrics Specification

## Overview

GEO_API exposes data quality metrics per dataset table and file date. The API
returns **long-format metric rows** (one row per metric), which the app maps to
DAMA-DMBOK v2 quality dimensions for visualization.

Base URL: `http://localhost:8000`

## Endpoints

| Endpoint                                              | Description                              |
|-------------------------------------------------------|------------------------------------------|
| `GET /data-quality/{table_name}`                      | Overall snapshot (`file_date=overall`)   |
| `GET /data-quality/{table_name}/{file_date}`          | Metrics for one snapshot date            |
| `GET /data-quality/{table_name}/file-dates?file_dates=overall,2024-10-15` | Metrics for the requested snapshot dates |

There is no endpoint that enumerates available dates. The app probes a rolling
window of the **last 120 days** (plus `overall` and the currently selected date)
with a single `file_dates` query and keeps the `file_date` values that return
rows. The probe runs when the view loads (for the default selection) and is
re-run when the user switches tables.
The result is cached per table for the session, so switching snapshots does not
re-probe. As of Oct 2026, all 19 tables have daily snapshots from `2026-09-01`
to `2026-10-09` plus `overall`.

### Example

```
GET /data-quality/eonet_event/file-dates?file_dates=overall
```

### Response Schema

A JSON array of metric rows:

```json
[
  {
    "table_name": "eonet_event",
    "file_date": "overall",
    "metric": "bad_row_pct",
    "value": 8.0,
    "computed_at": "2026-10-04T01:14:08.910374"
  }
]
```

| Field        | Type   | Description                                  |
|--------------|--------|----------------------------------------------|
| table_name   | string | Dataset table name                           |
| file_date    | string | Snapshot date (`overall` or `YYYY-MM-DD`)    |
| metric       | string | Metric name (see families below)             |
| value        | number | Metric value                                 |
| computed_at  | string | ISO timestamp of computation                 |

## Metric Families

| Prefix / Name              | Meaning                                     |
|----------------------------|---------------------------------------------|
| `null_pct__<field>`        | % of NULLs in a field                       |
| `bad_pct__<rule>`          | % of rows failing a field rule (e.g. `bad_pct__latitude_range`, `bad_pct__not_blank__event_id`) |
| `bad_row_pct`              | % of rows failing any rule                  |
| `dup_row_pct`              | % of duplicate rows                         |
| `unique_row_pct`           | % of unique rows                            |
| `total_records`            | Total row count                             |
| `distinct__<field>`        | Distinct value count per field              |
| `min__` `max__` `mean__`   | Field statistics                            |
| `p05__` … `p95__` `range__` `stddev__` | Field percentiles / dispersion |

## Dimension Mapping (frontend)

Computed in `src/utils/quality.js` (`dimensionsFromMetrics`):

| Dimension    | Formula                                                        | Gauge description                       |
|--------------|----------------------------------------------------------------|-----------------------------------------|
| Completeness | 100 − mean(`null_pct__*`)                                      | avg % of non-NULL values across fields  |
| Validity     | 100 − `bad_row_pct`                                            | % of rows passing all rules             |
| Uniqueness   | 100 − `dup_row_pct`                                            | % of unique (non-duplicate) rows        |
| Consistency  | 100 − mean(`bad_pct__*` excluding `not_blank__*` checks)       | avg % of domain/range rules passing     |

`not_blank__*` rules are excluded from consistency because blank checks
measure completeness/validity, not consistency. If a dimension has no
underlying metrics for a table (e.g. consistency for `union_etl`), the gauge
shows **No data** instead of a misleading 0%.

Overall score = mean of the four dimension scores (metrics with no data are
ignored).

Scores are **floored to one decimal** (never rounded up), so 100% appears only
when every underlying check is clean. Before this, small defects (e.g. a 0.6%
NULL rate averaged over 20 fields -> 99.8%) were rounded to 100% and looked
inconsistent with the rule table.

When a dated snapshot is selected (i.e. not `overall`), each gauge badge and
KPI card (rows scanned, pass count, fail rate) shows the change vs the previous
available snapshot in parentheses, e.g. `Good (+2)`, `7 metrics (+1,204)`,
`bad rows (-0.4)`. Gauge tooltips name the comparison date. Changes are colored
by meaning: green = improvement, red = regression, yellow = unchanged. The Fail
rate card is inverted — a drop in bad rows is an improvement (green). No
indicator is shown for the first available snapshot or for `overall`; the
Datasets card is a frontend constant with no per-snapshot value.

The **Quality trend** chart plots the overall score for every discovered dated
snapshot (the `overall` aggregate is excluded). It is derived from the same
probe response as the date list, so it costs no extra request. The per-date
dimension scores used for the gauge deltas come from the same probe response.

## Thresholds

| Score Range | Badge | Meaning          |
|-------------|-------|------------------|
| ≥ 90        | ok    | Healthy          |
| 75–89       | warn  | Needs attention  |
| < 75        | bad   | Critical         |

## Rule Status

Derived from the underlying metric percentage:

| Metric %  | Status | Rule pass rate |
|-----------|--------|----------------|
| < 1       | pass   | > 99%          |
| 1–9.99    | warn   | 90–99%         |
| ≥ 10      | fail   | < 90%          |

## Datasets

19 tables are tracked in the UI (`tableNames` in `src/views/DataQualityView.jsx`):

- Data sources: `eonet_event`, `nifc_fire`, `ibtracs_cyclone`, `usgs_earthquake`,
  `usgs_volcano`, `openmeteo_flood`, `gdacs_event`, `usgs_nwis`, `avalanche_org`
- ETL tables: the same names with an `_etl` suffix
- Union table: `union_etl`

The table dropdown lists all 19 names alphabetically and defaults to
`avalanche_org`; the snapshot dropdown is also sorted alphabetically.
