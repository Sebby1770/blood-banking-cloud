import { useState } from 'react';
import { api } from '../api.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorPortalPage({ onToast }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', bloodGroup: 'O+', city: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.donors.create(form);
      setSubmitted(true);
      onToast?.('Registration successful — thank you for donating!', 'success');
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };

  if (submitted) {
    return (
      <div className="portal-hero">
        <div className="card portal-card">
          <h2>Thank you, {form.name}!</h2>
          <p>You're registered as a <strong>{form.bloodGroup}</strong> donor in <strong>{form.city}</strong>.</p>
          <p className="muted">Our team will contact you at {form.phone} when your blood type is needed.</p>
          <button className="primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', bloodGroup: 'O+', city: '' }); }}>
            Register another donor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-hero">
      <div className="portal-intro">
        <h2>Become a donor</h2>
        <p>Register to help save lives. One donation can help up to three people.</p>
      </div>
      <div className="card portal-card">
        <form onSubmit={submit}>
          <div className="portal-form">
            <label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
            <label>Blood group
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></label>
          </div>
          <button className="primary portal-submit" type="submit">Register as donor</button>
        </form>
      </div>
    </div>
  );
}