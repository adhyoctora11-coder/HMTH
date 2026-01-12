
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import MaintenancePage from './pages/Maintenance';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import ImportAssets from './pages/ImportAssets';
import { db } from './db';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(db.getCurrentUser());

  const handleLogin = (email: string, pass: string): boolean => {
    const newUser = db.login(email, pass);
    if (newUser) {
      setUser(newUser);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/inventory" element={<Inventory user={user} />} />
          <Route path="/inventory/import" element={<ImportAssets user={user} />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/maintenance" element={<MaintenancePage user={user} />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
