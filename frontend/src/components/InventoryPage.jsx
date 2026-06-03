import { useEffect, useState } from 'react';
import { api } from '../api.js';

const THRESHOLD = 5;

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

  return (
    <>
      <h2>Inventory</h2>
      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="card">
        <div className="table-wrap"><table>
          <thead>
            <tr><th>Blood group</th><th>Units</th><th>Status</th><th>Adjust</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const low = r.units < THRESHOLD;
              return (
                <tr key={r.id}>
                  <td><strong>{r.bloodGroup}</strong></td>
                  <td>{r.units}</td>
                  <td>
                    {low
                      ? <span className="badge low">Low</span>
                      : <span className="badge ok">OK</span>}
                  </td>
                  <td>
                    <button className="primary" style={{ marginRight: 6 }} onClick={() => adjust(r.bloodGroup, +1)}>+1</button>
                    <button className="primary" onClick={() => adjust(r.bloodGroup, -1)}>−1</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
