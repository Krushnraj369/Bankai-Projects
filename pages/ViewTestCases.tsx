import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TestCase, Status, Priority } from '../types';
import { Trash2, Edit2, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CheckSquare, Square, Download, X, FileSpreadsheet, FileJson, Check, Settings2, ArrowUpDown, ArrowUp, ArrowDown, Search, Upload } from 'lucide-react';
import { testCaseService } from '../services/testCaseService';

export const ViewTestCases: React.FC = () => {
  const [cases, setCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filtering & Pagination
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof TestCase; direction: 'asc' | 'desc' } | null>(null);

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportColumns, setExportColumns] = useState<string[]>([
    'id', 'subject', 'status', 'priority', 'moduleCode', 'qaName', 'executionDate', 'expectedOutput', 'testSteps'
  ]);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState(false);

  const AVAILABLE_COLUMNS = [
    { key: 'id', label: 'Test Case ID' },
    { key: 'subject', label: 'Subject' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'product', label: 'Product' },
    { key: 'moduleCode', label: 'Module Code' },
    { key: 'qaName', label: 'QA Name' },
    { key: 'platform', label: 'Platform' },
    { key: 'environment', label: 'Environment' },
    { key: 'testType', label: 'Test Type' },
    { key: 'executionDate', label: 'Execution Date' },
    { key: 'testSteps', label: 'Test Steps' },
    { key: 'expectedOutput', label: 'Expected Output' },
    { key: 'actualOutput', label: 'Actual Output' },
    { key: 'defectLink', label: 'Defect Link' },
    { key: 'preconditions', label: 'Preconditions' },
    { key: 'postConditions', label: 'Post Conditions' },
    { key: 'reviewer', label: 'Reviewer' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await testCaseService.getAll();
    setCases(data);
    setLoading(false);
  };

  // --- IMPORT LOGIC ---
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);

    try {
      const text = await file.text();
      let importedData: any[] = [];

      if (file.name.endsWith('.json')) {
        importedData = JSON.parse(text);
        if (!Array.isArray(importedData)) throw new Error("JSON must be an array of objects");
      } else if (file.name.endsWith('.csv')) {
        importedData = parseCSV(text);
      } else {
        throw new Error("Unsupported file format. Please use .csv or .json");
      }

      console.log("Parsed Data:", importedData);

      // Validate & Map Data
      if (importedData.length === 0) throw new Error("File is empty");

      await testCaseService.import(importedData);
      
      alert(`Successfully imported ${importedData.length} test cases.`);
      loadData(); // Refresh table
    } catch (error: any) {
      console.error(error);
      alert(`Import Failed: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Map CSV headers to internal keys (simple matching)
    const keyMap: Record<string, string> = {};
    AVAILABLE_COLUMNS.forEach(col => {
      // Find header that looks like 'Test Case ID' or 'id'
      const match = headers.find(h => 
        h.toLowerCase() === col.key.toLowerCase() || 
        h.toLowerCase() === col.label.toLowerCase()
      );
      if (match) keyMap[match] = col.key;
    });

    const result = [];
    for (let i = 1; i < lines.length; i++) {
      // Basic split (Enhancement: Use regex for quoted commas if needed)
      // Regex to split by comma ONLY if not inside quotes
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      
      // Fallback simple split if regex fails or simple structure
      const rowValues = values ? values.map(v => v.replace(/^"|"$/g, '')) : lines[i].split(',');

      if (rowValues.length > 0) {
        const obj: any = {};
        headers.forEach((h, index) => {
          const internalKey = keyMap[h] || h.toLowerCase().replace(/\s/g, ''); // Fallback to camelCase-ish
          obj[internalKey] = rowValues[index];
        });
        result.push(obj);
      }
    }
    return result;
  };

  // --- ACTIONS ---
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected test cases?`)) {
       await testCaseService.delete(Array.from(selectedIds));
       setSelectedIds(new Set());
       loadData();
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSort = (key: keyof TestCase) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    let data = cases.filter(item => {
      const matchesSearch = item.subject.toLowerCase().includes(searchText.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchText.toLowerCase()) ||
                            item.moduleCode.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    if (sortConfig !== null) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [cases, searchText, statusFilter, priorityFilter, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export Functions
  const toggleExportColumn = (key: string) => {
    setExportColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const handleSelectAllColumns = () => {
    if (exportColumns.length === AVAILABLE_COLUMNS.length) {
      setExportColumns([]);
    } else {
      setExportColumns(AVAILABLE_COLUMNS.map(c => c.key));
    }
  };

  const executeExport = () => {
    const dataToExport = selectedIds.size > 0 
      ? cases.filter(c => selectedIds.has(c.id)) 
      : filteredData;

    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    if (exportColumns.length === 0) {
      alert("Please select at least one column to export");
      return;
    }

    let content = "";
    let mimeType = "";
    let extension = "";

    if (exportFormat === 'json') {
      const exportObject = dataToExport.map(item => {
        const filteredItem: any = {};
        exportColumns.forEach(col => {
          filteredItem[col] = (item as any)[col] || "";
        });
        return filteredItem;
      });
      content = JSON.stringify(exportObject, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else {
      const headers = exportColumns.map(col => AVAILABLE_COLUMNS.find(c => c.key === col)?.label || col).join(",");
      const rows = dataToExport.map(item => {
        return exportColumns.map(col => {
          let val = (item as any)[col] || "";
          if (typeof val === 'string') {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(",");
      });
      content = [headers, ...rows].join("\n");
      mimeType = "text/csv";
      extension = "csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bankai_qa_export_${new Date().toISOString().slice(0,10)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExportModalOpen(false);
  };

  const StatusBadge = ({ status }: { status: Status }) => {
    const styles = {
      [Status.Pass]: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      [Status.Fail]: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
      [Status.Draft]: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      [Status.Blocked]: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      [Status.InReview]: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
      [Status.Retest]: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
      [Status.Approved]: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
      [Status.Deprecated]: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const icons = {
      [Priority.Critical]: '🔴',
      [Priority.High]: '🟠',
      [Priority.Medium]: '🟡',
      [Priority.Low]: '🟢'
    };
    return <span className="text-xs font-medium text-muted whitespace-nowrap">{icons[priority]} {priority}</span>;
  };

  const QuickFilterButton = ({ label, value, count, colorClass }: { label: string, value: string, count?: number, colorClass?: string }) => {
    const isActive = statusFilter === value;
    return (
      <button
        onClick={() => {
           setStatusFilter(value);
           setCurrentPage(1);
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
          isActive 
            ? `bg-surface border-primary-500 ring-1 ring-primary-500 text-primary-600 shadow-sm` 
            : 'bg-surface border-border text-muted hover:text-heading hover:border-primary-200'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${colorClass || 'bg-slate-400'}`}></div>
        {label}
        {count !== undefined && (
          <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  const SortHeader = ({ label, field, sortable = true }: { label: string, field?: keyof TestCase, sortable?: boolean }) => {
    if (!sortable || !field) return <th className="p-4">{label}</th>;
    
    const isActive = sortConfig?.key === field;
    return (
      <th className="p-4 cursor-pointer group select-none" onClick={() => handleSort(field)}>
        <div className="flex items-center gap-1 hover:text-primary-500 transition-colors">
          {label}
          <span className={`text-muted transition-opacity ${isActive ? 'opacity-100 text-primary-500' : 'opacity-0 group-hover:opacity-50'}`}>
            {isActive && sortConfig.direction === 'asc' && <ArrowUp size={14} />}
            {isActive && sortConfig.direction === 'desc' && <ArrowDown size={14} />}
            {!isActive && <ArrowUpDown size={14} />}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-4 pb-8 relative">
      
      {/* Hidden Import Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.json"
        className="hidden"
      />

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-hover/50">
              <h3 className="text-lg font-bold text-heading flex items-center gap-2">
                <Settings2 size={20} className="text-primary-500" />
                Export Settings
              </h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-muted hover:text-heading transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              <div className="mb-6">
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Export Format</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setExportFormat('csv')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      exportFormat === 'csv' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                        : 'border-border hover:border-primary-200 text-muted'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${exportFormat === 'csv' ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      <FileSpreadsheet size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">CSV</div>
                      <div className="text-xs opacity-70">Comma Separated Values</div>
                    </div>
                    {exportFormat === 'csv' && <Check className="ml-auto text-primary-500" size={20} />}
                  </button>

                  <button 
                    onClick={() => setExportFormat('json')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      exportFormat === 'json' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                        : 'border-border hover:border-primary-200 text-muted'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${exportFormat === 'json' ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      <FileJson size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">JSON</div>
                      <div className="text-xs opacity-70">JavaScript Object Notation</div>
                    </div>
                    {exportFormat === 'json' && <Check className="ml-auto text-primary-500" size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Select Columns</label>
                  <button 
                    onClick={handleSelectAllColumns}
                    className="text-xs font-medium text-primary-600 hover:text-primary-500"
                  >
                    {exportColumns.length === AVAILABLE_COLUMNS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {AVAILABLE_COLUMNS.map((col) => (
                    <label 
                      key={col.key} 
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all select-none ${
                        exportColumns.includes(col.key)
                          ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
                          : 'bg-background border-border hover:bg-surface-hover'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        exportColumns.includes(col.key) ? 'bg-primary-500 border-primary-500' : 'border-muted'
                      }`}>
                         {exportColumns.includes(col.key) && <Check size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm ${exportColumns.includes(col.key) ? 'text-heading font-medium' : 'text-muted'}`}>
                        {col.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-border bg-surface-hover/30 flex justify-end gap-3">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-heading transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeExport}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-0.5 text-sm font-bold"
              >
                <Download size={16} />
                Export Data
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
        <QuickFilterButton label="All Cases" value="All" count={cases.length} colorClass="bg-slate-400" />
        <QuickFilterButton label="Passed" value={Status.Pass} count={cases.filter(c => c.status === Status.Pass).length} colorClass="bg-emerald-500" />
        <QuickFilterButton label="Failed" value={Status.Fail} count={cases.filter(c => c.status === Status.Fail).length} colorClass="bg-rose-500" />
        <QuickFilterButton label="In Review" value={Status.InReview} count={cases.filter(c => c.status === Status.InReview).length} colorClass="bg-indigo-500" />
        <QuickFilterButton label="Draft" value={Status.Draft} count={cases.filter(c => c.status === Status.Draft).length} colorClass="bg-slate-500" />
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-surface p-4 rounded-xl shadow-sm border border-border flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full xl:w-auto">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
             <input 
               type="text" 
               placeholder="Filter by Subject, ID..." 
               value={searchText}
               onChange={(e) => setSearchText(e.target.value)}
               className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500 focus:outline-none w-full transition-all" 
             />
          </div>
          
          <select 
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
           {selectedIds.size > 0 && (
             <button 
               onClick={handleDelete}
               className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-sm font-medium"
             >
               <Trash2 size={16} /> <span className="hidden md:inline">Delete</span> ({selectedIds.size})
             </button>
           )}
           
           {/* IMPORT BUTTON */}
           <button 
             onClick={handleImportClick}
             disabled={importLoading}
             className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-muted rounded-lg hover:bg-background hover:text-heading transition-colors text-sm font-medium"
           >
             {importLoading ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div> : <Upload size={16} />}
             Import
           </button>

           <button 
             onClick={() => setIsExportModalOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-muted rounded-lg hover:bg-background hover:text-heading transition-colors text-sm font-medium"
           >
             <Download size={16} /> Export
           </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-background text-muted uppercase text-xs font-semibold border-b border-border">
              <tr>
                <th className="p-4 w-10">
                  <button onClick={handleSelectAll} className="text-muted hover:text-primary-600">
                    {selectedIds.size > 0 && selectedIds.size === paginatedData.length ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <SortHeader label="ID" field="id" />
                <SortHeader label="Subject" field="subject" />
                <SortHeader label="Status" field="status" />
                <SortHeader label="Priority" field="priority" />
                <SortHeader label="Module" field="moduleCode" />
                <SortHeader label="Execution Date" field="executionDate" />
                <SortHeader label="QA Name" field="qaName" />
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-muted">Loading data from database...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-muted">No test cases found.</td></tr>
              ) : (
                paginatedData.map((tc) => (
                  <tr key={tc.id} className={`hover:bg-surface-hover transition-colors ${selectedIds.has(tc.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelect(tc.id)} className={`${selectedIds.has(tc.id) ? 'text-primary-600' : 'text-muted hover:text-heading'}`}>
                        {selectedIds.has(tc.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="p-4 font-mono font-medium text-muted">{tc.id}</td>
                    <td className="p-4">
                      <div className="max-w-xs truncate font-medium text-heading" title={tc.subject}>{tc.subject}</div>
                    </td>
                    <td className="p-4"><StatusBadge status={tc.status} /></td>
                    <td className="p-4"><PriorityBadge priority={tc.priority} /></td>
                    <td className="p-4 text-muted">{tc.moduleCode}</td>
                    <td className="p-4 text-muted">{tc.executionDate}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                          {tc.qaName.charAt(0)}
                        </div>
                        <span className="truncate max-w-[100px] text-heading">{tc.qaName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-muted hover:text-primary-600 hover:bg-background rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted order-2 md:order-1">
            Showing <span className="font-semibold text-heading">{filteredData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</span> to <span className="font-semibold text-heading">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-heading">{filteredData.length}</span> entries
          </span>
          <div className="flex gap-2 order-1 md:order-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-background text-muted hover:text-heading transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
             <div className="flex items-center gap-1 hidden md:flex">
               {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                 let pageNum = i + 1;
                 if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 2 + i;
                 if (pageNum > totalPages) return null;

                 return (
                   <button 
                     key={pageNum}
                     onClick={() => setCurrentPage(pageNum)}
                     className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                       currentPage === pageNum 
                         ? 'bg-primary-600 text-white' 
                         : 'text-muted hover:bg-background hover:text-heading'
                     }`}
                   >
                     {pageNum}
                   </button>
                 )
               })}
             </div>
             <span className="md:hidden text-sm font-medium px-2 flex items-center text-heading">
                Page {currentPage} / {totalPages || 1}
             </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-background text-muted hover:text-heading transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
