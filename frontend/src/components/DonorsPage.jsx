import { useEffect, useState } from 'react';
import { api } from '../api.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EMPTY = { name: '', email: '', phone: '', bloodGroup: 'O+', city: '' };

export default function DonorsPage() {
  const [donors, setDonors] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  const load = () => api.donors.list().then(setDonors).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.donors.create(form);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const recordDonation = async (donorId) => {
    try {
      await api.donations.create({ donorId, units: 1 });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = donors.filter((d) =>
    !filter || d.bloodGroup === filter
  );

  return (
    <>
      <h2>Donors</h2>

      <div className="card">
        <h3>Register donor</h3>
        <form onSubmit={submit}>
          <div className="row">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
            <label>Blood group
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></label>
            <button className="primary" type="submit">Add donor</button>
          </div>
        </form>
        {error && <p style={{ color: 'var(--primary)' }}>{error}</p>}
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <label>Filter by group
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Group</th><th>City</th><th>Phone</th><th>Last donated</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td><span className="badge ok">{d.bloodGroup}</span></td>
                <td>{d.city}</td>
                <td>{d.phone}</td>
                <td>{d.lastDonatedAt ? new Date(d.lastDonatedAt).toLocaleDateString() : '—'}</td>
                <td><button className="primary" onClick={() => recordDonation(d.id)}>Record donation</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
