import React, { useState } from 'react';
import { 
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
  User,
  ATSScoreBreakdown
} from '../types';
import { generateRecruiterRankingReportPDF, generateCandidateReportPDF } from '../services/reportGenerator';
import { ExplainabilityModal } from './ExplainabilityModal';
import { JobFormModal } from './JobFormModal';
import { AdminPanel } from './AdminPanel';
import { CandidateAccountsManager } from './CandidateAccountsManager';
import { 
  Briefcase, 
  Users, 
  Plus, 
  Download, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  SlidersHorizontal,
  Edit2,
  Trash2,
  Building2,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  UserCheck,
  Contact
} from 'lucide-react';

interface RecruiterDashboardProps {
  currentUser: User;
  jobs: JobDescription[];
  applications: JobApplication[];
  candidates: CandidateProfile[];
  users: User[];
  knownSkills: Skill[];
  relationships: SkillRelationship[];
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  projectRules: ProjectQualityRule[];
  courses: Course[];
  auditLogs: AuditLog[];
  onSaveJob: (job: JobDescription) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateApplicationStatus: (appId: string, status: 'Screened' | 'Shortlisted' | 'Under Review' | 'Rejected' | 'Re-applied / Updated') => void;
  onUpdateCandidate: (updated: CandidateProfile) => void;
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
  onAddSkill: (skill: Skill) => void;
  onDeleteSkill: (skillId: string) => void;
  onAddRelationship: (rel: SkillRelationship) => void;
  onDeleteRelationship: (relId: string) => void;
  onUpdateWeights: (w: ScoringWeights) => void;
  onUpdateThresholds: (t: ScoringThresholds) => void;
  onUpdateProjectRule: (ruleId: string, points: number) => void;
  onAddCourse: (c: Course) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  currentUser,
  jobs,
  applications,
  candidates,
  users,
  knownSkills,
  relationships,
  weights,
  thresholds,
  projectRules,
  courses,
  auditLogs,
  onSaveJob,
  onDeleteJob,
  onUpdateApplicationStatus,
  onUpdateCandidate,
  onDeleteCandidate,
  onAdminCreateCandidate,
  onAddSkill,
  onDeleteSkill,
  onAddRelationship,
  onDeleteRelationship,
  onUpdateWeights,
  onUpdateThresholds,
  onUpdateProjectRule,
  onAddCourse
}) => {
  const [activeTab, setActiveTab] = useState<'applicants' | 'candidates' | 'settings'>('applicants');
  
  // Filter jobs to those posted by this company/recruiter
  const myJobs = jobs.filter(
    j => j.recruiterId === currentUser.id || (currentUser.companyName && j.companyName.toLowerCase() === currentUser.companyName.toLowerCase())
  );
  const [selectedJobId, setSelectedJobId] = useState<string>(myJobs[0]?.id || '');

  // Keep selectedJobId in sync with myJobs
  const activeJob = myJobs.find(j => j.id === selectedJobId) || myJobs[0];

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal state for inspecting candidate explainability
  const [inspectModalData, setInspectModalData] = useState<{
    candidate: CandidateProfile;
    breakdown: ATSScoreBreakdown;
  } | null>(null);

  // Applications for this company's jobs
  const myApplications = applications.filter(
    a => a.recruiterId === currentUser.id || (currentUser.companyName && a.companyName.toLowerCase() === currentUser.companyName.toLowerCase())
  );

  // Applications for the currently active job, ranked by overall ATS score
  const jobApplications = activeJob
    ? applications
        .filter(a => a.jobId === activeJob.id)
        .sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore)
    : [];

  const handleOpenNewJobModal = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleOpenEditJobModal = () => {
    if (!activeJob) return;
    setEditingJob(activeJob);
    setIsJobModalOpen(true);
  };

  const handleDeleteActiveJob = () => {
    if (!activeJob) return;
    if (confirm(`Are you sure you want to delete the job posting "${activeJob.title}"?`)) {
      onDeleteJob(activeJob.id);
      setToastMessage(`Job "${activeJob.title}" has been deleted.`);
      setTimeout(() => setToastMessage(null), 3500);
      const remaining = myJobs.filter(j => j.id !== activeJob.id);
      if (remaining.length > 0) {
        setSelectedJobId(remaining[0].id);
      } else {
        setSelectedJobId('');
      }
    }
  };

  const handleExportRankingPDF = () => {
    if (!activeJob || jobApplications.length === 0) return;

    const rankedItems = jobApplications.map((app, index) => {
      // Find candidate profile or create from snapshot
      const cand = candidates.find(c => c.id === app.candidateId) || 
        app.candidateProfileSnapshot || {
          id: app.candidateId,
          userId: app.candidateUserId,
          fullName: app.candidateName,
          email: app.candidateEmail,
          phone: app.candidatePhone || 'N/A',
          location: 'N/A',
          summary: '',
          extractedSkills: app.scoreBreakdown.exactMatchedSkills,
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          totalExpYears: app.candidateExpYears || 0,
          highestDegree: app.candidateDegree || 'N/A',
          updatedAt: app.appliedDate
        };

      return {
        candidate: cand,
        breakdown: app.scoreBreakdown,
        rank: index + 1
      };
    });

    generateRecruiterRankingReportPDF(activeJob, rankedItems);
  };

  const handleExportCandidatePDF = (app: JobApplication) => {
    if (!activeJob) return;
    const cand = candidates.find(c => c.id === app.candidateId) || 
      app.candidateProfileSnapshot || {
        id: app.candidateId,
        userId: app.candidateUserId,
        fullName: app.candidateName,
        email: app.candidateEmail,
        phone: app.candidatePhone || 'N/A',
        location: 'N/A',
        summary: '',
        extractedSkills: app.scoreBreakdown.exactMatchedSkills,
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        totalExpYears: app.candidateExpYears || 0,
        highestDegree: app.candidateDegree || 'N/A',
        updatedAt: app.appliedDate
      };

    generateCandidateReportPDF(cand, activeJob, app.scoreBreakdown);
  };

  const handleInspectApplicant = (app: JobApplication) => {
    const cand = candidates.find(c => c.id === app.candidateId) || 
      app.candidateProfileSnapshot || {
        id: app.candidateId,
        userId: app.candidateUserId,
        fullName: app.candidateName,
        email: app.candidateEmail,
        phone: app.candidatePhone || 'N/A',
        location: 'N/A',
        summary: '',
        extractedSkills: app.scoreBreakdown.exactMatchedSkills,
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        totalExpYears: app.candidateExpYears || 0,
        highestDegree: app.candidateDegree || 'N/A',
        updatedAt: app.appliedDate
      };

    setInspectModalData({
      candidate: cand,
      breakdown: app.scoreBreakdown
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300 font-bold';
      case 'Re-applied / Updated':
        return 'bg-purple-500/15 text-purple-700 border-purple-300 font-bold';
      case 'Under Review':
        return 'bg-amber-500/15 text-amber-700 border-amber-300 font-bold';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-700 border-rose-300 font-bold';
      default:
        return 'bg-blue-500/15 text-blue-700 border-blue-300 font-bold';
    }
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'Excellent Match': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Strong Match': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Good Match': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Moderate Match': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-fade-in">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-100 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Top Company Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Company Recruitment Portal • {currentUser.companyName || 'Employer Dashboard'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your company's job postings and screen applicants with transparent, rule-based ATS ranking.
          </p>
        </div>

        <button
          onClick={handleOpenNewJobModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Description</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">My Jobs Posted</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myJobs.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Active listings</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Total Applicants</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myApplications.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Across all your jobs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Shortlisted</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {myApplications.filter(a => a.status === 'Shortlisted').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Top qualified candidates</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Under Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {myApplications.filter(a => a.status === 'Under Review').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Pending decisions</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'applicants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Job Openings & Applicant Ranking</span>
          {myApplications.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {myApplications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'candidates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Contact className="w-4 h-4" />
          <span>Candidate Accounts & Stored Profiles</span>
          <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {users.filter(u => u.role === 'CANDIDATE').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>HR Skill Engine & Settings</span>
        </button>
      </div>

      {/* TAB 1: APPLICANTS & RANKING */}
      {activeTab === 'applicants' && (
        <div className="space-y-6">
          
          {myJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Jobs Posted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Post your company's first job description to start receiving applicants and viewing transparent, explainable ATS rankings.
              </p>
              <button
                onClick={handleOpenNewJobModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-colors inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Post Your First Job Description</span>
              </button>
            </div>
          ) : (
            <>
              {/* Job Selector & Actions Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Job:</label>
                    <select
                      value={activeJob?.id || ''}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-xs sm:max-w-sm"
                    >
                      {myJobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({applications.filter(a => a.jobId === j.id).length} applicants)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleOpenEditJobModal}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-1 transition-colors"
                      title="Edit this job"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDeleteActiveJob}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-200 flex items-center space-x-1 transition-colors"
                      title="Delete this job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Job Metadata Summary */}
                {activeJob && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900">{activeJob.title}</span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {activeJob.department}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{activeJob.location}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">
                        Min Experience: <strong className="text-slate-700">{activeJob.minExperienceYears} Yrs</strong> | Min Education: <strong className="text-slate-700">{activeJob.minEducationDegree}</strong>
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Required Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeJob.requiredSkills.map((sk) => (
                          <span key={sk} className="bg-white border border-slate-300 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Applicant Ranking Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                      <span>Candidate Screening & Ranking Table</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
                        {jobApplications.length} applied
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Candidates who applied to this job, ranked by transparent ATS score. Inferred skills via relationship mapping are explicitly indicated.
                    </p>
                  </div>

                  {jobApplications.length > 0 && (
                    <button
                      onClick={handleExportRankingPDF}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export Ranking PDF</span>
                    </button>
                  )}
                </div>

                {jobApplications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">No Candidates Have Applied Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      When candidates register, upload their resumes, and apply to <strong>{activeJob?.title}</strong>, their evaluated scores and audit trails will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3.5 px-4">Rank</th>
                          <th className="py-3.5 px-4">Candidate</th>
                          <th className="py-3.5 px-4 text-center">ATS Score</th>
                          <th className="py-3.5 px-4">Matched Skills (Exact & Inferred)</th>
                          <th className="py-3.5 px-4">Missing Skills</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {jobApplications.map((app, index) => {
                          const score = app.scoreBreakdown;
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Rank */}
                              <td className="py-4 px-4 font-black text-slate-900 text-sm">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${
                                  index === 0 
                                    ? 'bg-amber-100 text-amber-800 font-black' 
                                    : index === 1 
                                    ? 'bg-slate-200 text-slate-800' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  #{index + 1}
                                </span>
                              </td>

                              {/* Candidate Info */}
                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-900 text-sm">{app.candidateName}</div>
                                <div className="text-slate-500 text-[11px]">{app.candidateEmail}</div>
                                <div className="text-slate-400 text-[10px] mt-0.5">
                                  {app.candidateDegree || 'N/A'} • {app.candidateExpYears || 0} Yrs Exp
                                </div>
                              </td>

                              {/* Overall Score */}
                              <td className="py-4 px-4 text-center">
                                <div className="text-base font-black text-slate-900">
                                  {score.overallScore}%
                                </div>
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${getClassificationBadge(score.classification)}`}>
                                  {score.classification}
                                </span>
                              </td>

                              {/* Matched Skills & Related Inferences */}
                              <td className="py-4 px-4 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {/* Exact matches */}
                                  {score.exactMatchedSkills.map((sk) => (
                                    <span key={sk} className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>{sk}</span>
                                    </span>
                                  ))}

                                  {/* Related matches */}
                                  {score.relatedMatchedSkills.map((rel) => (
                                    <span 
                                      key={rel.requiredSkill}
                                      className="bg-purple-50 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1"
                                      title={rel.explanation}
                                    >
                                      <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                                      <span>{rel.requiredSkill} (via {rel.candidateSkill})</span>
                                    </span>
                                  ))}

                                  {score.exactMatchedSkills.length === 0 && score.relatedMatchedSkills.length === 0 && (
                                    <span className="text-slate-400 text-[11px]">None detected</span>
                                  )}
                                </div>
                              </td>

                              {/* Missing Skills */}
                              <td className="py-4 px-4 max-w-[180px]">
                                <div className="flex flex-wrap gap-1">
                                  {score.missingSkills.map((sk) => (
                                    <span key={sk} className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                                      <XCircle className="w-2.5 h-2.5 text-rose-500" />
                                      <span>{sk}</span>
                                    </span>
                                  ))}
                                  {score.missingSkills.length === 0 && (
                                    <span className="text-emerald-600 font-bold text-[11px]">None (Full skill match!)</span>
                                  )}
                                </div>
                              </td>

                              {/* Status Dropdown */}
                              <td className="py-4 px-4 text-center">
                                <select
                                  value={app.status}
                                  onChange={(e) => onUpdateApplicationStatus(app.id, e.target.value as any)}
                                  className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${getStatusBadge(app.status)}`}
                                >
                                  <option value="Screened">Screened</option>
                                  <option value="Re-applied / Updated">Re-applied / Updated</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Under Review">Under Review</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => handleInspectApplicant(app)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 transition-colors inline-flex items-center space-x-1"
                                  title="Inspect mathematical breakdown & audit trail"
                                >
                                  <HelpCircle className="w-3 h-3 text-blue-600" />
                                  <span>Audit</span>
                                </button>
                                <button
                                  onClick={() => handleExportCandidatePDF(app)}
                                  className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1"
                                  title="Download candidate report PDF"
                                >
                                  <Download className="w-3 h-3 text-emerald-400" />
                                  <span>PDF</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      )}

      {/* TAB 2: CANDIDATE ACCOUNTS & STORED PROFILES */}
      {activeTab === 'candidates' && (
        <CandidateAccountsManager
          users={users}
          candidates={candidates}
          applications={applications}
          knownSkills={knownSkills}
          relationships={relationships}
          onUpdateCandidate={onUpdateCandidate}
          onDeleteCandidate={onDeleteCandidate}
          onAdminCreateCandidate={onAdminCreateCandidate}
        />
      )}

      {/* TAB 3: HR SETTINGS (SKILL TAXONOMY, RELATIONSHIP MAP, WEIGHTS) */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-blue-950">Company / HR Skill Engine Control</h3>
              <p className="text-xs text-blue-700 mt-0.5">
                Manage the rule-based Skill Taxonomy and Skill-Relationship Maps (e.g. Flask $\to$ Python). Candidates never see or modify this configuration.
              </p>
            </div>
            <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              HR Protected
            </span>
          </div>

          <AdminPanel
            weights={weights}
            onUpdateWeights={onUpdateWeights}
            thresholds={thresholds}
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
          />
        </div>
      )}

      {/* Post/Edit Job Modal */}
      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        knownSkills={knownSkills}
        onSaveJob={onSaveJob}
        existingJob={editingJob}
        recruiterId={currentUser.id}
        defaultCompanyName={currentUser.companyName || 'My Company'}
      />

      {/* Explainability / Audit Trail Modal */}
      {inspectModalData && (
        <ExplainabilityModal
          isOpen={true}
          onClose={() => setInspectModalData(null)}
          breakdown={inspectModalData.breakdown}
          candidate={inspectModalData.candidate}
          job={activeJob!}
        />
      )}

    </div>
  );
};
