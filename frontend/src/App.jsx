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
import CampaignsPage from './components/CampaignsPage.jsx';
import DonorPortalPage from './components/DonorPortalPage.jsx';
import ApiDocsPage from './components/ApiDocsPage.jsx';
import SearchBar from './components/SearchBar.jsx';
import ToastStack from './components/ToastStack.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useToast } from './hooks/useToast.js';
import { api } from './api.js';

const NAV = [
  { section: 'Operations', items: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', component: Dashboard },
    { id: 'queue', label: 'Priority queue', icon: '⚡', component: QueuePage },
    { id: 'outreach', label: 'Outreach', icon: '📞', component: OutreachPage },
    { id: 'campaigns', label: 'Blood drives', icon: '🎯', component: CampaignsPage },
  ]},
  { section: 'Registry', items: [
    { id: 'donors', label: 'Donors', icon: '🩸', component: DonorsPage },
    { id: 'portal', label: 'Donor portal', icon: '❤️', component: DonorPortalPage },
    { id: 'donations', label: 'Donations', icon: '📋', component: DonationsPage },
    { id: 'inventory', label: 'Inventory', icon: '🏥', component: InventoryPage },
    { id: 'requests', label: 'Requests', icon: '🆘', component: RequestsPage },
    { id: 'hospitals', label: 'Hospitals', icon: '🏨', component: HospitalsPage },
  ]},
  { section: 'Insights', items: [
    { id: 'reports', label: 'Reports', icon: '📈', component: ReportsPage },
    { id: 'alerts', label: 'Alerts', icon: '🔔', component: AlertsPage, badge: true },
    { id: 'compatibility', label: 'Compatibility', icon: '🧬', component: CompatibilityPage },
  ]},
  { section: 'System', items: [
    { id: 'settings', label: 'Settings', icon: '⚙️', component: SettingsPage },
    { id: 'api', label: 'API docs', icon: '📡', component: ApiDocsPage },
  ]},
];

const ALL_PAGES = NAV.flatMap((s) => s.items);

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [orgName, setOrgName] = useState('Blood Bank Cloud');
  const { dark, toggle } = useTheme();
  const { toasts, toast, dismiss } = useToast();
  const ActiveComponent = ALL_PAGES.find((p) => p.id === page)?.component || Dashboard;

  const navigate = (id) => {
    setPage(id);
    setSidebarOpen(false);
  };

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
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
        ☰
      </button>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="brand">
          <h1>{orgName}</h1>
          <span className="version">v0.5.0</span>
        </div>
        <SearchBar onNavigate={navigate} />
        <nav>
          {NAV.map((group) => (
            <div key={group.section} className="nav-section">
              <div className="nav-section-label">{group.section}</div>
              {group.items.map((p) => (
                <button
                  key={p.id}
                  className={page === p.id ? 'active' : ''}
                  onClick={() => navigate(p.id)}
                >
                  <span className="nav-icon">{p.icon}</span>
                  {p.label}
                  {p.badge && unreadAlerts > 0 && (
                    <span className="nav-badge">{unreadAlerts}</span>
                  )}
                </button>
              ))}
            </div>
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
        <ActiveComponent onToast={toast} onNavigate={navigate} />
      </main>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}