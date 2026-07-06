import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = filter ? { bloodGroup: filter } : {};
    api.donations.list(params)
      .then(setDonations)
      .catch((e) => setError(e.message));
  }, [filter]);

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <>
      <h2>Donation history</h2>
      {error && <div className="card error-text">{error}</div>}

      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <label>Filter by group
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All groups</option>
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
        </div>
        <table>
          <thead>
            <tr><th>Date</th><th>Donor</th><th>Group</th><th>Units</th><th>City</th></tr>
          </thead>
          <tbody>
            {donations.length === 0 && (
              <tr><td colSpan="5" className="muted">No donations recorded yet.</td></tr>
            )}
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.donatedAt).toLocaleString()}</td>
                <td>{d.donor ? d.donor.name : '—'}</td>
                <td><span className="badge ok">{d.bloodGroup}</span></td>
                <td>{d.units}</td>
                <td>{d.donor ? d.donor.city : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}