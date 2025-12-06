import React, { useState } from 'react';
import { AnimatedPage, AnimatedCard } from '../components/Animations';
import { Bug, Filter, Plus, MoreHorizontal, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Priority, Severity } from '../types';

interface Defect {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  severity: Severity;
  priority: Priority;
  assignee: string;
  createdDate: string;
}

const initialDefects: Defect[] = [
  { id: 'BUG-101', title: 'Login page crashes on weak network', status: 'Open', severity: Severity.Critical, priority: Priority.Immediate, assignee: 'Unassigned', createdDate: '2 hours ago' },
  { id: 'BUG-102', title: 'Payment gateway timeout error', status: 'In Progress', severity: Severity.High, priority: Priority.High, assignee: 'Prince', createdDate: '1 day ago' },
  { id: 'BUG-103', title: 'Typo in Dashboard header', status: 'Resolved', severity: Severity.Low, priority: Priority.Low, assignee: 'Dinesh', createdDate: '3 days ago' },
  { id: 'BUG-104', title: 'Search filter not resetting', status: 'Open', severity: Severity.Medium, priority: Priority.Medium, assignee: 'Unassigned', createdDate: '5 hours ago' }
];

export const Defects: React.FC = () => {
  const [defects] = useState<Defect[]>(initialDefects);

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
           <div>
              <h2 className="text-2xl font-bold text-heading">Defect Tracking</h2>
              <p className="text-muted">Manage and track issues across projects.</p>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-500 shadow-lg">
             <Plus size={18} /> Report Defect
           </button>
        </div>

        {/* Filter Bar (Mock) */}
        <div className="flex gap-2 pb-2">
           <button className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm flex items-center gap-2 text-heading"><Filter size={14} /> All Status</button>
           <button className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm flex items-center gap-2 text-heading"><Filter size={14} /> Assigned to Me</button>
        </div>

        {/* Defect List */}
        <div className="grid gap-4">
           {defects.map(defect => (
              <AnimatedCard key={defect.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-primary-400 transition-colors group cursor-pointer">
                 <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-start">
                       <div className={`p-3 rounded-xl ${
                          defect.severity === Severity.Critical ? 'bg-rose-100 text-rose-600' :
                          defect.severity === Severity.High ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                       }`}>
                          <Bug size={24} />
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-mono font-bold text-muted">{defect.id}</span>
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                defect.status === 'Open' ? 'bg-rose-100 text-rose-700' :
                                defect.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-emerald-100 text-emerald-700'
                             }`}>
                                {defect.status}
                             </span>
                          </div>
                          <h3 className="text-lg font-bold text-heading">{defect.title}</h3>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                             <span className="flex items-center gap-1" title="Priority"><AlertCircle size={14} className={defect.priority === Priority.Immediate ? 'text-rose-500' : ''}/> {defect.priority}</span>
                             <span className="flex items-center gap-1" title="Created"><Clock size={14}/> {defect.createdDate}</span>
                             <span title="Assignee" className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                   {defect.assignee.charAt(0)}
                                </div>
                                {defect.assignee}
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2 text-muted hover:text-heading opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={20} />
                       </button>
                       <button className="p-2 text-primary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                          <ArrowRight size={20} />
                       </button>
                    </div>
                 </div>
              </AnimatedCard>
           ))}
        </div>
      </div>
    </AnimatedPage>
  );
};