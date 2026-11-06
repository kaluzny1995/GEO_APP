import Icon from './Icon.jsx'
import {
  DATA_SOURCES,
  FLOW_KINDS,
  SYSTEM_FLOW_DATABASE,
  SYSTEM_FLOW_EDGE_BY_ID,
  SYSTEM_FLOW_REPOS,
  SYSTEM_FLOW_STORE,
} from '../data/systemFlow.js'

function TechChip({ tech, repoId, repoName }) {
  return (
    <li
      className={`system-flow-tech${tech.wide ? ' system-flow-tech--wide' : ''}`}
      data-testid={`system-flow-tech-${repoId}-${tech.id}`}
      title={`${tech.name} — ${repoName}`}
    >
      <img src={tech.logo} alt="" loading="lazy" />
      <span>{tech.name}</span>
    </li>
  )
}

function RepoNode({ repo, variant = 'repo' }) {
  return (
    <article
      className={`system-flow-node system-flow-node--${variant}`}
      data-testid={`system-flow-node-${repo.id}`}
      aria-label={`${repo.name} repository`}
    >
      <div className="system-flow-node-head">
        <img className="system-flow-node-icon" src={repo.logo} alt="" loading="lazy" />
        <div className="system-flow-node-heading">
          <span className="system-flow-node-kind">{repo.role}</span>
          <h4>{repo.name}</h4>
          <p>{repo.description}</p>
        </div>
      </div>
      <ul className="system-flow-techs" aria-label={`${repo.name} technologies`}>
        {repo.technologies.map((tech) => (
          <TechChip key={tech.id} tech={tech} repoId={repo.id} repoName={repo.name} />
        ))}
      </ul>
      {repo.techNote && <span className="system-flow-tech-note">{repo.techNote}</span>}
    </article>
  )
}

function SourcesNode() {
  return (
    <section
      className="system-flow-node system-flow-node--sources"
      data-testid="system-flow-node-sources"
      aria-label={`${DATA_SOURCES.length} public data sources`}
    >
      <div className="system-flow-node-heading">
        <span className="system-flow-node-kind">Data sources</span>
        <h4>{DATA_SOURCES.length} public feeds</h4>
        <p>JSON APIs and CSV feeds consumed by GEO_Download.</p>
      </div>
      <ul className="system-flow-source-grid">
        {DATA_SOURCES.map((source) => (
          <li
            key={source.id}
            className="system-flow-source"
            data-testid={`system-flow-source-${source.id}`}
            title={`${source.name} — ${source.description}`}
          >
            <img src={source.logo} alt="" loading="lazy" />
            <span className="system-flow-source-name">{source.name}</span>
            <span
              className={`system-flow-source-format system-flow-source-format--${source.format}`}
            >
              {source.format.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function StoreNode() {
  return (
    <section
      className="system-flow-node system-flow-node--store"
      data-testid="system-flow-node-csv"
      aria-label={`${SYSTEM_FLOW_STORE.name} data store`}
    >
      <div className="system-flow-node-head">
        <img className="system-flow-node-icon" src={SYSTEM_FLOW_STORE.logo} alt="" loading="lazy" />
        <div className="system-flow-node-heading">
          <span className="system-flow-node-kind">{SYSTEM_FLOW_STORE.role}</span>
          <h4>{SYSTEM_FLOW_STORE.name}</h4>
          <p>{SYSTEM_FLOW_STORE.description}</p>
        </div>
      </div>
    </section>
  )
}

function DatabaseNode() {
  return (
    <section
      className="system-flow-node system-flow-node--database"
      data-testid="system-flow-node-db"
      aria-label={`${SYSTEM_FLOW_DATABASE.name} database`}
    >
      <div className="system-flow-node-head">
        <img
          className="system-flow-node-icon system-flow-database-icon"
          src={SYSTEM_FLOW_DATABASE.logo}
          alt=""
          loading="lazy"
        />
        <div className="system-flow-node-heading">
          <span className="system-flow-node-kind">{SYSTEM_FLOW_DATABASE.role}</span>
          <h4>{SYSTEM_FLOW_DATABASE.name}</h4>
          <p>{SYSTEM_FLOW_DATABASE.description}</p>
        </div>
      </div>
      <ul className="system-flow-techs" aria-label="Supabase PostgreSQL technologies">
        {SYSTEM_FLOW_DATABASE.technologies.map((tech) => (
          <TechChip
            key={tech.id}
            tech={tech}
            repoId={SYSTEM_FLOW_DATABASE.id}
            repoName={SYSTEM_FLOW_DATABASE.name}
          />
        ))}
      </ul>
    </section>
  )
}

function EdgeBadge({ edge, kind }) {
  const meta = FLOW_KINDS[kind]

  return (
    <span
      className={`system-flow-edge-badge system-flow-edge-badge--${kind}`}
      title={edge.title}
      aria-label={`${meta.label}: ${edge.title}`}
    >
      <Icon name={meta.icon} size={16} />
      <span>{meta.label}</span>
    </span>
  )
}

function EdgeGroup({ edge }) {
  return (
    <span className="system-flow-edge-group" data-testid={`system-flow-edge-${edge.id}`}>
      <span
        className="system-flow-edge-badges"
        data-testid={`system-flow-edge-badges-${edge.id}`}
      >
        {edge.kinds.map((kind) => (
          <EdgeBadge key={kind} edge={edge} kind={kind} />
        ))}
      </span>
    </span>
  )
}

function FlowConnector({ edgeIds, label }) {
  const edges = edgeIds.map((id) => SYSTEM_FLOW_EDGE_BY_ID[id]).filter(Boolean)

  return (
    <div
      className="system-flow-connector"
      data-testid={`system-flow-connector-${edges.map((edge) => edge.id).join('-')}`}
    >
      <div className="system-flow-connector-badges">
        {edges.map((edge) => (
          <EdgeGroup key={edge.id} edge={edge} />
        ))}
      </div>
      {label && <span className="system-flow-connector-label">{label}</span>}
    </div>
  )
}

function OrchestrationLink({ edgeId, target }) {
  const edge = SYSTEM_FLOW_EDGE_BY_ID[edgeId]

  return (
    <div className="system-flow-orchestration-link">
      <EdgeGroup edge={edge} />
      <span className="system-flow-orchestration-arrow" aria-hidden="true">→</span>
      <span className="system-flow-orchestration-target">{target}</span>
    </div>
  )
}

export default function SystemFlowDiagram() {
  return (
    <div className="system-flow-diagram" role="group" aria-label="System flow diagram">
      <section className="system-flow-control-plane" aria-label="GEO_E2E orchestration">
        <RepoNode repo={SYSTEM_FLOW_REPOS.e2e} variant="control" />
        <div className="system-flow-orchestration-links" aria-label="GEO_E2E orchestrates">
          <OrchestrationLink edgeId="e2e-download" target="GEO_Download" />
          <OrchestrationLink edgeId="e2e-etl" target="GEO_ETL" />
          <OrchestrationLink edgeId="e2e-db" target="Supabase PostgreSQL" />
        </div>
      </section>

      <SourcesNode />
      <FlowConnector
        edgeIds={['sources-download-json', 'sources-download-csv']}
        label="JSON / CSV"
      />
      <RepoNode repo={SYSTEM_FLOW_REPOS.download} />
      <FlowConnector edgeIds={['download-csv']} label="CSV snapshots" />
      <StoreNode />
      <FlowConnector edgeIds={['csv-etl']} label="CSV" />
      <RepoNode repo={SYSTEM_FLOW_REPOS.etl} />
      <FlowConnector edgeIds={['etl-db']} label="SQL / JDBC" />
      <DatabaseNode />

      <div className="system-flow-consumers">
        <div className="system-flow-branch">
          <FlowConnector edgeIds={['db-api']} label="SQL / asyncpg" />
          <RepoNode repo={SYSTEM_FLOW_REPOS.api} />
          <FlowConnector edgeIds={['api-app']} label="HTTP / JSON" />
          <RepoNode repo={SYSTEM_FLOW_REPOS.app} />
        </div>
        <div className="system-flow-branch">
          <FlowConnector edgeIds={['db-visual']} label="SQL / psycopg" />
          <RepoNode repo={SYSTEM_FLOW_REPOS.visual} />
        </div>
      </div>
    </div>
  )
}
