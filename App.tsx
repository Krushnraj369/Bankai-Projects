import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateTestCase } from './pages/CreateTestCase';
import { ViewTestCases } from './pages/ViewTestCases';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { testCaseService } from './services/testCaseService';
import { authService } from './services/authService';
import { TestCase, User } from './types';

// Simple Theme Type
export type Theme = 'light' | 'dark' | 'cosmic';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [allCases, setAllCases] = useState<TestCase[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoadingAuth(false);
  }, []);

  // Load data for dashboard context
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [activePage, currentUser]);

  // Apply Theme Class to Body/Root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'cosmic');
    root.classList.add(theme);
  }, [theme]);

  const loadData = async () => {
    const data = await testCaseService.getAll();
    setAllCases(data);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading System...</div>;
  }

  // If not logged in, show Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Main App Layout
  return (
    <div className={`app-container ${theme} min-h-screen bg-background text-heading transition-colors duration-300`}>
      <Layout 
        activePage={activePage} 
        onNavigate={setActivePage}
        currentTheme={theme}
        onThemeChange={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {activePage === 'dashboard' && (
          <Dashboard data={allCases} />
        )}
        {activePage === 'create' && (
          <CreateTestCase onSuccess={() => setActivePage('view')} />
        )}
        {activePage === 'view' && (
          <ViewTestCases />
        )}
        {activePage === 'settings' && (
          <Settings />
        )}
      </Layout>
    </div>
  );
}

export default App;