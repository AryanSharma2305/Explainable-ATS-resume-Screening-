import React, { useState, useMemo } from 'react';
import { 
  CandidateProfile, 
  JobDescription, 
  JobApplication,
  Skill, 
  SkillRelationship, 
  ScoringWeights, 
  ScoringThresholds, 
  Course, 
  ProjectQualityRule, 
  User,
  ATSScoreBreakdown 
} from '../types';
import { calculateATSScore, getTransitiveInferredSkills } from '../services/ruleEngine';
import { generateCandidateReportPDF } from '../services/reportGenerator';
import { getRecommendedCoursesForGaps } from '../services/courseService';
import { ExplainabilityModal } from './ExplainabilityModal';
import { ResumeUploadModal } from './ResumeUploadModal';
import { CandidateLearningHub } from './CandidateLearningHub';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Download, 
  BookOpen, 
  Briefcase, 
  Edit3, 
  ChevronRight, 
  ArrowUpRight,
  GraduationCap,
  Layers,
  Search,
  Check,
  Send,
  ExternalLink,
  Award,
  AlertCircle,
  Network,
  Plus
} from 'lucide-react';
import { parseResumeTextRuleBased } from '../services/pdfParser';

interface CandidateDashboardProps {
  currentUser: User;
  candidate: CandidateProfile;
  jobs: JobDescription[];
  applications: JobApplication[];
  knownSkills: Skill[];
  relationships: SkillRelationship[];
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  courses: Course[];
  projectRules: ProjectQualityRule[];
  onUpdateCandidate: (updated: CandidateProfile) => void;
  onApplyJob: (application: JobApplication) => void;
  onReapplyJob: (application: JobApplication) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  currentUser,
  candidate,
  jobs,
  applications,
  knownSkills,
  relationships,
  weights,
  thresholds,
  courses,
  projectRules,
  onUpdateCandidate,
  onApplyJob,
  onReapplyJob
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'browse' | 'courses' | 'profile'>('applications');
  
  // Applications submitted by this candidate
  const myApplications = applications.filter(a => a.candidateUserId === currentUser.id);

  // Selected application to inspect
  const [selectedAppId, setSelectedAppId] = useState<string>(myApplications[0]?.id || '');
  const activeApp = myApplications.find(a => a.id === selectedAppId) || myApplications[0];

  // Modals state
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickResumeText, setQuickResumeText] = useState('');

  // Transitive one-way inferred skills based on candidate's extracted skills
  const inferredSkills = useMemo(() => {
    return getTransitiveInferredSkills(candidate.extractedSkills || [], relationships);
  }, [candidate.extractedSkills, relationships]);

  const handleAddLearnedSkill = (skillName: string) => {
    const existing = (candidate.extractedSkills || []).some(
      s => s.toLowerCase() === skillName.toLowerCase()
    );
    if (existing) {
      setToastMessage(`"${skillName}" is already in your profile skills!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const updatedSkills = [...(candidate.extractedSkills || []), skillName];
    const updatedCandidate: CandidateProfile = {
      ...candidate,
      extractedSkills: updatedSkills,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateCandidate(updatedCandidate);
    setToastMessage(`✓ Added "${skillName}" to your skills! Re-apply to your applications to recalculate your ATS score.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleQuickScan = () => {
    if (!quickResumeText.trim()) return;
    const parsed = parseResumeTextRuleBased(quickResumeText, knownSkills);
    const updated: CandidateProfile = {
      ...candidate,
      extractedSkills: parsed.extractedSkills,
      rawResumeText: quickResumeText,
      totalExpYears: parsed.totalExpYears > 0 ? parsed.totalExpYears : candidate.totalExpYears,
      highestDegree: parsed.highestDegree !== 'Not detected' ? parsed.highestDegree : candidate.highestDegree,
      education: parsed.education.length > 0 ? parsed.education : candidate.education,
      projects: parsed.projects.length > 0 ? parsed.projects : candidate.projects,
      experience: parsed.experience.length > 0 ? parsed.experience : candidate.experience,
      certifications: parsed.certifications.length > 0 ? parsed.certifications : candidate.certifications,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateCandidate(updated);
    setQuickResumeText('');
    setToastMessage(`Rule extraction complete: ${parsed.extractedSkills.length} skills detected and saved to profile!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Calculate ATS Score for active app or preview
  const activeAppJob = activeApp ? jobs.find(j => j.id === activeApp.jobId) : null;
  const currentBreakdown: ATSScoreBreakdown | null = activeApp ? activeApp.scoreBreakdown : null;

  // Fully resolved recommended courses for active application's missing skills
  const missingSkillCourseGroups = useMemo(() => {
    if (!currentBreakdown || !currentBreakdown.missingSkills || currentBreakdown.missingSkills.length === 0) {
      return [];
    }
    return getRecommendedCoursesForGaps(currentBreakdown.missingSkills, courses);
  }, [currentBreakdown, courses]);

  // Recommended courses for active application's missing skills (legacy flat array)
  const recommendedCourses = currentBreakdown
    ? courses.filter(c => 
        currentBreakdown.missingSkills.some(ms => ms.toLowerCase() === c.skillName.toLowerCase())
      )
    : [];

  // Job recommendations sorted by ATS Score
  const jobRecommendations = jobs.map((job) => {
    const score = calculateATSScore(candidate, job, relationships, weights, thresholds, projectRules);
    return { job, score };
  }).sort((a, b) => b.score.overallScore - a.score.overallScore);

  const handleApplyToJob = (job: JobDescription) => {
    // 1. Guard check: Must have extracted skills!
    if (!candidate.extractedSkills || candidate.extractedSkills.length === 0) {
      setToastMessage('Please upload your resume first');
      setIsResumeModalOpen(true);
      return;
    }

    // Check if already applied -> route to reapply flow
    const existing = myApplications.find(a => a.jobId === job.id);
    if (existing) {
      handleReapplyToJob(job, existing);
      return;
    }

    // Run transparent ATS screening engine with candidate's saved extracted skills
    const breakdown = calculateATSScore(
      candidate,
      job,
      relationships,
      weights,
      thresholds,
      projectRules
    );

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      recruiterId: job.recruiterId,
      candidateId: candidate.id,
      candidateUserId: currentUser.id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      candidateDegree: candidate.highestDegree,
      candidateExpYears: candidate.totalExpYears,
      status: 'Screened',
      appliedDate: new Date().toISOString().split('T')[0],
      scoreBreakdown: breakdown,
      candidateProfileSnapshot: candidate
    };

    onApplyJob(newApp);
    setSelectedAppId(newApp.id);
    setActiveTab('applications');
    setToastMessage(`Applied to ${job.title} at ${job.companyName}! Your ATS match score is ${breakdown.overallScore}%.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReapplyToJob = (job: JobDescription, existingApp?: JobApplication) => {
    const targetApp = existingApp || myApplications.find(a => a.jobId === job.id);
    if (!targetApp) return;

    // Guard check: Must have extracted skills!
    if (!candidate.extractedSkills || candidate.extractedSkills.length === 0) {
      setToastMessage('Please upload your resume first');
      setIsResumeModalOpen(true);
      return;
    }

    // Recalculate score with candidate's latest saved skills
    const breakdown = calculateATSScore(
      candidate,
      job,
      relationships,
      weights,
      thresholds,
      projectRules
    );

    const updatedApp: JobApplication = {
      ...targetApp,
      status: 'Re-applied / Updated',
      scoreBreakdown: breakdown,
      candidateProfileSnapshot: candidate,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      candidateDegree: candidate.highestDegree,
      candidateExpYears: candidate.totalExpYears,
      appliedDate: new Date().toISOString().split('T')[0]
    };

    onReapplyJob(updatedApp);
    setSelectedAppId(updatedApp.id);
    setActiveTab('applications');
    setToastMessage(`Application updated with latest resume for ${job.title}! New ATS score: ${breakdown.overallScore}%.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleDownloadPDF = () => {
    if (!activeApp || !activeAppJob) return;
    generateCandidateReportPDF(candidate, activeAppJob, activeApp.scoreBreakdown);
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'Excellent Match': return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'Strong Match': return 'bg-teal-500/10 text-teal-700 border-teal-300';
      case 'Good Match': return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'Moderate Match': return 'bg-amber-500/10 text-amber-700 border-amber-300';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-emerald-500/15 text-emerald-800 border-emerald-400 font-extrabold';
      case 'Re-applied / Updated':
        return 'bg-purple-500/15 text-purple-800 border-purple-400 font-extrabold';
      case 'Under Review':
        return 'bg-amber-500/15 text-amber-800 border-amber-400 font-extrabold';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-800 border-rose-400 font-extrabold';
      default:
        return 'bg-blue-500/15 text-blue-800 border-blue-400 font-extrabold';
    }
  };

  const filteredJobs = jobs.filter(j => {
    const q = jobSearchQuery.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-fade-in">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-100 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Top Banner & Profile Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Candidate Career Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {candidate.fullName || currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Degree: <span className="font-semibold text-slate-700">{candidate.highestDegree || 'Not specified'}</span> | Total Experience: <span className="font-semibold text-slate-700">{candidate.totalExpYears} Years</span> | Detected Skills: <span className="font-semibold text-emerald-600">{candidate.extractedSkills.length}</span>
          </p>
        </div>

        <button
          onClick={() => setIsResumeModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow flex items-center justify-center space-x-1.5 transition-colors self-start md:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Upload / Parse Resume (PDF)</span>
        </button>
      </div>

      {/* Small visible check: Detected skills status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            {candidate.extractedSkills.length > 0 ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {candidate.extractedSkills.length > 0 ? 'Verified Resume Skills' : 'Resume Skills Pending'}
                </h4>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  candidate.extractedSkills.length > 0 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {candidate.extractedSkills.length} Detected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {candidate.extractedSkills.length > 0
                  ? 'Confirmed skills extracted from your resume. When you apply to jobs, these skills (plus inferred framework-to-base-language relationships) are used to calculate your ATS match score.'
                  : 'Please upload your resume first. The rule-based engine will extract your skills before you can apply to jobs.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 shrink-0 self-start sm:self-auto transition-colors shadow-2xs"
          >
            {candidate.extractedSkills.length > 0 ? 'Update Resume / Skills' : 'Upload Resume Now'}
          </button>
        </div>

        {candidate.extractedSkills.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Extracted Skills in Profile ({candidate.extractedSkills.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.extractedSkills.map(sk => (
                  <span
                    key={sk}
                    className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>

            {inferredSkills.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
                  <Network className="w-3 h-3 text-indigo-500" />
                  <span>Inferred via Relationship Map ({inferredSkills.length}):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inferredSkills.map(inf => (
                    <span
                      key={inf.skill}
                      className="bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center space-x-1 shadow-2xs"
                      title={inf.viaChain.length > 2 ? `Derived from ${inf.sourceSkill} (${inf.viaChain.join(' → ')})` : `Derived from ${inf.sourceSkill}`}
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span className="font-bold">{inf.skill}</span>
                      <span className="text-[10px] text-indigo-500 font-normal">
                        ({inf.viaChain.length > 2 ? inf.viaChain.join(' → ') : `via ${inf.sourceSkill}`})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'applications'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>My Applications & Results</span>
          {myApplications.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {myApplications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'browse'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse Open Jobs</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'courses'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Upskill Courses & Learning Hub</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Profile & Skills</span>
        </button>
      </div>

      {/* TAB 1: MY APPLICATIONS & EXPLAINABLE RESULTS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          
          {myApplications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Applications Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Browse our open job postings and submit your application with a single click. Our rule-based NLP engine will calculate your transparent ATS score and skill gaps in real time.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-colors inline-flex items-center space-x-1.5"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Available Jobs</span>
              </button>
            </div>
          ) : (
            <>
              {/* Application Selector */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Application:</label>
                  <select
                    value={activeApp?.id || ''}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none max-w-xs sm:max-w-md"
                  >
                    {myApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.jobTitle} ({app.companyName}) — {app.scoreBreakdown.overallScore}% ({app.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Employer Status:</span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border ${getStatusBadge(activeApp?.status || 'Screened')}`}>
                    {activeApp?.status}
                  </span>
                </div>
              </div>

              {activeApp && currentBreakdown && (
                <>
                  {/* Primary Score Overview Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    
                    {/* Overall Match Circle / Metric */}
                    <div className="flex items-center space-x-5 border-b md:border-b-0 md:border-r border-slate-700/80 pb-6 md:pb-0 md:pr-6">
                      <div className="relative w-24 h-24 rounded-full bg-slate-800 border-4 border-emerald-500 flex items-center justify-center shadow-lg shrink-0">
                        <span className="text-2xl font-black text-white">{currentBreakdown.overallScore}%</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                          ATS Match Result
                        </span>
                        <h2 className="text-lg font-bold text-white mt-0.5">{currentBreakdown.classification}</h2>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Role: <strong className="text-white">{activeApp.jobTitle}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Company: {activeApp.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown Metric Bars */}
                    <div className="space-y-2.5 md:col-span-1 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-slate-300">Skill Alignment (40%)</span>
                          <span className="text-emerald-400 font-bold">{currentBreakdown.skillScoreWeighted} / 40 pts</span>
                        </div>
                        <div className="w-full bg-slate-700/70 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(currentBreakdown.skillScoreWeighted / 40) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-slate-300">Work Experience (20%)</span>
                          <span className="text-blue-400 font-bold">{currentBreakdown.expScoreWeighted} / 20 pts</span>
                        </div>
                        <div className="w-full bg-slate-700/70 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(currentBreakdown.expScoreWeighted / 20) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-slate-300">Education Alignment (10%)</span>
                          <span className="text-indigo-400 font-bold">{currentBreakdown.eduScoreWeighted} / 10 pts</span>
                        </div>
                        <div className="w-full bg-slate-700/70 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${(currentBreakdown.eduScoreWeighted / 10) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-slate-300">Project Quality (20%)</span>
                          <span className="text-purple-400 font-bold">{currentBreakdown.projectScoreWeighted} / 20 pts</span>
                        </div>
                        <div className="w-full bg-slate-700/70 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${(currentBreakdown.projectScoreWeighted / 20) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Explanations & Action CTAs */}
                    <div className="flex flex-col space-y-2.5 md:pl-4">
                      <button
                        onClick={() => setIsExplainModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Explain How {currentBreakdown.overallScore}% Was Calculated</span>
                      </button>

                      <button
                        onClick={handleDownloadPDF}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs py-2 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Download Screening PDF Report</span>
                      </button>

                      {activeAppJob && (
                        <button
                          onClick={() => handleReapplyToJob(activeAppJob, activeApp)}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
                          title="Recalculate your ATS score with your latest saved resume skills"
                        >
                          <Sparkles className="w-4 h-4 text-purple-200" />
                          <span>Re-apply with Updated Resume</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Skills Alignment & Relationship Inference Section */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">Skill Alignment & Related-Skill Inferences</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          How candidate skills matched against required job skills using exact matching and rule-based ontology mappings.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Exact Matched Skills */}
                      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Exact Matched Skills ({currentBreakdown.exactMatchedSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentBreakdown.exactMatchedSkills.map((sk) => (
                            <span key={sk} className="bg-white border border-emerald-300 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                              {sk}
                            </span>
                          ))}
                          {currentBreakdown.exactMatchedSkills.length === 0 && (
                            <span className="text-slate-400 text-xs italic">No direct keyword matches</span>
                          )}
                        </div>
                      </div>

                      {/* Related Skill Inferences (CRITICAL RESEARCH HIGHLIGHT) */}
                      <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-xs font-bold text-purple-900 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span>Inferred Via Relationship Map ({currentBreakdown.relatedMatchedSkills.length})</span>
                        </div>
                        <div className="space-y-2">
                          {currentBreakdown.relatedMatchedSkills.map((rel) => (
                            <div key={rel.requiredSkill} className="bg-white border border-purple-200 p-2 rounded-lg text-xs">
                              <div className="flex items-center justify-between font-bold text-purple-950">
                                <span>{rel.requiredSkill}</span>
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                                  +{rel.creditEarnedPercentage}% Credit
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1 leading-tight">
                                Derived from candidate's <strong className="text-purple-700 font-semibold">{rel.candidateSkill}</strong> ({rel.relationshipType}).
                              </p>
                            </div>
                          ))}
                          {currentBreakdown.relatedMatchedSkills.length === 0 && (
                            <span className="text-slate-400 text-xs italic">No related skills inferred for this role</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills (Skill-Gap) */}
                      <div className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-xs font-bold text-rose-800 mb-2">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Missing Skills Gap ({currentBreakdown.missingSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentBreakdown.missingSkills.map((sk) => (
                            <span key={sk} className="bg-white border border-rose-300 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                              {sk}
                            </span>
                          ))}
                          {currentBreakdown.missingSkills.length === 0 && (
                            <span className="text-emerald-700 text-xs font-bold">100% skill requirements satisfied!</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Strict One-Way Transparency Banner */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold text-slate-800">Rule Engine Logic: </span>
                        Relationships are strictly one-way (<span className="font-semibold text-indigo-700">Framework/Tool → Base Skill</span>).
                        Listing a framework like <strong className="text-slate-800">Spring Boot</strong> automatically infers and credits <strong className="text-slate-800">Java</strong>.
                        However, knowing base <strong className="text-slate-800">Java</strong> does <em>not</em> imply you know <strong className="text-slate-800">Spring Boot</strong>.
                        If your resume mentions a framework, ensure it is listed in your profile to satisfy both requirements automatically!
                      </div>
                    </div>
                  </div>

                  {/* Recommended Courses to Close Skill Gap */}
                  {missingSkillCourseGroups.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">
                            <BookOpen className="w-4 h-4" />
                            <span>Actionable Career Growth</span>
                          </div>
                          <h3 className="font-bold text-base text-slate-900">
                            Recommended Courses to Bridge Missing Skill Gaps ({currentBreakdown.missingSkills.length})
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Learning these missing skills directly boosts your match percentage for <strong>{activeApp.jobTitle}</strong>.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('courses')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center space-x-1 self-start sm:self-auto"
                        >
                          <span>Full Learning Hub</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {missingSkillCourseGroups.map(({ skillName, courses: skillCourses }) => {
                          const isAcquired = (candidate.extractedSkills || []).some(
                            s => s.toLowerCase() === skillName.toLowerCase()
                          );

                          return (
                            <div key={skillName} className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-rose-100 text-rose-900 font-black text-xs px-2.5 py-1 rounded-lg border border-rose-200">
                                    Missing: {skillName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Required for {activeApp.jobTitle}
                                  </span>
                                </div>

                                {!isAcquired ? (
                                  <button
                                    onClick={() => handleAddLearnedSkill(skillName)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-colors flex items-center space-x-1 self-start sm:self-auto"
                                    title="Add this skill to your profile once learned"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>I Learned This (Add to Profile)</span>
                                  </button>
                                ) : (
                                  <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added to Profile! Re-apply above to increase score</span>
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {skillCourses.map(c => (
                                  <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-300 transition-colors shadow-2xs">
                                    <div>
                                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                          {c.provider}
                                        </span>
                                        <span>{c.duration} • {c.level}</span>
                                      </div>
                                      <h4 className="font-bold text-xs text-slate-900 mt-1">{c.title}</h4>
                                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                        {c.description}
                                      </p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                      <span className="text-[10px] text-slate-400">Verified Curriculum</span>
                                      <a
                                        href={c.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
                                      >
                                        <span>Start Learning</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommended Jobs */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span>Smart Matching</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-1">
                      Recommended Openings Based on Your Profile
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Other active openings where your current skills yield high match compatibility.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobRecommendations.filter(rec => rec.job.id !== activeApp.jobId).slice(0, 3).map(({ job, score }) => (
                        <div key={job.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-900">{job.title}</span>
                              <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
                                {score.overallScore}%
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">{job.companyName} • {job.location}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.requiredSkills.slice(0, 3).map((sk) => (
                                <span key={sk} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleApplyToJob(job)}
                            className="mt-3 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                          >
                            <span>Apply & Screen</span>
                            <ChevronRight className="w-3 h-3 text-emerald-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      )}

      {/* TAB 2: BROWSE OPEN JOBS */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or required skill (e.g. Python, MySQL)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredJobs.length} active positions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => {
              const application = myApplications.find(a => a.jobId === job.id);
              const previewScore = calculateATSScore(candidate, job, relationships, weights, thresholds, projectRules);

              return (
                <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{job.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {job.companyName} • {job.location} ({job.jobType})
                        </p>
                      </div>
                      {application ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 whitespace-nowrap">
                          Applied • {application.scoreBreakdown.overallScore}%
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                          Est. Match: {previewScore.overallScore}%
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 my-2">
                      {job.descriptionText}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-1 mb-3">
                      <div>Min Experience: <strong className="text-slate-700">{job.minExperienceYears} Years</strong></div>
                      <div>Min Education: <strong className="text-slate-700">{job.minEducationDegree}</strong></div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.map((sk) => {
                          const isMatched = candidate.extractedSkills.some(cs => cs.toLowerCase() === sk.toLowerCase());
                          return (
                            <span 
                              key={sk} 
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                isMatched 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {sk} {isMatched && '✓'}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skill Gap Course Hint */}
                    {previewScore.missingSkills.length > 0 && (
                      <div className="mt-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                        <span className="text-amber-900 font-semibold flex items-center space-x-1">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{previewScore.missingSkills.length} missing {previewScore.missingSkills.length === 1 ? 'skill' : 'skills'}: {previewScore.missingSkills.join(', ')}</span>
                        </span>
                        <button
                          onClick={() => setActiveTab('courses')}
                          className="text-emerald-700 hover:text-emerald-800 font-bold ml-2 underline shrink-0"
                        >
                          Find Courses →
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Posted on {job.createdAt}
                    </span>

                    {application ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAppId(application.id);
                            setActiveTab('applications');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1"
                        >
                          <span>View Results</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReapplyToJob(job, application)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-colors flex items-center space-x-1"
                          title="Recalculate ATS score using your latest saved resume skills"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Re-apply with Updated Resume</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyToJob(job)}
                        className={`${
                          candidate.extractedSkills.length === 0
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        } text-xs font-bold px-4 py-2 rounded-xl shadow transition-colors flex items-center space-x-1.5`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {candidate.extractedSkills.length === 0
                            ? 'Upload Resume to Apply'
                            : 'Apply & Calculate Score'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: UPSKILL COURSES & LEARNING HUB */}
      {activeTab === 'courses' && (
        <CandidateLearningHub
          candidate={candidate}
          jobs={jobs}
          courses={courses}
          knownSkills={knownSkills}
          relationships={relationships}
          weights={weights}
          thresholds={thresholds}
          projectRules={projectRules}
          onAddLearnedSkill={handleAddLearnedSkill}
          onNavigateToTab={(t) => setActiveTab(t)}
        />
      )}

      {/* TAB 4: MY PROFILE & EXTRACTED SKILLS */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Candidate Profile & Extracted Resume</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Skills, projects, and education parsed by the transparent rule-based NLP parser.
              </p>
            </div>
            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-colors inline-flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit / Re-upload Resume PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Contact / Bio */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Personal Information</h4>
              <div>
                <span className="text-slate-400 block text-[10px]">Full Name:</span>
                <span className="font-bold text-slate-800 text-sm">{candidate.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address:</span>
                <span className="font-semibold text-slate-700">{candidate.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                <span className="font-semibold text-slate-700">{candidate.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Highest Degree:</span>
                <span className="font-semibold text-slate-700">{candidate.highestDegree}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Work Experience:</span>
                <span className="font-semibold text-slate-700">{candidate.totalExpYears} Years</span>
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Detected Skills ({candidate.extractedSkills.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Extracted via regex and keyword normalization dictionary:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.extractedSkills.map((sk) => (
                  <span key={sk} className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                    {sk}
                  </span>
                ))}
                {candidate.extractedSkills.length === 0 && (
                  <span className="text-slate-400 italic">No skills extracted yet. Upload a resume PDF to parse.</span>
                )}
              </div>

              {/* Inferred via Relationship Map */}
              {inferredSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <h5 className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] flex items-center space-x-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Inferred via Relationship Map ({inferredSkills.length}):</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {inferredSkills.map((inf) => (
                      <span
                        key={inf.skill}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
                        title={inf.viaChain.length > 2 ? `Derived from ${inf.sourceSkill} (${inf.viaChain.join(' → ')})` : `Derived from ${inf.sourceSkill}`}
                      >
                        <span className="font-bold">{inf.skill}</span>
                        <span className="text-[10px] text-indigo-500 font-normal ml-1">
                          ({inf.viaChain.length > 2 ? inf.viaChain.join(' → ') : `via ${inf.sourceSkill}`})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Quick Paste & Scan Resume Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Quick Paste & Re-Scan Resume Text</span>
              </h4>
              <span className="text-[10px] text-slate-400">Rule-based regex & ontology extractor</span>
            </div>
            <textarea
              rows={4}
              value={quickResumeText}
              onChange={(e) => setQuickResumeText(e.target.value)}
              placeholder="Paste updated resume text here (e.g. 'Skills: Python, Django, SQL, Git, Docker, React. 4 years of experience as Full Stack Engineer...')"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Instantly parses skills, updates profile, and allows one-click re-applying to your jobs.
              </span>
              <button
                onClick={handleQuickScan}
                disabled={!quickResumeText.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scan & Update Saved Skills</span>
              </button>
            </div>
          </div>

          {/* Raw Resume Text Preview */}
          {candidate.rawResumeText && (
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
                Parsed Resume Plain Text
              </h4>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono whitespace-pre-wrap max-h-48">
                {candidate.rawResumeText}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Resume Upload / Edit Modal */}
      <ResumeUploadModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        knownSkills={knownSkills}
        candidateProfile={candidate}
        onSaveProfile={onUpdateCandidate}
        relationships={relationships}
      />

      {/* Explainability Breakdown Modal */}
      {isExplainModalOpen && activeApp && activeAppJob && (
        <ExplainabilityModal
          isOpen={isExplainModalOpen}
          onClose={() => setIsExplainModalOpen(false)}
          breakdown={activeApp.scoreBreakdown}
          candidate={candidate}
          job={activeAppJob}
        />
      )}

    </div>
  );
};
