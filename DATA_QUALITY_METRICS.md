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

## Validation Rules

GEO_API exposes validation-rule metrics for each dataset table. Each value is
the percentage of rows that violate the check. A table only returns metrics for
rules that apply to its columns, so the number of evaluated rules varies by
table and snapshot.

A rule is scored by its **violating percentage**:

- under 1% — **pass** (pass rate above 99%)
- 1% to just under 10% — **warn** (pass rate 90–99%)
- 10% or more — **fail** (pass rate below 90%)

The thresholds are configured as `RULE_THRESHOLDS` in `src/config.js`.

### Table-level metrics

| Metric | Meaning |
|--------|---------|
| `bad_row_pct` | Share of rows violating at least one validation rule. Drives the Validity gauge. |
| `dup_row_pct` | Share of duplicate full rows within the snapshot. Drives the Uniqueness gauge. |
| `null_pct__<column>` | Share of rows where the column is NULL. Drives the Completeness gauge. |
| `bad_pct__<rule>` | Share of rows failing one specific field or model rule. |

### Model rules

These checks are emitted as `bad_pct__<rule>` (for example,
`not_blank__event_id` is reported as `bad_pct__not_blank__event_id`).

| Rule | Meaning |
|------|---------|
| `not_blank__<column>` | Required text — string columns must not be blank after trimming. NULLs are measured separately by `null_pct__<column>`. |
| `file_date_iso` | Snapshot date — `file_date` must match `YYYY-MM-DD`. Applies to dated snapshots only, not `overall`. |

`not_blank__*` checks are excluded from the Consistency gauge because blank
values are a completeness/validity concern, not a domain/range consistency
concern.

### Dataset rules

These checks are also emitted as `bad_pct__<rule>`.

| Rule | Applies to | Meaning |
|------|------------|---------|
| `latitude_range` | Coordinate data | Latitude must be within −90..90. |
| `longitude_range` | Coordinate data | Longitude must be within −180..180. |
| `danger_level_domain` | Avalanche data | `danger_level` must be 1..5, or −1 for “no rating”. |
| `forecast_order` | Avalanche data | `forecast_end` must not precede `forecast_start` (NULLs allowed). |
| `alert_level_domain` | GDACS events | `alert_level` must be Green, Orange or Red. |
| `acres_non_negative` | Wildfires | `acres` must be ≥ 0. |
| `percent_contained_0_100` | Wildfires | `percent_contained` must be within 0..100. |
| `geometry_count_non_negative` | EONET events | `geometry_count` must be ≥ 0. |
| `wmo_wind_non_negative` | Cyclones | `wmo_wind` must be ≥ 0. |
| `discharge_non_negative` | Floods | `discharge_m3s` must be ≥ 0. |
| `gauge_height_non_negative` | Rivers | `gauge_height` must be ≥ 0. |
| `flood_category_domain` | Rivers | `flood_category` must be one of `no_flooding`, `action`, `minor`, `moderate` or `major`. |

### Rule rows in the dashboard

`src/views/DataQualityView.jsx` turns every scoreable metric into a row in the
rule-level table:

| Rule row | Source metric | Rule ID prefix |
|----------|---------------|----------------|
| Row validity | `bad_row_pct` | `R-101` |
| Row uniqueness | `dup_row_pct` | `R-102` |
| Field completeness: `<column>` | `null_pct__<column>` | `R-20n` |
| Field validity: `<rule>` | `bad_pct__<rule>` | `R-30n` |

The table shows `Pass %` as `100 − violating_percentage`, rounded to the
nearest whole percentage, and `Fails` as an estimate based on
`FAIL_ESTIMATE_ROWS` (1,000 nominal rows, not the actual `total_records`
count). Rule status follows the [Rule Status](#rule-status) thresholds below.

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

## Data Quantity Flow (frontend)

The `/data-quantity` view reuses `GET /data-quality/{table_name}/{file_date}` and
reads the `total_records` metric for all 19 tables. Snapshot dates are discovered
from `union_etl`'s `file-dates` probe; the view defaults to the latest dated
snapshot and falls back to `overall` when only the aggregate is available. The
19 count requests run in parallel.

For each configured plain → ETL pair (`TABLE_FLOW` in `src/config.js`):

- `difference = plain total_records − ETL total_records`
- a positive difference is shown as “N filtered out”
- zero is shown as “No rows filtered”
- a negative difference is shown as “N more in ETL” (the overall aggregate can
  contain more ETL rows than the plain snapshot, for example EONET)
- if either count is missing, the arrow badge says “No count” and the missing
  card(s) show an italic red “no data” value

All ETL tables are connected to the `union_etl` card in the diagram; the curves
are illustrative and do not imply per-table additive totals. The union card
shows `union_etl`'s own `total_records` for the same snapshot.

## Datasets

19 tables are tracked in the UI (`TABLE_NAMES` in `src/config.js`):

- Data sources: `eonet_event`, `nifc_fire`, `ibtracs_cyclone`, `usgs_earthquake`,
  `usgs_volcano`, `openmeteo_flood`, `gdacs_event`, `usgs_nwis`, `avalanche_org`
- ETL tables: the same names with an `_etl` suffix
- Union table: `union_etl`

The table dropdown lists all 19 names alphabetically and defaults to
`avalanche_org`; the snapshot dropdown is also sorted alphabetically.
