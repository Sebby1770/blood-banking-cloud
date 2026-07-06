import { useEffect, useState } from 'react';
import { api } from '../api.js';

const GROUPS = ['any', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY = { name: '', city: '', bloodGroup: 'any', targetUnits: 10, scheduledAt: '', notes: '' };

export default function CampaignsPage({ onToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  const load = () => api.campaigns.list().then(setCampaigns).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.campaigns.create({ ...form, targetUnits: parseInt(form.targetUnits, 10) });
      setForm(EMPTY);
      onToast?.('Blood drive scheduled', 'success');
      load();
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };

  const updateStatus = async (id, status) => {
    await api.campaigns.update(id, { status });
    onToast?.(`Campaign marked ${status}`, 'success');
    load();
  };

  return (
    <>
      <h2>Blood drives</h2>
      <p className="subtitle">Plan and track community donation campaigns</p>

      <div className="card">
        <h3>Schedule a drive</h3>
        <form onSubmit={submit}>
          <div className="row">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Mumbai O+ Drive" /></label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></label>
            <label>Target group
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>Target units<input type="number" min="1" value={form.targetUnits} onChange={(e) => setForm({ ...form, targetUnits: e.target.value })} /></label>
            <label>Date<input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required /></label>
            <button className="primary" type="submit">Schedule</button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Drive</th><th>City</th><th>Group</th><th>Target</th><th>Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && <tr><td colSpan="7" className="muted">No campaigns yet.</td></tr>}
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.city}</td>
                <td><span className="badge ok">{c.bloodGroup}</span></td>
                <td>{c.targetUnits} units</td>
                <td>{new Date(c.scheduledAt).toLocaleString()}</td>
                <td><span className="badge">{c.status}</span></td>
                <td className="actions">
                  {c.status === 'planned' && <button className="primary sm" onClick={() => updateStatus(c.id, 'active')}>Activate</button>}
                  {c.status === 'active' && <button className="primary sm" onClick={() => updateStatus(c.id, 'completed')}>Complete</button>}
                  {c.status !== 'cancelled' && c.status !== 'completed' && (
                    <button className="ghost sm" onClick={() => updateStatus(c.id, 'cancelled')}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}