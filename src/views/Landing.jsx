import { NavLink } from 'react-router-dom'

export default function Landing() {
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>GEO_APP</h2>
          <p className="muted">Geographic data-quality overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NavLink to="/admin/data-quality/avalanche_org/overall" className="btn btn-sm">
            Open Data Quality dashboard →
          </NavLink>
        </div>
      </div>

      <div className="card">
        <h3>What is GEO_APP for?</h3>
        <p className="muted">
          GEO_APP is a React front-end for exploring the quality of geographic datasets
          (places, rivers, volcanoes, earthquakes, fires, cyclones, floods and more). It
          connects to the GEO_API to fetch data-quality metrics for each dataset table
          and date via the /data-quality/&#123;table_name&#125;/&#123;file_date&#125; endpoint — so you
          can see at a glance which datasets are healthy, which need attention, and which
          rules are failing.
        </p>
      </div>

      <div className="card">
        <h3>How to read the Data Quality dashboard</h3>
        <ol className="muted" style={{ marginLeft: 20 }}>
          <li>
            Open the dashboard with the button above or the &quot;Data Quality&quot; link in the
            sidebar.
          </li>
          <li>
            Pick a dataset table in the first dropdown — 19 tables are tracked: 9 data
            sources, 9 ETL tables and 1 union table. It defaults to <code>avalanche_org</code>.
          </li>
          <li>
            Pick a snapshot date in the second dropdown. Snapshot dates are discovered
            from the API automatically; <code>overall</code> is the aggregate view.
          </li>
          <li>
            Check the four quality gauges: Completeness (average % of non-NULL values),
            Validity (% of rows passing all rules), Uniqueness (% of non-duplicate rows)
            and Consistency (average % of domain/range rules passing). A gauge shows
            &quot;No data&quot; when the API has no metrics for that dimension.
          </li>
          <li>
            Read the scores: ≥ 90 is good, 75–89 needs attention, below 75 is critical.
          </li>
          <li>
            Use the charts and table below the KPIs: the trend line covers all available
            snapshot dates, the radar shows the four dimensions, the bar/doughnut charts
            summarize rule results, and the rule-level table can be sorted and filtered
            to find failing checks.
          </li>
        </ol>
      </div>

      <div className="card">
        <h3>Available dataset tables</h3>
        <p className="muted">
          19 tables are available through the API: 9 plain data source tables,
          9 ETL tables and 1 union table:
        </p>
        <ul className="muted" style={{ marginLeft: 20 }}>
          <li>eonet_event · nifc_fire · ibtracs_cyclone · usgs_earthquake · usgs_volcano</li>
          <li>openmeteo_flood · gdacs_event · usgs_nwis · avalanche_org</li>
          <li>eonet_event_etl · nifc_fire_etl · ibtracs_cyclone_etl · usgs_earthquake_etl · usgs_volcano_etl</li>
          <li>openmeteo_flood_etl · gdacs_event_etl · usgs_nwis_etl · avalanche_org_etl</li>
          <li>union_etl</li>
        </ul>
      </div>
    </>
  )
}
