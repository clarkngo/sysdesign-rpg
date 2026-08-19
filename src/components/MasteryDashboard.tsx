import type { MasteryKey } from '../game/encounters'

interface Props {
  overall: number
  mastery: Record<MasteryKey, number>
  labels: Record<MasteryKey, string>
  uptime: number
  threatType: string
}

const ORDER: MasteryKey[] = [
  'caching',
  'database',
  'loadBalancing',
  'faultTolerance',
  'security',
]

export default function MasteryDashboard({
  overall,
  mastery,
  labels,
  uptime,
  threatType,
}: Props) {
  const activeCats = ORDER.filter((k) => mastery[k] > 0).length

  return (
    <section className="dashboard">
      <header className="dash-header">
        <div className="dash-title">
          <span className="dash-icon" aria-hidden>
            ⌂
          </span>
          <h2>Architect Dashboard</h2>
        </div>
        <div className="dash-filter" aria-label="Time range">
          This Week ▾
        </div>
      </header>

      <div className="metrics">
        <MetricRow label="Overall Progress" value={overall} />
        {ORDER.map((key) => (
          <MetricRow key={key} label={labels[key]} value={mastery[key]} />
        ))}
      </div>

      <div className="engagement">
        <span className="check" aria-hidden>
          ✓
        </span>
        <span>
          Service uptime {uptime.toFixed(2)}% · Threat: {threatType} ·{' '}
          {activeCats} of {ORDER.length} mastery tracks engaged
        </span>
      </div>

      <footer className="dash-footer">
        <span className="shield" aria-hidden>
          ⛨
        </span>
        <span>Architectures you can trust. Uptime you&apos;ll be proud of.</span>
      </footer>
    </section>
  )
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
