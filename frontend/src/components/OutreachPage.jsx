import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function OutreachPage({ onToast }) {
  const [data, setData] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);

  const load = () => {
    const params = city ? { city } : {};
    return api.outreach.list(params)
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(() => { load(); }, [city]);

  const callDonor = (donor) => {
    onToast?.(`Contact ${donor.name} at ${donor.phone}`, 'info');
  };

  if (error) return <div className="card error-text">{error}</div>;
  if (!data) return <div className="card">Loading outreach data…</div>;

  return (
    <>
      <h2>Donor outreach</h2>
      <p className="subtitle">Eligible donors for low-stock blood groups (threshold: {data.threshold} units)</p>

      <div className="card">
        <label>Filter by city
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" style={{ marginLeft: 8 }} />
        </label>
      </div>

      {data.outreach.length === 0 ? (
        <div className="card success-text">All blood groups are above threshold — no outreach needed.</div>
      ) : (
        data.outreach.map((item) => (
          <div key={item.bloodGroup} className="card">
            <div className="card-header">
              <h3>
                <span className="badge low">{item.bloodGroup}</span>
                {' '}{item.units} units (need {item.deficit} more)
              </h3>
            </div>
            {item.eligibleDonors.length === 0 ? (
              <p className="muted">No eligible donors found{city ? ` in ${city}` : ''}. Try another city or register new donors.</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Name</th><th>Group</th><th>City</th><th>Phone</th><th>Last donated</th><th></th></tr>
                </thead>
                <tbody>
                  {item.eligibleDonors.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td><span className="badge ok">{d.bloodGroup}</span></td>
                      <td>{d.city}</td>
                      <td>{d.phone}</td>
                      <td>{d.lastDonatedAt ? new Date(d.lastDonatedAt).toLocaleDateString() : 'Never'}</td>
                      <td><button className="primary sm" onClick={() => callDonor(d)}>Contact</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </>
  );
}