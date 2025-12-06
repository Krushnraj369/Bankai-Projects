import React from 'react';
import { AnimatedPage, AnimatedCard } from '../components/Animations';
import { Calendar, ChevronLeft, ChevronRight, Plus, Flag, Clock } from 'lucide-react';

export const TestPlanning: React.FC = () => {
  const plans = [
    { id: 1, name: 'Sprint 24 Regression', start: 'Oct 10', end: 'Oct 24', status: 'Active', progress: 65, owner: 'Krushnraj' },
    { id: 2, name: 'Payment Module Release v2.1', start: 'Oct 15', end: 'Oct 30', status: 'Planned', progress: 0, owner: 'Prince' },
    { id: 3, name: 'Hotfix 2.0.1 Verification', start: 'Oct 08', end: 'Oct 09', status: 'Completed', progress: 100, owner: 'Dinesh' },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end">
           <div>
              <h2 className="text-2xl font-bold text-heading">Test Planning & Cycles</h2>
              <p className="text-muted">Manage test cycles, milestones, and resource allocation.</p>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 shadow-lg">
             <Plus size={18} /> New Test Plan
           </button>
        </div>

        {/* Timeline Visualizer (Mock Gantt) */}
        <AnimatedCard className="bg-surface border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
           <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <div className="flex items-center gap-4">
                 <h3 className="font-bold text-heading">October 2024</h3>
                 <div className="flex gap-1">
                    <button className="p-1 hover:bg-surface-hover rounded"><ChevronLeft size={18}/></button>
                    <button className="p-1 hover:bg-surface-hover rounded"><ChevronRight size={18}/></button>
                 </div>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Active</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> Planned</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"/> Completed</span>
              </div>
           </div>

           <div className="relative pt-6">
              {/* Dates Row */}
              <div className="grid grid-cols-31 gap-px mb-4 border-b border-border pb-2">
                 {Array.from({length: 15}).map((_, i) => (
                    <div key={i} className="text-center text-xs text-muted col-span-2">{10 + i}</div>
                 ))}
              </div>

              {/* Plans Bars */}
              <div className="space-y-6">
                 {plans.map((plan, idx) => (
                    <div key={plan.id} className="relative h-12 flex items-center group">
                       <div className="w-48 shrink-0 pr-4">
                          <div className="text-sm font-bold text-heading truncate">{plan.name}</div>
                          <div className="text-xs text-muted flex items-center gap-1">
                             <Clock size={10} /> {plan.start} - {plan.end}
                          </div>
                       </div>
                       <div className="flex-1 relative h-8 bg-surface-hover/30 rounded-lg">
                          <div 
                             className={`absolute top-1 bottom-1 rounded-md shadow-sm border border-white/10 flex items-center px-3 text-xs font-bold text-white transition-all hover:scale-[1.01] cursor-pointer ${
                                plan.status === 'Active' ? 'bg-emerald-500 left-[10%] w-[40%]' : 
                                plan.status === 'Planned' ? 'bg-blue-500 left-[30%] w-[30%]' : 
                                'bg-slate-500 left-[0%] w-[5%]'
                             }`}
                          >
                             {plan.progress}%
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </AnimatedCard>

        {/* Detailed Cycle List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {plans.map(plan => (
              <AnimatedCard key={plan.id} className="bg-surface border border-border rounded-xl p-5 hover:border-primary-400 transition-colors cursor-pointer group">
                 <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                       plan.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                       plan.status === 'Planned' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                       {plan.status}
                    </span>
                    <button className="text-muted hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={18}/></button>
                 </div>
                 <h4 className="text-lg font-bold text-heading mb-2">{plan.name}</h4>
                 <div className="w-full bg-background rounded-full h-2 mb-4">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${plan.progress}%` }} />
                 </div>
                 <div className="flex justify-between text-sm text-muted">
                    <span className="flex items-center gap-1"><Flag size={14}/> 4 Milestones</span>
                    <span>Owner: {plan.owner}</span>
                 </div>
              </AnimatedCard>
           ))}
        </div>

      </div>
    </AnimatedPage>
  );
};