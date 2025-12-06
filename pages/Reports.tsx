import React, { useState } from 'react';
import { AnimatedPage, AnimatedCard } from '../components/Animations';
import { Download, FileText, Calendar, Filter, Printer, Clock, FileSpreadsheet, FileJson, CheckCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

export const Reports: React.FC = () => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState('Execution Summary');
  const [format, setFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      showToast(`${reportType} (${format}) generated successfully.`, 'success');
    }, 2000);
  };

  const downloads = [
    { name: 'Daily_Status_Report_Oct10.pdf', date: 'Oct 10, 2024', size: '2.4 MB', type: 'DSR' },
    { name: 'Release_2.1_SignOff.xlsx', date: 'Oct 08, 2024', size: '1.1 MB', type: 'Sign-off' },
    { name: 'Traceability_Matrix_v3.csv', date: 'Oct 05, 2024', size: '856 KB', type: 'RTM' },
    { name: 'Defect_Summary_Q3.pdf', date: 'Sep 30, 2024', size: '3.2 MB', type: 'Defects' },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-8 pb-10">
        
        {/* --- HEADER --- */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h2 className="text-xl font-bold text-heading flex items-center gap-2">
                 <FileText className="text-primary-500" /> Report Center
              </h2>
              <p className="text-sm text-muted">Generate, schedule, and download official testing documentation.</p>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors">
              <Clock size={16} /> Schedule New Report
           </button>
        </div>

        {/* --- REPORT WIZARD --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Generator Form */}
           <AnimatedCard className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-heading mb-6 border-b border-border pb-2">Custom Report Generator</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase">Report Type</label>
                    <select 
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500"
                    >
                       <option>Execution Summary</option>
                       <option>Detailed Defect Report</option>
                       <option>Traceability Matrix (RTM)</option>
                       <option>User Performance Scorecard</option>
                       <option>Test Case Repository Dump</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase">Module Scope</label>
                    <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500">
                       <option>All Modules</option>
                       <option>Authentication</option>
                       <option>Payments</option>
                       <option>User Profile</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase">Date Range</label>
                    <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-heading focus:ring-2 focus:ring-primary-500">
                       <option>Last 24 Hours</option>
                       <option>Current Sprint</option>
                       <option>Last 30 Days</option>
                       <option>Custom Range...</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase">Output Format</label>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setFormat('PDF')}
                         className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${format === 'PDF' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-background border-border text-muted'}`}
                       >
                         PDF
                       </button>
                       <button 
                         onClick={() => setFormat('Excel')}
                         className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${format === 'Excel' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-background border-border text-muted'}`}
                       >
                         Excel
                       </button>
                       <button 
                         onClick={() => setFormat('CSV')}
                         className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${format === 'CSV' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-background border-border text-muted'}`}
                       >
                         CSV
                       </button>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                 <button 
                   onClick={handleGenerate}
                   disabled={isGenerating}
                   className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                 >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Printer size={18} />}
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                 </button>
              </div>
           </AnimatedCard>

           {/* Quick Actions */}
           <div className="space-y-6">
              <AnimatedCard delay={0.1} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                 <h3 className="font-bold text-heading mb-4 text-sm uppercase tracking-wide">Quick Exports</h3>
                 <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 bg-surface-hover/50 hover:bg-surface-hover border border-border rounded-xl transition-colors text-left group">
                       <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform"><CheckCircle size={20} /></div>
                       <div>
                          <div className="font-bold text-sm text-heading">Daily Status Report</div>
                          <div className="text-xs text-muted">Today's executions summary</div>
                       </div>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-surface-hover/50 hover:bg-surface-hover border border-border rounded-xl transition-colors text-left group">
                       <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><FileSpreadsheet size={20} /></div>
                       <div>
                          <div className="font-bold text-sm text-heading">Release Sign-off</div>
                          <div className="text-xs text-muted">Current Release Metrics</div>
                       </div>
                    </button>
                 </div>
              </AnimatedCard>
           </div>

        </div>

        {/* --- DOWNLOAD HISTORY --- */}
        <AnimatedCard delay={0.2} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-heading">Recent Downloads</h3>
              <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">View All History</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-background text-muted uppercase text-xs">
                    <tr>
                       <th className="p-4">Report Name</th>
                       <th className="p-4">Type</th>
                       <th className="p-4">Generated Date</th>
                       <th className="p-4">Size</th>
                       <th className="p-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    {downloads.map((file, i) => (
                       <tr key={i} className="hover:bg-surface-hover transition-colors">
                          <td className="p-4 font-medium text-heading flex items-center gap-2">
                             {file.name.endsWith('.pdf') ? <FileText size={16} className="text-rose-500" /> : <FileSpreadsheet size={16} className="text-emerald-500" />}
                             {file.name}
                          </td>
                          <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-muted">{file.type}</span></td>
                          <td className="p-4 text-muted">{file.date}</td>
                          <td className="p-4 text-muted font-mono text-xs">{file.size}</td>
                          <td className="p-4 text-right">
                             <button className="text-primary-600 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-2 rounded-lg transition-colors">
                                <Download size={16} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </AnimatedCard>

      </div>
    </AnimatedPage>
  );
};