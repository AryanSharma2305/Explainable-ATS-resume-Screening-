import React, { useState } from 'react';
import { 
  User, 
  CompanyTenant, 
  JobDescription, 
  CandidateProfile, 
  JobApplication, 
  Skill, 
  SkillRelationship, 
  AuditLog 
} from '../types';
import { 
  HardDrive, 
  X, 
  Download, 
  Clock, 
  Database, 
  Users, 
  FileText, 
  Briefcase, 
  Send, 
  CheckCircle2, 
  Copy, 
  Search, 
  ShieldCheck, 
  RefreshCw,
  Building2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { calculateStorageStats, downloadBackupJSON, StoragePayload } from '../services/storageService';

interface DataStorageExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StoragePayload;
  onSyncNow?: () => void;
}

export const DataStorageExplorerModal: React.FC<DataStorageExplorerModalProps> = ({
  isOpen,
  onClose,
  data,
  onSyncNow
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'candidates' | 'jobs' | 'applications' | 'companies' | 'raw'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  if (!isOpen) return null;

  const stats = calculateStorageStats(data);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadBackupJSON(data);
  };

  // Filtered lists
  const filteredUsers = (data.users || []).filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCandidates = (data.candidates || []).filter(c => 
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.extractedSkills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredJobs = (data.jobs || []).filter(j => 
    j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApps = (data.applications || []).filter(a => 
    a.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-emerald-600 p-2.5 rounded-2xl text-white shadow-md">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Persistent Data Storage Explorer
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>30-Day Retention Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                All records are saved on server disk and client storage for 1 month (30 days). User logins are permanently retained.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow flex items-center space-x-1.5"
              title="Download entire database as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON Backup</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 30-Day Retention Banner & Storage Metrics */}
        <div className="bg-slate-950/40 border-b border-slate-800/80 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Retention Period</span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">30 Days (1 Month)</div>
            <div className="text-[10px] text-emerald-400 font-medium">Guaranteed Persistence</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Total Accounts</span>
            </div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">{data.users?.length || 0} Registered</div>
            <div className="text-[10px] text-slate-400">Admin, Recruiters, Candidates</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
              <Send className="w-3 h-3 text-purple-400" />
              <span>Applications & Resumes</span>
            </div>
            <div className="text-sm font-black text-purple-300 mt-0.5">{data.applications?.length || 0} Screened</div>
            <div className="text-[10px] text-slate-400">{data.candidates?.length || 0} Parsed Profiles</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
              <Database className="w-3 h-3 text-amber-400" />
              <span>Database Size</span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">{stats.sizeKb} KB Stored</div>
            <div className="text-[10px] text-slate-400">Dual Sync (Server + Browser)</div>
          </div>
        </div>

        {/* Tab Selector & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex overflow-x-auto space-x-1.5 scrollbar-none">
            {[
              { id: 'users', label: `Users & Logins (${data.users?.length || 0})`, icon: Users },
              { id: 'candidates', label: `Resumes & Candidates (${data.candidates?.length || 0})`, icon: FileText },
              { id: 'jobs', label: `Job Postings (${data.jobs?.length || 0})`, icon: Briefcase },
              { id: 'applications', label: `Applications & Scores (${data.applications?.length || 0})`, icon: Send },
              { id: 'companies', label: `Companies (${data.companies?.length || 0})`, icon: Building2 },
              { id: 'raw', label: 'Raw JSON Database', icon: Database },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab !== 'raw' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stored data..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: USERS & LOGINS */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>All accounts stored in database. You can sign in using any of these emails:</span>
                <button 
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPasswords ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80">
                {filteredUsers.map((user, idx) => (
                  <div key={user.id || idx} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start sm:items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0 ${
                        user.role === 'ADMIN' ? 'bg-purple-600' : user.role === 'RECRUITER' ? 'bg-indigo-600' : 'bg-emerald-600'
                      }`}>
                        {user.role === 'ADMIN' ? '👑' : user.role === 'RECRUITER' ? '🏢' : '🎓'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{user.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : user.role === 'RECRUITER'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {user.role === 'ADMIN' ? 'Software Owner' : user.role === 'RECRUITER' ? 'Company / HR' : 'Candidate'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Password</div>
                        <div className="font-mono text-slate-300">
                          {showPasswords ? (user.password || 'password123') : '••••••••'}
                        </div>
                      </div>
                      <div className="text-right pl-3 border-l border-slate-800">
                        <div className="text-[10px] text-emerald-400 font-semibold">Retention</div>
                        <div className="text-[11px] text-slate-300">Active for 30 Days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATES & RESUMES */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Parsed resumes and skill profiles stored in the database:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((cand, idx) => (
                  <div key={cand.id || idx} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{cand.fullName}</h4>
                        <p className="text-xs text-slate-400 font-mono">{cand.email}</p>
                        <p className="text-[11px] text-indigo-400 mt-0.5">{cand.location || 'India'} • {cand.highestDegree}</p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {cand.totalExpYears} Yrs Exp
                      </span>
                    </div>

                    {/* Extracted Skills */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Extracted Skills ({cand.extractedSkills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(cand.extractedSkills || []).map((s, sIdx) => (
                          <span key={sIdx} className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resume Snippet */}
                    {cand.rawResumeText && (
                      <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-xl text-[11px] text-slate-400 line-clamp-3 font-mono">
                        "{cand.rawResumeText}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: JOBS */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job, idx) => (
                  <div key={job.id || idx} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {job.companyName}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-0.5">{job.title}</h4>
                        <p className="text-[11px] text-slate-400">{job.location} • {job.jobType}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Min Exp: {job.minExperienceYears} Yrs
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {job.descriptionText}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(job.requiredSkills || []).map((s, sIdx) => (
                        <span key={sIdx} className="bg-indigo-950/70 text-indigo-200 border border-indigo-800/60 text-[10px] px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-3">
              {filteredApps.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No applications stored yet. When candidates apply to jobs, their evaluations and match breakdowns will appear here.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80">
                  {filteredApps.map((app, idx) => (
                    <div key={app.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-white">{app.candidateName}</div>
                        <div className="text-xs text-indigo-400">{app.jobTitle} • {app.companyName}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Applied: {app.appliedDate}</div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-base font-black text-emerald-400">
                            {app.scoreBreakdown?.overallScore || 0}%
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {app.scoreBreakdown?.exactMatchedSkills?.length || 0} direct + {app.scoreBreakdown?.relatedMatchedSkills?.length || 0} implicit
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMPANIES */}
          {activeTab === 'companies' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(data.companies || []).map((comp, idx) => (
                <div key={comp.id || idx} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {comp.status}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-400">{comp.plan} Plan</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{comp.name}</h4>
                  <p className="text-xs text-slate-400">{comp.industry}</p>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                    Contact: <span className="text-slate-300 font-mono">{comp.contactEmail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: RAW JSON DATABASE */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Complete application JSON payload with 30-day retention parameters:</span>
                <button
                  onClick={handleCopyJSON}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[50vh] leading-relaxed scrollbar-thin">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Retention Policy: <strong>30-Day Guaranteed Active Storage</strong>. User accounts and screening evaluations persist across browser restarts.
            </span>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {onSyncNow && (
              <button
                onClick={onSyncNow}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sync to Server Disk</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Close Explorer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
