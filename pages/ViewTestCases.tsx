
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TestCase, Status, Priority, ViewMode } from '../types';
import * as Constants from '../constants';
import { Trash2, Edit2, ChevronLeft, ChevronRight, CheckSquare, Square, Download, X, Check, ArrowUpDown, ArrowUp, ArrowDown, Search, Upload, LayoutGrid, List as ListIcon, Copy, Save, XCircle, Filter, Calendar, Columns, GripVertical, Sidebar, Layers, ChevronDown, ChevronUp, AlertCircle, PieChart, Maximize2, MoreHorizontal, FileText, Tag, Clock, Activity } from 'lucide-react';
import { testCaseService } from '../services/testCaseService';
import { useToast } from '../components/Toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedCard } from '../components/Animations';
import { AnimatePresence, motion } from 'framer-motion';

// --- CUSTOM TOOLTIP COMPONENT ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg z-[100] pointer-events-none whitespace-normal text-center">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
    </div>
  </div>
);

// --- FILTER DROPDOWN ---
const FilterDropdown = ({ label, options, selected, onChange, icon: Icon }: { label: string, options: string[], selected: string[], onChange: (val: string[]) => void, icon?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95 ${selected.length > 0 ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-surface border-border text-heading hover:bg-surface-hover'}`}
      >
        {Icon && <Icon size={16} className={selected.length > 0 ? 'text-primary-600' : 'text-muted'} />}
        <span className="truncate max-w-[100px]">{selected.length === 0 ? label : `${selected.length} selected`}</span>
        <ChevronDown size={12} className={`opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-border bg-surface-hover/50 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-muted tracking-wider">Filter {label}</span>
            {selected.length > 0 && (
              <button onClick={() => onChange([])} className="text-[10px] font-bold text-rose-500 hover:underline">CLEAR</button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {options.map(option => (
              <label key={option} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-hover rounded-lg cursor-pointer transition-colors group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(option) ? 'bg-primary-600 border-primary-600 text-white' : 'border-muted bg-background group-hover:border-primary-400'}`}>
                  {selected.includes(option) && <Check size={10} strokeWidth={4} />}
                </div>
                <input type="checkbox" className="hidden" checked={selected.includes(option)} onChange={() => toggleOption(option)} />
                <span className={`text-sm ${selected.includes(option) ? 'font-medium text-primary-600' : 'text-heading'}`}>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ViewTestCases: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  
  // Data State
  const [cases, setCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // View State
  const viewMode = (searchParams.get('view') as ViewMode) || 'list';
  const searchText = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status')?.split(',').filter(Boolean) || [];
  const priorityFilter = searchParams.get('priority')?.split(',').filter(Boolean) || [];
  const qaFilter = searchParams.get('qa')?.split(',').filter(Boolean) || [];

  // Split View & Grouping
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState(false);
  const [groupBy, setGroupBy] = useState<string>(''); 

  const updateParams = (updates: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key);
      } else {
        newParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
    setSearchParams(newParams);
  };

  // Edit State
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<TestCase>>({});

  // Pagination & Sort
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isSplitView || viewMode === 'board' ? 9 : 20;
  const [sortConfig, setSortConfig] = useState<{ key: keyof TestCase; direction: 'asc' | 'desc' } | null>(null);

  // Columns State
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'id', 'subject', 'status', 'priority', 'moduleCode', 'qaName', 'actions'
  ]);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });
  const columnButtonRef = useRef<HTMLButtonElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Fixed Position Menus
  const [statusMenu, setStatusMenu] = useState<{ id: string; currentStatus: string; top: number; left: number } | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  
  const [actionMenu, setActionMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Constants
  const AVAILABLE_COLUMNS = [
    { key: 'id', label: 'ID', width: 'w-24 shrink-0' },
    { key: 'subject', label: 'Subject', width: 'flex-1 min-w-[300px]' }, 
    { key: 'status', label: 'Status', width: 'w-32 shrink-0' },
    { key: 'priority', label: 'Priority', width: 'w-28 shrink-0' },
    { key: 'moduleCode', label: 'Module', width: 'w-32 shrink-0' },
    { key: 'qaName', label: 'QA', width: 'w-32 shrink-0' },
    { key: 'executionDate', label: 'Exec Date', width: 'w-32 shrink-0' },
    { key: 'testType', label: 'Type', width: 'w-32 shrink-0' },
    { key: 'environment', label: 'Env', width: 'w-24 shrink-0' },
    { key: 'platform', label: 'Plat', width: 'w-24 shrink-0' },
    { key: 'browser', label: 'Browser', width: 'w-28 shrink-0' },
    { key: 'defectLink', label: 'Defect', width: 'w-32 shrink-0' },
  ];

  // --- HANDLERS ---

  useEffect(() => {
    // Global click listener to close menus
    const handleClickOutside = (event: MouseEvent) => {
      // Column Menu
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node) &&
          columnButtonRef.current && !columnButtonRef.current.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
      // Status Menu
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setStatusMenu(null);
      }
      // Action Menu
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActionMenu(null);
      }
    };
    
    // Scroll listener
    const handleScroll = (event: Event) => {
      // Don't close if scrolling inside the menu itself
      if (columnMenuRef.current && event.target instanceof Node && columnMenuRef.current.contains(event.target)) return;
      
      // Close fixed menus on main scroll
      setIsColumnMenuOpen(false);
      setStatusMenu(null);
      setActionMenu(null);
    };
    
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const toggleColumnMenu = () => {
    if (isColumnMenuOpen) { setIsColumnMenuOpen(false); return; }
    if (columnButtonRef.current) {
      const rect = columnButtonRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const pos: any = { top: rect.bottom + 8 };
      if (rect.right > screenWidth / 2) pos.right = screenWidth - rect.right;
      else pos.left = rect.left;
      setMenuPosition(pos);
      setIsColumnMenuOpen(true);
    }
  };

  const openStatusMenu = (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setStatusMenu({ id, currentStatus, top: rect.bottom + 4, left: rect.left });
    setActionMenu(null); // Close other menus
  };

  const openActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Align to right of button if close to edge
    const left = window.innerWidth - rect.right < 150 ? rect.right - 150 : rect.left;
    setActionMenu({ id, top: rect.bottom + 4, left });
    setStatusMenu(null); // Close other menus
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await testCaseService.getAll();
    setCases(data);
    setLoading(false);
  };

  // --- FILTERING & SORTING ---
  const filteredData = useMemo(() => {
    let data = cases.filter(item => {
      const matchesSearch = item.subject.toLowerCase().includes(searchText.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status);
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(item.priority);
      const matchesQa = qaFilter.length === 0 || qaFilter.includes(item.qaName);
      return matchesSearch && matchesStatus && matchesPriority && matchesQa;
    });

    if (sortConfig !== null) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        return aValue < bValue ? (sortConfig.direction === 'asc' ? -1 : 1) : (sortConfig.direction === 'asc' ? 1 : -1);
      });
    }
    return data;
  }, [cases, searchText, statusFilter, priorityFilter, qaFilter, sortConfig]);

  const viewStats = useMemo(() => {
    const total = filteredData.length;
    const passed = filteredData.filter(c => c.status === Status.Passed).length;
    const failed = filteredData.filter(c => c.status === Status.Failed).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const critical = filteredData.filter(c => c.priority === Priority.Immediate || c.priority === Priority.High).length;
    return { total, passed, failed, passRate, critical };
  }, [filteredData]);

  const groupedData = useMemo(() => {
    if (!groupBy) return null;
    return filteredData.reduce((groups, item) => {
      const key = (item as any)[groupBy] || 'Uncategorized';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, TestCase[]>);
  }, [filteredData, groupBy]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- ACTIONS ---
  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    const updatedCases = cases.map(c => c.id === id ? { ...c, status: newStatus } : c);
    setCases(updatedCases);
    try { await testCaseService.update(id, { status: newStatus }); showToast('Status updated!', 'success'); } 
    catch(e) { showToast('Update failed', 'error'); }
  };

  const handleBulkDelete = async () => {
    if(!window.confirm(`Delete ${selectedIds.size} items?`)) return;
    const ids = Array.from(selectedIds);
    const updatedCases = cases.filter(c => !ids.includes(c.id));
    setCases(updatedCases);
    await testCaseService.delete(ids);
    setSelectedIds(new Set());
    showToast('Deleted successfully', 'success');
  };

  const handleSingleDelete = async (id: string) => {
    if(!window.confirm('Delete this test case?')) return;
    const updatedCases = cases.filter(c => c.id !== id);
    setCases(updatedCases);
    await testCaseService.delete([id]);
    showToast('Deleted', 'success');
  };

  const startInlineEdit = (id: string) => {
    setEditRowId(id);
    const item = cases.find(c => c.id === id);
    if (item) setEditValues(item);
    setActionMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editRowId || !editValues) return;
    const updatedCases = cases.map(c => c.id === editRowId ? { ...c, ...editValues } : c);
    setCases(updatedCases);
    await testCaseService.update(editRowId, editValues);
    setEditRowId(null); setEditValues({});
    showToast('Saved', 'success');
  };

  // --- RENDERERS ---
  const StatusBadge = ({ status, id }: { status: string, id: string }) => {
    let colors = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    if (status === Status.Passed) colors = 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    if (status === Status.Failed) colors = 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    if (status === Status.Blocked) colors = 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    if (status === Status.InProgress) colors = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';

    return (
      <button 
        onClick={(e) => openStatusMenu(e, id, status)}
        className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:brightness-95 active:scale-95 ${colors}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${status === Status.Passed ? 'bg-emerald-500' : status === Status.Failed ? 'bg-rose-500' : 'bg-current opacity-50'}`}></span>
        {status}
        <ChevronDown size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
      </button>
    );
  };

  const renderCell = (tc: TestCase, colKey: string, isEditing: boolean) => {
    if (colKey === 'id') return <span className="font-mono text-[11px] font-bold text-muted bg-surface-hover px-1.5 py-0.5 rounded border border-border/50">{tc.id}</span>;
    if (colKey === 'subject') {
      if (isEditing) return <input autoFocus className="w-full bg-background border border-primary-500 rounded px-2 py-1 text-sm shadow-sm" value={editValues.subject || ''} onChange={e => setEditValues(p => ({...p, subject: e.target.value}))} />;
      return (
        <Tooltip text={tc.subject}>
          <span onClick={() => navigate(`/create?id=${tc.id}`)} className="font-medium text-heading truncate block hover:text-primary-600 hover:underline cursor-pointer transition-colors max-w-[400px]">
            {tc.subject}
          </span>
        </Tooltip>
      );
    }
    if (colKey === 'status') {
      if (isEditing) return <select value={editValues.status || ''} onChange={e => setEditValues(p => ({...p, status: e.target.value}))} className="bg-background border rounded text-xs px-1 py-1"><option>Select...</option>{Object.values(Status).map(s=><option key={s} value={s}>{s}</option>)}</select>;
      return <StatusBadge status={tc.status} id={tc.id} />;
    }
    if (colKey === 'priority') {
       if (isEditing) return <select value={editValues.priority || ''} onChange={e => setEditValues(p => ({...p, priority: e.target.value}))} className="bg-background border rounded text-xs px-1 py-1"><option>Select...</option>{Object.values(Priority).map(s=><option key={s} value={s}>{s}</option>)}</select>;
       const isHigh = tc.priority === Priority.High || tc.priority === Priority.Immediate;
       return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${isHigh ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50' : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>{tc.priority}</span>
    }
    const val = String((tc as any)[colKey] || '');
    return <span className="text-sm text-muted truncate block max-w-[150px]" title={val}>{val}</span>;
  };

  const handleHeaderDragStart = (e: React.DragEvent, colKey: string) => { setDraggedColumn(colKey); e.dataTransfer.effectAllowed = 'move'; };
  const handleHeaderDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleHeaderDrop = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === target) return;
    const newOrder = [...columnOrder];
    const fromIdx = newOrder.indexOf(draggedColumn);
    const toIdx = newOrder.indexOf(target);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggedColumn);
    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-4 overflow-hidden relative">
      
      {/* 1. CONTROL BAR */}
      <div className="bg-surface p-3 rounded-2xl border border-border shadow-sm flex flex-col gap-3 shrink-0 relative z-30">
        <div className="flex flex-col xl:flex-row gap-3 justify-between items-start xl:items-center">
          
          {/* Left: Filters */}
          <div className="flex-1 w-full xl:w-auto flex gap-2 flex-wrap items-center">
             <div className="relative flex-1 min-w-[240px] max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by ID or Subject..." 
                  value={searchText} 
                  onChange={(e) => updateParams({ q: e.target.value })} 
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-heading focus:ring-2 focus:ring-primary-500/50 w-full transition-all hover:border-primary-300 dark:hover:border-primary-700" 
                />
             </div>
             
             <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>
             
             <FilterDropdown label="Status" options={Object.values(Status)} selected={statusFilter} onChange={(val) => updateParams({ status: val })} icon={Filter} />
             <FilterDropdown label="Priority" options={Object.values(Priority)} selected={priorityFilter} onChange={(val) => updateParams({ priority: val })} />
             
             <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>

             {/* Group By */}
             <div className="relative group/groupmenu">
                <button className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${groupBy ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300' : 'bg-background border-border text-heading hover:bg-surface-hover'}`}>
                   <Layers size={16} /> <span>{groupBy ? `By: ${groupBy}` : 'Group'}</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-44 bg-surface border border-border rounded-xl shadow-xl z-20 hidden group-hover/groupmenu:block p-1 animate-in fade-in zoom-in-95">
                   {['', 'moduleCode', 'status', 'priority', 'qaName'].map(g => (
                      <button key={g} onClick={() => setGroupBy(g)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover rounded-lg text-heading flex items-center justify-between">
                         {g === '' ? 'None' : g.charAt(0).toUpperCase() + g.slice(1)}
                         {groupBy === g && <Check size={14} className="text-primary-500"/>}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Right: View Toggles */}
          <div className="flex items-center gap-3">
             <div className="flex bg-background border border-border rounded-xl p-1 shadow-sm">
               <button onClick={() => updateParams({ view: 'list' })} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface shadow text-primary-600' : 'text-muted hover:text-heading hover:bg-surface-hover'}`} title="List View"><ListIcon size={18}/></button>
               <button onClick={() => updateParams({ view: 'board' })} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-surface shadow text-primary-600' : 'text-muted hover:text-heading hover:bg-surface-hover'}`} title="Board View"><LayoutGrid size={18}/></button>
               <button onClick={() => updateParams({ view: 'timeline' })} className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-surface shadow text-primary-600' : 'text-muted hover:text-heading hover:bg-surface-hover'}`} title="Timeline View"><Calendar size={18}/></button>
             </div>
             
             {/* Column Menu Button */}
             <button 
                ref={columnButtonRef} 
                onClick={toggleColumnMenu} 
                className={`p-2.5 border rounded-xl transition-all active:scale-95 ${isColumnMenuOpen ? 'bg-primary-50 border-primary-500 text-primary-600 ring-2 ring-primary-200 dark:ring-primary-900' : 'bg-surface border-border text-muted hover:text-heading hover:border-primary-400'}`}
             >
               <Columns size={18}/>
             </button>

             {/* Split View Toggle */}
             <button 
                onClick={() => { setIsSplitView(!isSplitView); setActiveCaseId(null); }} 
                className={`p-2.5 border rounded-xl transition-all active:scale-95 ${isSplitView ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900/20' : 'bg-surface border-border text-muted hover:text-heading hover:border-indigo-400'}`}
                title="Toggle Split View"
             >
                <Sidebar size={18} className={isSplitView ? 'rotate-180' : ''} />
             </button>
          </div>
        </div>

        {/* 2. HUD STATS BAR */}
        <div className="flex gap-4 px-2 py-1 overflow-x-auto custom-scrollbar">
           <BadgeStat icon={ListIcon} label="Total" value={viewStats.total} color="blue" />
           <BadgeStat icon={PieChart} label="Pass Rate" value={`${viewStats.passRate}%`} color="emerald" />
           <BadgeStat icon={AlertCircle} label="Failures" value={viewStats.failed} color="rose" />
           <BadgeStat icon={AlertCircle} label="Critical" value={viewStats.critical} color="amber" />
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden gap-4 relative">
        
        {/* VIEW: LIST */}
        {viewMode === 'list' && (
          <div className={`flex-1 bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col transition-all duration-300 ${activeCaseId && isSplitView ? 'w-2/3' : 'w-full'}`}>
             
             {/* UNIFIED SCROLL CONTAINER - Force Horizontal Scroll */}
             <div className="flex-1 w-full h-full overflow-auto custom-scrollbar relative">
                <div className="min-w-max h-full"> 
                   
                   {/* Table Header - Sticky Top */}
                   <div className="sticky top-0 z-20 flex text-[11px] font-bold text-muted uppercase tracking-wider select-none bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm">
                      <div className="p-3 w-12 shrink-0 flex items-center justify-center border-r border-border">
                         <button onClick={() => selectedIds.size === filteredData.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredData.map(c => c.id)))}>
                            {selectedIds.size > 0 ? <CheckSquare size={16} className="text-primary-600"/> : <Square size={16}/>}
                         </button>
                      </div>
                      {columnOrder.map(colKey => {
                         if (colKey === 'actions') return <div key="actions" className="p-3 w-[80px] shrink-0 text-center border-l border-border">Action</div>;
                         const colDef = AVAILABLE_COLUMNS.find(c => c.key === colKey);
                         return (
                            <div 
                              key={colKey} 
                              draggable 
                              onDragStart={(e) => handleHeaderDragStart(e, colKey)}
                              onDragOver={handleHeaderDragOver}
                              onDrop={(e) => handleHeaderDrop(e, colKey)}
                              onClick={() => setSortConfig({ key: colKey as any, direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc' })}
                              className={`p-3 flex items-center gap-1 cursor-pointer hover:bg-surface-hover hover:text-primary-600 transition-colors border-r border-border/50 ${colDef?.width || 'w-32'} ${draggedColumn === colKey ? 'opacity-30 bg-primary-100' : ''}`}
                            >
                               <GripVertical size={12} className="text-muted/30 mr-1 cursor-move hover:text-muted"/>
                               {colDef?.label || colKey}
                               {sortConfig?.key === colKey && (sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-primary-500"/> : <ArrowDown size={12} className="text-primary-500"/>)}
                            </div>
                         );
                      })}
                   </div>

                   {/* Table Body */}
                   <div className="bg-background w-full">
                      {paginatedData.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-64 text-muted w-full">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p>No test cases found matching your filters.</p>
                            <button onClick={() => { updateParams({ q: '', status: [], priority: [] }) }} className="mt-4 text-primary-600 font-bold text-sm hover:underline">Clear Filters</button>
                         </div>
                      ) : groupBy && Object.keys(groupedData || {}).length > 0 ? (
                         Object.entries(groupedData || {}).map(([groupName, groupItems]) => (
                            <div key={groupName} className="border-b border-border">
                               <div className="sticky top-10 bg-surface/95 backdrop-blur-sm p-2 flex items-center gap-2 text-sm font-bold text-heading cursor-pointer z-10 border-b border-border/50 shadow-sm">
                                  <ChevronDown size={16} /> 
                                  <span>{groupName}</span> 
                                  <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 px-2 py-0.5 rounded-full font-bold">{groupItems.length}</span>
                               </div>
                               {groupItems.map((tc, idx) => <TableRow key={tc.id} tc={tc} index={idx} />)}
                            </div>
                         ))
                      ) : (
                         paginatedData.map((tc, idx) => <TableRow key={tc.id} tc={tc} index={idx} />)
                      )}
                   </div>

                </div>
             </div>

          </div>
        )}

        {/* VIEW: BOARD */}
        {viewMode === 'board' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
               {paginatedData.map((tc, idx) => (
                 <AnimatedCard key={tc.id} delay={idx * 0.05} className={`bg-surface border rounded-xl p-4 shadow-sm hover:shadow-lg transition-all group flex flex-col gap-3 h-fit cursor-pointer relative overflow-hidden ${
                    tc.priority === 'High' || tc.priority === 'Immediate' ? 'border-t-4 border-t-rose-500 border-x-border border-b-border' : 
                    tc.priority === 'Medium' ? 'border-t-4 border-t-amber-500 border-x-border border-b-border' : 'border-border'
                 }`} onClick={() => navigate(`/create?id=${tc.id}`)}>
                    <div className="flex justify-between items-start">
                       <span className="font-mono text-[10px] font-bold text-muted uppercase tracking-wider">{tc.id}</span>
                       <div onClick={e => e.stopPropagation()}><StatusBadge status={tc.status} id={tc.id} /></div>
                    </div>
                    <h3 className="text-sm font-bold text-heading line-clamp-3 leading-snug min-h-[3rem]" title={tc.subject}>{tc.subject}</h3>
                    <div className="flex gap-2 flex-wrap mt-auto pt-3 border-t border-border/50">
                       <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-muted flex items-center gap-1"><Layers size={10}/> {tc.moduleCode}</span>
                       <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-muted flex items-center gap-1"><Tag size={10}/> {tc.priority}</span>
                    </div>
                 </AnimatedCard>
               ))}
             </div>
          </div>
        )}

        {/* VIEW: TIMELINE */}
        {viewMode === 'timeline' && (
          <div className="flex-1 bg-surface border border-border rounded-2xl overflow-y-auto custom-scrollbar p-8">
             <div className="max-w-4xl mx-auto relative border-l-2 border-border/50 ml-4 space-y-10 pl-8 py-2">
                {Object.entries(
                   paginatedData.reduce((acc, tc) => {
                      const d = tc.executionDate || 'Unscheduled';
                      if(!acc[d]) acc[d] = [];
                      acc[d].push(tc);
                      return acc;
                   }, {} as Record<string, TestCase[]>)
                ).sort().map(([date, items]) => (
                   <div key={date} className="relative">
                      <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-surface border-4 border-primary-500 shadow-sm z-10 flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <h4 className="text-sm font-bold text-heading mb-4 flex items-center gap-2">
                         <Clock size={16} className="text-primary-500"/> {date}
                      </h4>
                      <div className="space-y-3">
                         {items.map(tc => (
                            <div key={tc.id} className="bg-background border border-border p-4 rounded-xl flex items-center gap-4 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate(`/create?id=${tc.id}`)}>
                               <StatusBadge status={tc.status} id={tc.id} />
                               <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-heading truncate group-hover:text-primary-600 transition-colors" title={tc.subject}>{tc.subject}</div>
                                  <div className="text-xs text-muted flex gap-3 mt-1">
                                     <span className="font-mono font-medium">{tc.id}</span>
                                     <span>• {tc.moduleCode}</span>
                                     <span>• {tc.qaName}</span>
                                  </div>
                               </div>
                               <ChevronRight size={16} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"/>
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* SPLIT VIEW DETAIL PANEL */}
        <AnimatePresence>
        {isSplitView && activeCaseId && viewMode === 'list' && (
           <motion.div 
             initial={{ x: '100%', opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: '100%', opacity: 0 }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
             className="w-[450px] bg-surface border-l border-border shadow-2xl flex flex-col overflow-hidden shrink-0 absolute right-0 top-0 bottom-0 z-20"
           >
              {(() => {
                 const activeTC = cases.find(c => c.id === activeCaseId);
                 if (!activeTC) return <div className="p-4">Case not found</div>;
                 return (
                    <>
                       <div className="p-5 border-b border-border flex justify-between items-start bg-surface-hover/30">
                          <div>
                             <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-[10px] font-bold text-muted px-1.5 py-0.5 bg-background rounded border border-border">{activeTC.id}</span>
                                <StatusBadge status={activeTC.status} id={activeTC.id} />
                             </div>
                             <h3 className="font-bold text-heading leading-tight text-lg">{activeTC.subject}</h3>
                          </div>
                          <button onClick={() => setActiveCaseId(null)} className="p-1 hover:bg-background rounded text-muted hover:text-heading"><X size={20}/></button>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-background/50">
                          {/* Properties Grid */}
                          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm bg-surface p-4 rounded-xl border border-border">
                             <DetailItem label="Module" value={activeTC.moduleCode} />
                             <DetailItem label="Priority" value={activeTC.priority} isPriority />
                             <DetailItem label="Assignee" value={activeTC.qaName} />
                             <DetailItem label="Execution Date" value={activeTC.executionDate} />
                             <DetailItem label="Environment" value={activeTC.environment} />
                             <DetailItem label="Browser" value={activeTC.browser} />
                          </div>
                          
                          {/* Steps */}
                          <div>
                             <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><ListIcon size={14}/> Test Steps</h4>
                             <div className="bg-surface border border-border rounded-xl p-4 text-sm text-heading whitespace-pre-wrap leading-relaxed font-mono shadow-sm">
                                {activeTC.testSteps}
                             </div>
                          </div>

                          {/* Results */}
                          <div className="grid grid-cols-1 gap-4">
                             <div>
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-2"><Check size={14}/> Expected</h4>
                                <div className="bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30 rounded-xl p-3 text-sm text-heading">{activeTC.expectedOutput}</div>
                             </div>
                             {activeTC.actualOutput && (
                                <div>
                                   <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-2"><Activity size={14}/> Actual</h4>
                                   <div className="bg-rose-50/50 border border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30 rounded-xl p-3 text-sm text-heading">{activeTC.actualOutput}</div>
                                </div>
                             )}
                          </div>
                       </div>
                       
                       {/* Footer Actions */}
                       <div className="p-4 border-t border-border bg-surface flex justify-end gap-3">
                          <button onClick={() => navigate(`/create?id=${activeTC.id}`)} className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-surface-hover transition-colors flex items-center gap-2">
                             <Edit2 size={14} /> Edit Case
                          </button>
                          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20">
                             Execute Test
                          </button>
                       </div>
                    </>
                 );
              })()}
           </motion.div>
        )}
        </AnimatePresence>

        {/* FLOATING BULK ACTION BAR */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white p-2 rounded-full shadow-2xl flex items-center gap-4 border border-slate-700 pr-6 pl-6"
            >
               <span className="font-bold text-sm bg-slate-800 px-3 py-1 rounded-full">{selectedIds.size} Selected</span>
               <div className="h-6 w-px bg-slate-700"></div>
               <button onClick={handleBulkDelete} className="flex items-center gap-2 text-sm font-medium hover:text-rose-400 transition-colors"><Trash2 size={16}/> Delete</button>
               <button className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors"><Edit2 size={16}/> Edit</button>
               <button className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors"><Download size={16}/> Export</button>
               <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 hover:bg-slate-800 rounded-full"><X size={14}/></button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* PORTALLED MENUS (Column & Status) */}
      {isColumnMenuOpen && (
        <div 
          ref={columnMenuRef} 
          className="fixed w-64 bg-surface border border-border rounded-xl shadow-2xl z-[9999] p-2 animate-in fade-in zoom-in-95 duration-100" 
          style={{ top: menuPosition.top, left: menuPosition.left ?? 'auto', right: menuPosition.right ?? 'auto' }}
        >
          <div className="flex justify-between items-center mb-2 px-2 border-b border-border pb-2"><h4 className="text-xs font-bold uppercase text-muted">Columns</h4><button onClick={()=>setIsColumnMenuOpen(false)}><X size={14}/></button></div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
            {AVAILABLE_COLUMNS.map(col => (
              <label key={col.key} className="flex items-center gap-3 px-2 py-2 hover:bg-surface-hover rounded cursor-pointer">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${columnOrder.includes(col.key) ? 'bg-primary-600 border-primary-600 text-white' : 'border-muted'}`}>{columnOrder.includes(col.key) && <Check size={10} strokeWidth={4}/>}</div>
                <input type="checkbox" className="hidden" checked={columnOrder.includes(col.key)} onChange={() => {
                    if(columnOrder.includes(col.key)) setColumnOrder(prev => prev.filter(c => c !== col.key));
                    else { const n = [...columnOrder]; const i = n.indexOf('actions'); if(i>-1) n.splice(i, 0, col.key); else n.push(col.key); setColumnOrder(n); }
                }} />
                <span className="text-sm text-heading">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {statusMenu && (
        <div 
          ref={statusMenuRef}
          className="fixed z-[9999] bg-surface border border-border shadow-xl rounded-xl p-1 min-w-[150px] flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{ top: statusMenu.top, left: statusMenu.left }}
        >
          <div className="px-3 py-2 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-border mb-1">Set Status</div>
          {Object.values(Status).map(s => (
            <button 
              key={s} 
              onClick={() => { handleQuickStatusUpdate(statusMenu.id, s); setStatusMenu(null); }} 
              className={`text-xs text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between group ${
                s === statusMenu.currentStatus ? 'bg-primary-50 text-primary-600 font-bold dark:bg-primary-900/20' : 'text-heading hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${s === 'Passed' ? 'bg-emerald-500' : s === 'Failed' ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                 {s}
              </div>
              {s === statusMenu.currentStatus && <Check size={14}/>}
            </button>
          ))}
        </div>
      )}

      {actionMenu && (
        <div 
          ref={actionMenuRef}
          className="fixed z-[9999] bg-surface border border-border shadow-xl rounded-xl p-1 min-w-[160px] flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{ top: actionMenu.top, left: actionMenu.left }}
        >
           <button onClick={() => startInlineEdit(actionMenu.id)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-heading hover:bg-surface-hover rounded-lg transition-colors">
              <Edit2 size={14} className="text-blue-500"/> Edit Case
           </button>
           <button className="flex items-center gap-2 px-3 py-2.5 text-sm text-heading hover:bg-surface-hover rounded-lg transition-colors">
              <Copy size={14} className="text-amber-500"/> Duplicate
           </button>
           <div className="h-px bg-border my-1"></div>
           <button onClick={() => handleSingleDelete(actionMenu.id)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors font-medium">
              <Trash2 size={14} /> Delete
           </button>
        </div>
      )}

    </div>
  );

  // --- ROW RENDERER ---
  function TableRow({ tc, index }: { tc: TestCase, index: number }) {
     const isSelected = selectedIds.has(tc.id);
     const isActive = tc.id === activeCaseId;
     const isEditing = editRowId === tc.id;

     return (
        <div 
           className={`flex border-b border-border/50 text-sm group transition-all cursor-pointer ${
              isActive ? 'bg-primary-50/80 border-l-4 border-l-primary-500' : 
              isSelected ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : 
              index % 2 === 0 ? 'bg-background/50 hover:bg-surface-hover' : 'bg-surface/30 hover:bg-surface-hover'
           }`}
           onClick={() => isSplitView ? setActiveCaseId(tc.id) : null}
        >
           <div className="p-3 w-12 shrink-0 flex items-center justify-center border-r border-border/50" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => { const s = new Set(selectedIds); s.has(tc.id) ? s.delete(tc.id) : s.add(tc.id); setSelectedIds(s); }}
                className="transition-transform active:scale-90"
              >
                 {isSelected ? <CheckSquare size={18} className="text-primary-600 drop-shadow-sm"/> : <Square size={18} className="text-muted hover:text-heading"/>}
              </button>
           </div>
           
           {columnOrder.map(colKey => {
              if (colKey === 'actions') return (
                 <div key="actions" className="p-3 w-[80px] shrink-0 flex items-center justify-center border-l border-border/50" onClick={e => e.stopPropagation()}>
                    {isEditing ? (
                       <div className="flex gap-1">
                          <button onClick={handleSaveEdit} className="p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200"><Save size={14}/></button>
                          <button onClick={() => {setEditRowId(null); setEditValues({});}} className="p-1 rounded bg-rose-100 text-rose-600 hover:bg-rose-200"><XCircle size={14}/></button>
                       </div>
                    ) : (
                       <button onClick={(e) => openActionMenu(e, tc.id)} className="p-1.5 text-muted hover:text-heading hover:bg-surface rounded-lg transition-colors">
                          <MoreHorizontal size={16} />
                       </button>
                    )}
                 </div>
              );
              const colDef = AVAILABLE_COLUMNS.find(c => c.key === colKey);
              return (
                 <div key={colKey} className={`p-3 flex items-center overflow-hidden border-r border-border/50 ${colDef?.width || 'w-32'}`}>
                    {renderCell(tc, colKey, isEditing)}
                 </div>
              );
           })}
        </div>
     );
  }
};

const BadgeStat = ({ icon: Icon, label, value, color }: any) => {
   const colors: any = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
   };
   return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 ${colors[color]} min-w-fit shadow-sm`}>
         <Icon size={14} />
         <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold opacity-70 uppercase">{label}</span>
            <span className="text-sm font-black">{value}</span>
         </div>
      </div>
   );
};

const DetailItem = ({ label, value, isPriority = false }: any) => (
   <div>
      <span className="text-muted text-xs block mb-1">{label}</span>
      <span className={`font-medium text-heading ${isPriority && (value === 'High' || value === 'Immediate') ? 'text-rose-500 font-bold' : ''}`}>
         {value || '-'}
      </span>
   </div>
);
