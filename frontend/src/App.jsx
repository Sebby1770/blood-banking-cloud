import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import DonorsPage from './components/DonorsPage.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import RequestsPage from './components/RequestsPage.jsx';
import Privacy from './components/Privacy.jsx';
import { Icon } from './components/icons.jsx';
import { api } from './api.js';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', component: Dashboard, sub: 'Real-time supply overview' },
  { id: 'donors', label: 'Donors', icon: 'users', component: DonorsPage, sub: 'Registered donors & donations' },
  { id: 'inventory', label: 'Inventory', icon: 'droplet', component: InventoryPage, sub: 'Units in stock per blood group' },
  { id: 'requests', label: 'Requests', icon: 'activity', component: RequestsPage, sub: 'Patient requests & matching' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield', component: Privacy, sub: 'How we protect your data', hidden: true },
];

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('bbc-theme') || 'system');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    localStorage.setItem('bbc-theme', theme);
  }, [theme]);
  const cycle = () => setTheme((t) => (t === 'dark' ? 'light' : t === 'light' ? 'system' : 'dark'));
  return [theme, cycle];
}

function useApiHealth() {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    let alive = true;
    const ping = () => api.health().then(() => alive && setOk(true)).catch(() => alive && setOk(false));
    ping();
    const id = setInterval(ping, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return ok;
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const [theme, cycleTheme] = useTheme();
  const apiOk = useApiHealth();

  const active = PAGES.find((p) => p.id === page) || PAGES[0];
  const ActiveComponent = active.component;
  const go = (id) => { setPage(id); setNavOpen(false); };

  return (
    <div className={'layout' + (navOpen ? ' nav-open' : '')}>
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo"><Icon name="droplet" color="#fff" /></span>
          <span className="brand-text">
            <span className="brand-name">Blood Bank</span>
            <span className="brand-sub">Cloud</span>
          </span>
        </div>

        <div className="nav-label">Operations</div>
        <nav>
          {PAGES.filter((p) => !p.hidden).map((p) => (
            <button key={p.id} className={page === p.id ? 'active' : ''} onClick={() => go(p.id)}>
              <Icon name={p.icon} /> {p.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <button className="nav-item" onClick={() => go('privacy')}>
            <Icon name="shield" /> Privacy Policy
          </button>
          <div className="env-pill">
            <span className="dot" /> Secured · {import.meta.env.MODE === 'production' ? 'Production' : 'Local dev'}
          </div>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <button className="icon-btn hamburger" aria-label="Toggle navigation" onClick={() => setNavOpen((v) => !v)}>
            <Icon name="menu" />
          </button>
          <div>
            <h1 className="page-title">{active.label}</h1>
            <p className="page-sub">{active.sub}</p>
          </div>
          <div className="topbar-actions">
            <span className={'status-pill' + (apiOk === false ? ' bad' : '')}>
              <span className="dot" />
              {apiOk === null ? 'Checking API…' : apiOk ? 'API healthy' : 'API offline'}
            </span>
            <button className="icon-btn" aria-label="Toggle theme" title={`Theme: ${theme}`} onClick={cycleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : theme === 'light' ? 'moon' : 'monitor'} />
            </button>
          </div>
        </header>

        <main className="main">
          <ActiveComponent />
        </main>

        <footer className="footer">
          <span>© {new Date().getFullYear()} Blood Bank Cloud — a demonstration platform.</span>
          <nav>
            <button className="linklike" onClick={() => go('privacy')}>Privacy Policy</button>
            <a href="https://github.com/Sebby1770/blood-banking-cloud" target="_blank" rel="noreferrer noopener">Source</a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
