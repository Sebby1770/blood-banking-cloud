import { useEffect, useState } from 'react';
import { api } from '../api.js';

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

  if (error) return <div className="card">Error loading dashboard: {error}</div>;
  if (!summary) return <div className="card">Loading…</div>;

  return (
    <>
      <h2>Overview</h2>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Total units in stock</div>
          <div className="value">{summary.totalUnits}</div>
        </div>
        <div className="kpi">
          <div className="label">All-time donations (units)</div>
          <div className="value">{summary.totalDonations}</div>
        </div>
        <div className="kpi">
          <div className="label">Open requests</div>
          <div className="value">{summary.openRequests}</div>
        </div>
        <div className="kpi">
          <div className="label">Low-stock groups</div>
          <div className={'value ' + (summary.lowStock.length ? 'warn' : '')}>
            {summary.lowStock.length}
          </div>
        </div>
      </div>

      {summary.lowStock.length > 0 && (
        <div className="card">
          <h3>Low stock alerts (threshold {summary.threshold} units)</h3>
          <table>
            <thead>
              <tr><th>Blood group</th><th>Units</th></tr>
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
      )}

      <div className="card">
        <h3>Donation trends (units per month)</h3>
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
    </>
  );
}
