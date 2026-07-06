import { useEffect, useState } from 'react';
import { api } from '../api.js';

const GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function CompatibilityPage() {
  const [matrix, setMatrix] = useState(null);
  const [selected, setSelected] = useState('O+');
  const [error, setError] = useState(null);

  useEffect(() => {
    api.compatibility.matrix()
      .then((data) => setMatrix(data.matrix))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card error-text">{error}</div>;
  if (!matrix) return <div className="card">Loading compatibility data…</div>;

  const compatible = matrix[selected] || [];

  return (
    <>
      <h2>Blood compatibility</h2>
      <p className="subtitle">Recipient blood type → which donor types can donate whole blood</p>

      <div className="card">
        <label>Recipient blood group
          <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ marginLeft: 8 }}>
            {GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <div className="compat-chips" style={{ marginTop: 16 }}>
          {compatible.map((g) => (
            <span key={g} className="compat-chip">{g}</span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Full compatibility matrix</h3>
        <table>
          <thead>
            <tr><th>Recipient</th><th>Compatible donors</th></tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <tr key={g} className={g === selected ? 'selected-row' : ''}>
                <td><strong>{g}</strong></td>
                <td>{matrix[g].join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}