import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, List, Settings, Menu, X, Database, Search, Moon, Sun, Sparkles, LogOut, User } from 'lucide-react';
import { User as UserType } from '../types';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  currentTheme: 'light' | 'dark' | 'cosmic';
  onThemeChange: (theme: 'light' | 'dark' | 'cosmic') => void;
  currentUser: UserType | null;
  onLogout: () => void;
}

// Helper Component defined outside
const NavItem = ({ page, icon: Icon, label, isCollapsed, isActive, onClick }: { page: string, icon: any, label: string, isCollapsed: boolean, isActive: boolean, onClick: (page: string) => void }) => (
  <button
    onClick={() => onClick(page)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
        : 'text-muted hover:bg-surface-hover hover:text-heading'
    }`}
  >
    <Icon size={20} className={`min-w-[20px] ${isActive ? 'text-white' : 'text-muted group-hover:text-heading'}`} />
    <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>
      {label}
    </span>
    {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activePage, 
  onNavigate, 
  currentTheme, 
  onThemeChange,
  currentUser,
  onLogout
}) => {
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileSidebarOpen(false);
  };

  const themes = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'cosmic', label: 'Cosmic Theme', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300">
      
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:relative z-50 h-full bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out shadow-xl
          ${mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} 
          ${desktopSidebarOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border min-h-[64px]">
          <div className={`flex items-center justify-center w-full ${!desktopSidebarOpen ? 'px-0' : ''}`}>
             <Logo theme={currentTheme} showText={desktopSidebarOpen} className={!desktopSidebarOpen ? 'justify-center' : ''} />
          </div>
          
          <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden absolute right-4 text-muted hover:text-heading">
            <X size={20} />
          </button>
        </div>

        {!desktopSidebarOpen && (
          <div className="hidden md:flex justify-center py-4">
             <button onClick={() => setDesktopSidebarOpen(true)} className="text-muted hover:text-heading">
              <Menu size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 p-3 space-y-2 mt-4 overflow-y-auto">
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'dashboard'} onClick={handleNavigate} />
          <NavItem page="create" icon={PlusCircle} label="Create Test Case" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'create'} onClick={handleNavigate} />
          <NavItem page="view" icon={List} label="View All Cases" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'view'} onClick={handleNavigate} />
          <div className="pt-4 mt-4 border-t border-border">
            <NavItem page="settings" icon={Settings} label="System Config" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'settings'} onClick={handleNavigate} />
          </div>
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="p-4 border-t border-border hidden md:flex justify-between items-center">
           {desktopSidebarOpen && <span className="text-xs text-muted">v2.5.0 Bankai</span>}
           <button 
             onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)} 
             className="text-muted hover:text-heading p-1 hover:bg-surface-hover rounded-lg transition-colors"
           >
             {desktopSidebarOpen ? <X size={16} /> : <Menu size={16} />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full bg-background transition-colors duration-300">
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileSidebarOpen(true)} 
              className="md:hidden p-2 -ml-2 text-muted hover:bg-background rounded-lg"
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-lg md:text-xl font-semibold text-heading truncate">
              {activePage === 'dashboard' && 'Executive Dashboard'}
              {activePage === 'create' && 'New Test Case'}
              {activePage === 'view' && 'Test Case Repository'}
              {activePage === 'settings' && 'System Settings'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Theme Switcher */}
            <div className="relative">
              <button 
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 rounded-full hover:bg-background text-muted hover:text-primary-500 transition-colors"
                title="Change Theme"
              >
                {currentTheme === 'light' && <Sun size={20} />}
                {currentTheme === 'dark' && <Moon size={20} />}
                {currentTheme === 'cosmic' && <Sparkles size={20} />}
              </button>
              
              {themeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setThemeDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id as any);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-background transition-colors ${
                          currentTheme === t.id ? 'text-primary-500 font-medium' : 'text-muted'
                        }`}
                      >
                        <t.icon size={16} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="pl-9 pr-4 py-2 rounded-full bg-background border-none text-sm text-heading placeholder-muted focus:ring-2 focus:ring-primary-500 w-48 lg:w-64 transition-all"
              />
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm border border-primary-100 shrink-0 hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer"
                title={currentUser?.NAME}
              >
                {currentUser?.NAME?.charAt(0) || 'U'}
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-surface-hover/50">
                      <p className="text-sm font-semibold text-heading truncate">{currentUser?.NAME}</p>
                      <p className="text-xs text-muted truncate">ID: {currentUser?.USERID}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-heading hover:bg-background transition-colors">
                        <User size={16} /> Profile
                      </button>
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
