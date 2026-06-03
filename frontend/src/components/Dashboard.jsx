import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Icon } from './icons.jsx';

const KPIS = [
  { key: 'totalUnits', label: 'Total units in stock', icon: 'package' },
  { key: 'totalDonations', label: 'All-time donations', icon: 'history' },
  { key: 'openRequests', label: 'Open requests', icon: 'inbox' },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.analytics.summary(), api.analytics.trends()])
      .then(([s, t]) => {
        setSummary(s);
        setTrends(t);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-banner">Error loading dashboard: {error}</div>;
  if (!summary) return <div className="state"><div className="spinner" />Loading overview…</div>;

  return (
    <>
      {KPIS.length > 0 && (
        <div className="kpi-grid">
          {KPIS.map((k) => (
            <div className="kpi" key={k.key}>
              <div className="kpi-top">
                <span className="kpi-icon"><Icon name={k.icon} /></span>
              </div>
              <div className="label">{k.label}</div>
              <div className="value">{summary[k.key]}</div>
            </div>
          ))}
          <div className="kpi">
            <div className="kpi-top"><span className="kpi-icon"><Icon name="alert" /></span></div>
            <div className="label">Low-stock groups</div>
            <div className={'value ' + (summary.lowStock.length ? 'warn' : 'ok')}>
              {summary.lowStock.length}
            </div>
          </div>
        </div>
      )}

      {summary.lowStock.length > 0 && (
        <div className="card">
          <h3><Icon name="alert" /> Low stock alerts (threshold {summary.threshold} units)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Blood group</th><th>Units remaining</th></tr>
              </thead>
              <tbody>
                {summary.lowStock.map((r) => (
                  <tr key={r.bloodGroup}>
                    <td><span className="badge low">{r.bloodGroup}</span></td>
                    <td>{r.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h3><Icon name="history" /> Donation trends (units per month)</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Month</th><th>Blood group</th><th>Donations</th><th>Units</th></tr>
            </thead>
            <tbody>
              {trends.length === 0 && (
                <tr><td colSpan="4" style={{ color: 'var(--muted)' }}>No donation history yet.</td></tr>
              )}
              {trends.map((row, i) => (
                <tr key={i}>
                  <td>{row.month}</td>
                  <td>{row.bloodGroup}</td>
                  <td>{row.donations}</td>
                  <td>{row.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
