import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Activity, Trophy, Medal, Star, Flame, Crown, Zap, Edit2, CheckCircle2, XCircle, PlusCircle, MessageSquare } from 'lucide-react';
import { itemFadeUp, itemScale } from './Animations';
import { Status } from '../types';

// ============================================================================
// PARTICLE BACKGROUND
// ============================================================================
export const ParticleBackground = () => {
  // Simple CSS-based particles for performance vs Canvas
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary-500/10 blur-sm"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.3 + 0.1
          }}
          animate={{
            y: [null, Math.random() * 100 + "%"],
            opacity: [null, Math.random() * 0.5],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
            repeatType: "reverse"
          }}
          style={{
            width: Math.random() * 10 + 5 + "px",
            height: Math.random() * 10 + 5 + "px",
          }}
        />
      ))}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-transparent to-background/80" />
    </div>
  );
};

// ============================================================================
// HEALTH GAUGE
// ============================================================================
export const HealthGauge = ({ score, label, color }: { score: number, label: string, color: string }) => {
  const data = [{ name: 'score', value: score, fill: color }];
  
  return (
    <motion.div variants={itemScale} className="relative flex flex-col items-center justify-center p-4 bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={8} data={data} startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'var(--border-main)' }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
          <span className="text-2xl font-bold text-heading">{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted uppercase tracking-wider mt-[-20px]">{label}</span>
      <motion.div 
        className={`mt-2 text-xs flex items-center gap-1 ${score > 70 ? 'text-emerald-500' : 'text-rose-500'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {score > 70 ? '▲' : '▼'} {Math.floor(Math.random() * 5 + 1)}% vs last week
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// REAL-TIME ACTIVITY FEED
// ============================================================================
export const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Initial Seed
    const seed = [
      { id: 1, user: 'Krushnraj', action: 'executed', target: 'TC-1045 Login Validation', time: 'Just now', icon: Zap, color: 'text-amber-500' },
      { id: 2, user: 'Prince', action: 'created', target: 'TC-2099 Payment API', time: '2 mins ago', icon: PlusCircle, color: 'text-emerald-500' },
      { id: 3, user: 'Dinesh', action: 'failed', target: 'TC-1022 Search Module', time: '5 mins ago', icon: XCircle, color: 'text-rose-500' },
    ];
    setActivities(seed);

    // Simulation Loop
    const interval = setInterval(() => {
      const actions = [
        { action: 'executed', text: 'Login Flow', icon: Zap, color: 'text-amber-500' },
        { action: 'passed', text: 'Checkout Process', icon: CheckCircle2, color: 'text-emerald-500' },
        { action: 'commented', text: 'Defect #404', icon: MessageSquare, color: 'text-blue-500' },
        { action: 'updated', text: 'User Profile TC', icon: Edit2, color: 'text-indigo-500' }
      ];
      const users = ['Krushnraj', 'Prince', 'Dinesh', 'Srushti', 'Pratik'];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const newActivity = {
        id: Date.now(),
        user: randomUser,
        action: randomAction.action,
        target: `TC-${Math.floor(Math.random() * 9000 + 1000)} ${randomAction.text}`,
        time: 'Just now',
        icon: randomAction.icon,
        color: randomAction.color
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-heading flex items-center gap-2 mb-4">
        <Activity className="text-primary-500" size={20} /> Live Activity
      </h3>
      <div className="flex-1 space-y-4 overflow-hidden">
        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-surface/40 border border-white/5 hover:bg-surface-hover/50 transition-colors"
            >
              <div className={`p-2 rounded-full bg-background border border-white/5 ${item.color}`}>
                <item.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-heading truncate">
                  <span className="font-bold text-primary-500">{item.user}</span> {item.action}
                </p>
                <p className="text-xs text-muted truncate">{item.target}</p>
              </div>
              <span className="text-[10px] text-muted whitespace-nowrap">{item.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// GAMIFICATION WIDGET
// ============================================================================
export const GamificationWidget = () => {
  const leaderboard = [
    { rank: 1, name: 'Krushnraj', score: 9850, avatar: 'K', streak: 12 },
    { rank: 2, name: 'Prince', score: 8720, avatar: 'P', streak: 5 },
    { rank: 3, name: 'Dinesh', score: 8100, avatar: 'D', streak: 8 },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 relative z-10">
        <Trophy className="text-yellow-400" size={20} /> Top Performers
      </h3>

      <div className="space-y-4 relative z-10">
        {leaderboard.map((user, index) => (
          <motion.div
            key={user.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
              index === 0 
                ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                : 'bg-surface/30 border-white/5'
            }`}
          >
            <div className="flex-shrink-0 relative">
              {index === 0 && <Crown size={16} className="absolute -top-2 -right-1 text-yellow-400 animate-bounce" />}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-slate-700'
              }`}>
                {user.avatar}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{user.name}</span>
                {user.streak > 10 && <Flame size={14} className="text-orange-500 animate-pulse" />}
              </div>
              <div className="text-xs text-slate-400">Level {Math.floor(user.score / 1000)} • {user.score} XP</div>
            </div>

            <div className="text-2xl font-bold text-slate-500/50">#{user.rank}</div>
          </motion.div>
        ))}
      </div>
      
      {/* Badges Preview */}
      <div className="mt-6 pt-4 border-t border-white/10 flex gap-2 justify-center">
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-emerald-400" title="Bug Hunter"><Zap size={14} /></div>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-blue-400" title="Early Bird"><Medal size={14} /></div>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-purple-400" title="Perfectionist"><Star size={14} /></div>
        <div className="text-xs text-slate-400 flex items-center ml-2">+12 more</div>
      </div>
    </div>
  );
};