import { Fragment, useId } from 'react'
import { UNION_TABLE } from '../config.js'
import { formatQuantity, sumQuantities } from '../utils/dataQuantity.js'

const CARD_HEIGHT = 58
const ROW_GAP = 12

const hasQuantity = (value) => typeof value === 'number' && Number.isFinite(value)

const quantityAriaLabel = (value) =>
  hasQuantity(value) ? `${formatQuantity(value)} rows` : 'no data'

function QuantityValue({ value, className = 'quantity-card-count' }) {
  if (!hasQuantity(value)) {
    return <em className={`${className} quantity-no-data`}>no data</em>
  }
  return <strong className={className}>{formatQuantity(value)}</strong>
}

function QuantitySummary({ count, prefix }) {
  if (!hasQuantity(count)) {
    return <>{prefix} · <em className="quantity-no-data">no data</em></>
  }
  return <>{prefix} · {formatQuantity(count)} rows</>
}

export default function DataQuantityDiagram({ flows = [], unionCount = null, fileDate }) {
  const markerId = `quantity-arrow-${useId().replace(/:/g, '')}`
  const gradientId = `quantity-flow-${useId().replace(/:/g, '')}`
  const rowCount = Math.max(flows.length, 1)
  const flowHeight = CARD_HEIGHT * flows.length + ROW_GAP * Math.max(flows.length - 1, 0)
  const plainTotal = sumQuantities(flows.map((flow) => flow.plainCount))
  const etlTotal = sumQuantities(flows.map((flow) => flow.etlCount))

  return (
    <div className="quantity-diagram-wrap">
      <div
        className="quantity-diagram-grid"
        role="group"
        aria-label={`Data quantity flow for ${fileDate}`}
      >
        <div className="quantity-column-heading" style={{ gridColumn: 1, gridRow: 1 }}>
          <span>Plain tables</span>
          <small><QuantitySummary count={plainTotal} prefix={`${flows.length} tables`} /></small>
        </div>
        <div className="quantity-column-heading" style={{ gridColumn: 3, gridRow: 1 }}>
          <span>ETL tables</span>
          <small><QuantitySummary count={etlTotal} prefix={`${flows.length} tables`} /></small>
        </div>
        <div className="quantity-column-heading" style={{ gridColumn: 5, gridRow: 1 }}>
          <span>Union table</span>
          <small><QuantitySummary count={unionCount} prefix="1 table" /></small>
        </div>

        {flows.map((flow, index) => {
          const gridRow = index + 2
          return (
            <Fragment key={flow.plain}>
              <div
                className="quantity-card quantity-card-plain"
                style={{ gridColumn: 1, gridRow }}
                role="group"
                aria-label={`${flow.plain}: ${quantityAriaLabel(flow.plainCount)}`}
              >
                <span className="quantity-card-name" title={flow.plain}>{flow.plain}</span>
                <QuantityValue value={flow.plainCount} />
              </div>

              <div
                className={`quantity-link-filter quantity-tone-${flow.differenceTone}`}
                style={{ gridColumn: 2, gridRow }}
                title={
                  flow.difference === null
                    ? 'No row-count comparison is available'
                    : flow.difference >= 0
                      ? `${formatQuantity(flow.difference)} rows filtered out from ${flow.plain} to ${flow.etl}`
                      : `${formatQuantity(-flow.difference)} more rows in ${flow.etl} than in ${flow.plain}`
                }
              >
                <span className="quantity-link-label">{flow.differenceLabel}</span>
              </div>

              <div
                className="quantity-card quantity-card-etl"
                style={{ gridColumn: 3, gridRow }}
                role="group"
                aria-label={`${flow.etl}: ${quantityAriaLabel(flow.etlCount)}`}
              >
                <span className="quantity-card-name" title={flow.etl}>{flow.etl}</span>
                <QuantityValue value={flow.etlCount} />
              </div>
            </Fragment>
          )
        })}

        <div
          className="quantity-union-links"
          style={{ gridColumn: 4, gridRow: `2 / span ${rowCount}` }}
          aria-hidden="true"
        >
          <svg viewBox={`0 0 180 ${Math.max(flowHeight, 1)}`} preserveAspectRatio="none">
            <defs>
              <linearGradient
                id={gradientId}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="180"
                y2="0"
              >
                <stop offset="0%" stopColor="var(--bd-info)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--bd-primary)" stopOpacity="0.9" />
              </linearGradient>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="quantity-arrowhead" />
              </marker>
            </defs>
            {flows.map((flow, index) => {
              const startY = index * (CARD_HEIGHT + ROW_GAP) + CARD_HEIGHT / 2
              const endY = flowHeight / 2 + (index - (flows.length - 1) / 2) * 15
              return (
                <path
                  key={flow.etl}
                  data-testid={`quantity-union-link-${flow.etl}`}
                  d={`M 0 ${startY} C 70 ${startY}, 110 ${endY}, 180 ${endY}`}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                  markerEnd={`url(#${markerId})`}
                />
              )
            })}
          </svg>
        </div>

        <div
          className="quantity-card quantity-card-union"
          style={{ gridColumn: 5, gridRow: `2 / span ${rowCount}` }}
          role="group"
          aria-label={`${UNION_TABLE}: ${quantityAriaLabel(unionCount)} from ${flows.length} ETL tables`}
        >
          <span className="quantity-card-kind">Union</span>
          <span className="quantity-card-name">{UNION_TABLE}</span>
          <QuantityValue value={unionCount} />
          <span className="quantity-card-note">
            {hasQuantity(unionCount) ? 'rows ' : ''}from {flows.length} ETL tables
          </span>
        </div>
      </div>
    </div>
  )
}
