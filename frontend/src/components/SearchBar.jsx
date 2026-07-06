import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function SearchBar({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return undefined;
    }
    const timer = setTimeout(() => {
      api.search(query)
        .then(setResults)
        .catch(() => setResults(null));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const total = results ? results.donors.length + results.requests.length : 0;

  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search donors, patients, cities…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && query.length >= 2 && results && (
        <div className="search-dropdown">
          {total === 0 ? (
            <div className="search-empty">No results for "{query}"</div>
          ) : (
            <>
              {results.donors.map((d) => (
                <button key={`d-${d.id}`} className="search-item" onClick={() => { onNavigate('donors'); setOpen(false); setQuery(''); }}>
                  <span className="search-type">Donor</span>
                  <strong>{d.label}</strong>
                  <span className="muted">{d.detail}</span>
                </button>
              ))}
              {results.requests.map((r) => (
                <button key={`r-${r.id}`} className="search-item" onClick={() => { onNavigate('requests'); setOpen(false); setQuery(''); }}>
                  <span className="search-type">Request</span>
                  <strong>{r.label}</strong>
                  <span className="muted">{r.detail}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}