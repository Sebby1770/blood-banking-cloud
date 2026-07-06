import { useEffect, useState } from 'react';
import { api } from '../api.js';
import DonorDetailModal from './DonorDetailModal.jsx';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY = { name: '', email: '', phone: '', bloodGroup: 'O+', city: '' };

export default function DonorsPage({ onToast }) {
  const [donors, setDonors] = useState([]);
  const [filter, setFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);

  const load = () => {
    const params = {};
    if (filter) params.bloodGroup = filter;
    if (cityFilter) params.city = cityFilter;
    return api.donors.list(params).then(setDonors).catch((e) => setError(e.message));
  };

  useEffect(() => { load(); }, [filter, cityFilter]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.donors.create(form);
      setForm(EMPTY);
      onToast?.('Donor registered', 'success');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewDonor = async (donor) => {
    const data = await api.donors.history(donor.id);
    setSelected(data.donor);
    setHistory(data);
  };

  const recordDonation = async (donor) => {
    if (donor.eligibility && !donor.eligibility.eligible) {
      onToast?.(`Wait ${donor.eligibility.daysUntilEligible} more day(s)`, 'error');
      return;
    }
    try {
      await api.donations.create({ donorId: donor.id, units: 1 });
      onToast?.(`Donation recorded for ${donor.name}`, 'success');
      setSelected(null);
      load();
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n').slice(1);
    const rows = lines.map((line) => {
      const [name, email, phone, bloodGroup, city] = line.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
      return { name, email, phone, bloodGroup, city };
    }).filter((r) => r.name && r.email);
    try {
      const result = await api.donors.import(rows);
      onToast?.(`Imported ${result.imported} donor(s)${result.errors ? `, ${result.errors} failed` : ''}`, 'success');
      load();
    } catch (err) {
      onToast?.(err.message, 'error');
    }
    e.target.value = '';
  };

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
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Donor registry ({donors.length})</h3>
          <div className="header-actions">
            <label className="import-btn">
              Import CSV
              <input type="file" accept=".csv" onChange={handleImport} hidden />
            </label>
            <a className="export-link" href="/api/export/donors.csv" download>Export CSV</a>
          </div>
        </div>
        <div className="row" style={{ marginBottom: 12 }}>
          <label>Filter by group
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
          <label>Filter by city
            <input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="e.g. Mumbai" />
          </label>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Group</th><th>City</th><th>Last donated</th><th>Eligible</th><th></th></tr>
          </thead>
          <tbody>
            {donors.map((d) => (
              <tr key={d.id}>
                <td><button className="link-btn" onClick={() => viewDonor(d)}>{d.name}</button></td>
                <td><span className="badge ok">{d.bloodGroup}</span></td>
                <td>{d.city}</td>
                <td>{d.lastDonatedAt ? new Date(d.lastDonatedAt).toLocaleDateString() : '—'}</td>
                <td>
                  {d.eligibility?.eligible
                    ? <span className="badge ok">Yes</span>
                    : <span className="badge warn">Wait {d.eligibility?.daysUntilEligible}d</span>}
                </td>
                <td>
                  <button className="primary sm" disabled={d.eligibility && !d.eligibility.eligible} onClick={() => recordDonation(d)}>
                    Donate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DonorDetailModal
        donor={selected}
        history={history}
        onClose={() => { setSelected(null); setHistory(null); }}
        onRecordDonation={recordDonation}
      />
    </>
  );
}