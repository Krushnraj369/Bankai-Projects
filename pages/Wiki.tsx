import React, { useState } from 'react';
import { AnimatedPage, AnimatedCard } from '../components/Animations';
import { BookOpen, Search, ChevronRight, FileText, Hash } from 'lucide-react';

export const Wiki: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState(1);

  const docs = [
    { id: 1, title: 'Getting Started Guide', category: 'Onboarding' },
    { id: 2, title: 'Test Case Best Practices', category: 'Guidelines' },
    { id: 3, title: 'Automation Framework Setup', category: 'Technical' },
    { id: 4, title: 'Defect Lifecycle Policy', category: 'Process' },
    { id: 5, title: 'API Testing Strategy', category: 'Technical' },
  ];

  return (
    <AnimatedPage>
      <div className="h-full flex gap-6">
        
        {/* Sidebar Navigation */}
        <div className="w-64 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shrink-0 h-[calc(100vh-100px)]">
           <div className="p-4 border-b border-border bg-surface-hover/50">
              <h3 className="font-bold text-heading flex items-center gap-2"><BookOpen size={18} className="text-primary-500"/> Knowledge Base</h3>
           </div>
           
           <div className="p-3">
              <div className="relative mb-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                 <input type="text" placeholder="Search docs..." className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary-500" />
              </div>

              <div className="space-y-1">
                 {docs.map(doc => (
                    <button 
                      key={doc.id}
                      onClick={() => setActiveDoc(doc.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition-colors ${activeDoc === doc.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-muted hover:bg-surface-hover hover:text-heading'}`}
                    >
                       <span className="truncate">{doc.title}</span>
                       <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeDoc === doc.id ? 'opacity-100' : ''}`} />
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface border border-border rounded-2xl p-8 shadow-sm overflow-y-auto h-[calc(100vh-100px)] custom-scrollbar">
           <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-4">
                 <Hash size={14} /> {docs.find(d => d.id === activeDoc)?.category}
              </div>
              
              <h1 className="text-3xl font-black text-heading mb-6">{docs.find(d => d.id === activeDoc)?.title}</h1>
              
              <div className="prose dark:prose-invert max-w-none text-muted leading-relaxed space-y-6">
                 <p>
                    Welcome to the <strong>BankaiQA</strong> documentation. This guide serves as the primary resource for understanding the testing protocols and utilizing the system effectively.
                 </p>
                 
                 <div className="bg-primary-50 dark:bg-primary-900/10 border-l-4 border-primary-500 p-4 rounded-r-lg">
                    <p className="text-sm text-primary-800 dark:text-primary-200 m-0">
                       <strong>Note:</strong> Make sure you have requested access to the relevant Jira projects before starting your testing cycles.
                    </p>
                 </div>

                 <h3 className="text-xl font-bold text-heading mt-8">1. Introduction</h3>
                 <p>
                    Testing is a crucial part of our development lifecycle. We follow a strict Agile methodology with 2-week sprints. All test cases must be reviewed by a Peer QA before execution.
                 </p>

                 <h3 className="text-xl font-bold text-heading mt-8">2. Naming Conventions</h3>
                 <p>
                    When creating a test case, please ensure the Subject follows the format:
                    <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-rose-500 mx-1 text-sm">[Module] - [Feature] - [Action]</code>
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li>Example: <em>Auth - Login - Verify invalid password error</em></li>
                    <li>Example: <em>Pay - Checkout - Verify credit card validation</em></li>
                 </ul>
              </div>
           </div>
        </div>

      </div>
    </AnimatedPage>
  );
};