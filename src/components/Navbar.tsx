import React from 'react';
import { User } from '../types';
import { Briefcase, GraduationCap, Sparkles, LogOut, Crown } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onOpenStorageExplorer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenStorageExplorer
}) => {
  const isAdmin = currentUser.role?.toUpperCase() === 'ADMIN' || currentUser.email?.toLowerCase() === 'admin@gmail.com';
  const isRecruiter = !isAdmin && currentUser.role?.toUpperCase() === 'RECRUITER';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Title & App Branding */}
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl text-white shadow-sm flex items-center justify-center ${
            isAdmin ? 'bg-purple-600' : isRecruiter ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {isAdmin ? <Crown className="w-5 h-5 text-amber-300" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-slate-100">
                Explainable ATS Screener
              </h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                isAdmin
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : isRecruiter 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {isAdmin ? '👑 Software Owner' : isRecruiter ? '🏢 Company & HR' : '🎓 Candidate'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {isAdmin 
                ? 'Platform Administration • SaaS Tenants • Scoring Algorithm Tuning & Global Audit'
                : isRecruiter
                ? `${currentUser.companyName || 'Company HR'} • Job Postings & Applicant Screening`
                : 'Build Resume Profile, Apply for Jobs & View Explainable Match Scores'}
            </p>
          </div>
        </div>

        {/* User Profile Info & Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">

          {/* Current User Badge */}
          <div className="flex items-center space-x-2.5 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${
              isAdmin ? 'bg-purple-600' : isRecruiter ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}>
              {isAdmin ? (
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              ) : isRecruiter ? (
                <Briefcase className="w-3.5 h-3.5" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-100 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {isAdmin ? 'Software Owner' : isRecruiter ? (currentUser.companyName || 'Company HR') : currentUser.email}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-rose-950/60 hover:border-rose-700/50 hover:text-rose-300 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
            title="Log out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>

      </div>
    </header>
  );
};
