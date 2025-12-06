import React from 'react';
import { AnimatedPage, AnimatedCard } from '../components/Animations';
import { Construction, ArrowRight } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <AnimatedPage>
      <div className="h-full flex items-center justify-center p-6">
        <AnimatedCard className="max-w-2xl w-full bg-surface border border-border rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-full text-primary-600 animate-pulse">
              <Construction size={48} />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-heading mb-4 tracking-tight">
            {title} <span className="text-primary-500">Coming Soon</span>
          </h1>
          
          <p className="text-lg text-muted mb-8 leading-relaxed max-w-lg mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform">
               Notify When Ready
             </button>
             <button className="px-6 py-3 border border-border text-heading rounded-xl font-medium hover:bg-surface-hover transition-colors flex items-center gap-2">
               View Roadmap <ArrowRight size={16} />
             </button>
          </div>
          
          <div className="mt-8 text-xs font-mono text-muted uppercase tracking-widest">
            Estimated Release: Q4 2024
          </div>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
};