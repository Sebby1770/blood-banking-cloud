import { useEffect, useState } from 'react';
import { api } from '../api.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY = ['low', 'medium', 'high', 'critical'];
const EMPTY = { patientName: '', bloodGroup: 'O+', unitsNeeded: 1, urgency: 'medium', hospitalId: '' };

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [matched, setMatched] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);

  const load = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    return Promise.all([api.requests.list(params), api.hospitals.list()])
      .then(([r, h]) => { setRequests(r); setHospitals(h); })
      .catch((e) => setError(e.message));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await api.requests.create({
        ...form,
        unitsNeeded: parseInt(form.unitsNeeded, 10),
        hospitalId: parseInt(form.hospitalId, 10),
      });
      setMatched(result.matchedDonors);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const fulfill = async (id) => {
    try {
      await api.requests.fulfill(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (id) => {
    try {
      await api.requests.cancel(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h2>Blood requests</h2>

      <div className="card">
        <h3>New request</h3>
        <form onSubmit={submit}>
          <div className="row">
            <label>Patient<input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} required /></label>
            <label>Blood group
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>Units<input type="number" min="1" value={form.unitsNeeded} onChange={(e) => setForm({ ...form, unitsNeeded: e.target.value })} required /></label>
            <label>Urgency
              <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                {URGENCY.map((u) => <option key={u}>{u}</option>)}
              </select>
            </label>
            <label>Hospital
              <select value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })} required>
                <option value="">Select…</option>
                {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name} ({h.city})</option>)}
              </select>
            </label>
            <button className="primary" type="submit">Submit & match</button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
        {matched && (
          <div className="match-result">
            <strong>Matched {matched.length} donor(s):</strong>{' '}
            {matched.map((d) => `${d.name} (${d.bloodGroup}, ${d.city})`).join(', ') || '— none in same city.'}
          </div>
        )}
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <label>Filter by status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
        <table>
          <thead>
            <tr><th>Patient</th><th>Group</th><th>Units</th><th>Urgency</th><th>Hospital</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.patientName}</td>
                <td><span className="badge ok">{r.bloodGroup}</span></td>
                <td>{r.unitsNeeded}</td>
                <td>
                  <span className={'badge ' + (r.urgency === 'critical' || r.urgency === 'high' ? 'low' : 'warn')}>
                    {r.urgency}
                  </span>
                </td>
                <td>{r.hospital ? r.hospital.name : '—'}</td>
                <td><span className="badge">{r.status}</span></td>
                <td className="actions">
                  {r.status !== 'fulfilled' && r.status !== 'cancelled' && (
                    <>
                      <button className="primary sm" onClick={() => fulfill(r.id)}>Fulfill</button>
                      <button className="ghost sm" onClick={() => cancel(r.id)}>Cancel</button>
                    </>
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