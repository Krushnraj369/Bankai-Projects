import React, { useState } from 'react';
import { AnimatedPage, AnimatedCard } from '../components/Animations';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Filter, ChevronDown, Calendar, Layers, Activity, Bug } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const trendData = [
  { date: 'Sep 25', passed: 10, failed: 2, blocked: 0 },
  { date: 'Sep 28', passed: 18, failed: 5, blocked: 1 },
  { date: 'Oct 01', passed: 25, failed: 3, blocked: 0 },
  { date: 'Oct 04', passed: 32, failed: 8, blocked: 2 },
  { date: 'Oct 07', passed: 45, failed: 4, blocked: 1 },
  { date: 'Oct 10', passed: 50, failed: 2, blocked: 0 },
];

const defectBySeverity = [
  { name: 'Critical', value: 5, color: '#f43f5e' },
  { name: 'High', value: 12, color: '#f97316' },
  { name: 'Medium', value: 25, color: '#eab308' },
  { name: 'Low', value: 15, color: '#3b82f6' },
];

const modulePerformance = [
  { name: 'Auth', passed: 95, failed: 5 },
  { name: 'Payments', passed: 85, failed: 15 },
  { name: 'Cart', passed: 90, failed: 10 },
  { name: 'Profile', passed: 98, failed: 2 },
  { name: 'Search', passed: 80, failed: 20 },
];

const testerVelocity = [
  { subject: 'Krushnraj', A: 120, B: 110, fullMark: 150 },
  { subject: 'Prince', A: 98, B: 130, fullMark: 150 },
  { subject: 'Dinesh', A: 86, B: 130, fullMark: 150 },
  { subject: 'Pratik', A: 99, B: 100, fullMark: 150 },
  { subject: 'Srushti', A: 85, B: 90, fullMark: 150 },
  { subject: 'Rutvik', A: 65, B: 85, fullMark: 150 },
];

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
           <div>
              <h2 className="text-xl font-bold text-heading flex items-center gap-2">
                 <Activity className="text-primary-500" /> Deep Dive Analytics
              </h2>
              <p className="text-sm text-muted">Real-time insights into quality, velocity, and coverage.</p>
           </div>
           
           <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading hover:bg-surface-hover transition-colors">
                 <Calendar size={16} /> {timeRange} <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading hover:bg-surface-hover transition-colors">
                 <Filter size={16} /> All Modules
              </button>
           </div>
        </div>

        {/* TOP ROW: TRENDS & DEFECTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Chart 1: Cumulative Execution Trend */}
           <AnimatedCard className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="font-bold text-heading mb-4">Cumulative Execution Trend</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" opacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="passed" stackId="1" stroke="#10b981" fill="url(#colorPassed)" />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke="#f43f5e" fill="url(#colorFailed)" />
                    <Area type="monotone" dataKey="blocked" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </AnimatedCard>

           {/* Chart 2: Defect Severity Distribution */}
           <AnimatedCard delay={0.1} className="lg:col-span-1 bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="font-bold text-heading mb-4 flex items-center gap-2">
                 <Bug size={18} className="text-rose-500"/> Defect Severity
              </h3>
              <div className="flex-1 w-full min-h-0 relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={defectBySeverity}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {defectBySeverity.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-card)" strokeWidth={2} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px' }} />
                     <Legend verticalAlign="bottom" height={36} />
                   </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                       <span className="text-3xl font-black text-heading">57</span>
                       <p className="text-xs text-muted uppercase">Total Defects</p>
                    </div>
                 </div>
              </div>
           </AnimatedCard>
        </div>

        {/* BOTTOM ROW: MODULE PERFORMANCE & VELOCITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Chart 3: Module Performance */}
           <AnimatedCard delay={0.2} className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="font-bold text-heading mb-4 flex items-center gap-2">
                 <Layers size={18} className="text-indigo-500"/> Module Success Rate (%)
              </h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modulePerformance} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-main)" opacity={0.5} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <Tooltip cursor={{fill: 'var(--bg-card-hover)', opacity: 0.5}} contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-main)' }} />
                    <Bar dataKey="passed" stackId="a" fill="#10b981" barSize={20} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="failed" stackId="a" fill="#f43f5e" barSize={20} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </AnimatedCard>

           {/* Chart 4: Tester Velocity */}
           <AnimatedCard delay={0.3} className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="font-bold text-heading mb-4">QA Execution Velocity</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={testerVelocity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" opacity={0.5} />
                      <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-main)' }} />
                      <Bar dataKey="A" name="Tests Executed" fill="var(--primary-500)" radius={[4, 4, 0, 0]} barSize={30} />
                   </BarChart>
                </ResponsiveContainer>
              </div>
           </AnimatedCard>

        </div>
      </div>
    </AnimatedPage>
  );
};