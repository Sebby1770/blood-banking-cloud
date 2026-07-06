import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function ApiDocsPage() {
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    api.docs().then(setDocs).catch(() => {});
  }, []);

  if (!docs) return <div className="card">Loading API docs…</div>;

  return (
    <>
      <h2>API reference</h2>
      <p className="subtitle">{docs.name} v{docs.version}</p>
      <div className="card">
        <table>
          <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
          <tbody>
            {docs.endpoints.map((ep) => (
              <tr key={ep.method + ep.path}>
                <td><code className="method">{ep.method}</code></td>
                <td><code>{ep.path}</code></td>
                <td>{ep.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}