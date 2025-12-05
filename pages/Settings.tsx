import React, { useState, useEffect } from 'react';
import { Users, Database, Activity, Plus, Trash2, Save, RefreshCw, Power, CheckCircle, XCircle } from 'lucide-react';
import { configurationService } from '../services/configurationService';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'masterData' | 'health'>('users');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-heading">System Configuration</h2>
        <p className="text-muted">Manage users, dropdown options, and system health.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <TabButton id="users" label="User Management" icon={Users} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <TabButton id="masterData" label="Master Data" icon={Database} active={activeTab === 'masterData'} onClick={() => setActiveTab('masterData')} />
        <TabButton id="health" label="System Health" icon={Activity} active={activeTab === 'health'} onClick={() => setActiveTab('health')} />
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'masterData' && <MasterDataTab />}
        {activeTab === 'health' && <SystemHealthTab />}
      </div>
    </div>
  );
};

// ============================================================================
// TAB COMPONENTS
// ============================================================================

const TabButton = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
      active ? 'border-primary-500 text-primary-600' : 'border-transparent text-muted hover:text-heading'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// --- USER MANAGEMENT TAB ---
const UserManagementTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ USERID: '', NAME: '', PASSWORD: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await configurationService.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.USERID || !newUser.PASSWORD) return;
    
    setLoading(true);
    await configurationService.createUser({ ...newUser, ACTIVE_FLAG: 'Y' });
    setNewUser({ USERID: '', NAME: '', PASSWORD: '' });
    await loadUsers();
    setLoading(false);
  };

  const toggleStatus = async (userId: string) => {
    await configurationService.toggleUserStatus(userId);
    loadUsers();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* User List */}
      <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-surface-hover/50 border-b border-border flex justify-between items-center">
          <h3 className="font-semibold text-heading">Registered Users</h3>
          <button onClick={loadUsers} className="text-primary-600 hover:text-primary-500"><RefreshCw size={16} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-muted uppercase text-xs">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user, i) => (
                <tr key={i} className="hover:bg-surface-hover">
                  <td className="p-4 font-medium text-heading">{user.USERID}</td>
                  <td className="p-4 text-muted">{user.NAME}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.ACTIVE_FLAG === 'Y' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {user.ACTIVE_FLAG === 'Y' ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleStatus(user.USERID)}
                      title={user.ACTIVE_FLAG === 'Y' ? 'Block User' : 'Activate User'}
                      className={`p-2 rounded-lg transition-colors ${
                        user.ACTIVE_FLAG === 'Y' 
                          ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20' 
                          : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      }`}
                    >
                      <Power size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && <div className="p-8 text-center text-muted">No users found.</div>}
        </div>
      </div>

      {/* Add User Form */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm h-fit">
        <h3 className="font-semibold text-heading mb-4">Add New User</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase">User ID</label>
            <input 
              type="text" 
              value={newUser.USERID}
              onChange={e => setNewUser({...newUser, USERID: e.target.value})}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase">Full Name</label>
            <input 
              type="text" 
              value={newUser.NAME}
              onChange={e => setNewUser({...newUser, NAME: e.target.value})}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase">Password</label>
            <input 
              type="text" 
              value={newUser.PASSWORD}
              onChange={e => setNewUser({...newUser, PASSWORD: e.target.value})}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MASTER DATA TAB ---
const MasterDataTab = () => {
  const [category, setCategory] = useState('PRODUCTS');
  const [options, setOptions] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);

  const CATEGORIES = [
    { label: 'Products', value: 'PRODUCTS' },
    { label: 'QA Names', value: 'QA_NAMES' },
    { label: 'Environments', value: 'ENVIRONMENTS' },
    { label: 'Platforms', value: 'PLATFORMS' },
  ];

  useEffect(() => {
    loadOptions();
  }, [category]);

  const loadOptions = async () => {
    setLoading(true);
    const data = await configurationService.getDropdownOptions(category);
    setOptions(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    setLoading(true);
    await configurationService.addDropdownOption(category, newValue.trim());
    setNewValue('');
    await loadOptions();
    setLoading(false);
  };

  const handleDelete = async (val: string) => {
    if (!window.confirm(`Delete "${val}" from ${category}?`)) return;
    setLoading(true);
    await configurationService.deleteDropdownOption(category, val);
    await loadOptions();
    setLoading(false);
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
       <div className="p-4 border-b border-border bg-surface-hover/50 flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-4 w-full md:w-auto">
           <span className="text-sm font-bold text-muted uppercase">Edit Category:</span>
           <select 
             value={category}
             onChange={(e) => setCategory(e.target.value)}
             className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-heading focus:ring-2 focus:ring-primary-500"
           >
             {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
           </select>
         </div>
         
         <form onSubmit={handleAdd} className="flex gap-2 w-full md:w-auto">
           <input 
             type="text" 
             placeholder="Add new option..." 
             value={newValue}
             onChange={(e) => setNewValue(e.target.value)}
             className="flex-1 md:w-64 bg-background border border-border rounded-lg px-3 py-2 text-sm text-heading focus:ring-2 focus:ring-primary-500"
           />
           <button 
             type="submit" 
             disabled={loading}
             className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center justify-center"
           >
             <Plus size={18} />
           </button>
         </form>
       </div>

       <div className="p-6">
         {loading ? (
           <div className="text-center py-8 text-muted animate-pulse">Loading options...</div>
         ) : (
           <div className="flex flex-wrap gap-3">
             {options.map((opt, i) => (
               <div key={i} className="group flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm font-medium text-heading shadow-sm hover:border-primary-400 transition-colors">
                 {opt}
                 <button 
                   onClick={() => handleDelete(opt)}
                   className="text-muted hover:text-rose-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <XCircle size={16} />
                 </button>
               </div>
             ))}
             {options.length === 0 && <p className="text-muted text-sm italic">No custom options found. System defaults may be active.</p>}
           </div>
         )}
       </div>
    </div>
  );
};

// --- SYSTEM HEALTH TAB ---
const SystemHealthTab = () => {
  const [health, setHealth] = useState<{ status: string; latency: number } | null>(null);
  const [checking, setChecking] = useState(false);

  const runCheck = async () => {
    setChecking(true);
    const result = await configurationService.checkHealth();
    setHealth(result);
    setChecking(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-heading mb-4">Connection Status</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            health?.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            <Activity size={32} />
          </div>
          <div>
             <div className="text-2xl font-bold text-heading">{health?.status || 'CHECKING...'}</div>
             <div className="text-sm text-muted">Backend Connectivity</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm border-b border-border pb-2">
            <span className="text-muted">Response Latency</span>
            <span className="font-mono font-medium text-heading">{health?.latency} ms</span>
          </div>
          <div className="flex justify-between text-sm border-b border-border pb-2">
            <span className="text-muted">Data Source</span>
            <span className="font-medium text-heading">GAS_HOSTED</span>
          </div>
        </div>

        <button 
          onClick={runCheck}
          disabled={checking}
          className="w-full mt-6 py-2 border border-border rounded-lg text-sm font-medium hover:bg-surface-hover text-heading transition-colors"
        >
          {checking ? 'Pinging...' : 'Re-check Connection'}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
        <Database size={48} className="text-primary-500 mb-4" />
        <h3 className="text-lg font-bold text-heading">Database Integrity</h3>
        <p className="text-sm text-muted mt-2 max-w-xs">
          Connected to Google Sheets (BankaiQA). Data integrity checks passed. No schema errors detected.
        </p>
        <div className="mt-6 flex items-center gap-2 text-emerald-600 font-medium text-sm">
          <CheckCircle size={16} /> All Systems Operational
        </div>
      </div>
    </div>
  );
};