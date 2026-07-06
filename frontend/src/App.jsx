import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import DonorsPage from './components/DonorsPage.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import RequestsPage from './components/RequestsPage.jsx';
import DonationsPage from './components/DonationsPage.jsx';
import HospitalsPage from './components/HospitalsPage.jsx';
import AlertsPage from './components/AlertsPage.jsx';
import CompatibilityPage from './components/CompatibilityPage.jsx';
import SearchBar from './components/SearchBar.jsx';
import { useTheme } from './hooks/useTheme.js';
import { api } from './api.js';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', component: Dashboard },
  { id: 'donors', label: 'Donors', icon: '🩸', component: DonorsPage },
  { id: 'donations', label: 'Donations', icon: '📋', component: DonationsPage },
  { id: 'inventory', label: 'Inventory', icon: '🏥', component: InventoryPage },
  { id: 'requests', label: 'Requests', icon: '🆘', component: RequestsPage },
  { id: 'hospitals', label: 'Hospitals', icon: '🏨', component: HospitalsPage },
  { id: 'alerts', label: 'Alerts', icon: '🔔', component: AlertsPage },
  { id: 'compatibility', label: 'Compatibility', icon: '🧬', component: CompatibilityPage },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const { dark, toggle } = useTheme();
  const ActiveComponent = PAGES.find((p) => p.id === page).component;

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ status: 'offline' }));
    api.alerts.count().then((c) => setUnreadAlerts(c.unread)).catch(() => {});
    const id = setInterval(() => {
      api.alerts.count().then((c) => setUnreadAlerts(c.unread)).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [page]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>Blood Bank Cloud</h1>
          <span className="version">v0.3.0</span>
        </div>
        <SearchBar onNavigate={setPage} />
        <nav>
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={page === p.id ? 'active' : ''}
              onClick={() => setPage(p.id)}
            >
              <span className="nav-icon">{p.icon}</span>
              {p.label}
              {p.id === 'alerts' && unreadAlerts > 0 && (
                <span className="nav-badge">{unreadAlerts}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggle}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <div className={'health ' + (health?.status === 'ok' ? 'ok' : 'warn')}>
            API {health?.status === 'ok' ? 'online' : 'offline'}
          </div>
        </div>
      </aside>
      <main className="main">
        <ActiveComponent />
      </main>
    </div>
  );
}