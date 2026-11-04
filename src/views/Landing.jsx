import { NavLink } from 'react-router-dom'
import {
  API_PATHS,
  APP_NAME,
  APP_OVERVIEW_SUBTITLE,
  DANGER_LEVELS,
  DEFAULT_TABLE,
  ETL_TABLE_NAMES,
  OVERALL_DATE,
  PLAIN_TABLE_NAMES,
  QUALITY_METRICS,
  REGION_ORDER,
  ROUTES,
  RULE_THRESHOLDS,
  SCORE_THRESHOLDS,
  TABLE_NAMES,
  UNION_TABLE,
  UNRATED_DANGER_RATINGS,
} from '../config.js'

const sourceTables = PLAIN_TABLE_NAMES
const etlTables = ETL_TABLE_NAMES
const unionTables = TABLE_NAMES.filter((t) => t === UNION_TABLE)
const regionList = `${REGION_ORDER.slice(0, -1).join(', ')} and ${REGION_ORDER[REGION_ORDER.length - 1]}`

const RULE_GROUPS = [
  {
    title: 'Table-level metrics',
    rules: [
      [QUALITY_METRICS.badRowPct, 'Row validity — share of rows that violate any rule.'],
      [QUALITY_METRICS.dupRowPct, 'Row uniqueness — share of full-row duplicates within the snapshot.'],
      [`${QUALITY_METRICS.nullPctPrefix}<column>`, 'Field completeness — share of rows where column is NULL.'],
      [`${QUALITY_METRICS.badPctPrefix}<rule>`, 'Field validity — share of rows violating one specific check; the dataset rules below are reported with this prefix.'],
    ],
  },
  {
    title: 'Model rules',
    rules: [
      [`${QUALITY_METRICS.notBlank}<column>`, `Required text — required string columns must not be blank after trimming. NULLs are covered by ${QUALITY_METRICS.nullPctPrefix}<column> instead.`],
      ['file_date_iso', 'Snapshot date — file_date must match YYYY-MM-DD (dated snapshots only, not overall).'],
    ],
  },
  {
    title: 'Dataset rules',
    rules: [
      ['latitude_range', 'Coordinates — latitude must be within −90..90.'],
      ['longitude_range', 'Coordinates — longitude must be within −180..180.'],
      ['danger_level_domain', 'Avalanches — danger_level must be 1..5, or −1 for “no rating”.'],
      ['forecast_order', 'Avalanches — forecast_end must not precede forecast_start (NULLs allowed).'],
      ['alert_level_domain', 'GDACS — alert_level must be Green, Orange or Red.'],
      ['acres_non_negative', 'Wildfires — acres must be ≥ 0.'],
      ['percent_contained_0_100', 'Wildfires — percent_contained must be within 0..100.'],
      ['geometry_count_non_negative', 'EONET — geometry_count must be ≥ 0.'],
      ['wmo_wind_non_negative', 'Cyclones — wmo_wind must be ≥ 0.'],
      ['discharge_non_negative', 'Floods — discharge_m3s must be ≥ 0.'],
      ['gauge_height_non_negative', 'Rivers — gauge_height must be ≥ 0.'],
      ['flood_category_domain', 'Rivers — flood_category must be one of no_flooding, action, minor, moderate or major.'],
    ],
  },
]

export default function Landing() {
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>{APP_NAME}</h2>
          <p className="muted">{APP_OVERVIEW_SUBTITLE}</p>
        </div>
        <div className="btn-group" role="group" aria-label="Dashboards">
          <NavLink to={ROUTES.dataSourceFiles} className="btn btn-sm btn-files">
            Data Source Files
          </NavLink>
          <NavLink to={ROUTES.dataQuality} className="btn btn-sm btn-quality">
            Data Quality
          </NavLink>
          <NavLink to={ROUTES.dataQuantity} className="btn btn-sm btn-quantity">
            Data Quantity
          </NavLink>
          <NavLink to={ROUTES.eventCategories} className="btn btn-sm btn-categories">
            Event Categories
          </NavLink>
          <NavLink to={ROUTES.eventLocations} className="btn btn-sm btn-locations">
            Event Locations
          </NavLink>
        </div>
      </div>

      <div className="card overview-card">
        <h3>What is GEO_APP for?</h3>
        <p className="muted">
          GEO_APP is a React front-end for exploring data quality and event quantity
          across geographic datasets (events, wildfires, cyclones, earthquakes,
          volcanoes, floods, rivers and avalanches). It connects to the GEO_API to fetch data-quality metrics for each
          dataset table and snapshot via the {API_PATHS.dataQuality}/&#123;table_name&#125;/&#123;file_date&#125;
          endpoint — snapshot dates are discovered with a file-dates probe — so you can
          see at a glance which datasets are healthy, which need attention, and which
          rules are failing.
        </p>
      </div>

      <div className="card overview-card">
        <h3>How to read the Data Source Files dashboard</h3>
        <p className="muted">
          The Data Source Files tab is the CSV inventory published by GEO_ETL&apos;s
          DATA_SOURCE_FILE job for every GEO_Download source folder.
        </p>
        <ol className="muted" style={{ marginLeft: 20 }}>
          <li>
            Open it with the button above or the &quot;Data Source Files&quot; link in the
            sidebar — the address is <code>{ROUTES.dataSourceFiles}</code>.
          </li>
          <li>
            Pick a source in the dropdown. The table lists one row per calendar date
            between the pipeline start and the latest snapshot; dates with no CSV are
            highlighted red and marked <strong>Missing</strong>.
          </li>
          <li>
            The timeline plots record counts on the left linear axis and file size in kB
            on the right; red bands and crosses mark the missing dates. Undated files are
            kept in the table but cannot be placed on the timeline.
          </li>
          <li>
            Sort any column, page through the table, and use the download menu to export
            every row for the selected source as CSV, JSON, XML or TXT — including missing
            dates and undated files.
          </li>
        </ol>
      </div>

      <div className="card overview-card">
        <h3>How to read the Data Quality dashboard</h3>
        <ol className="muted" style={{ marginLeft: 20 }}>
          <li>
            Open the Data Quality dashboard with its button above or the &quot;Data Quality&quot;
            link in the sidebar — the address is <code>{ROUTES.dataQuality}</code>.
          </li>
          <li>
            Pick a dataset table in the first dropdown — {TABLE_NAMES.length} tables are
            tracked: {sourceTables.length} data sources, {etlTables.length} ETL tables
            and {unionTables.length} union {unionTables.length === 1 ? 'table' : 'tables'}.
            It defaults to <code>{DEFAULT_TABLE}</code>, whose <code>{OVERALL_DATE}</code> metrics
            load automatically when the dashboard opens; changing either dropdown
            reloads the metrics.
          </li>
          <li>
            Pick a snapshot date in the second dropdown. Snapshot dates are discovered
            from the API automatically after the first load; <code>{OVERALL_DATE}</code> is
            the aggregate view.
          </li>
          <li>
            Check the four quality gauges: Completeness (average % of non-NULL values),
            Validity (% of rows passing all rules), Uniqueness (% of non-duplicate rows)
            and Consistency (average % of domain/range rules passing). A gauge shows
            &quot;No data&quot; when the API has no metrics for that dimension. When a dated
            snapshot is selected (not <code>{OVERALL_DATE}</code>), each badge also shows the
            change vs the previous snapshot in parentheses — green for improvement, red
            for regression, yellow for unchanged.
          </li>
          <li>
            Read the scores: ≥ {SCORE_THRESHOLDS.good} is good, {SCORE_THRESHOLDS.warn}–
            {SCORE_THRESHOLDS.good - 1} needs attention, below {SCORE_THRESHOLDS.warn} is critical.
          </li>
          <li>
            Use the charts and table below the KPIs: the trend line covers all available
            snapshot dates, the radar shows the four dimensions, the bar/doughnut charts
            summarize rule results, and the rule-level table can be sorted and filtered
            to find failing checks.
          </li>
        </ol>
      </div>

      <div className="card overview-card">
        <h3>How to read the Data Quantity dashboard</h3>
        <p className="muted">
          The Data Quantity tab diagrams how rows move from the {PLAIN_TABLE_NAMES.length} plain
          source tables through their {ETL_TABLE_NAMES.length} ETL tables into{' '}
          <code>{UNION_TABLE}</code>.
        </p>
        <ol className="muted" style={{ marginLeft: 20 }}>
          <li>
            Open the Data Quantity dashboard with its button above or the &quot;Data Quantity&quot;
            link in the sidebar — the address is <code>{ROUTES.dataQuantity}</code>.
          </li>
          <li>
            Pick a snapshot date. The dashboard starts on the latest dated snapshot and
            falls back to <code>{OVERALL_DATE}</code> when only aggregate data is available.
          </li>
          <li>
            Each row compares a plain table with its ETL table. The badge on the arrow
            shows how many rows were filtered out; if the ETL table has more rows than the
            selected plain snapshot, it reports how many more.
          </li>
          <li>
            Every ETL table feeds the union card, which shows the union row count for the
            selected snapshot.
          </li>
        </ol>
      </div>

      <div className="card overview-card">
        <h3>How to read the Event Categories dashboard</h3>
        <p className="muted">
          The Event Categories tab groups <code>{UNION_TABLE}</code> events by
          category/subcategory, broken down by source_name/subsource_name.
        </p>
        <ol className="muted" style={{ marginLeft: 20 }}>
          <li>
            Open it with the button above or the &quot;Event Categories&quot; link in the
            sidebar — the address is <code>{ROUTES.eventCategories}</code>.
          </li>
          <li>
            Every row shows the overall count and its share of all events, plus the count
            and share for each of the four danger levels ({DANGER_LEVELS.join(', ')}).
            Events rated {UNRATED_DANGER_RATINGS.join(' or ')} are included in overall
            counts only.
          </li>
          <li>
            The category-by-source heatmap shows counts and shares; use the transpose icon
            in the card header to swap rows and columns.
          </li>
        </ol>
      </div>

      <div className="card overview-card">
        <h3>How to read the Event Locations dashboard</h3>
        <p className="muted">
          The Event Locations tab groups <code>{UNION_TABLE}</code> events by
          country/state/province, broken down by source_name/subsource_name.
        </p>
        <ol className="muted" style={{ marginLeft: 20 }}>
          <li>
            Open it with the button above or the &quot;Event Locations&quot; link in the
            sidebar — the address is <code>{ROUTES.eventLocations}</code>.
          </li>
          <li>
            Every row shows the overall count and its share of all events, plus the count
            and share for each of the four danger levels ({DANGER_LEVELS.join(', ')}).
            Events rated {UNRATED_DANGER_RATINGS.join(' or ')} are included in overall
            counts only.
          </li>
          <li>
            The source-by-region heatmap ({regionList}) shows counts and shares; use the
            transpose icon in the card header to swap rows and columns.
          </li>
        </ol>
      </div>

      <div className="card overview-card">
        <h3>Data quality rules</h3>
        <p className="muted">
          The dashboard evaluates these checks for every table and snapshot; each table
          only includes rules that apply to its columns. A rule is scored by the share of
          violating rows: under {RULE_THRESHOLDS.warn}% passes, {RULE_THRESHOLDS.warn}% to
          just under {RULE_THRESHOLDS.fail}% needs attention, and {RULE_THRESHOLDS.fail}%
          or more fails.
        </p>
        {RULE_GROUPS.map((group) => (
          <div key={group.title}>
            <h4 className="rule-group-title">{group.title}</h4>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Rule</th>
                    <th>What it means</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rules.map(([name, meaning]) => (
                    <tr key={name}>
                      <td><code>{name}</code></td>
                      <td>{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="card overview-card">
        <h3>Available dataset tables</h3>
        <p className="muted">
          {TABLE_NAMES.length} tables are available through the API: {sourceTables.length} plain
          data source tables, {etlTables.length} ETL tables and {unionTables.length} union{' '}
          {unionTables.length === 1 ? 'table' : 'tables'}:
        </p>
        <ul className="muted" style={{ marginLeft: 20 }}>
          {[sourceTables, etlTables, unionTables].map((group) => (
            <li key={group[0]}>{group.join(' · ')}</li>
          ))}
        </ul>
      </div>
    </>
  )
}
