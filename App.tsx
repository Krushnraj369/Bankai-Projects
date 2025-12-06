
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateTestCase } from './pages/CreateTestCase';
import { ViewTestCases } from './pages/ViewTestCases';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Achievements } from './pages/Achievements';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { Defects } from './pages/Defects';
import { TestPlanning } from './pages/TestPlanning';
import { Automation } from './pages/Automation';
import { Wiki } from './pages/Wiki';
import { SystemConfigHub } from './pages/SystemConfigHub';
import { testCaseService } from './services/testCaseService';
import { authService } from './services/authService';
import { TestCase, User } from './types';
import { ToastProvider } from './components/Toast';
import { AIAssistant } from './components/AIAssistant';

export type Theme = 'light' | 'dark' | 'cosmic' | 'cyberpunk' | 'nature' | 'executive' | 'terminal' | 'sakura' | 'sunset' | 'abyss';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allCases, setAllCases] = useState<TestCase[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Determine active page from URL for the Sidebar
  const getActivePage = () => {
    const path = location.pathname.substring(1); // remove leading /
    if (path === '' || path === 'dashboard') return 'dashboard';
    return path;
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [location.pathname, currentUser]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'cosmic', 'cyberpunk', 'nature', 'executive', 'terminal', 'sakura', 'sunset', 'abyss');
    root.classList.add(theme);
  }, [theme]);

  const loadData = async () => {
    const data = await testCaseService.getAll();
    setAllCases(data);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading System...</div>;
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ToastProvider>
      <div className={`app-container ${theme} min-h-screen bg-background text-heading transition-colors duration-300`}>
        <Layout 
          activePage={getActivePage()} 
          onNavigate={(page) => navigate(`/${page}`)}
          currentTheme={theme}
          onThemeChange={setTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard data={allCases} />} />
            <Route path="/create" element={<CreateTestCase onSuccess={() => navigate('/view')} />} />
            <Route path="/view" element={<ViewTestCases />} />
            <Route path="/intelligence" element={<SystemConfigHub />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* FORCEFULLY LINKING REAL PAGES */}
            <Route path="/defects" element={<Defects />} />
            <Route path="/planning" element={<TestPlanning />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/wiki" element={<Wiki />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
        
        {/* Global AI Assistant */}
        <AIAssistant />
        
      </div>
    </ToastProvider>
  );
}

export default App;
