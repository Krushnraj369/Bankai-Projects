import React from 'react';
import { Trophy, Zap, Users, Bug, Target, TrendingUp, Medal, Star, Flame, Award, CheckCircle2 } from 'lucide-react';
import { AnimatedPage, AnimatedCard, containerVariants } from '../components/Animations';
import { motion } from 'framer-motion';

export const Achievements: React.FC = () => {
  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HERO SECTION: USER STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {/* Rank Card */}
           <AnimatedCard className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Trophy size={60} /></div>
             <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">Current Rank</p>
             <div className="flex items-baseline gap-2">
               <h2 className="text-4xl font-black">#2</h2>
               <span className="text-emerald-300 text-sm font-bold flex items-center">
                 <TrendingUp size={14} className="mr-1" /> Up from #3
               </span>
             </div>
             <p className="mt-4 text-xs font-medium text-indigo-100 bg-white/10 w-fit px-2 py-1 rounded">Top 5% of Testers</p>
           </AnimatedCard>

           <StatsCard label="Tests Executed" value="45" icon={Zap} color="text-amber-500" />
           <StatsCard label="Bugs Found" value="12" icon={Bug} color="text-rose-500" />
           <StatsCard label="Helpfulness Pts" value="8" icon={Users} color="text-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1: PROGRESS & ACHIEVEMENTS */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Progress Bars */}
             <AnimatedCard delay={0.1} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-bold text-heading flex items-center gap-2 mb-6">
                 <Target className="text-primary-500" /> Progress Goals
               </h3>
               
               <div className="space-y-6">
                 <ProgressBar label="Weekly Goal" percentage={70} color="bg-emerald-500" subtext="70% Complete (30% remaining)" />
                 <ProgressBar label="Monthly Target" percentage={50} color="bg-blue-500" subtext="50% Complete (On Track)" />
                 <ProgressBar label="Yearly Objective" percentage={20} color="bg-purple-500" subtext="20% Complete" />
               </div>
             </AnimatedCard>

             {/* Achievements List */}
             <AnimatedCard delay={0.2} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-heading flex items-center gap-2 mb-6">
                  <Award className="text-yellow-500" /> Your Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <AchievementBadge title="Quality Champion" icon="🥇" color="bg-yellow-500/10 text-yellow-600 border-yellow-200" />
                   <AchievementBadge title="Speed Runner" icon="⚡" color="bg-blue-500/10 text-blue-600 border-blue-200" />
                   <AchievementBadge title="Team Player" icon="👥" color="bg-indigo-500/10 text-indigo-600 border-indigo-200" />
                   <AchievementBadge title="Bug Hunter" icon="🐛" color="bg-rose-500/10 text-rose-600 border-rose-200" />
                </div>
             </AnimatedCard>
          </div>

          {/* COLUMN 2: CHALLENGES & LEADERBOARD */}
          <div className="space-y-6">
            
            {/* Daily Challenges */}
            <AnimatedCard delay={0.3} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-heading flex items-center gap-2">
                   <Target className="text-rose-500" /> Daily Challenges
                 </h3>
                 <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Resets in 4h</span>
               </div>
               
               <div className="space-y-3">
                 <ChallengeItem text="Review 5 test cases" completed={true} />
                 <ChallengeItem text="Execute 10 tests" completed={false} progress="8/10" />
                 <ChallengeItem text="Help 2 teammates" completed={false} progress="1/2" />
                 <ChallengeItem text="Find 1 critical bug" completed={true} />
               </div>
            </AnimatedCard>

            {/* Weekly Leaders */}
            <AnimatedCard delay={0.4} className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Medal size={80} /></div>
               <h3 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10">
                 <CrownIcon /> Weekly Leaders
               </h3>

               <div className="space-y-4 relative z-10">
                 <LeaderRow rank={1} name="Sarah" accuracy="98%" isYou={false} />
                 <LeaderRow rank={2} name="You" accuracy="95%" isYou={true} />
                 <LeaderRow rank={3} name="Mike" accuracy="92%" isYou={false} />
                 <LeaderRow rank={4} name="John" accuracy="89%" isYou={false} />
               </div>
            </AnimatedCard>

          </div>
        </div>

      </div>
    </AnimatedPage>
  );
};

// --- SUB COMPONENTS ---

const StatsCard = ({ label, value, icon: Icon, color }: any) => (
  <AnimatedCard className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
    <div className={`p-3 rounded-full w-fit mb-3 ${color.replace('text-', 'bg-').replace('500', '100')} ${color}`}>
      <Icon size={24} />
    </div>
    <p className="text-2xl font-black text-heading">{value}</p>
    <p className="text-xs font-bold text-muted uppercase tracking-wider">{label}</p>
  </AnimatedCard>
);

const ProgressBar = ({ label, percentage, color, subtext }: any) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-sm font-bold text-heading">{label}</span>
      <span className="text-sm font-medium text-muted">{percentage}%</span>
    </div>
    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`h-full rounded-full ${color}`} 
      />
    </div>
    <p className="text-xs text-muted mt-1">{subtext}</p>
  </div>
);

const AchievementBadge = ({ title, icon, color }: any) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${color} text-center transition-transform hover:scale-105 cursor-pointer`}>
    <div className="text-3xl mb-2">{icon}</div>
    <span className="text-xs font-bold">{title}</span>
  </div>
);

const ChallengeItem = ({ text, completed, progress }: any) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-background border-border'}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted text-transparent'}`}>
      <CheckCircle2 size={12} />
    </div>
    <div className="flex-1">
      <p className={`text-sm font-medium ${completed ? 'text-emerald-800 line-through decoration-emerald-500/50' : 'text-heading'}`}>{text}</p>
    </div>
    {progress && <span className="text-xs font-bold text-muted bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{progress}</span>}
  </div>
);

const LeaderRow = ({ rank, name, accuracy, isYou }: any) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl ${isYou ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}>
    <div className={`w-8 h-8 flex items-center justify-center font-black rounded-lg ${
      rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
      rank === 2 ? 'bg-slate-300 text-slate-800' :
      rank === 3 ? 'bg-amber-600 text-amber-100' : 'bg-slate-700 text-slate-400'
    }`}>
      {rank}
    </div>
    <div className="flex-1">
       <div className="flex items-center gap-2">
         <span className={`font-bold ${isYou ? 'text-white' : 'text-slate-200'}`}>{name}</span>
         {isYou && <span className="text-[10px] bg-primary-500 px-1 rounded text-white font-medium">YOU</span>}
         {rank === 1 && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
       </div>
    </div>
    <div className="text-right">
       <div className="font-mono font-bold text-emerald-400">{accuracy}</div>
       <div className="text-[10px] text-slate-400">Accuracy</div>
    </div>
  </div>
);

const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-400">
    <path d="M2 20H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 16L2 4L12 9L22 4L19 16H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);