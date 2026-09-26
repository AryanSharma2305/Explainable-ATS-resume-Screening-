export type UserRole = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;
  title?: string;
  status?: 'active' | 'suspended';
  createdAt?: string;
}

export interface CompanyTenant {
  id: string;
  name: string;
  industry: string;
  contactEmail: string;
  website?: string;
  plan: 'Enterprise' | 'Professional' | 'Startup';
  status: 'Active' | 'Pending' | 'Suspended';
  maxJobPostings: number;
  recruiterCount: number;
  joinedDate: string;
}

export type SkillCategory = 
  | 'Programming Languages'
  | 'Frameworks'
  | 'Databases'
  | 'Tools & DevOps'
  | 'Cloud Platforms'
  | 'Data Science & AI/ML'
  | 'Web Technologies'
  | 'Core CS & Software Design';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  aliases: string[]; // e.g., ["py", "python3"] for Python
}

export type RelationshipType = 'framework_of' | 'tool_for' | 'subset_of' | 'dialect_of' | 'ecosystem_partner';

export interface SkillRelationship {
  id: string;
  skill: string;          // e.g. "Flask"
  relatedSkill: string;   // e.g. "Python"
  relationshipType: RelationshipType;
  strength: number;       // 0.1 to 1.0 (e.g. 1.0 = direct framework)
  description: string;    // e.g. "Flask is a lightweight Python web framework"
}

export interface CandidateEducation {
  id: string;
  degree: string;         // e.g. "Master of Computer Applications (MCA)", "B.Tech CSE"
  fieldOfStudy: string;   // e.g. "Computer Science"
  institution: string;
  completionYear: number;
  cgpaPercentage?: string;
}

export interface CandidateExperience {
  id: string;
  jobTitle: string;
  company: string;
  years: number;
  responsibilities: string;
  technologiesUsed: string[];
}

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  hasDatabase?: boolean;
  hasAuth?: boolean;
  hasRestApi?: boolean;
  hasFramework?: boolean;
  hasDeployment?: boolean;
  hasGit?: boolean;
  hasCrud?: boolean;
  hasMeasurableResults?: boolean;
}

export interface CandidateCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueYear: number;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  rawResumeText?: string;
  extractedSkills: string[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  totalExpYears: number;
  highestDegree: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  department: string;
  location: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  descriptionText: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  minEducationDegree: string;
  requiredCertifications: string[];
  responsibilities: string[];
  createdAt: string;
  status: 'Active' | 'Closed' | 'Draft';
}

export interface ScoringWeights {
  skillMatch: number;      // default 40
  projectQuality: number;  // default 20
  experience: number;      // default 20
  education: number;       // default 10
  certification: number;   // default 10
}

export interface ScoringThresholds {
  excellent: number; // 95
  strong: number;    // 85
  good: number;      // 70
  moderate: number;  // 55
}

export type MatchClassification = 
  | 'Excellent Match'
  | 'Strong Match'
  | 'Good Match'
  | 'Moderate Match'
  | 'Low Match';

export interface RelatedMatchDetail {
  requiredSkill: string;
  candidateSkill: string;
  relationshipType: RelationshipType;
  strength: number;
  creditEarnedPercentage: number;
  explanation: string;
}

export interface ProjectEvaluationDetail {
  projectId: string;
  projectTitle: string;
  score: number; // 0 - 100
  detectedCriteria: string[];
  missingSuggestions: string[];
}

export interface ATSScoreBreakdown {
  overallScore: number;           // 0 - 100
  classification: MatchClassification;
  
  // Component Raw & Weighted Scores
  skillScoreRaw: number;          // 0 - 100
  skillScoreWeighted: number;     // e.g. 36 out of 40
  
  projectScoreRaw: number;        // 0 - 100
  projectScoreWeighted: number;   // e.g. 17 out of 20
  
  expScoreRaw: number;            // 0 - 100
  expScoreWeighted: number;       // e.g. 16 out of 20
  
  eduScoreRaw: number;            // 0 - 100
  eduScoreWeighted: number;       // e.g. 10 out of 10
  
  certScoreRaw: number;           // 0 - 100
  certScoreWeighted: number;      // e.g. 8 out of 10
  
  // Skill match details
  exactMatchedSkills: string[];
  relatedMatchedSkills: RelatedMatchDetail[];
  missingSkills: string[];
  bonusPreferredSkills: string[];
  
  // Project & Exp evaluation
  projectEvaluations: ProjectEvaluationDetail[];
  experienceGapYears: number;
  
  // Mathematical Explanation Log
  formulaBreakdown: string;
  auditTrail: string[];
  improvementSuggestions: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  recruiterId: string;
  candidateId: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateDegree?: string;
  candidateExpYears?: number;
  status: 'Screened' | 'Shortlisted' | 'Under Review' | 'Rejected' | 'Re-applied / Updated';
  appliedDate: string;
  scoreBreakdown: ATSScoreBreakdown;
  candidateProfileSnapshot?: CandidateProfile;
}

export interface Course {
  id: string;
  skillName: string;
  title: string;
  provider: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  url: string;
  description: string;
}

export interface ProjectQualityRule {
  id: string;
  ruleName: string;
  description: string;
  points: number;
  checkType: 'database' | 'auth' | 'rest_api' | 'framework' | 'cloud' | 'git' | 'crud' | 'description' | 'metrics' | 'multi_tech';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  details: string;
}
