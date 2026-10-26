import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserRole,
  Skill, 
  SkillRelationship, 
  ScoringWeights, 
  ScoringThresholds, 
  ProjectQualityRule, 
  Course, 
  JobDescription, 
  CandidateProfile, 
  JobApplication,
  AuditLog,
  CompanyTenant
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_COMPANIES,
  INITIAL_SKILLS, 
  INITIAL_RELATIONSHIPS, 
  INITIAL_WEIGHTS, 
  INITIAL_THRESHOLDS, 
  INITIAL_PROJECT_RULES, 
  INITIAL_COURSES, 
  INITIAL_JOBS, 
  INITIAL_CANDIDATES,
  INITIAL_APPLICATIONS 
} from './services/seedData';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { SoftwareOwnerDashboard } from './components/SoftwareOwnerDashboard';
import { DataStorageExplorerModal } from './components/DataStorageExplorerModal';
import { fetchServerStorage, syncStorageToServer, StoragePayload } from './services/storageService';

// Helper to guarantee bidirectional consistency between users and candidate profiles
function reconcileUsersAndCandidates(inputUsers: User[], inputCandidates: CandidateProfile[]) {
  const safeUsers = [...inputUsers];
  const safeCandidates = [...inputCandidates];

  // 1. Ensure all candidate profiles have a corresponding user account
  safeCandidates.forEach(cand => {
    if (!cand || !cand.email) return;
    const emailLower = cand.email.trim().toLowerCase();
    const userExists = safeUsers.some(u => u && u.email && u.email.trim().toLowerCase() === emailLower);
    if (!userExists) {
      safeUsers.push({
        id: cand.userId || `user-cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cand.fullName || 'Candidate',
        email: emailLower,
        password: 'password123',
        role: 'CANDIDATE',
        title: cand.summary || 'Job Seeker',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: cand.updatedAt || '2026-08-01'
      });
    }
  });

  // 2. Ensure all CANDIDATE users have a candidate profile
  safeUsers.forEach(u => {
    if (!u || !u.email) return;
    if (u.role?.toUpperCase() === 'CANDIDATE') {
      const emailLower = u.email.trim().toLowerCase();
      const profExists = safeCandidates.some(c => c && c.email && c.email.trim().toLowerCase() === emailLower);
      if (!profExists) {
        safeCandidates.push({
          id: `cand-${u.id}`,
          userId: u.id,
          fullName: u.name || 'Candidate',
          email: emailLower,
          phone: '',
          location: '',
          summary: u.title || 'Job Seeker',
          rawResumeText: '',
          extractedSkills: [],
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          totalExpYears: 0,
          highestDegree: 'Bachelor Degree',
          updatedAt: new Date().toISOString().split('T')[0]
        });
      }
    }
  });

  return { users: safeUsers, candidates: safeCandidates };
}

export default function App() {
  // Stored Users (Reconciled with initial users)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ats_users');
    let loadedUsers: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    
    // Purge legacy admin if present
    loadedUsers = loadedUsers.filter(u => u.email.toLowerCase() !== 'admin@ats-screener.io');

    // Ensure admin@gmail.com with admin123 exists and has ADMIN role
    const adminIndex = loadedUsers.findIndex(u => u.email.toLowerCase() === 'admin@gmail.com');
    if (adminIndex >= 0) {
      loadedUsers[adminIndex] = {
        ...loadedUsers[adminIndex],
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'ADMIN',
        name: loadedUsers[adminIndex].name || 'Admin (Software Owner)'
      };
    } else {
      loadedUsers.unshift({
        id: 'user-admin-1',
        name: 'Admin (Software Owner)',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'ADMIN',
        companyName: 'ATS Screener SaaS Platform',
        title: 'Platform Software Owner & Super Admin',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01'
      });
    }

    // Ensure aryanmsharma23@gmail.com user exists
    const aryanIndex = loadedUsers.findIndex(u => u.email.toLowerCase() === 'aryanmsharma23@gmail.com');
    if (aryanIndex < 0) {
      loadedUsers.push({
        id: 'user-cand-1',
        name: 'Aryan Sharma',
        email: 'aryanmsharma23@gmail.com',
        password: 'password123',
        role: 'CANDIDATE',
        title: 'Full Stack & Python Engineer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-08-01'
      });
    }

    // Always normalize all user roles to uppercase and ensure password default
    return loadedUsers.map(u => ({
      ...u,
      password: u.password || 'password123',
      role: (u.email?.toLowerCase() === 'admin@gmail.com' ? 'ADMIN' : (u.role?.toUpperCase() as UserRole) || 'CANDIDATE')
    }));
  });

  // Track if server storage has loaded to prevent accidental overwrite
  const [hasServerLoaded, setHasServerLoaded] = useState(false);

  // Storage Explorer Modal State (30-day retention viewer)
  const [isStorageExplorerOpen, setIsStorageExplorerOpen] = useState(false);

  // Stored Companies
  const [companies, setCompanies] = useState<CompanyTenant[]>(() => {
    const saved = localStorage.getItem('ats_companies');
    if (!saved) return INITIAL_COMPANIES;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  // Current Logged-in User (null if not logged in)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ats_current_user');
    if (!saved) return null;
    try {
      const u = JSON.parse(saved);
      if (u.email && (u.email.toLowerCase() === 'admin@ats-screener.io' || u.email.toLowerCase() === 'admin@gmail.com')) {
        return {
          ...u,
          email: 'admin@gmail.com',
          password: 'admin123',
          role: 'ADMIN'
        };
      }
      return u;
    } catch {
      return null;
    }
  });

  // Skill Taxonomy & Rules State
  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem('ats_skills_v4');
    if (!saved) return INITIAL_SKILLS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length >= INITIAL_SKILLS.length ? parsed : INITIAL_SKILLS;
    } catch {
      return INITIAL_SKILLS;
    }
  });

  const [relationships, setRelationships] = useState<SkillRelationship[]>(() => {
    const saved = localStorage.getItem('ats_relationships_v4');
    if (!saved) return INITIAL_RELATIONSHIPS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length >= INITIAL_RELATIONSHIPS.length ? parsed : INITIAL_RELATIONSHIPS;
    } catch {
      return INITIAL_RELATIONSHIPS;
    }
  });

  const [weights, setWeights] = useState<ScoringWeights>(() => {
    const saved = localStorage.getItem('ats_weights');
    return saved ? JSON.parse(saved) : INITIAL_WEIGHTS;
  });

  const [thresholds, setThresholds] = useState<ScoringThresholds>(() => {
    const saved = localStorage.getItem('ats_thresholds');
    return saved ? JSON.parse(saved) : INITIAL_THRESHOLDS;
  });

  const [projectRules, setProjectRules] = useState<ProjectQualityRule[]>(() => {
    const saved = localStorage.getItem('ats_project_rules');
    return saved ? JSON.parse(saved) : INITIAL_PROJECT_RULES;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('ats_courses_v3');
    if (!saved) return INITIAL_COURSES;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length >= INITIAL_COURSES.length ? parsed : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  // Jobs
  const [jobs, setJobs] = useState<JobDescription[]>(() => {
    const saved = localStorage.getItem('ats_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  // Candidate Profiles
  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => {
    const saved = localStorage.getItem('ats_candidates');
    const loadedCandidates: CandidateProfile[] = saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    
    // Reconcile: ensure initial candidates are present
    INITIAL_CANDIDATES.forEach(initCand => {
      const exists = loadedCandidates.some(c => c.userId === initCand.userId || c.email.toLowerCase() === initCand.email.toLowerCase());
      if (!exists) {
        loadedCandidates.push(initCand);
      }
    });

    return loadedCandidates;
  });

  // Job Applications
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('ats_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => [
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      actorEmail: 'admin@gmail.com',
      action: 'SYSTEM_ONLINE',
      details: 'Explainable ATS Screener online. Multi-tenant 3-tier role architecture active.'
    }
  ]);

  // Initial Server Sync on Mount
  useEffect(() => {
    fetchServerStorage().then(serverData => {
      setHasServerLoaded(true);
      if (!serverData) return;

      let combinedUsers = [...users];
      if (serverData.users && serverData.users.length > 0) {
        const map = new Map<string, User>();
        // 1. Initial users baseline
        INITIAL_USERS.forEach(u => map.set(u.email.toLowerCase(), { ...u, password: u.password || 'password123' }));
        // 2. Client prev state
        combinedUsers.forEach(u => map.set(u.email.toLowerCase(), { ...u, password: u.password || 'password123' }));
        // 3. Authoritative server disk state
        serverData.users.forEach(u => map.set(u.email.toLowerCase(), { ...u, password: u.password || 'password123' }));

        combinedUsers = Array.from(map.values());
      }

      let combinedCandidates = [...candidates];
      if (serverData.candidates && serverData.candidates.length > 0) {
        const map = new Map<string, CandidateProfile>();
        INITIAL_CANDIDATES.forEach(c => map.set(c.email.toLowerCase(), c));
        combinedCandidates.forEach(c => map.set(c.email.toLowerCase(), c));
        serverData.candidates.forEach(c => map.set(c.email.toLowerCase(), c));
        combinedCandidates = Array.from(map.values());
      }

      // Bidirectional reconciliation
      const reconciled = reconcileUsersAndCandidates(combinedUsers, combinedCandidates);
      setUsers(reconciled.users);
      setCandidates(reconciled.candidates);

      if (serverData.companies && serverData.companies.length > 0) {
        setCompanies(serverData.companies);
      }
      if (serverData.jobs && serverData.jobs.length > 0) {
        setJobs(serverData.jobs);
      }
      if (serverData.applications && serverData.applications.length > 0) {
        setApplications(serverData.applications);
      }
    }).catch(err => {
      console.warn('Initial server sync warning:', err);
      setHasServerLoaded(true);
    });
  }, []);

  // Sync to LocalStorage & Server File Storage with 30-Day Retention
  useEffect(() => {
    localStorage.setItem('ats_users', JSON.stringify(users));
    localStorage.setItem('ats_companies', JSON.stringify(companies));
    if (currentUser) {
      localStorage.setItem('ats_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ats_current_user');
    }
    localStorage.setItem('ats_skills_v4', JSON.stringify(skills));
    localStorage.setItem('ats_relationships_v4', JSON.stringify(relationships));
    localStorage.setItem('ats_skills', JSON.stringify(skills));
    localStorage.setItem('ats_relationships', JSON.stringify(relationships));
    localStorage.setItem('ats_weights', JSON.stringify(weights));
    localStorage.setItem('ats_thresholds', JSON.stringify(thresholds));
    localStorage.setItem('ats_project_rules', JSON.stringify(projectRules));
    localStorage.setItem('ats_courses_v3', JSON.stringify(courses));
    localStorage.setItem('ats_courses', JSON.stringify(courses));
    localStorage.setItem('ats_jobs', JSON.stringify(jobs));
    localStorage.setItem('ats_candidates', JSON.stringify(candidates));
    localStorage.setItem('ats_applications', JSON.stringify(applications));

    // Guard: Only sync state to server after initial server load has succeeded to prevent overwriting disk
    if (!hasServerLoaded) return;

    // Save to persistent server file database
    const timer = setTimeout(() => {
      syncStorageToServer({
        users,
        companies,
        jobs,
        candidates,
        applications,
        skills,
        relationships,
        weights,
        thresholds,
        projectRules,
        courses,
        auditLogs
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [hasServerLoaded, users, companies, currentUser, skills, relationships, weights, thresholds, projectRules, courses, jobs, candidates, applications, auditLogs]);

  // Log Helper
  const addAuditLog = (action: string, details: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actorEmail: currentUser ? currentUser.email : 'system',
      action,
      details
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    const effectiveRole: UserRole = 
      user.email.toLowerCase() === 'admin@gmail.com' || user.role?.toUpperCase() === 'ADMIN'
        ? 'ADMIN'
        : user.role?.toUpperCase() === 'RECRUITER'
        ? 'RECRUITER'
        : 'CANDIDATE';
    const normalizedUser: User = { 
      ...user, 
      role: effectiveRole,
      password: user.password || 'password123'
    };

    // Ensure user is immediately saved in users state
    setUsers(prev => {
      const idx = prev.findIndex(u => u.email.toLowerCase() === normalizedUser.email.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...normalizedUser };
        return copy;
      }
      return [...prev, normalizedUser];
    });

    setCurrentUser(normalizedUser);

    if (effectiveRole === 'CANDIDATE') {
      const existing = candidates.find(c => c.userId === user.id || c.email.toLowerCase() === user.email.toLowerCase());
      if (!existing) {
        const newProfile: CandidateProfile = {
          id: `cand-${user.id}`,
          userId: user.id,
          fullName: user.name || 'Candidate',
          email: user.email,
          phone: '',
          location: '',
          summary: user.title || 'Job Seeker',
          rawResumeText: '',
          extractedSkills: [],
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          totalExpYears: 0,
          highestDegree: 'Bachelor Degree',
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setCandidates(prev => [...prev, newProfile]);
      }
    }
    addAuditLog('USER_LOGIN', `${user.name} logged in as ${effectiveRole}`);
  };

  const handleRegister = (newUser: User) => {
    const safeUser: User = {
      ...newUser,
      password: newUser.password || 'password123',
      role: newUser.role?.toUpperCase() as UserRole || 'CANDIDATE'
    };
    setUsers(prev => [...prev, safeUser]);
    if (newUser.role === 'CANDIDATE') {
      const newProfile: CandidateProfile = {
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
      };
      setCandidates(prev => [...prev, newProfile]);
    }
    setCurrentUser(newUser);
    addAuditLog('USER_REGISTERED', `New account created: ${newUser.name} (${newUser.role})`);
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', `${currentUser.name} logged out`);
    }
    setCurrentUser(null);
  };

  const handleSwitchUser = (targetUser: User) => {
    setCurrentUser(targetUser);
    addAuditLog('SWITCH_PERSONA', `Switched active persona to ${targetUser.name} (${targetUser.role})`);
  };

  // Candidate Data Handlers
  const activeCandidateProfile = currentUser && currentUser.role === 'CANDIDATE'
    ? candidates.find(c => c.userId === currentUser.id || c.email.toLowerCase() === currentUser.email.toLowerCase()) || {
        id: `cand-${currentUser.id}`,
        userId: currentUser.id,
        fullName: currentUser.name,
        email: currentUser.email,
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
      }
    : null;

  const handleUpdateCandidate = (updated: CandidateProfile) => {
    setCandidates((prev) => {
      const idx = prev.findIndex(c => c.id === updated.id || c.userId === updated.userId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
    setUsers(prev => prev.map(u => u.id === updated.userId ? { ...u, name: updated.fullName, email: updated.email } : u));
    addAuditLog('CANDIDATE_PROFILE_UPDATED', `Updated profile for ${updated.fullName} (${updated.extractedSkills.length} skills detected)`);
  };

  const handleDeleteCandidate = (candidateId: string, userId: string) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId && c.userId !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
    setApplications(prev => prev.filter(a => a.candidateId !== candidateId && a.candidateUserId !== userId));
    addAuditLog('CANDIDATE_DELETED', `Deleted candidate account and profile ID: ${userId}`);
  };

  const handleAdminCreateCandidate = (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    location?: string;
    degree?: string;
    expYears?: number;
    rawResumeText?: string;
    skills?: string[];
  }) => {
    const newUserId = `user-cand-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: data.name,
      email: data.email,
      password: data.password || 'password123',
      role: 'CANDIDATE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const newProfile: CandidateProfile = {
      id: `cand-${newUserId}`,
      userId: newUserId,
      fullName: data.name,
      email: data.email,
      phone: data.phone || '',
      location: data.location || '',
      summary: '',
      rawResumeText: data.rawResumeText || '',
      extractedSkills: data.skills || [],
      education: data.degree ? [{
        id: `edu-${Date.now()}`,
        degree: data.degree,
        fieldOfStudy: 'Computer Science',
        institution: 'University',
        completionYear: new Date().getFullYear(),
        cgpaPercentage: '80%'
      }] : [],
      experience: data.expYears ? [{
        id: `exp-${Date.now()}`,
        jobTitle: 'Software Engineer',
        company: 'Previous Company',
        years: data.expYears,
        responsibilities: 'Software development',
        technologiesUsed: data.skills || []
      }] : [],
      projects: [],
      certifications: [],
      totalExpYears: data.expYears || 0,
      highestDegree: data.degree || 'Bachelor Degree',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);
    setCandidates(prev => [...prev, newProfile]);
    
    // Save directly to server disk for 30-day continuous retention
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: newUser, candidateProfile: newProfile })
    }).catch(err => console.warn('Admin create sync notice:', err));

    addAuditLog('ADMIN_CREATED_CANDIDATE', `Created candidate account for ${data.name} (${data.email})`);
  };

  const handleApplyJob = (application: JobApplication) => {
    setApplications(prev => [application, ...prev]);
    addAuditLog(
      'JOB_APPLICATION_SUBMITTED',
      `${application.candidateName} applied to ${application.jobTitle} (Score: ${application.scoreBreakdown.overallScore}%)`
    );
  };

  const handleReapplyJob = (updatedApp: JobApplication) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    addAuditLog(
      'APPLICATION_REAPPLIED',
      `${updatedApp.candidateName} re-applied to ${updatedApp.jobTitle} with updated resume (New Score: ${updatedApp.scoreBreakdown.overallScore}%)`
    );
  };

  // Recruiter / Job Handlers
  const handleSaveJob = (job: JobDescription) => {
    setJobs((prev) => {
      const exists = prev.some(j => j.id === job.id);
      if (exists) return prev.map(j => j.id === job.id ? job : j);
      return [job, ...prev];
    });
    addAuditLog('JOB_DESCRIPTION_SAVED', `Saved Job Description: ${job.title} at ${job.companyName}`);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setApplications(prev => prev.filter(a => a.jobId !== jobId));
    addAuditLog('JOB_DELETED', `Deleted job posting ID: ${jobId}`);
  };

  const handleUpdateApplicationStatus = (
    appId: string, 
    status: 'Screened' | 'Shortlisted' | 'Under Review' | 'Rejected' | 'Re-applied / Updated'
  ) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    addAuditLog('APPLICATION_STATUS_UPDATED', `Application ${appId} status set to ${status}`);
  };

  // Software Owner & Admin Handlers
  const handleAddCompany = (newCompany: CompanyTenant, initialRecruiter: User) => {
    setCompanies(prev => [...prev, newCompany]);
    setUsers(prev => [...prev, initialRecruiter]);
    addAuditLog('COMPANY_ONBOARDED', `Onboarded ${newCompany.name} with recruiter ${initialRecruiter.name} (${initialRecruiter.email})`);
  };

  const handleToggleCompanyStatus = (companyId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const nextStatus = c.status === 'Active' ? 'Suspended' : 'Active';
        addAuditLog('COMPANY_STATUS_CHANGED', `Changed status of ${c.name} to ${nextStatus}`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleDeleteCompany = (companyId: string) => {
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return;
    if (confirm(`Are you sure you want to remove ${comp.name} from the platform?`)) {
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      addAuditLog('COMPANY_DELETED', `Removed company ${comp.name} (ID: ${companyId})`);
    }
  };

  const handleAddSkill = (skill: Skill) => {
    setSkills((prev) => [...prev, skill]);
    addAuditLog('SKILL_ADDED', `Added skill to taxonomy: ${skill.name}`);
  };

  const handleDeleteSkill = (skillId: string) => {
    setSkills((prev) => prev.filter(s => s.id !== skillId));
    addAuditLog('SKILL_DELETED', `Removed skill ID: ${skillId}`);
  };

  const handleAddRelationship = (rel: SkillRelationship) => {
    setRelationships((prev) => [rel, ...prev]);
    addAuditLog('RELATIONSHIP_ADDED', `Added mapping: ${rel.skill} -> ${rel.relatedSkill} (${rel.relationshipType})`);
  };

  const handleDeleteRelationship = (relId: string) => {
    setRelationships((prev) => prev.filter(r => r.id !== relId));
    addAuditLog('RELATIONSHIP_DELETED', `Removed relationship ID: ${relId}`);
  };

  const handleUpdateProjectRule = (ruleId: string, updatedPoints: number) => {
    setProjectRules((prev) => prev.map(r => r.id === ruleId ? { ...r, points: updatedPoints } : r));
    addAuditLog('PROJECT_RULE_UPDATED', `Updated project rule ${ruleId} points to ${updatedPoints}`);
  };

  // Current Storage Payload for Explorer
  const currentStoragePayload: StoragePayload = {
    users,
    companies,
    jobs,
    candidates,
    applications,
    skills,
    relationships,
    weights,
    thresholds,
    projectRules,
    courses,
    auditLogs
  };

  const handleManualSync = () => {
    syncStorageToServer(currentStoragePayload);
    addAuditLog('STORAGE_SYNC_MANUAL', 'User initiated manual synchronization to server persistent disk.');
  };

  // IF NOT LOGGED IN -> RENDER AUTH PAGE
  if (!currentUser) {
    return (
      <>
        <AuthPage
          onLogin={handleLogin}
          onRegister={handleRegister}
          existingUsers={users}
          existingCandidates={candidates}
          onOpenStorageExplorer={() => setIsStorageExplorerOpen(true)}
        />
        <DataStorageExplorerModal
          isOpen={isStorageExplorerOpen}
          onClose={() => setIsStorageExplorerOpen(false)}
          data={currentStoragePayload}
          onSyncNow={handleManualSync}
        />
      </>
    );
  }

  // IF LOGGED IN -> RENDER ONE OF 3 ROLE-PROTECTED PORTALS
  const effectiveRole: UserRole = 
    currentUser.email?.toLowerCase() === 'admin@gmail.com' || currentUser.role?.toUpperCase() === 'ADMIN'
      ? 'ADMIN'
      : currentUser.role?.toUpperCase() === 'RECRUITER'
      ? 'RECRUITER'
      : 'CANDIDATE';

  const effectiveUser: User = {
    ...currentUser,
    role: effectiveRole
  };

  const safeCandidateProfile = activeCandidateProfile || {
    id: `cand-${currentUser.id}`,
    userId: currentUser.id,
    fullName: currentUser.name || 'Candidate',
    email: currentUser.email,
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
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={effectiveUser}
        onLogout={handleLogout}
        onOpenStorageExplorer={() => setIsStorageExplorerOpen(true)}
      />

      {/* Main Container View (Role-Protected for All 3 Options) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* OPTION 1: ADMIN (SOFTWARE OWNER) PORTAL */}
        {effectiveRole === 'ADMIN' && (
          <SoftwareOwnerDashboard
            currentUser={effectiveUser}
            companies={companies}
            users={users}
            jobs={jobs}
            applications={applications}
            candidates={candidates}
            knownSkills={skills}
            relationships={relationships}
            weights={weights}
            thresholds={thresholds}
            projectRules={projectRules}
            courses={courses}
            auditLogs={auditLogs}
            onAddCompany={handleAddCompany}
            onToggleCompanyStatus={handleToggleCompanyStatus}
            onDeleteCompany={handleDeleteCompany}
            onUpdateWeights={(w) => {
              setWeights(w);
              addAuditLog('WEIGHTS_UPDATED', 'Software owner adjusted master ATS scoring weights.');
            }}
            onUpdateThresholds={(t) => {
              setThresholds(t);
              addAuditLog('THRESHOLDS_UPDATED', 'Software owner adjusted match classification thresholds.');
            }}
            onAddSkill={handleAddSkill}
            onDeleteSkill={handleDeleteSkill}
            onAddRelationship={handleAddRelationship}
            onDeleteRelationship={handleDeleteRelationship}
            onUpdateProjectRule={handleUpdateProjectRule}
            onAddCourse={(c) => setCourses(prev => [...prev, c])}
            onUpdateCandidate={handleUpdateCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            onAdminCreateCandidate={handleAdminCreateCandidate}
            onOpenStorageExplorer={() => setIsStorageExplorerOpen(true)}
          />
        )}

        {/* OPTION 2: COMPANY / HR PORTAL */}
        {effectiveRole === 'RECRUITER' && (
          <RecruiterDashboard
            currentUser={effectiveUser}
            jobs={jobs}
            applications={applications}
            candidates={candidates}
            users={users}
            knownSkills={skills}
            relationships={relationships}
            weights={weights}
            thresholds={thresholds}
            projectRules={projectRules}
            courses={courses}
            auditLogs={auditLogs}
            onSaveJob={handleSaveJob}
            onDeleteJob={handleDeleteJob}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onUpdateCandidate={handleUpdateCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            onAdminCreateCandidate={handleAdminCreateCandidate}
            onAddSkill={handleAddSkill}
            onDeleteSkill={handleDeleteSkill}
            onAddRelationship={handleAddRelationship}
            onDeleteRelationship={handleDeleteRelationship}
            onUpdateWeights={(w) => {
              setWeights(w);
              addAuditLog('WEIGHTS_UPDATED', `Adjusted ATS scoring weights.`);
            }}
            onUpdateThresholds={(t) => {
              setThresholds(t);
              addAuditLog('THRESHOLDS_UPDATED', `Adjusted match classification thresholds.`);
            }}
            onUpdateProjectRule={handleUpdateProjectRule}
            onAddCourse={(c) => setCourses(prev => [...prev, c])}
          />
        )}

        {/* OPTION 3: CANDIDATE PORTAL */}
        {effectiveRole === 'CANDIDATE' && (
          <CandidateDashboard
            currentUser={effectiveUser}
            candidate={safeCandidateProfile}
            jobs={jobs}
            applications={applications}
            knownSkills={skills}
            relationships={relationships}
            weights={weights}
            thresholds={thresholds}
            courses={courses}
            projectRules={projectRules}
            onUpdateCandidate={handleUpdateCandidate}
            onApplyJob={handleApplyJob}
            onReapplyJob={handleReapplyJob}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 px-6 text-center">
        <p>
          Explainable Skill-Based ATS Resume Screening System • Unified 3-Tier Multi-User Platform
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Software Owner Administration • Company / HR Recruitment & Ranking • Candidate Career Fit & Upskilling
        </p>
      </footer>

      {/* 30-Day Data Storage Explorer Modal */}
      <DataStorageExplorerModal
        isOpen={isStorageExplorerOpen}
        onClose={() => setIsStorageExplorerOpen(false)}
        data={currentStoragePayload}
        onSyncNow={handleManualSync}
      />

    </div>
  );
}
