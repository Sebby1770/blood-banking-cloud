import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function ReportsPage() {
  const [cities, setCities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [fulfillment, setFulfillment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.analytics.cities(),
      api.analytics.donorsByGroup(),
      api.analytics.forecast(),
      api.analytics.fulfillment(),
    ])
      .then(([c, g, f, ful]) => {
        setCities(c);
        setGroups(g);
        setForecast(f);
        setFulfillment(ful);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card error-text">{error}</div>;

  const maxCity = Math.max(...cities.map((c) => c.donors), 1);
  const maxGroup = Math.max(...groups.map((g) => g.count), 1);

  return (
    <>
      <h2>Reports & analytics</h2>
      <p className="subtitle">Supply-demand insights and donor distribution</p>

      {forecast && (
        <div className="kpi-grid">
          <div className="kpi">
            <div className="label">Supply trend</div>
            <div className={'value ' + (forecast.trend === 'deficit' ? 'warn' : '')}>{forecast.trend}</div>
          </div>
          <div className="kpi">
            <div className="label">Supply/demand ratio</div>
            <div className="value">{forecast.supplyDemandRatio ?? '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Total in stock</div>
            <div className="value">{forecast.totalUnits}</div>
          </div>
          {fulfillment && (
            <div className="kpi">
              <div className="label">Fulfillment rate</div>
              <div className="value">{fulfillment.fulfillmentRate}%</div>
            </div>
          )}
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h3>Donors by city</h3>
          <div className="bar-chart">
            {cities.map((c) => (
              <div key={c.city} className="bar-row">
                <span className="bar-label">{c.city}</span>
                <div className="bar-track">
                  <div className="bar-fill healthy" style={{ width: `${(c.donors / maxCity) * 100}%` }} />
                </div>
                <span className="bar-value">{c.donors}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Donors by blood group</h3>
          <div className="bar-chart">
            {groups.map((g) => (
              <div key={g.bloodGroup} className="bar-row">
                <span className="bar-label">{g.bloodGroup}</span>
                <div className="bar-track">
                  <div className="bar-fill healthy" style={{ width: `${(g.count / maxGroup) * 100}%` }} />
                </div>
                <span className="bar-value">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {forecast?.lowGroups?.length > 0 && (
        <div className="card alert-card">
          <h3>Groups needing attention</h3>
          <div className="compat-chips">
            {forecast.lowGroups.map((g) => (
              <span key={g} className="compat-chip">{g}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}