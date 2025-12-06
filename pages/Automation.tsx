import React from 'react';
import { AnimatedPage, AnimatedCard } from '../components/Animations';
import { PlayCircle, CheckCircle, XCircle, Clock, Terminal, GitBranch, Server } from 'lucide-react';

export const Automation: React.FC = () => {
  const pipelines = [
    { id: 1, name: 'Core API Regression', status: 'Passing', duration: '12m 30s', lastRun: '10 mins ago', branch: 'main' },
    { id: 2, name: 'UI E2E Suite (Chrome)', status: 'Failed', duration: '45m 12s', lastRun: '2 hours ago', branch: 'feature/payment-v2' },
    { id: 3, name: 'Mobile App Smoke Test', status: 'Running', duration: '2m 15s...', lastRun: 'Running now', branch: 'release/v3.0' },
    { id: 4, name: 'Performance Load Test', status: 'Passing', duration: '1h 20m', lastRun: 'Yesterday', branch: 'main' },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10"><Terminal size={120} /></div>
           <h2 className="text-3xl font-black mb-2">Automation Hub</h2>
           <p className="text-slate-400 max-w-xl">Centralized command center for CI/CD pipelines, Selenium grids, and nightly regression suites.</p>
           
           <div className="flex gap-4 mt-8">
              <StatsBadge label="Total Suites" value="12" icon={Server} color="text-indigo-400" />
              <StatsBadge label="Passing" value="92%" icon={CheckCircle} color="text-emerald-400" />
              <StatsBadge label="Avg Duration" value="18m" icon={Clock} color="text-amber-400" />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Pipeline List */}
           <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-heading">Active Pipelines</h3>
                 <button className="text-sm text-primary-600 font-medium hover:underline">View Jenkins</button>
              </div>
              
              {pipelines.map(pipe => (
                 <AnimatedCard key={pipe.id} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-full ${
                          pipe.status === 'Passing' ? 'bg-emerald-100 text-emerald-600' :
                          pipe.status === 'Failed' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600 animate-pulse'
                       }`}>
                          {pipe.status === 'Passing' ? <CheckCircle size={20} /> : pipe.status === 'Failed' ? <XCircle size={20} /> : <PlayCircle size={20} />}
                       </div>
                       <div>
                          <h4 className="font-bold text-heading">{pipe.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted mt-1">
                             <span className="flex items-center gap-1"><GitBranch size={12}/> {pipe.branch}</span>
                             <span className="flex items-center gap-1"><Clock size={12}/> {pipe.duration}</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`text-sm font-bold ${
                          pipe.status === 'Passing' ? 'text-emerald-600' :
                          pipe.status === 'Failed' ? 'text-rose-600' : 'text-blue-600'
                       }`}>{pipe.status.toUpperCase()}</div>
                       <div className="text-xs text-muted">{pipe.lastRun}</div>
                    </div>
                 </AnimatedCard>
              ))}
           </div>

           {/* Console / Logs Preview */}
           <AnimatedCard className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-fit">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2 text-slate-500">
                 <Terminal size={14} /> Live Execution Log
              </div>
              <div className="space-y-1 opacity-80">
                 <div className="text-emerald-500">[SUCCESS] Setup Environment (2s)</div>
                 <div>[INFO] Starting Test: Login_Valid_User</div>
                 <div>[INFO] Locating element #username...</div>
                 <div>[INFO] Entering text 'admin@bankai.com'</div>
                 <div>[INFO] Locating element #password...</div>
                 <div>[INFO] Clicking #submit-btn</div>
                 <div className="text-emerald-500">[PASS] Redirected to Dashboard</div>
                 <div className="text-amber-500">[WARN] Response time > 500ms (820ms)</div>
                 <div className="animate-pulse">_</div>
              </div>
           </AnimatedCard>

        </div>
      </div>
    </AnimatedPage>
  );
};

const StatsBadge = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-3">
     <Icon className={color} size={20} />
     <div>
        <div className="text-lg font-bold text-white leading-none">{value}</div>
        <div className="text-[10px] text-slate-300 uppercase tracking-wide">{label}</div>
     </div>
  </div>
);