import React, { useMemo } from 'react';
import { TestCase, Status, Priority } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { Activity, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';

interface DashboardProps {
  data: TestCase[];
}

const COLORS = {
  [Status.Pass]: '#10b981', // emerald-500
  [Status.Fail]: '#ef4444', // red-500
  [Status.Draft]: '#94a3b8', // slate-400
  [Status.Blocked]: '#f59e0b', // amber-500
  [Status.InReview]: '#6366f1', // indigo-500
  [Status.Retest]: '#8b5cf6', // violet-500
  [Status.Approved]: '#0ea5e9', // sky-500
  [Status.Deprecated]: '#64748b' // slate-500
};

// Moved Outside
const StatCard = ({ title, value, icon: Icon, color, bgClass }: any) => (
  <div className="bg-surface rounded-2xl p-5 md:p-6 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={64} />
    </div>
    <div className="relative z-10">
      <p className="text-xs md:text-sm font-medium text-muted uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl md:text-3xl font-bold mt-1 text-heading">{value}</h3>
      <div className={`inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-full text-xs font-semibold ${bgClass} ${color.replace('text-', 'text-opacity-100 ')}`}>
         <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span> Live
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  
  // Calculate Stats
  const stats = useMemo(() => {
    return {
      total: data.length,
      passed: data.filter(c => c.status === Status.Pass).length,
      failed: data.filter(c => c.status === Status.Fail).length,
      blocked: data.filter(c => c.status === Status.Blocked).length,
      pending: data.filter(c => c.status === Status.Draft || c.status === Status.InReview).length,
      highPriority: data.filter(c => c.priority === Priority.High || c.priority === Priority.Critical).length
    };
  }, [data]);

  // Chart Data: Status Distribution
  const statusData = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Chart Data: Module Wise
  const moduleData = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      acc[curr.moduleCode] = (acc[curr.moduleCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, count })).slice(0, 7);
  }, [data]);

  return (
    <div className="space-y-6 pb-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Cases" value={stats.total} icon={Activity} color="text-indigo-600" bgClass="bg-indigo-50 dark:bg-indigo-900/30" />
        <StatCard title="Passed" value={stats.passed} icon={CheckCircle2} color="text-emerald-600" bgClass="bg-emerald-50 dark:bg-emerald-900/30" />
        <StatCard title="Failed" value={stats.failed} icon={XCircle} color="text-rose-600" bgClass="bg-rose-50 dark:bg-rose-900/30" />
        <StatCard title="Pending" value={stats.pending} icon={PlayCircle} color="text-amber-600" bgClass="bg-amber-50 dark:bg-amber-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Distribution Pie Chart */}
        <div className="bg-surface p-5 md:p-6 rounded-2xl shadow-sm border border-border lg:col-span-1">
          <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
            Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as Status] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module Performance Bar Chart */}
        <div className="bg-surface p-5 md:p-6 rounded-2xl shadow-sm border border-border lg:col-span-2">
           <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
            Test Cases by Module (Top 7)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} dy={10} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-card-hover)'}}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}
                />
                <Bar dataKey="count" fill="var(--primary-600)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Execution Trend (Mock) */}
       <div className="bg-surface p-5 md:p-6 rounded-2xl shadow-sm border border-border">
           <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            Execution Trend (Last 30 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                  { day: '1', pass: 10, fail: 2 }, { day: '5', pass: 15, fail: 4 }, 
                  { day: '10', pass: 12, fail: 1 }, { day: '15', pass: 20, fail: 5 }, 
                  { day: '20', pass: 18, fail: 2 }, { day: '25', pass: 25, fail: 3 }, 
                  { day: '30', pass: 30, fail: 0 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-main)' }} />
                <Area type="monotone" dataKey="pass" stroke="#10b981" fillOpacity={1} fill="url(#colorPass)" strokeWidth={2} />
                <Area type="monotone" dataKey="fail" stroke="#ef4444" fillOpacity={1} fill="url(#colorFail)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};
