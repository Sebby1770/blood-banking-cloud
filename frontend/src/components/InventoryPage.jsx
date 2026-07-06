import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const load = () => api.inventory.list().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const adjust = async (bloodGroup, delta) => {
    try {
      await api.inventory.adjust(bloodGroup, delta);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const total = rows.reduce((sum, r) => sum + r.units, 0);

  return (
    <>
      <h2>Inventory</h2>
      <p className="subtitle">{total} total units across {rows.length} blood groups</p>
      {error && <div className="card error-text">{error}</div>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Blood group</th><th>Units</th><th>Status</th><th>Threshold</th><th>Adjust</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.bloodGroup}</strong></td>
                <td>{r.units}</td>
                <td>
                  <span className={'badge ' + (r.status === 'low' ? 'low' : r.status === 'moderate' ? 'warn' : 'ok')}>
                    {r.status}
                  </span>
                </td>
                <td className="muted">{r.threshold}</td>
                <td>
                  <button className="primary sm" onClick={() => adjust(r.bloodGroup, +1)}>+1</button>
                  <button className="primary sm" onClick={() => adjust(r.bloodGroup, -1)}>−1</button>
                  <button className="ghost sm" onClick={() => adjust(r.bloodGroup, +5)}>+5</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}