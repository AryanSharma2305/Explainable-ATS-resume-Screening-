import React, { useState } from 'react';
import { 
  User, 
  JobDescription, 
  JobApplication, 
  CandidateProfile, 
  Skill, 
  SkillRelationship, 
  ScoringWeights, 
  ScoringThresholds, 
  ProjectQualityRule, 
  Course, 
  AuditLog,
  CompanyTenant
} from '../types';
import { AdminPanel } from './AdminPanel';
import { CandidateAccountsManager } from './CandidateAccountsManager';
import { 
  Crown, 
  Building2, 
  Users, 
  Briefcase, 
  SlidersHorizontal, 
  Database, 
  Network, 
  BookOpen, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Search, 
  BarChart3, 
  Activity, 
  FileText,
  Sparkles,
  ChevronRight,
  XCircle,
  HardDrive,
  Check
} from 'lucide-react';

interface SoftwareOwnerDashboardProps {
  currentUser: User;
  companies: CompanyTenant[];
  users: User[];
  jobs: JobDescription[];
  applications: JobApplication[];
  candidates: CandidateProfile[];
  knownSkills: Skill[];
  relationships: SkillRelationship[];
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  projectRules: ProjectQualityRule[];
  courses: Course[];
  auditLogs: AuditLog[];
  onAddCompany: (company: CompanyTenant, initialRecruiter: User) => void;
  onToggleCompanyStatus: (companyId: string) => void;
  onDeleteCompany: (companyId: string) => void;
  onUpdateWeights: (weights: ScoringWeights) => void;
  onUpdateThresholds: (thresholds: ScoringThresholds) => void;
  onAddSkill: (skill: Skill) => void;
  onDeleteSkill: (skillId: string) => void;
  onAddRelationship: (rel: SkillRelationship) => void;
  onDeleteRelationship: (relId: string) => void;
  onUpdateProjectRule: (ruleId: string, points: number) => void;
  onAddCourse: (course: Course) => void;
  onUpdateCandidate: (candidate: CandidateProfile) => void;
  onDeleteCandidate: (candidateId: string, userId: string) => void;
  onAdminCreateCandidate: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    location?: string;
    degree?: string;
    expYears?: number;
    rawResumeText?: string;
    skills?: string[];
  }) => void;
  onOpenStorageExplorer?: () => void;
}

export const SoftwareOwnerDashboard: React.FC<SoftwareOwnerDashboardProps> = ({
  currentUser,
  companies = [],
  users = [],
  jobs = [],
  applications = [],
  candidates = [],
  knownSkills = [],
  relationships = [],
  weights,
  thresholds,
  projectRules = [],
  courses = [],
  auditLogs = [],
  onAddCompany,
  onToggleCompanyStatus,
  onDeleteCompany,
  onUpdateWeights,
  onUpdateThresholds,
  onAddSkill,
  onDeleteSkill,
  onAddRelationship,
  onDeleteRelationship,
  onUpdateProjectRule,
  onAddCourse,
  onUpdateCandidate,
  onDeleteCandidate,
  onAdminCreateCandidate,
  onOpenStorageExplorer
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'companies' | 'candidates' | 'jobs' | 'engine' | 'taxonomy' | 'courses' | 'audit'
  >('overview');

  // New Company Modal state
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('Technology & Cloud');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [newCompanyPlan, setNewCompanyPlan] = useState<'Enterprise' | 'Professional' | 'Startup'>('Enterprise');
  const [newRecruiterName, setNewRecruiterName] = useState('');
  const [newRecruiterEmail, setNewRecruiterEmail] = useState('');
  const [newRecruiterPassword, setNewRecruiterPassword] = useState('password123');

  // Search filter for companies
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // Computed metrics
  const recruiters = (users || []).filter(u => u && u.role === 'RECRUITER');
  
  const avgOverallScore = applications.length > 0
    ? Math.round(
        applications.reduce((acc, curr) => acc + (curr.scoreBreakdown?.overallScore || 0), 0) / applications.length
      )
    : 0;

  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;

  const handleCreateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newRecruiterEmail.trim() || !newRecruiterName.trim()) {
      alert('Please fill out all required company and recruiter fields.');
      return;
    }

    const companyId = `comp-${Date.now()}`;
    const newCompany: CompanyTenant = {
      id: companyId,
      name: newCompanyName.trim(),
      industry: newCompanyIndustry.trim(),
      contactEmail: newRecruiterEmail.trim(),
      website: newCompanyWebsite.trim() || undefined,
      plan: newCompanyPlan,
      status: 'Active',
      maxJobPostings: newCompanyPlan === 'Enterprise' ? 50 : newCompanyPlan === 'Professional' ? 20 : 5,
      recruiterCount: 1,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const newRecruiterUser: User = {
      id: `user-recruiter-${Date.now()}`,
      name: newRecruiterName.trim(),
      email: newRecruiterEmail.trim(),
      password: newRecruiterPassword || 'password123',
      role: 'RECRUITER',
      companyName: newCompanyName.trim(),
      title: 'Talent Acquisition Partner',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddCompany(newCompany, newRecruiterUser);
    setIsAddCompanyOpen(false);
    setNewCompanyName('');
    setNewCompanyWebsite('');
    setNewRecruiterName('');
    setNewRecruiterEmail('');
  };

  const filteredCompanies = (companies || []).filter(comp => {
    const q = companySearchQuery.toLowerCase();
    return (
      (comp.name || '').toLowerCase().includes(q) || 
      (comp.industry || '').toLowerCase().includes(q) || 
      (comp.contactEmail || '').toLowerCase().includes(q)
    );
  });

  // Safe weights and thresholds with defaults
  const safeWeights: ScoringWeights = {
    skillMatch: weights?.skillMatch ?? 40,
    projectQuality: weights?.projectQuality ?? 20,
    experience: weights?.experience ?? 20,
    education: weights?.education ?? 10,
    certification: weights?.certification ?? 10
  };

  const safeThresholds: ScoringThresholds = {
    excellent: thresholds?.excellent ?? 95,
    strong: thresholds?.strong ?? 85,
    good: thresholds?.good ?? 70,
    moderate: thresholds?.moderate ?? 55
  };

  return (
    <div className="space-y-6">
      
      {/* Software Owner Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold text-purple-300">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Software Owner & Master System Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Software Owner Portal
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
              Root administration authority. Manage onboarded companies, candidate databases, multi-tenant recruiters, core mathematical ATS scoring weights, transitive ontology graphs, and global audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Engine Status</div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Rule-Based NLP Active</span>
              </div>
            </div>
            <button
              onClick={() => setIsAddCompanyOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Company</span>
            </button>
          </div>
        </div>

        {/* Global SaaS KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-indigo-900/50">
          <div className="bg-slate-900/60 border border-indigo-900/40 p-3 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Companies</span>
            </div>
            <div className="text-xl font-black text-white">{companies.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active Tenants</div>
          </div>

          <div className="bg-slate-900/60 border border-indigo-900/40 p-3 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-semibold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Recruiters</span>
            </div>
            <div className="text-xl font-black text-white">{recruiters.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">HR Accounts</div>
          </div>

          <div className="bg-slate-900/60 border border-indigo-900/40 p-3 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-semibold mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Candidates</span>
            </div>
            <div className="text-xl font-black text-white">{candidates.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Parsed Resumes</div>
          </div>

          <div className="bg-slate-900/60 border border-indigo-900/40 p-3 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-semibold mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Postings</span>
            </div>
            <div className="text-xl font-black text-white">{jobs.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Live Openings</div>
          </div>

          <div className="bg-slate-900/60 border border-indigo-900/40 p-3 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-semibold mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Applications</span>
            </div>
            <div className="text-xl font-black text-white">{applications.length}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{shortlistedCount} Shortlisted</div>
          </div>

          <div className="bg-slate-900/60 border border-indigo-900/40 p-3 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-semibold mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Avg Match Rate</span>
            </div>
            <div className="text-xl font-black text-emerald-400">{avgOverallScore}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">ATS Fit Average</div>
          </div>
        </div>
      </div>

      {/* Main Software Owner Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Platform Analytics', icon: BarChart3 },
          { id: 'companies', label: `Companies & HR (${companies.length})`, icon: Building2 },
          { id: 'candidates', label: `Candidates Pool (${candidates.length})`, icon: Users },
          { id: 'jobs', label: `Platform Jobs (${jobs.length})`, icon: Briefcase },
          { id: 'engine', label: 'ATS Scoring Engine', icon: SlidersHorizontal },
          { id: 'taxonomy', label: `Skill Taxonomy (${knownSkills.length})`, icon: Database },
          { id: 'courses', label: `Course Catalog (${courses.length})`, icon: BookOpen },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System Architecture & Transparency Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Explainable ATS Scoring Architecture</h3>
                    <p className="text-xs text-slate-500">Mathematical transparency vs. opaque black-box screening</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  Zero Hallucination
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <div className="text-indigo-600 font-bold text-xs mb-1">1. Skill Match Weight</div>
                  <div className="text-2xl font-black text-slate-900">{safeWeights.skillMatch}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Direct token & transitive ontology graph matches.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <div className="text-indigo-600 font-bold text-xs mb-1">2. Experience & Degree</div>
                  <div className="text-2xl font-black text-slate-900">{safeWeights.experience + safeWeights.education}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Experience ({safeWeights.experience}%) + Degree ({safeWeights.education}%).
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <div className="text-indigo-600 font-bold text-xs mb-1">3. Projects & Certs</div>
                  <div className="text-2xl font-black text-slate-900">
                    {safeWeights.projectQuality + safeWeights.certification}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Project Quality ({safeWeights.projectQuality}%) + Certs ({safeWeights.certification}%).
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed">
                <strong className="text-indigo-950 font-bold">Software Owner Note:</strong> As platform administrator, you define the core screening weights that all companies adopt by default. Each company can review candidate rankings generated by your rule-based engine, ensuring completely bias-free screening.
              </div>
            </div>

            {/* Quick Actions & Recent Platform Stats */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Platform Operations</span>
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setIsAddCompanyOpen(true)}
                  className="w-full text-left bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-200 p-3.5 rounded-2xl transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-950">Add Company Tenant</div>
                      <div className="text-[10px] text-slate-400">Register new employer organization</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>

                <button
                  onClick={() => setActiveTab('engine')}
                  className="w-full text-left bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-200 p-3.5 rounded-2xl transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-purple-950">Tune Scoring Algorithm</div>
                      <div className="text-[10px] text-slate-400">Calibrate mathematical weights & bounds</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                </button>

                <button
                  onClick={() => setActiveTab('taxonomy')}
                  className="w-full text-left bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-200 p-3.5 rounded-2xl transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <Network className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">Manage Skill Graph</div>
                      <div className="text-[10px] text-slate-400">{relationships.length} active ontological mappings</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <button
                  onClick={() => setActiveTab('candidates')}
                  className="w-full text-left bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-200 p-3.5 rounded-2xl transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-950">Global Talent Directory</div>
                      <div className="text-[10px] text-slate-400">Search {candidates.length} candidate profiles</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>
              </div>
            </div>

          </div>

          {/* Recent Applications Across All Companies */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Platform Activity & Screening Feed</h3>
                <p className="text-xs text-slate-500">Live applications processed across all onboarded employers</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {applications.length} Total Applications
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No job applications submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider pb-2">
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Company & Job Opening</th>
                      <th className="py-2.5 px-3">ATS Overall Score</th>
                      <th className="py-2.5 px-3">Skill Breakdown</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {applications.slice(0, 8).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{app.candidateName}</div>
                          <div className="text-[10px] text-slate-400">{app.candidateEmail}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{app.jobTitle}</div>
                          <div className="text-[10px] text-slate-400">{app.companyName}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <span className={`font-black text-sm ${
                              (app.scoreBreakdown?.overallScore || 0) >= safeThresholds.strong
                                ? 'text-emerald-600'
                                : (app.scoreBreakdown?.overallScore || 0) >= safeThresholds.moderate
                                ? 'text-indigo-600'
                                : 'text-amber-600'
                            }`}>
                              {app.scoreBreakdown?.overallScore ?? 0}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({app.scoreBreakdown?.classification || 'Match'})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[11px] text-slate-600">
                            <span className="text-emerald-600 font-semibold">
                              {app.scoreBreakdown?.exactMatchedSkills?.length || 0} exact
                            </span>
                            {(app.scoreBreakdown?.relatedMatchedSkills?.length || 0) > 0 && (
                              <span className="text-indigo-600 font-semibold ml-1.5">
                                + {app.scoreBreakdown.relatedMatchedSkills.length} implicit
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'Shortlisted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : app.status === 'Screened'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : app.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-[11px] text-slate-400">
                          {app.appliedDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Data Storage & LocalStorage Persistence Architecture */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-50 p-2.5 rounded-2xl text-emerald-600">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">Data Storage & Persistence Architecture</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                      30-Day Active Retention
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Full-stack disk persistence (`data/ats_storage.json`) + Client LocalStorage cache</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onOpenStorageExplorer && (
                  <button
                    onClick={onOpenStorageExplorer}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Inspect 30-Day Stored Database</span>
                  </button>
                )}
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1.5 w-fit">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Server Disk Synced (1 Month)</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-bold">Storage Location:</strong> All data is permanently persisted on the <strong className="text-indigo-600 font-mono">Server Disk (`data/ats_storage.json`)</strong> with client-side HTML5 LocalStorage sync. This ensures registered accounts (such as <strong className="text-slate-900 font-mono">aryanmsharma23@gmail.com</strong>), uploaded resumes, ATS scores, evaluated applications, and taxonomy rules remain intact for <strong className="text-emerald-700 font-semibold">1 month (30 days)</strong> across browser reboots, tab closures, and sandbox reloads.
            </div>

            {/* Storage Keys & Live Counts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {[
                { key: 'ats_users', label: 'User Accounts & Credentials', count: `${users.length} Users`, desc: 'Admin, Company/HR & Candidate accounts' },
                { key: 'ats_companies', label: 'Company Tenants', count: `${companies.length} Companies`, desc: 'Multi-tenant employer profiles & subscriptions' },
                { key: 'ats_jobs', label: 'Job Postings', count: `${jobs.length} Postings`, desc: 'Requirements, min degree, and skill criteria' },
                { key: 'ats_candidates', label: 'Candidate Profiles & Resumes', count: `${candidates.length} Profiles`, desc: 'Extracted skills, experience & education' },
                { key: 'ats_applications', label: 'Job Applications & ATS Scores', count: `${applications.length} Records`, desc: 'Transparent breakdown scores & status' },
                { key: 'ats_skills_v4', label: 'Skill Taxonomy Dictionary', count: `${knownSkills.length} Skills`, desc: 'Categorized technology taxonomy & aliases' },
                { key: 'ats_relationships_v4', label: 'Transitive Skill Ontology Map', count: `${relationships.length} Mappings`, desc: 'Implicit skill deduction rules (e.g. Flask -> Python)' },
                { key: 'ats_weights', label: 'Scoring Algorithm Weights', count: `${safeWeights.skillMatch + safeWeights.projectQuality + safeWeights.experience + safeWeights.education + safeWeights.certification}% Sum`, desc: 'Skill, Project, Exp, Degree & Cert weights' },
                { key: 'ats_audit_logs', label: 'Audit Trail Records', count: `${auditLogs.length} Events`, desc: 'Timestamped system governance log history' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-3.5 rounded-2xl hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {item.key}
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {item.count}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-2">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANIES & HR TENANTS */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Onboarded Companies & Organizations</h2>
              <p className="text-xs text-slate-500">Multi-tenant employer management across the platform</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setIsAddCompanyOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Company</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((comp) => {
              const compJobs = (jobs || []).filter(j => j.companyName === comp.name);
              const compRecruiters = (users || []).filter(u => u && u.role === 'RECRUITER' && u.companyName === comp.name);
              const compApps = (applications || []).filter(a => a.companyName === comp.name);

              return (
                <div key={comp.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        comp.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {comp.status}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {comp.plan} Plan
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900">{comp.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{comp.industry}</p>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Primary Contact:</span>
                        <span className="font-medium text-slate-700">{comp.contactEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">HR Recruiters:</span>
                        <span className="font-bold text-slate-900">{compRecruiters.length} Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Job Postings:</span>
                        <span className="font-bold text-indigo-600">{compJobs.length} Jobs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Applicants Screened:</span>
                        <span className="font-bold text-emerald-600">{compApps.length}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                        <span>Joined:</span>
                        <span>{comp.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleCompanyStatus(comp.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                        comp.status === 'Active'
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {comp.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>

                    <button
                      onClick={() => onDeleteCompany(comp.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-all"
                      title="Delete company tenant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CANDIDATE TALENT DIRECTORY */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          <CandidateAccountsManager
            candidates={candidates || []}
            users={users || []}
            applications={applications || []}
            knownSkills={knownSkills || []}
            relationships={relationships || []}
            onUpdateCandidate={onUpdateCandidate}
            onDeleteCandidate={onDeleteCandidate}
            onAdminCreateCandidate={onAdminCreateCandidate}
          />
        </div>
      )}

      {/* TAB 4: PLATFORM JOB OPENINGS */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">All Company Job Postings</h2>
            <p className="text-xs text-slate-500">Cross-company directory of active career opportunities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(jobs || []).map((job) => {
              const jobApps = applications.filter(a => a.jobId === job.id);
              return (
                <div key={job.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {job.companyName}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{job.title}</h3>
                      <p className="text-xs text-slate-500">{job.department} • {job.location} • {job.jobType}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {jobApps.length} Applicants
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.descriptionText}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Required Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.requiredSkills || []).map((s, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Min Exp: <strong className="text-slate-700">{job.minExperienceYears} Years</strong></span>
                    <span>Min Degree: <strong className="text-slate-700">{job.minEducationDegree}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ATS SCORING ENGINE & WEIGHTS */}
      {activeTab === 'engine' && (
        <div className="space-y-6">
          <div className="bg-purple-950/20 border border-purple-200 p-4 rounded-2xl flex items-center space-x-3 text-purple-950">
            <SlidersHorizontal className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div className="text-xs leading-relaxed">
              <strong>Root Algorithm Control:</strong> Modifying these weights recalibrates the core scoring engine across all applicant evaluations, ensuring mathematical fairness and audit compliance.
            </div>
          </div>

          <AdminPanel
            weights={safeWeights}
            onUpdateWeights={onUpdateWeights}
            thresholds={safeThresholds}
            onUpdateThresholds={onUpdateThresholds}
            skills={knownSkills}
            onAddSkill={onAddSkill}
            onDeleteSkill={onDeleteSkill}
            relationships={relationships}
            onAddRelationship={onAddRelationship}
            onDeleteRelationship={onDeleteRelationship}
            projectRules={projectRules}
            onUpdateProjectRule={onUpdateProjectRule}
            courses={courses}
            onAddCourse={onAddCourse}
            auditLogs={auditLogs}
            initialTab="weights"
          />
        </div>
      )}

      {/* TAB 6: SKILL TAXONOMY & RELATIONSHIPS */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-6">
          <AdminPanel
            weights={safeWeights}
            onUpdateWeights={onUpdateWeights}
            thresholds={safeThresholds}
            onUpdateThresholds={onUpdateThresholds}
            skills={knownSkills}
            onAddSkill={onAddSkill}
            onDeleteSkill={onDeleteSkill}
            relationships={relationships}
            onAddRelationship={onAddRelationship}
            onDeleteRelationship={onDeleteRelationship}
            projectRules={projectRules}
            onUpdateProjectRule={onUpdateProjectRule}
            courses={courses}
            onAddCourse={onAddCourse}
            auditLogs={auditLogs}
            initialTab="skills"
          />
        </div>
      )}

      {/* TAB 7: COURSE CATALOG */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <AdminPanel
            weights={safeWeights}
            onUpdateWeights={onUpdateWeights}
            thresholds={safeThresholds}
            onUpdateThresholds={onUpdateThresholds}
            skills={knownSkills}
            onAddSkill={onAddSkill}
            onDeleteSkill={onDeleteSkill}
            relationships={relationships}
            onAddRelationship={onAddRelationship}
            onDeleteRelationship={onDeleteRelationship}
            projectRules={projectRules}
            onUpdateProjectRule={onUpdateProjectRule}
            courses={courses}
            onAddCourse={onAddCourse}
            auditLogs={auditLogs}
            initialTab="courses"
          />
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <AdminPanel
            weights={safeWeights}
            onUpdateWeights={onUpdateWeights}
            thresholds={safeThresholds}
            onUpdateThresholds={onUpdateThresholds}
            skills={knownSkills}
            onAddSkill={onAddSkill}
            onDeleteSkill={onDeleteSkill}
            relationships={relationships}
            onAddRelationship={onAddRelationship}
            onDeleteRelationship={onDeleteRelationship}
            projectRules={projectRules}
            onUpdateProjectRule={onUpdateProjectRule}
            courses={courses}
            onAddCourse={onAddCourse}
            auditLogs={auditLogs}
            initialTab="logs"
          />
        </div>
      )}

      {/* MODAL: ONBOARD NEW COMPANY */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Onboard Company & HR Account</h3>
                  <p className="text-xs text-slate-500">Register employer tenant on the software</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCompanyOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Apex Innovations"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    required
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    placeholder="e.g. FinTech & AI"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
                  <select
                    value={newCompanyPlan}
                    onChange={(e) => setNewCompanyPlan(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Enterprise">Enterprise (50 jobs)</option>
                    <option value="Professional">Professional (20 jobs)</option>
                    <option value="Startup">Startup (5 jobs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  value={newCompanyWebsite}
                  onChange={(e) => setNewCompanyWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900 mb-2">Initial HR Recruiter Account</div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Recruiter Name</label>
                    <input
                      type="text"
                      required
                      value={newRecruiterName}
                      onChange={(e) => setNewRecruiterName(e.target.value)}
                      placeholder="e.g. Rachel Adams"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Recruiter Email</label>
                      <input
                        type="email"
                        required
                        value={newRecruiterEmail}
                        onChange={(e) => setNewRecruiterEmail(e.target.value)}
                        placeholder="rachel@apex.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Initial Password</label>
                      <input
                        type="text"
                        required
                        value={newRecruiterPassword}
                        onChange={(e) => setNewRecruiterPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
