import { NavLink } from 'react-router-dom'
import SystemFlowDiagram from '../components/SystemFlowDiagram.jsx'
import Icon from '../components/Icon.jsx'
import {
  DATA_SOURCES,
  FLOW_KINDS,
  REPOSITORY_STACKS,
  SYSTEM_FLOW_REPOS,
} from '../data/systemFlow.js'
import { ROUTES } from '../config.js'

const repoCount = Object.keys(SYSTEM_FLOW_REPOS).length
const sourceCount = DATA_SOURCES.length
const csvSourceCount = DATA_SOURCES.filter((source) => source.format === 'csv').length
const jsonSourceCount = DATA_SOURCES.filter((source) => source.format === 'json').length
const flowKindList = Object.values(FLOW_KINDS)

export default function SystemFlowView() {
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>System Flow</h2>
          <p className="muted">
            How {repoCount} repositories, {sourceCount} public data sources and their technologies
            connect.
          </p>
        </div>
        <NavLink to={ROUTES.overview} className="btn btn-sm btn-outline-secondary">
          ← Back to Overview
        </NavLink>
      </div>

      <div className="card system-flow-card">
        <div className="card-title-row">
          <h3>Repositories &amp; data flow</h3>
          <span className="quantity-snapshot">
            {repoCount} repos · {sourceCount} sources
          </span>
        </div>
        <p className="sub muted">
          GEO_E2E orchestrates the pipeline with Airflow. GEO_Download turns {jsonSourceCount} JSON
          APIs and {csvSourceCount} CSV feeds into dated CSV snapshots; GEO_ETL loads them into
          Supabase PostgreSQL with PySpark; GEO_API serves the geo schema as JSON; GEO_APP and
          GEO_Visual read from the API or the database. Edge badges show the format that moves
          between each component. The diagram reflows with the window width, so the same
          pipeline stays readable on wide and narrow screens.
        </p>
        <SystemFlowDiagram />
      </div>

      <div className="card" style={{ marginTop: 16 }} data-testid="system-flow-legend">
        <h3>Flow legend</h3>
        <p className="sub muted">
          The badge on each relationship identifies the data format or protocol.
        </p>
        <div className="system-flow-legend-grid">
          {flowKindList.map((kind) => (
            <div
              key={kind.id}
              className={`system-flow-legend-item system-flow-legend-item--${kind.id}`}
            >
              <span className="system-flow-legend-icon">
                <Icon name={kind.icon} size={18} />
              </span>
              <div>
                <strong>{kind.label}</strong>
                <span>{kind.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card table-card" style={{ marginTop: 16 }}>
        <h3>Technology inventory</h3>
        <p className="sub muted">
          Complete stacks per repository, including libraries that do not have a logo in the
          diagram.
        </p>
        <div className="table-wrap">
          <table className="system-flow-stack-table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Role</th>
                <th>Technologies</th>
              </tr>
            </thead>
            <tbody>
              {REPOSITORY_STACKS.map((stack) => (
                <tr key={stack.repo}>
                  <td>
                    <strong>{stack.repo}</strong>
                  </td>
                  <td>{stack.role}</td>
                  <td>{stack.technologies.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>How to read this view</h3>
        <ol className="muted" style={{ marginLeft: 20 }}>
          <li>
            Start at the public data sources at the top and follow the arrows through GEO_Download,
            the <code>data/</code> CSV store, GEO_ETL and the Supabase PostgreSQL database.
          </li>
          <li>
            From the database, GEO_API serves JSON over HTTP to GEO_APP, while GEO_Visual reads the
            same views directly over SQL.
          </li>
          <li>
            The GEO_E2E card above the pipeline shows the Airflow orchestration edges (CLI) and the
            Airflow metadata database edge (SQL).
          </li>
          <li>
            Every source and technology image has its name underneath. The <code>no_text</code>{' '}
            assets keep the image itself free of a duplicate wordmark, while wordmark logos get a
            reinforcing label.
          </li>
        </ol>
      </div>
    </>
  )
}
