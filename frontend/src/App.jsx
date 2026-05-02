import { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import DonorsPage from './components/DonorsPage.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import RequestsPage from './components/RequestsPage.jsx';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', component: Dashboard },
  { id: 'donors', label: 'Donors', component: DonorsPage },
  { id: 'inventory', label: 'Inventory', component: InventoryPage },
  { id: 'requests', label: 'Requests', component: RequestsPage },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const ActiveComponent = PAGES.find((p) => p.id === page).component;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Blood Bank Cloud</h1>
        <nav>
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={page === p.id ? 'active' : ''}
              onClick={() => setPage(p.id)}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">
        <ActiveComponent />
      </main>
    </div>
  );
}
