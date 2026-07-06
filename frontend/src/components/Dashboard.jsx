import { useEffect, useState } from 'react';
import { api } from '../api.js';

const TYPE_LABELS = {
  donation: 'Donation',
  request_created: 'Request',
  request_fulfilled: 'Fulfilled',
  request_cancelled: 'Cancelled',
  inventory_adjusted: 'Inventory',
  low_stock_alert: 'Low stock',
  donor_registered: 'New donor',
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [activity, setActivity] = useState([]);
  const [fulfillment, setFulfillment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.analytics.summary(),
      api.analytics.trends(),
      api.analytics.activity(15),
      api.analytics.fulfillment(),
    ])
      .then(([s, t, a, f]) => {
        setSummary(s);
        setTrends(t);
        setActivity(a);
        setFulfillment(f);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card error-text">Error loading dashboard: {error}</div>;
  if (!summary) return <div className="card">Loading…</div>;

  const maxUnits = Math.max(...(summary.inventoryByGroup?.map((r) => r.units) || [1]), 1);

  return (
    <>
      <h2>Overview</h2>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Total units in stock</div>
          <div className="value">{summary.totalUnits}</div>
        </div>
        <div className="kpi">
          <div className="label">All-time donations</div>
          <div className="value">{summary.totalDonations}</div>
        </div>
        <div className="kpi">
          <div className="label">Pending requests</div>
          <div className="value">{summary.openRequests}</div>
        </div>
        <div className="kpi">
          <div className="label">Available donors</div>
          <div className="value">{summary.availableDonors}</div>
        </div>
        <div className="kpi">
          <div className="label">Low-stock groups</div>
          <div className={'value ' + (summary.lowStock.length ? 'warn' : '')}>
            {summary.lowStock.length}
          </div>
        </div>
        {fulfillment && (
          <div className="kpi">
            <div className="label">Fulfillment rate</div>
            <div className="value">{fulfillment.fulfillmentRate}%</div>
          </div>
        )}
      </div>

      {summary.inventoryByGroup && (
        <div className="card">
          <h3>Inventory by blood group</h3>
          <div className="bar-chart">
            {summary.inventoryByGroup.map((r) => (
              <div key={r.bloodGroup} className="bar-row">
                <span className="bar-label">{r.bloodGroup}</span>
                <div className="bar-track">
                  <div
                    className={'bar-fill ' + r.status}
                    style={{ width: `${(r.units / maxUnits) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{r.units}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.lowStock.length > 0 && (
        <div className="card alert-card">
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

      <div className="grid-2">
        <div className="card">
          <h3>Recent activity</h3>
          <ul className="activity-feed">
            {activity.length === 0 && <li className="muted">No activity yet.</li>}
            {activity.map((item) => (
              <li key={item.id}>
                <span className="activity-type">{TYPE_LABELS[item.type] || item.type}</span>
                <span>{item.message}</span>
                <time>{new Date(item.createdAt).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Donation trends</h3>
          <table>
            <thead>
              <tr><th>Month</th><th>Group</th><th>Donations</th><th>Units</th></tr>
            </thead>
            <tbody>
              {trends.length === 0 && (
                <tr><td colSpan="4" className="muted">No donation history yet.</td></tr>
              )}
              {trends.slice(-8).map((row, i) => (
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