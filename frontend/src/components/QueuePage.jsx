import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function QueuePage({ onToast }) {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);

  const load = () => api.requests.queue().then(setQueue).catch((e) => setError(e.message));
  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, []);

  const fulfill = async (id) => {
    try {
      await api.requests.fulfill(id);
      onToast?.('Request fulfilled', 'success');
      load();
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };

  if (error) return <div className="card error-text">{error}</div>;

  return (
    <>
      <h2>Priority queue</h2>
      <p className="subtitle">Pending requests sorted by urgency — fulfill ready requests first</p>

      <div className="card">
        <table>
          <thead>
            <tr><th>Priority</th><th>Patient</th><th>Group</th><th>Units</th><th>Urgency</th><th>Stock</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {queue.length === 0 && (
              <tr><td colSpan="8" className="muted">No pending requests.</td></tr>
            )}
            {queue.map((r, i) => (
              <tr key={r.id} className={r.urgency === 'critical' ? 'selected-row' : ''}>
                <td><strong>#{i + 1}</strong></td>
                <td>{r.patientName}</td>
                <td><span className="badge ok">{r.bloodGroup}</span></td>
                <td>{r.unitsNeeded}</td>
                <td><span className={'badge ' + (r.urgency === 'critical' ? 'low' : 'warn')}>{r.urgency}</span></td>
                <td>
                  {r.canFulfill
                    ? <span className="badge ok">{r.inventoryAvailable} ✓</span>
                    : <span className="badge low">{r.inventoryAvailable} ✗</span>}
                </td>
                <td>{r.status}</td>
                <td>
                  {r.canFulfill && (
                    <button className="primary sm" onClick={() => fulfill(r.id)}>Fulfill</button>
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