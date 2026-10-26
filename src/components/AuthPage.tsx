import React, { useState } from 'react';
import { User, UserRole, CandidateProfile } from '../types';
import { INITIAL_USERS } from '../services/seedData';
import { 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building2,
  RefreshCw,
  Crown
} from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  existingUsers: User[];
  existingCandidates?: CandidateProfile[];
  onOpenStorageExplorer?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  existingUsers,
  existingCandidates = [],
  onOpenStorageExplorer
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sign up form state (Only public roles: Candidate or Company/HR)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('CANDIDATE');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const fillQuickCredentials = (email: string, pass: string) => {
    setActiveTab('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const emailTrimmed = loginEmail.trim().toLowerCase();

    // 1. Search in existingUsers passed from App state
    let user = (existingUsers || []).find(
      u => u && u.email && u.email.trim().toLowerCase() === emailTrimmed
    );

    // 2. Search in existingCandidates passed from App state (auto-link candidate profile)
    if (!user && existingCandidates && existingCandidates.length > 0) {
      const cand = existingCandidates.find(
        c => c && c.email && c.email.trim().toLowerCase() === emailTrimmed
      );
      if (cand) {
        user = {
          id: cand.userId || `user-cand-${Date.now()}`,
          name: cand.fullName || 'Candidate',
          email: emailTrimmed,
          password: 'password123',
          role: 'CANDIDATE',
          title: cand.summary || 'Job Seeker',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          createdAt: cand.updatedAt || '2026-08-01'
        };
      }
    }

    // 3. Search in INITIAL_USERS fallback
    if (!user) {
      user = INITIAL_USERS.find(
        u => u && u.email && u.email.trim().toLowerCase() === emailTrimmed
      );
    }

    // 4. Query backend /api/auth/login endpoint (persisted disk file)
    let serverErrorMessage: string | null = null;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        user = data.user;
      } else if (!res.ok && data.error) {
        serverErrorMessage = data.error;
      }
    } catch (err) {
      console.warn('Backend login fallback lookup failed:', err);
    }

    setIsLoggingIn(false);

    if (!user) {
      setLoginError(serverErrorMessage || 'No account found with this email address. Please check your credentials or create a new account.');
      return;
    }

    // Verify password with default fallback to password123
    const expectedPassword = user.password || 'password123';
    if (loginPassword && expectedPassword !== loginPassword) {
      setLoginError('Incorrect password. Please verify your password and try again.');
      return;
    }

    onLogin(user);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid email address.');
      return;
    }

    if (signupPassword.length < 4) {
      setSignupError('Password should be at least 4 characters.');
      return;
    }

    if (signupRole === 'RECRUITER' && !signupCompany.trim()) {
      setSignupError('Please enter your company or organization name.');
      return;
    }

    const emailTrimmed = signupEmail.trim().toLowerCase();
    const emailExists = (existingUsers || []).some(
      u => u.email?.trim().toLowerCase() === emailTrimmed
    );

    if (emailExists) {
      setSignupError('An account with this email already exists. Please sign in instead.');
      return;
    }

    setIsSigningUp(true);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: signupName.trim(),
      email: emailTrimmed,
      password: signupPassword,
      role: signupRole,
      companyName: signupRole === 'RECRUITER' ? signupCompany.trim() : undefined,
      title: signupRole === 'RECRUITER' 
        ? 'Talent Acquisition Partner' 
        : 'Job Seeker',
      avatar: signupRole === 'RECRUITER' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    };

    // Candidate profile if role is CANDIDATE
    const newCandidateProfile: CandidateProfile | undefined = signupRole === 'CANDIDATE' ? {
      id: `cand-${newUser.id}`,
      userId: newUser.id,
      fullName: newUser.name,
      email: newUser.email,
      phone: '',
      location: '',
      summary: '',
      rawResumeText: '',
      extractedSkills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      totalExpYears: 0,
      highestDegree: 'Bachelor Degree',
      updatedAt: new Date().toISOString().split('T')[0]
    } : undefined;

    // Immediately persist directly to server disk storage for 30-day retention
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: newUser, candidateProfile: newCandidateProfile })
      });
    } catch (err) {
      console.warn('Direct server registration sync notice:', err);
    }

    setIsSigningUp(false);
    onRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-emerald-600 p-2.5 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight">Explainable ATS Screener</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider hidden sm:inline-block">
                  Transparent NLP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Transparent Resume Screening & Skill Matching Platform
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure Authentication</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-center gap-12">
        
        {/* Left column: Overview of the Platform */}
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-full text-xs text-indigo-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rule-Based NLP & Explainable Matching</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Transparent Resume Screening & Job Fit Analytics
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate traditional keyword-rejection bias. Built for <strong className="text-indigo-400">Employers & HR Hiring Teams</strong> and <strong className="text-emerald-400">Job Candidates</strong> to produce mathematically transparent match scores and actionable skill guidance.
          </p>

          {/* 2 Public Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* For Employers / HR */}
            <div className="bg-slate-800/60 border border-indigo-500/30 p-4 rounded-2xl text-left">
              <div className="bg-indigo-500/20 text-indigo-300 p-2 rounded-xl w-fit mb-2.5">
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-bold text-xs text-white">
                For Employers & HR
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Post job listings, screen applicants in real-time, inspect ranked candidate pools, and download ATS explanation PDF reports.
              </p>
            </div>

            {/* For Candidates */}
            <div className="bg-slate-800/60 border border-emerald-500/30 p-4 rounded-2xl text-left">
              <div className="bg-emerald-500/20 text-emerald-300 p-2 rounded-xl w-fit mb-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-bold text-xs text-white">
                For Candidates
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Upload resume, test job fit with real-time score preview, apply to open jobs, and access targeted courses for missing skills.
              </p>
            </div>

          </div>
        </div>

        {/* Right column: Auth Card */}
        <div className="w-full lg:w-[460px] bg-slate-950/85 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Tab Navigation */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
                setSignupError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setLoginError(null);
                setSignupError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl leading-relaxed">
                  {loginError}
                </div>
              )}

              {/* Quick Fill Demo Credentials */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Quick Fill Credentials:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                    30-Day Retained
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('aryanmsharma23@gmail.com', 'password123')}
                    className="bg-slate-800 hover:bg-emerald-950/70 border border-slate-700 hover:border-emerald-600/50 p-1.5 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[10px] font-bold text-emerald-300 flex items-center space-x-1">
                      <span>Candidate</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">aryanmsharma23@...</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('admin@gmail.com', 'admin123')}
                    className="bg-slate-800 hover:bg-purple-950/70 border border-slate-700 hover:border-purple-600/50 p-1.5 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[10px] font-bold text-purple-300 flex items-center space-x-1">
                      <span>Admin</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">admin@gmail.com</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('recruiter@techcorp.com', 'password123')}
                    className="bg-slate-800 hover:bg-indigo-950/70 border border-slate-700 hover:border-indigo-600/50 p-1.5 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[10px] font-bold text-indigo-300 flex items-center space-x-1">
                      <span>HR / Co.</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">recruiter@techcorp...</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP TAB (Only Candidate or Company / HR) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl">
                  {signupError}
                </div>
              )}

              {/* Role Selection (Candidate or Company / HR only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Candidate */}
                  <button
                    type="button"
                    onClick={() => setSignupRole('CANDIDATE')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      signupRole === 'CANDIDATE'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-100 mb-1">
                      <GraduationCap className={`w-4 h-4 ${signupRole === 'CANDIDATE' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>Candidate</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Job Seeker / Applicant</div>
                  </button>

                  {/* Company / HR */}
                  <button
                    type="button"
                    onClick={() => setSignupRole('RECRUITER')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      signupRole === 'RECRUITER'
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-100 mb-1">
                      <Briefcase className={`w-4 h-4 ${signupRole === 'RECRUITER' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span>Company / HR</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Employer / Recruiter</div>
                  </button>

                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* If Recruiter, ask for Company Name */}
              {signupRole === 'RECRUITER' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={signupCompany}
                      onChange={(e) => setSignupCompany(e.target.value)}
                      placeholder="e.g. TechCorp Solutions"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-2"
              >
                <span>Create {signupRole === 'RECRUITER' ? 'Company / HR' : 'Candidate'} Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 text-center py-4 px-6 text-xs text-slate-500">
        <p>Explainable Skill-Based ATS Screener • Supporting Employers, HR & Candidates</p>
      </footer>
    </div>
  );
};
