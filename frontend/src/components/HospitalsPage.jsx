import { useEffect, useState } from 'react';
import { api } from '../api.js';

const EMPTY = { name: '', city: '', contactEmail: '', contactPhone: '' };

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  const load = () => api.hospitals.list().then(setHospitals).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.hospitals.create(form);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h2>Hospitals</h2>

      <div className="card">
        <h3>Register hospital</h3>
        <form onSubmit={submit}>
          <div className="row">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></label>
            <label>Contact email<input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} required /></label>
            <label>Contact phone<input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} required /></label>
            <button className="primary" type="submit">Add hospital</button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>City</th><th>Email</th><th>Phone</th></tr>
          </thead>
          <tbody>
            {hospitals.map((h) => (
              <tr key={h.id}>
                <td><strong>{h.name}</strong></td>
                <td>{h.city}</td>
                <td>{h.contactEmail}</td>
                <td>{h.contactPhone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}