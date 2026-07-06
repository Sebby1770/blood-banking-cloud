import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  const load = () => api.alerts.list({ limit: 50 }).then(setAlerts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.alerts.markRead(id);
    load();
  };

  const markAllRead = async () => {
    await api.alerts.markAllRead();
    load();
  };

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <>
      <div className="page-header">
        <h2>Alerts</h2>
        {unread > 0 && (
          <button className="primary" onClick={markAllRead}>Mark all read ({unread})</button>
        )}
      </div>
      {error && <div className="card error-text">{error}</div>}

      <div className="card">
        {alerts.length === 0 ? (
          <p className="muted">No alerts yet. Low-stock and new-request notifications appear here.</p>
        ) : (
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a.id} className={'alert-item ' + (a.read ? 'read' : 'unread')}>
                <div className="alert-meta">
                  <span className={'badge ' + (a.type === 'low_stock' ? 'low' : 'warn')}>{a.type.replace('_', ' ')}</span>
                  {a.bloodGroup && <span className="badge ok">{a.bloodGroup}</span>}
                  <time>{new Date(a.createdAt).toLocaleString()}</time>
                </div>
                <strong>{a.subject}</strong>
                <p>{a.message}</p>
                {!a.read && (
                  <button className="ghost" onClick={() => markRead(a.id)}>Mark read</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}