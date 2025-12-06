import React, { useMemo, useState } from 'react';
import { TestCase, Status, Priority, TestType } from '../types';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Activity, CheckCircle2, XCircle, PlayCircle, Layers, Zap, Filter, BarChart3, AlertTriangle, ArrowRight, Bug, CalendarClock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage, AnimatedCard, containerVariants, Counter } from '../components/Animations';
import { HealthGauge, ActivityFeed, GamificationWidget, ParticleBackground } from '../components/DashboardWidgets';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  data: TestCase[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const navigate = useNavigate();
  
  // Chart State
  const [chartMetric, setChartMetric] = useState<'total' | 'passed' | 'failed'>('total');
  const [timeRange, setTimeRange] = useState('7d');

  // Stats Calculation
  const stats = useMemo(() => {
    const total = data.length;
    const passed = data.filter(c => c.status === Status.Passed).length;
    const failed = data.filter(c => c.status === Status.Failed).length;
    const pending = data.filter(c => c.status === Status.NotExecuted || c.status === Status.InProgress).length;
    const blocked = data.filter(c => c.status === Status.Blocked).length;
    
    // Calculated Scores
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const stabilityScore = total > 0 ? Math.round(100 - ((failed / total) * 100)) : 100;
    
    // Mock Advanced Metrics
    const efficiencyScore = 88;
    const defectDensity = 14; 
    const automationCoverage = 62;
    
    const overallHealth = Math.round((passRate * 0.4) + (stabilityScore * 0.3) + (efficiencyScore * 0.2) + (automationCoverage * 0.1));

    return { total, passed, failed, pending, blocked, passRate, stabilityScore, overallHealth, efficiencyScore, defectDensity, automationCoverage };
  }, [data]);

  // --- CHART DATA PREPARATION ---

  // 1. Module Distribution (Bar Chart)
  const moduleData = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      if (!acc[curr.moduleCode]) {
        acc[curr.moduleCode] = { total: 0, passed: 0, failed: 0 };
      }
      acc[curr.moduleCode].total += 1;
      if (curr.status === Status.Passed) acc[curr.moduleCode].passed += 1;
      if (curr.status === Status.Failed) acc[curr.moduleCode].failed += 1;
      return acc;
    }, {} as Record<string, { total: number, passed: number, failed: number }>);

    return Object.entries(counts)
      .map(([name, metrics]) => ({ name, value: metrics[chartMetric] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [data, chartMetric]);

  // 2. Execution Trend (Area Chart) - Mocking historical data based on current snapshot
  const trendData = useMemo(() => {
    return [
      { date: 'Mon', passed: 12, failed: 2, executed: 14 },
      { date: 'Tue', passed: 18, failed: 4, executed: 22 },
      { date: 'Wed', passed: 15, failed: 1, executed: 16 },
      { date: 'Thu', passed: 25, failed: 5, executed: 30 },
      { date: 'Fri', passed: 30, failed: 2, executed: 32 },
      { date: 'Sat', passed: 10, failed: 0, executed: 10 },
      { date: 'Sun', passed: stats.passed, failed: stats.failed, executed: stats.total }, // Current
    ];
  }, [stats]);

  // 3. Test Type Coverage (Radar Chart)
  const typeData = useMemo(() => {
    const types = [TestType.Functional, TestType.Unit, TestType.API, TestType.Security, TestType.Performance, TestType.UI];
    return types.map(t => ({
      subject: t.split(' ')[0], // Short name
      A: data.filter(c => c.testType === t).length || Math.floor(Math.random() * 10) + 1, // Mock fill if empty
      fullMark: 20
    }));
  }, [data]);

  // 4. Recent Failures List
  const recentFailures = useMemo(() => {
    return data
      .filter(c => c.status === Status.Failed)
      .slice(0, 5)
      .map(c => ({ id: c.id, subject: c.subject, priority: c.priority, qa: c.qaName }));
  }, [data]);

  return (
    <AnimatedPage>
      <div className="relative min-h-screen pb-10 space-y-6">
        
        {/* Background FX */}
        <ParticleBackground />

        {/* --- HERO SECTION --- */}
        <div className="relative z-0">
          <AnimatedCard className="bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-10 opacity-10"><Activity size={180} /></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                    className="flex items-center gap-2 text-indigo-300 font-bold mb-1"
                  >
                    <CalendarClock size={16} /> Week 42 Overview
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    System Health: <span className={stats.overallHealth > 70 ? "text-emerald-400" : "text-amber-400"}>{stats.overallHealth}%</span>
                  </h1>
                  <p className="text-slate-400 max-w-xl">
                    Execution velocity is up 12% from last week. Automated coverage has reached a new high of {stats.automationCoverage}%.
                  </p>
                </div>
                
                <div className="flex gap-3">
                   <button onClick={() => navigate('/create')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                     <PlayCircle size={18} /> Run Test Cycle
                   </button>
                   <button onClick={() => navigate('/defects')} className="px-5 py-2.5 bg-surface/20 hover:bg-surface/30 text-white border border-white/10 rounded-xl font-bold backdrop-blur-md transition-all flex items-center gap-2">
                     <Bug size={18} /> Report Defect
                   </button>
                </div>
             </div>
          </AnimatedCard>
        </div>

        {/* --- KPI GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-0">
           <KPICard title="Total Cases" value={stats.total} icon={Layers} color="text-indigo-400" bg="bg-indigo-500/10" delay={0.1} />
           <KPICard title="Passed" value={stats.passed} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" delay={0.2} />
           <KPICard title="Failed" value={stats.failed} icon={XCircle} color="text-rose-400" bg="bg-rose-500/10" delay={0.3} />
           <KPICard title="Blocked" value={stats.blocked} icon={AlertTriangle} color="text-amber-400" bg="bg-amber-500/10" delay={0.4} />
           <KPICard title="Efficiency" value={stats.efficiencyScore} suffix="%" icon={Zap} color="text-cyan-400" bg="bg-cyan-500/10" delay={0.5} />
        </div>

        {/* --- MAIN CHARTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
          
          {/* Chart 1: Trend Analysis (Area) */}
          <div className="lg:col-span-2 bg-surface/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col h-[400px]">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-heading flex items-center gap-2">
                    <TrendingUp className="text-primary-500" size={20} /> Execution Trend
                  </h3>
                  <p className="text-xs text-muted">Daily pass/fail ratios over time</p>
                </div>
                <select 
                   value={timeRange} 
                   onChange={(e) => setTimeRange(e.target.value)}
                   className="bg-background border border-border rounded-lg text-xs px-3 py-1 text-heading focus:ring-1 focus:ring-primary-500"
                >
                   <option value="7d">Last 7 Days</option>
                   <option value="30d">Last 30 Days</option>
                </select>
             </div>
             
             <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorExecuted" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 11}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 11}} />
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" opacity={0.2} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)' }} 
                   />
                   <Legend iconType="circle" />
                   <Area type="monotone" dataKey="executed" stackId="1" stroke="#6366f1" fill="url(#colorExecuted)" />
                   <Area type="monotone" dataKey="passed" stackId="2" stroke="#10b981" fill="url(#colorPassed)" />
                   <Area type="monotone" dataKey="failed" stackId="3" stroke="#f43f5e" fill="url(#colorFailed)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Chart 2: Test Type Radar */}
          <div className="lg:col-span-1 bg-surface/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col h-[400px]">
             <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
               <Layers className="text-purple-500" size={20} /> Coverage Analysis
             </h3>
             <div className="flex-1 w-full min-h-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={typeData}>
                   <PolarGrid stroke="var(--border-main)" opacity={0.5} />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 25]} tick={false} axisLine={false} />
                   <Radar
                     name="Test Cases"
                     dataKey="A"
                     stroke="var(--primary-500)"
                     strokeWidth={3}
                     fill="var(--primary-500)"
                     fillOpacity={0.4}
                   />
                   <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px' }} />
                 </RadarChart>
               </ResponsiveContainer>
               
               {/* Center Score */}
               <div className="absolute top-2 right-2 flex flex-col items-end">
                  <span className="text-2xl font-black text-heading">{stats.automationCoverage}%</span>
                  <span className="text-[10px] text-muted uppercase">Automation</span>
               </div>
             </div>
          </div>

        </div>

        {/* --- BOTTOM ROW: FAILURES & FEED --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
           
           {/* Recent Failures Widget */}
           <AnimatedCard delay={0.1} className="lg:col-span-1 bg-surface/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col h-[400px]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-heading flex items-center gap-2">
                   <AlertTriangle className="text-rose-500" size={18} /> Recent Failures
                </h3>
                <button onClick={() => navigate('/view?status=Failed')} className="text-xs text-primary-600 font-bold hover:underline">View All</button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {recentFailures.length > 0 ? recentFailures.map(fail => (
                   <div key={fail.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-[10px] font-mono text-rose-600 font-bold">{fail.id}</span>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded border ${fail.priority === Priority.High ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{fail.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-heading line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">{fail.subject}</p>
                      <div className="mt-2 text-xs text-muted flex items-center gap-1">
                         <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold">{fail.qa.charAt(0)}</div>
                         {fail.qa}
                      </div>
                   </div>
                )) : (
                   <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                      <CheckCircle2 size={40} className="mb-2 text-emerald-500" />
                      <p className="text-sm">No recent failures!</p>
                   </div>
                )}
             </div>
           </AnimatedCard>
           
           {/* Activity Feed */}
           <div className="lg:col-span-1 h-[400px]">
             <ActivityFeed />
           </div>

           {/* Gamification */}
           <div className="lg:col-span-1 h-[400px]">
             <GamificationWidget />
           </div>

        </div>

      </div>
    </AnimatedPage>
  );
};

const KPICard = ({ title, value, suffix = '', icon: Icon, color, bg, delay }: any) => (
  <AnimatedCard delay={delay} className={`bg-surface/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
    <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${bg} ${color} opacity-80 group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="mt-2">
      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{title}</p>
      <div className="text-3xl font-black text-heading mt-1 flex items-baseline">
        <Counter from={0} to={value} />
        {suffix && <span className="text-lg ml-0.5 opacity-60">{suffix}</span>}
      </div>
    </div>
    {/* Micro Chart / Sparkline Mock */}
    <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
       <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${Math.random() * 40 + 40}%` }}></div>
    </div>
  </AnimatedCard>
);
