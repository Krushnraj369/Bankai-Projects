
import React, { useState, useEffect } from 'react';
import { AnimatedPage, AnimatedCard, containerVariants, itemFadeUp } from '../components/Animations';
import { configAIService, AiRecommendation, HealthMetric } from '../services/configAIService';
import { Activity, Shield, Zap, DollarSign, Server, Network, Cpu, Check, AlertTriangle, ArrowRight, RefreshCw, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';

export const SystemConfigHub: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'optimizer' | 'security'>('overview');
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const m = await configAIService.getHealthMetrics();
    const r = await configAIService.getRecommendations();
    setMetrics(m);
    setRecommendations(r);
    setLoading(false);
  };

  const handleApplyOptimization = (id: string) => {
    showToast('Optimization applied successfully. System updating...', 'success');
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const handleEditRoles = () => {
    showToast('Role Editor Mode Enabled. (Demo)', 'info');
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        
        {/* --- HEADER --- */}
        <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-2xl border border-slate-800">
           {/* Background Decor - Added pointer-events-none to prevent click blocking */}
           <div className="absolute top-0 right-0 p-12 opacity-10 animate-spin-slow pointer-events-none">
              <Cpu size={200} className="text-primary-500" />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 text-primary-400 mb-2 font-mono text-sm tracking-widest uppercase">
                 <Activity size={14} className="animate-pulse" /> System Intelligence Hub v3.0
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Mission Control</h1>
              <p className="text-slate-400 max-w-xl">
                 AI-driven configuration optimization, architectural visualization, and security hardening center.
              </p>
           
              {/* Navigation Tabs - Moved inside z-10 container to ensure clickability */}
              <div className="flex gap-4 mt-8 overflow-x-auto pb-2 custom-scrollbar relative z-20">
                  <NavTab id="overview" label="Health Overview" icon={Activity} active={activeTab} onClick={setActiveTab} />
                  <NavTab id="architecture" label="3D Architecture" icon={Network} active={activeTab} onClick={setActiveTab} />
                  <NavTab id="optimizer" label="AI Optimizer" icon={Zap} active={activeTab} onClick={setActiveTab} />
                  <NavTab id="security" label="Security Matrix" icon={Shield} active={activeTab} onClick={setActiveTab} />
              </div>
           </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[500px]">
           
           {/* 1. HEALTH OVERVIEW */}
           {activeTab === 'overview' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {metrics.map((metric, idx) => (
                    <AnimatedCard key={idx} delay={idx * 0.1} className="bg-surface border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary-500/50 transition-colors">
                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 pointer-events-none">
                          {metric.category === 'Security' && <Shield size={80} />}
                          {metric.category === 'Performance' && <Zap size={80} />}
                          {metric.category === 'Reliability' && <Server size={80} />}
                          {metric.category === 'Cost' && <DollarSign size={80} />}
                       </div>
                       
                       <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">{metric.category}</h3>
                       <div className="flex items-end gap-2 mb-4">
                          <span className={`text-4xl font-black ${getScoreColor(metric.score)}`}>{metric.score}</span>
                          <span className="text-sm text-muted mb-1">/100</span>
                       </div>
                       
                       <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                          <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${metric.score}%` }} 
                             transition={{ duration: 1, delay: 0.5 }}
                             className={`h-full rounded-full ${getBgColor(metric.score)}`} 
                          />
                       </div>
                       
                       <div className="flex justify-between items-center text-xs font-medium">
                          <span className={metric.issues > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                             {metric.issues > 0 ? `${metric.issues} Issues Found` : 'All Systems Nominal'}
                          </span>
                          <button className="text-primary-600 hover:underline">Details &rarr;</button>
                       </div>
                    </AnimatedCard>
                 ))}

                 {/* Global Alert Log */}
                 <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-heading mb-4 flex items-center gap-2"><Activity size={18}/> Real-time Event Log</h3>
                    <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto custom-scrollbar">
                       <LogEntry time="10:42:05" level="INFO" msg="System backup completed successfully (2.4GB)" />
                       <LogEntry time="10:45:12" level="WARN" msg="High latency detected in Auth Service (450ms)" />
                       <LogEntry time="10:48:30" level="SUCCESS" msg="Auto-scaling trigger: Added 2 nodes" />
                       <LogEntry time="11:02:01" level="INFO" msg="User 'admin' updated global settings" />
                       <LogEntry time="11:15:00" level="INFO" msg="Scheduled maintenance window set for Sunday" />
                    </div>
                 </div>
              </motion.div>
           )}

           {/* 2. 3D ARCHITECTURE VISUALIZER (MOCK) */}
           {activeTab === 'architecture' && (
              <AnimatedCard className="bg-slate-950 border border-slate-800 rounded-3xl p-1 shadow-2xl overflow-hidden h-[600px] relative group">
                 {/* Toolbar */}
                 <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-lg text-slate-300 text-xs font-mono">
                       <div>NODES: 5</div>
                       <div>EDGES: 4</div>
                       <div className="text-emerald-400">STATUS: HEALTHY</div>
                    </div>
                 </div>

                 {/* Simulated 3D Viewport */}
                 <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 absolute pointer-events-none"></div>
                 <div className="w-full h-full flex items-center justify-center relative">
                    
                    {/* Central Node */}
                    <div className="absolute z-20 flex flex-col items-center animate-pulse">
                       <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] border-4 border-slate-900">
                          <Cpu size={40} className="text-white" />
                       </div>
                       <span className="mt-4 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold border border-slate-700">BankaiQA Core</span>
                    </div>

                    {/* Orbiting Nodes */}
                    <OrbitNode icon={Server} label="Oracle DB" angle={0} color="bg-rose-500" />
                    <OrbitNode icon={Globe} label="Frontend" angle={72} color="bg-blue-500" />
                    <OrbitNode icon={Lock} label="Auth Service" angle={144} color="bg-emerald-500" />
                    <OrbitNode icon={Network} label="API Gateway" angle={216} color="bg-purple-500" />
                    <OrbitNode icon={DollarSign} label="Billing" angle={288} color="bg-amber-500" />

                    {/* Connection Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                       <circle cx="50%" cy="50%" r="200" stroke="white" strokeWidth="1" strokeDasharray="4 4" fill="none" className="animate-[spin_60s_linear_infinite]" />
                       <circle cx="50%" cy="50%" r="100" stroke="white" strokeWidth="1" strokeDasharray="2 2" fill="none" className="animate-[spin_30s_linear_infinite_reverse]" />
                    </svg>
                 </div>
                 
                 <div className="absolute bottom-4 right-4 text-slate-500 text-xs">
                    Interactive Mode: Disabled (Preview)
                 </div>
              </AnimatedCard>
           )}

           {/* 3. AI OPTIMIZER */}
           {activeTab === 'optimizer' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-4">
                    {recommendations.length === 0 ? (
                       <div className="p-12 text-center bg-surface border border-border rounded-2xl">
                          <CheckCircleIcon />
                          <h3 className="text-lg font-bold text-heading mt-4">System Optimized</h3>
                          <p className="text-muted">No further recommendations at this time.</p>
                       </div>
                    ) : recommendations.map(rec => (
                       <AnimatedCard key={rec.id} className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
                          <div className={`p-4 rounded-xl shrink-0 ${
                             rec.category === 'Security' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20' :
                             rec.category === 'Performance' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' :
                             'bg-amber-100 text-amber-600 dark:bg-amber-900/20'
                          }`}>
                             {rec.category === 'Security' ? <Lock size={24} /> : rec.category === 'Performance' ? <Zap size={24} /> : <Activity size={24} />}
                          </div>
                          
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                   rec.impact === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                   {rec.impact} Impact
                                </span>
                                <span className="text-xs text-muted flex items-center gap-1">
                                   <Zap size={10} className="text-yellow-500 fill-yellow-500" /> {rec.confidence}% Confidence
                                </span>
                             </div>
                             <h3 className="text-lg font-bold text-heading">{rec.title}</h3>
                             <p className="text-sm text-muted mt-1 leading-relaxed">{rec.description}</p>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                             <button 
                                onClick={() => handleApplyOptimization(rec.id)}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95 whitespace-nowrap"
                             >
                                {rec.action}
                             </button>
                             <button className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-heading rounded-lg text-sm font-medium transition-colors">
                                Ignore
                             </button>
                          </div>
                       </AnimatedCard>
                    ))}
                 </div>

                 {/* Sidebar Stats */}
                 <div className="space-y-6">
                    <AnimatedCard className="bg-surface border border-border p-6 rounded-2xl">
                       <h3 className="font-bold text-heading mb-4">Optimization Score</h3>
                       <div className="flex justify-center mb-4">
                          <div className="w-32 h-32 rounded-full border-8 border-primary-100 dark:border-primary-900 flex items-center justify-center relative">
                             <span className="text-3xl font-black text-heading">84</span>
                             <div className="absolute top-0 left-0 w-full h-full border-8 border-primary-500 rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" />
                          </div>
                       </div>
                       <p className="text-center text-sm text-muted">
                          Your system is performing better than 84% of similar deployments.
                       </p>
                    </AnimatedCard>
                 </div>
              </div>
           )}

           {/* 4. SECURITY MATRIX */}
           {activeTab === 'security' && (
              <AnimatedCard className="bg-surface border border-border rounded-2xl p-6 overflow-hidden">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-heading flex items-center gap-2">
                       <Shield className="text-emerald-500" /> Role-Based Access Control (RBAC)
                    </h3>
                    <button 
                      onClick={handleEditRoles}
                      className="text-sm text-primary-600 font-medium hover:underline cursor-pointer px-2 py-1 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded"
                    >
                      Edit Roles
                    </button>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-background text-muted uppercase text-xs">
                          <tr>
                             <th className="p-4">Permission / Feature</th>
                             <th className="p-4 text-center">Admin</th>
                             <th className="p-4 text-center">Manager</th>
                             <th className="p-4 text-center">Tester</th>
                             <th className="p-4 text-center">Viewer</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-border">
                          {[
                             'Create Test Cases', 'Edit Test Cases', 'Delete Test Cases', 
                             'Execute Tests', 'Manage Users', 'View Reports', 'System Config'
                          ].map((perm, i) => (
                             <tr key={i} className="hover:bg-surface-hover">
                                <td className="p-4 font-medium text-heading">{perm}</td>
                                <td className="p-4 text-center"><Check className="mx-auto text-emerald-500" size={18} /></td>
                                <td className="p-4 text-center">{i < 6 ? <Check className="mx-auto text-emerald-500" size={18} /> : <Lock className="mx-auto text-slate-300" size={16} />}</td>
                                <td className="p-4 text-center">{i < 4 || i === 5 ? <Check className="mx-auto text-emerald-500" size={18} /> : <Lock className="mx-auto text-slate-300" size={16} />}</td>
                                <td className="p-4 text-center">{i === 5 ? <Check className="mx-auto text-emerald-500" size={18} /> : <Lock className="mx-auto text-slate-300" size={16} />}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </AnimatedCard>
           )}

        </div>
      </div>
    </AnimatedPage>
  );
};

// --- SUB COMPONENTS ---

const NavTab = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
      active === id 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const LogEntry = ({ time, level, msg }: any) => (
  <div className="flex gap-3 hover:bg-surface-hover p-1 rounded transition-colors cursor-default">
     <span className="text-slate-400 opacity-50">{time}</span>
     <span className={`${
        level === 'INFO' ? 'text-blue-500' : 
        level === 'WARN' ? 'text-amber-500' : 
        level === 'SUCCESS' ? 'text-emerald-500' : 'text-slate-500'
     } font-bold w-16`}>{level}</span>
     <span className="text-heading truncate">{msg}</span>
  </div>
);

const OrbitNode = ({ icon: Icon, label, angle, color }: any) => {
   const radius = 200; // Distance from center
   const x = Math.cos((angle * Math.PI) / 180) * radius;
   const y = Math.sin((angle * Math.PI) / 180) * radius;

   return (
      <div 
         className="absolute flex flex-col items-center"
         style={{ transform: `translate(${x}px, ${y}px)` }}
      >
         <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white shadow-xl rotate-45 border-4 border-slate-900 hover:scale-110 transition-transform cursor-pointer group`}>
            <Icon size={24} className="-rotate-45" />
         </div>
         <span className="mt-4 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-bold tracking-wider">{label}</span>
      </div>
   );
};

const CheckCircleIcon = () => (
   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 mb-4">
      <Check size={32} />
   </div>
);

const getScoreColor = (score: number) => {
   if (score >= 90) return 'text-emerald-500';
   if (score >= 70) return 'text-blue-500';
   if (score >= 50) return 'text-amber-500';
   return 'text-rose-500';
};

const getBgColor = (score: number) => {
   if (score >= 90) return 'bg-emerald-500';
   if (score >= 70) return 'bg-blue-500';
   if (score >= 50) return 'bg-amber-500';
   return 'bg-rose-500';
};
