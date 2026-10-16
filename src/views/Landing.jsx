export default function Landing() {
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>GEO_APP</h2>
          <p className="muted">Geographic data-quality overview</p>
        </div>
      </div>

      <div className="card">
        <h3>What is GEO_APP for?</h3>
        <p className="muted">
          GEO_APP is a React front-end for exploring the quality of geographic datasets
          (places, rivers, volcanoes and more). It will present data-quality tables,
          charts, gauges and badges in one dark dashboard — so you can see at a glance
          which datasets are healthy, which need attention, and which rules are failing.
        </p>
        <p className="muted">
          Data views (tables, charts, gauges, badges) are not wired up yet. This front
          page is the starting point — pick a dataset and the overview will grow here.
        </p>
      </div>
    </>
  )
}
