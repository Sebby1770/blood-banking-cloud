import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function SettingsPage({ onToast }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.settings.get()
      .then((s) => { setSettings(s); setForm(s); })
      .catch((e) => setError(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.settings.update(form);
      setSettings(updated);
      setForm(updated);
      onToast?.('Settings saved', 'success');
    } catch (err) {
      setError(err.message);
      onToast?.('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="card">Loading settings…</div>;

  return (
    <>
      <h2>Settings</h2>
      <p className="subtitle">Configure thresholds, cooldowns, and organization details</p>

      <div className="card">
        <form onSubmit={save}>
          <div className="settings-grid">
            <label>
              Organization name
              <input value={form.organizationName || ''} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
            </label>
            <label>
              Alert email
              <input type="email" value={form.alertEmail || ''} onChange={(e) => setForm({ ...form, alertEmail: e.target.value })} placeholder="ops@hospital.example" />
            </label>
            <label>
              Low-stock threshold (units)
              <input type="number" min="1" max="50" value={form.lowStockThreshold || ''} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </label>
            <label>
              Donation cooldown (days)
              <input type="number" min="14" max="180" value={form.donationCooldownDays || ''} onChange={(e) => setForm({ ...form, donationCooldownDays: e.target.value })} />
            </label>
          </div>
          <button className="primary" type="submit" disabled={saving} style={{ marginTop: 16 }}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>
    </>
  );
}