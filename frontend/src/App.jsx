import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import DonorsPage from './components/DonorsPage.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import RequestsPage from './components/RequestsPage.jsx';
import DonationsPage from './components/DonationsPage.jsx';
import HospitalsPage from './components/HospitalsPage.jsx';
import AlertsPage from './components/AlertsPage.jsx';
import CompatibilityPage from './components/CompatibilityPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import ReportsPage from './components/ReportsPage.jsx';
import OutreachPage from './components/OutreachPage.jsx';
import QueuePage from './components/QueuePage.jsx';
import SearchBar from './components/SearchBar.jsx';
import ToastStack from './components/ToastStack.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useToast } from './hooks/useToast.js';
import { api } from './api.js';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', component: Dashboard },
  { id: 'queue', label: 'Priority queue', icon: '⚡', component: QueuePage },
  { id: 'outreach', label: 'Outreach', icon: '📞', component: OutreachPage },
  { id: 'donors', label: 'Donors', icon: '🩸', component: DonorsPage },
  { id: 'donations', label: 'Donations', icon: '📋', component: DonationsPage },
  { id: 'inventory', label: 'Inventory', icon: '🏥', component: InventoryPage },
  { id: 'requests', label: 'Requests', icon: '🆘', component: RequestsPage },
  { id: 'hospitals', label: 'Hospitals', icon: '🏨', component: HospitalsPage },
  { id: 'reports', label: 'Reports', icon: '📈', component: ReportsPage },
  { id: 'alerts', label: 'Alerts', icon: '🔔', component: AlertsPage },
  { id: 'compatibility', label: 'Compatibility', icon: '🧬', component: CompatibilityPage },
  { id: 'settings', label: 'Settings', icon: '⚙️', component: SettingsPage },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [orgName, setOrgName] = useState('Blood Bank Cloud');
  const { dark, toggle } = useTheme();
  const { toasts, toast, dismiss } = useToast();
  const ActiveComponent = PAGES.find((p) => p.id === page).component;

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ status: 'offline' }));
    api.settings.get().then((s) => setOrgName(s.organizationName || 'Blood Bank Cloud')).catch(() => {});
    api.alerts.count().then((c) => setUnreadAlerts(c.unread)).catch(() => {});
    const id = setInterval(() => {
      api.alerts.count().then((c) => setUnreadAlerts(c.unread)).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [page]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-bar input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>{orgName}</h1>
          <span className="version">v0.4.0</span>
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
          <div className="shortcut-hint">⌘K to search</div>
        </div>
      </aside>
      <main className="main">
        <ActiveComponent onToast={toast} onNavigate={setPage} />
      </main>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}