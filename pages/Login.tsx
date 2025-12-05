import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { Logo } from '../components/Logo';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await authService.login(userId, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setUserId('Admin');
    setPassword('1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Main Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl p-8 md:p-10">
          
          {/* Logo Section - Always use Dark theme logo for Login screen */}
          <div className="flex flex-col items-center mb-10">
            <div className="p-4 bg-slate-800/50 rounded-2xl mb-4 border border-slate-700/50 shadow-inner">
               <Logo theme="dark" showText={false} className="scale-125" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Bankai<span className="text-primary-500">QA</span></h1>
            <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">Test Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="User ID"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/25 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Link */}
          <div className="mt-8 text-center">
            <button 
              onClick={handleQuickLogin}
              className="text-xs text-slate-500 hover:text-primary-400 transition-colors underline decoration-slate-700 hover:decoration-primary-500/50 underline-offset-4"
            >
              Populate Admin Credentials (Admin / 1)
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-6">
          &copy; {new Date().getFullYear()} Bankai Group. Internal Use Only.
        </p>

      </div>
    </div>
  );
};
