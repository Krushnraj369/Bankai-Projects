
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, Settings, Menu, X, Search, Moon, Sun, Sparkles, LogOut, User, Cpu, Leaf, Trophy, FileText, PieChart, Bug, Calendar, Workflow, BookOpen, ChevronRight, Zap, Briefcase, Terminal, Flower2, Sunrise, Anchor, Network, BrainCircuit } from 'lucide-react';
import { User as UserType } from '../types';
import { Logo } from './Logo';
import { configurationService } from '../services/configurationService';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  currentTheme: 'light' | 'dark' | 'cosmic' | 'cyberpunk' | 'nature' | 'executive' | 'terminal' | 'sakura' | 'sunset' | 'abyss';
  onThemeChange: (theme: 'light' | 'dark' | 'cosmic' | 'cyberpunk' | 'nature' | 'executive' | 'terminal' | 'sakura' | 'sunset' | 'abyss') => void;
  currentUser: UserType | null;
  onLogout: () => void;
}

// --- FUTURISTIC NAV ITEM ---
const NavItem = ({ page, icon: Icon, label, isCollapsed, isActive, onClick, isNew }: { page: string, icon: any, label: string, isCollapsed: boolean, isActive: boolean, onClick: (page: string) => void, isNew?: boolean }) => (
  <button
    onClick={() => onClick(page)}
    className={`
      relative w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 group overflow-hidden
      ${isActive 
        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25 scale-[1.02] ring-1 ring-white/20' 
        : 'text-muted hover:text-heading hover:bg-surface-hover/80 hover:translate-x-1'
      }
    `}
  >
    {/* Active Glow Overlay */}
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30 pointer-events-none" />
    )}

    {/* Icon Wrapper */}
    <div className={`
      relative z-10 p-1 rounded-lg transition-all duration-300
      ${isActive ? 'bg-white/20 text-white' : 'bg-transparent group-hover:bg-background/50'}
    `}>
      <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
    </div>

    {/* Label */}
    <span className={`
      relative z-10 text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-300 origin-left
      ${isCollapsed ? 'opacity-0 w-0 translate-x-[-10px]' : 'opacity-100 w-auto translate-x-0'}
    `}>
      {label}
    </span>

    {/* "New" Badge */}
    {isNew && !isCollapsed && (
      <span className="ml-auto relative z-10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white rounded shadow-sm animate-pulse">
        New
      </span>
    )}

    {/* Active Indicator Dot (Only when collapsed) */}
    {isActive && isCollapsed && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
    )}
  </button>
);

// --- CATEGORY HEADER ---
const NavCategory = ({ label, isCollapsed }: { label: string, isCollapsed: boolean }) => (
  <div className={`mt-6 mb-2 px-4 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center opacity-50' : 'justify-between opacity-100'}`}>
    {!isCollapsed ? (
      <>
        <span className="text-[10px] font-black text-primary-500/80 uppercase tracking-[0.2em]">{label}</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary-500/20 to-transparent ml-3" />
      </>
    ) : (
      <div className="h-[1px] w-6 bg-border" />
    )}
  </div>
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
  const [systemStatus, setSystemStatus] = useState({ status: 'CHECKING', latency: 0 });
  
  // Scroll Handling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const res = await configurationService.checkHealth();
      setSystemStatus({ status: res.status, latency: res.latency });
    };
    check();
    const interval = setInterval(check, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Reset scroll on route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileSidebarOpen(false);
  };

  const themes = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'cosmic', label: 'Cosmic', icon: Sparkles },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: Cpu },
    { id: 'nature', label: 'Nature', icon: Leaf },
    { id: 'executive', label: 'Executive', icon: Briefcase },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'sakura', label: 'Sakura', icon: Flower2 },
    { id: 'sunset', label: 'Sunset', icon: Sunrise },
    { id: 'abyss', label: 'Abyss', icon: Anchor },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300 selection:bg-primary-500/30">
      
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed md:relative z-50 h-full flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'} 
          ${desktopSidebarOpen ? 'md:w-72' : 'md:w-[88px]'}
          bg-surface/95 backdrop-blur-2xl border-r border-white/5 shadow-2xl
        `}
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" />

        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-5 min-h-[80px] relative">
          <div className={`flex items-center transition-all duration-300 ${!desktopSidebarOpen ? 'w-full justify-center' : ''}`}>
             <Logo theme={currentTheme as any} showText={desktopSidebarOpen} className={!desktopSidebarOpen ? 'justify-center scale-90' : ''} />
          </div>
          
          <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden absolute right-4 p-2 text-muted hover:text-heading hover:bg-surface-hover rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* --- NAVIGATION SCROLL AREA --- */}
        <div className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar space-y-1">
          
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'dashboard'} onClick={handleNavigate} />
          
          <NavCategory label="Core Testing" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} />
          <NavItem page="create" icon={PlusCircle} label="Create Case" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'create'} onClick={handleNavigate} />
          <NavItem page="view" icon={List} label="Repository" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'view'} onClick={handleNavigate} />
          
          <NavCategory label="Intelligence" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} />
          <NavItem page="intelligence" icon={BrainCircuit} label="System Intelligence" isNew={true} isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'intelligence'} onClick={handleNavigate} />
          <NavItem page="analytics" icon={PieChart} label="Analytics" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'analytics'} onClick={handleNavigate} />
          <NavItem page="reports" icon={FileText} label="Reports" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'reports'} onClick={handleNavigate} />
          <NavItem page="achievements" icon={Trophy} label="Gamification" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'achievements'} onClick={handleNavigate} />

          <NavCategory label="Lifecycle" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} />
          <NavItem page="defects" icon={Bug} label="Defects" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'defects'} onClick={handleNavigate} />
          <NavItem page="planning" icon={Calendar} label="Planning" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'planning'} onClick={handleNavigate} />
          <NavItem page="automation" icon={Workflow} label="Automation" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'automation'} onClick={handleNavigate} />
          <NavItem page="wiki" icon={BookOpen} label="Knowledge" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'wiki'} onClick={handleNavigate} />
          
          <NavCategory label="System" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} />
          <NavItem page="settings" icon={Settings} label="Settings" isCollapsed={!desktopSidebarOpen && !mobileSidebarOpen} isActive={activePage === 'settings'} onClick={handleNavigate} />
        
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="p-4 border-t border-white/5 bg-surface-hover/30">
           {desktopSidebarOpen ? (
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-muted uppercase tracking-wider">BankaiQA v3.0 Pro</span>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${systemStatus.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                      <span className={`text-[10px] font-medium ${systemStatus.status === 'ONLINE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {systemStatus.status === 'ONLINE' ? `Online (${systemStatus.latency}ms)` : 'Local Mode'}
                      </span>
                   </div>
                </div>
                <button 
                  onClick={() => setDesktopSidebarOpen(false)} 
                  className="p-2 text-muted hover:text-heading hover:bg-surface rounded-lg transition-all active:scale-95"
                >
                  <Menu size={18} />
                </button>
             </div>
           ) : (
             <div className="flex justify-center">
               <button 
                  onClick={() => setDesktopSidebarOpen(true)} 
                  className="p-2 text-muted hover:text-heading hover:bg-surface rounded-lg transition-all"
                >
                  <ChevronRight size={20} />
               </button>
             </div>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full bg-background transition-colors duration-300">
        {/* INCREASED Z-INDEX TO 40 TO FIX DROPDOWN OVERLAP */}
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 z-40 sticky top-0 transition-colors duration-300 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileSidebarOpen(true)} 
              className="md:hidden p-2 -ml-2 text-muted hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-lg md:text-xl font-bold text-heading tracking-tight flex items-center gap-2">
              {activePage === 'dashboard' && 'Executive Dashboard'}
              {activePage === 'create' && 'New Test Case'}
              {activePage === 'view' && 'Test Case Repository'}
              {activePage === 'intelligence' && 'System Intelligence Hub'}
              {activePage === 'analytics' && 'Analytics Intelligence'}
              {activePage === 'reports' && 'Reporting Center'}
              {activePage === 'achievements' && 'My Achievements & Progress'}
              {activePage === 'settings' && 'System Settings'}
              {activePage === 'defects' && 'Defect Tracking'}
              {activePage === 'planning' && 'Test Planning'}
              {activePage === 'automation' && 'Automation Hub'}
              {activePage === 'wiki' && 'Knowledge Base'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Theme Switcher */}
            <div className="relative">
              <button 
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2.5 rounded-full hover:bg-surface-hover text-muted hover:text-primary-500 transition-all active:scale-95"
                title="Change Theme"
              >
                {currentTheme === 'light' && <Sun size={20} />}
                {currentTheme === 'dark' && <Moon size={20} />}
                {currentTheme === 'cosmic' && <Sparkles size={20} />}
                {currentTheme === 'cyberpunk' && <Cpu size={20} />}
                {currentTheme === 'nature' && <Leaf size={20} />}
                {currentTheme === 'executive' && <Briefcase size={20} />}
                {currentTheme === 'terminal' && <Terminal size={20} />}
                {currentTheme === 'sakura' && <Flower2 size={20} />}
                {currentTheme === 'sunset' && <Sunrise size={20} />}
                {currentTheme === 'abyss' && <Anchor size={20} />}
              </button>
              
              {themeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setThemeDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl z-20 py-1 overflow-y-auto max-h-[300px] custom-scrollbar ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id as any);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors ${
                          currentTheme === t.id ? 'text-primary-500 font-bold bg-primary-50/50 dark:bg-primary-900/10' : 'text-muted'
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
                className="pl-9 pr-4 py-2 rounded-full bg-background border border-border focus:border-primary-500 text-sm text-heading placeholder:text-muted focus:ring-2 focus:ring-primary-500/20 w-48 lg:w-64 transition-all hover:border-primary-500/50"
              />
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary-500/20 hover:ring-2 hover:ring-primary-500/50 transition-all cursor-pointer active:scale-95"
                title={currentUser?.NAME}
              >
                {currentUser?.NAME?.charAt(0) || 'U'}
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-5 py-4 border-b border-border bg-surface-hover/30">
                      <p className="text-sm font-bold text-heading truncate">{currentUser?.NAME}</p>
                      <p className="text-xs text-muted truncate mt-0.5">ID: {currentUser?.USERID}</p>
                      <div className="mt-2 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                         <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wide">Online</span>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-muted hover:text-heading hover:bg-surface-hover transition-colors">
                        <User size={16} /> My Profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-muted hover:text-heading hover:bg-surface-hover transition-colors">
                        <Settings size={16} /> Account Settings
                      </button>
                      <div className="h-px bg-border my-1 mx-4" />
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors font-medium"
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
        <div ref={scrollContainerRef} className="flex-1 overflow-auto p-4 md:p-8 w-full custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};
