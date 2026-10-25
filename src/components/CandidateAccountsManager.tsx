import React, { useState, useMemo, FC, FormEvent } from 'react';
import { 
  CandidateProfile, 
  User, 
  JobApplication, 
  Skill, 
  SkillRelationship 
} from '../types';
import { getTransitiveInferredSkills } from '../services/ruleEngine';
import { parseResumeTextRuleBased } from '../services/pdfParser';
import { 
  Users, 
  Search, 
  Plus, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  X, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  Award,
  Layers,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  BookOpen
} from 'lucide-react';

interface CandidateAccountsManagerProps {
  users?: User[];
  candidates?: CandidateProfile[];
  applications?: JobApplication[];
  knownSkills?: Skill[];
  relationships?: SkillRelationship[];
  onUpdateCandidate: (updated: CandidateProfile) => void;
  onDeleteCandidate: (candidateId: string, userId: string) => void;
  onAdminCreateCandidate?: (data: {
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
  onCreateCandidate?: (data: any) => void;
}

export const CandidateAccountsManager: FC<CandidateAccountsManagerProps> = ({
  users = [],
  candidates = [],
  applications = [],
  knownSkills = [],
  relationships = [],
  onUpdateCandidate,
  onDeleteCandidate,
  onAdminCreateCandidate,
  onCreateCandidate
}) => {
  const handleCreateAction = onAdminCreateCandidate || onCreateCandidate || (() => {});
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WITH_RESUME' | 'NO_RESUME' | 'WITH_APPLICATIONS'>('ALL');

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Edit State
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDegree, setEditDegree] = useState('');
  const [editExpYears, setEditExpYears] = useState(0);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editRawResumeText, setEditRawResumeText] = useState('');

  // Create State
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createLocation, setCreateLocation] = useState('');
  const [createDegree, setCreateDegree] = useState('Bachelor Degree');
  const [createExpYears, setCreateExpYears] = useState(1);
  const [createResumeText, setCreateResumeText] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Merge candidate accounts with candidate profiles defensively
  const candidateAccounts = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const safeCandidates = Array.isArray(candidates) ? candidates : [];
    const safeApps = Array.isArray(applications) ? applications : [];
    const safeRels = Array.isArray(relationships) ? relationships : [];

    const candidateUsers = safeUsers.filter(u => u && u.role?.toUpperCase() === 'CANDIDATE');
    return candidateUsers.map(user => {
      const profile = safeCandidates.find(c => c && (c.userId === user.id || c.email?.toLowerCase() === user.email?.toLowerCase())) || {
        id: `cand-${user.id}`,
        userId: user.id,
        fullName: user.name || 'Candidate',
        email: user.email,
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
        highestDegree: 'Not specified',
        updatedAt: 'Just created'
      };

      const userApps = safeApps.filter(a => a && (a.candidateUserId === user.id || a.candidateEmail?.toLowerCase() === user.email?.toLowerCase()));
      const hasResume = (profile.extractedSkills && profile.extractedSkills.length > 0) || (profile.rawResumeText && profile.rawResumeText.trim().length > 0);
      const inferred = getTransitiveInferredSkills(profile.extractedSkills || [], safeRels);

      return {
        user,
        profile,
        userApps,
        hasResume,
        inferred
      };
    });
  }, [users, candidates, applications, relationships]);

  // Filter candidates defensively
  const filteredCandidates = useMemo(() => {
    return candidateAccounts.filter(({ user, profile, userApps, hasResume }) => {
      // Search text
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (profile.fullName || '').toLowerCase().includes(q) ||
        (profile.email || '').toLowerCase().includes(q) ||
        (profile.phone || '').toLowerCase().includes(q) ||
        (profile.location || '').toLowerCase().includes(q) ||
        (profile.highestDegree || '').toLowerCase().includes(q) ||
        (profile.extractedSkills || []).some(s => s && s.toLowerCase().includes(q));

      // Skill Filter
      const matchesSkill = skillFilter === 'ALL' || 
        (profile.extractedSkills || []).some(s => s && s.toLowerCase() === skillFilter.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'WITH_RESUME') matchesStatus = hasResume;
      if (statusFilter === 'NO_RESUME') matchesStatus = !hasResume;
      if (statusFilter === 'WITH_APPLICATIONS') matchesStatus = userApps.length > 0;

      return matchesSearch && matchesSkill && matchesStatus;
    });
  }, [candidateAccounts, searchQuery, skillFilter, statusFilter]);

  // Open Inspect Modal
  const handleInspect = (profile: CandidateProfile) => {
    setSelectedCandidate(profile);
    setInspectModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (profile: CandidateProfile) => {
    setSelectedCandidate(profile);
    setEditFullName(profile.fullName);
    setEditEmail(profile.email);
    setEditPhone(profile.phone || '');
    setEditLocation(profile.location || '');
    setEditDegree(profile.highestDegree || 'Bachelor Degree');
    setEditExpYears(profile.totalExpYears || 0);
    setEditSkills([...(profile.extractedSkills || [])]);
    setEditRawResumeText(profile.rawResumeText || '');
    setEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const updated: CandidateProfile = {
      ...selectedCandidate,
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      location: editLocation.trim(),
      highestDegree: editDegree.trim(),
      totalExpYears: Number(editExpYears),
      extractedSkills: editSkills,
      rawResumeText: editRawResumeText,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateCandidate(updated);
    setEditModalOpen(false);
    setSelectedCandidate(null);
  };

  // Re-parse raw text in edit modal
  const handleReparseInEdit = () => {
    if (!editRawResumeText.trim()) return;
    const parsed = parseResumeTextRuleBased(editRawResumeText, knownSkills);
    const combinedSkills = Array.from(new Set([...editSkills, ...parsed.extractedSkills]));
    setEditSkills(combinedSkills);
    if (parsed.totalExpYears > 0) setEditExpYears(parsed.totalExpYears);
    if (parsed.highestDegree !== 'Not detected') setEditDegree(parsed.highestDegree);
  };

  // Create Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createName.trim()) {
      setCreateError('Please enter candidate name.');
      return;
    }
    if (!createEmail.trim() || !createEmail.includes('@')) {
      setCreateError('Please enter a valid email address.');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === createEmail.trim().toLowerCase());
    if (emailExists) {
      setCreateError('An account with this email already exists.');
      return;
    }

    let detectedSkills: string[] = [];
    let detectedExp = createExpYears;
    let detectedDeg = createDegree;

    if (createResumeText.trim()) {
      const parsed = parseResumeTextRuleBased(createResumeText, knownSkills);
      detectedSkills = parsed.extractedSkills;
      if (parsed.totalExpYears > 0) detectedExp = parsed.totalExpYears;
      if (parsed.highestDegree !== 'Not detected') detectedDeg = parsed.highestDegree;
    }

    handleCreateAction({
      name: createName.trim(),
      email: createEmail.trim().toLowerCase(),
      phone: createPhone.trim(),
      location: createLocation.trim(),
      degree: detectedDeg,
      expYears: Number(detectedExp),
      rawResumeText: createResumeText.trim(),
      skills: detectedSkills
    });

    setCreateModalOpen(false);
    setCreateName('');
    setCreateEmail('');
    setCreatePhone('');
    setCreateLocation('');
    setCreateResumeText('');
    setCreateExpYears(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Candidate Accounts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{candidateAccounts.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Stored in database</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Resumes Parsed</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {candidateAccounts.filter(c => c.hasResume).length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">With extracted skills</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Total Applications</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{(applications || []).length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Submitted by candidates</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Skills Tracked</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {new Set((candidates || []).flatMap(c => c?.extractedSkills || [])).size}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Distinct candidate skills</p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate by name, email, phone, location, degree, or skill..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses ({candidateAccounts.length})</option>
              <option value="WITH_RESUME">With Resume ({candidateAccounts.filter(c => c.hasResume).length})</option>
              <option value="NO_RESUME">No Resume Yet ({candidateAccounts.filter(c => !c.hasResume).length})</option>
              <option value="WITH_APPLICATIONS">Has Applied ({candidateAccounts.filter(c => c.userApps.length > 0).length})</option>
            </select>

            {/* Skill Filter */}
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Filter by Skill: All</option>
              {(knownSkills || []).slice(0, 30).map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Add Candidate Button */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Candidate Account</span>
            </button>

          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredCandidates.length}</strong> of {candidateAccounts.length} candidate accounts stored in system.
          </span>
          <span className="text-[11px] text-slate-400">
            All profile updates and resume extractions are permanently persisted.
          </span>
        </div>
      </div>

      {/* Candidates List / Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No Candidate Accounts Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No candidates matched your search criteria or no candidate accounts have been created yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Candidate & Account</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Extracted Skills</th>
                  <th className="py-3 px-4">Exp & Education</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map(({ user, profile, userApps, hasResume, inferred }) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Candidate & Account */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                            <span>{profile.fullName || user.name}</span>
                            {hasResume ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-200">
                                Resume Parsed
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                                No Resume
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            ID: {user.id}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Updated: {profile.updatedAt}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800">{user.email}</span>
                        </div>
                        {profile.phone && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile.location && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Extracted Skills */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                          {(profile.extractedSkills || []).slice(0, 5).map((sk) => (
                            <span key={sk} className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {sk}
                            </span>
                          ))}
                          {(profile.extractedSkills || []).length > 5 && (
                            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                              +{(profile.extractedSkills || []).length - 5} more
                            </span>
                          )}
                          {(!profile.extractedSkills || profile.extractedSkills.length === 0) && (
                            <span className="text-[10px] text-slate-400 italic">No skills extracted</span>
                          )}
                        </div>

                        {/* Inferred indicator */}
                        {inferred.length > 0 && (
                          <div className="text-[10px] text-purple-700 font-semibold flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                            <span>+{inferred.length} inferred via Relationship Map</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Exp & Education */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {profile.totalExpYears} {profile.totalExpYears === 1 ? 'Year' : 'Years'} Exp
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {profile.highestDegree || 'Bachelor Degree'}
                        </div>
                      </div>
                    </td>

                    {/* Applications */}
                    <td className="py-3.5 px-4">
                      {userApps.length > 0 ? (
                        <div className="space-y-1">
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block">
                            {userApps.length} {userApps.length === 1 ? 'Application' : 'Applications'}
                          </span>
                          <div className="space-y-0.5">
                            {userApps.slice(0, 2).map(app => (
                              <div key={app.id} className="text-[10px] text-slate-600 flex items-center justify-between">
                                <span className="truncate max-w-[120px]">{app.jobTitle}</span>
                                <span className="font-bold text-slate-800 ml-1">{app.scoreBreakdown?.overallScore ?? 0}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None yet</span>
                      )}
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        <button
                          onClick={() => handleInspect(profile)}
                          className="bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 p-1.5 rounded-lg transition-colors"
                          title="Inspect Stored Profile & Resume"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(profile)}
                          className="bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 p-1.5 rounded-lg transition-colors"
                          title="Edit Candidate Profile Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete candidate account "${profile.fullName}" (${user.email})? This action cannot be undone.`)) {
                              onDeleteCandidate(profile.id, user.id);
                            }
                          }}
                          className="bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 p-1.5 rounded-lg transition-colors"
                          title="Delete Candidate Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECT MODAL */}
      {inspectModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Stored Candidate Profile & Resume Data
                </span>
                <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedCandidate.email} • ID: {selectedCandidate.userId}</p>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.location || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Highest Degree</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.highestDegree || 'Bachelor Degree'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Experience</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.totalExpYears} Years</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Updated</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.updatedAt}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Education Entries</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.education?.length || 0} Listed</span>
              </div>
            </div>

            {/* Extracted Skills */}
            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Extracted Skills ({selectedCandidate.extractedSkills?.length || 0})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCandidate.extractedSkills || []).map(sk => (
                  <span key={sk} className="bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {sk}
                  </span>
                ))}
                {(!selectedCandidate.extractedSkills || selectedCandidate.extractedSkills.length === 0) && (
                  <span className="text-xs text-slate-400 italic">No skills extracted from resume yet.</span>
                )}
              </div>
            </div>

            {/* Inferred Skills */}
            {selectedCandidate.extractedSkills && selectedCandidate.extractedSkills.length > 0 && (
              <div>
                <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Inferred via Relationship Map</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {getTransitiveInferredSkills(selectedCandidate.extractedSkills, relationships).map(inf => (
                    <span key={inf.skill} className="bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      <strong className="font-bold">{inf.skill}</strong>
                      <span className="text-[10px] text-purple-500 ml-1">
                        (via {inf.viaChain.length > 2 ? inf.viaChain.join(' → ') : inf.sourceSkill})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Projects Evaluation ({selectedCandidate.projects.length})</span>
                </h4>
                <div className="space-y-2">
                  {selectedCandidate.projects.map((proj) => (
                    <div key={proj.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{proj.title}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.hasDatabase && <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">✓ Database</span>}
                        {proj.hasAuth && <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">✓ Auth</span>}
                        {proj.hasRestApi && <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">✓ REST API</span>}
                        {proj.hasFramework && <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">✓ Framework</span>}
                        {proj.hasDeployment && <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">✓ Cloud/Docker</span>}
                        {proj.hasGit && <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">✓ Git</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Resume Plain Text */}
            {selectedCandidate.rawResumeText && (
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Stored Resume Raw Text</span>
                </h4>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedCandidate.rawResumeText}
                </pre>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setInspectModalOpen(false);
                  handleOpenEdit(selectedCandidate);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Edit Candidate Data
              </button>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Stored Candidate Profile</h3>
                <p className="text-xs text-slate-500">Update candidate contact information, skills, or resume text.</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Bangalore, India"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Highest Degree</label>
                  <input
                    type="text"
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    placeholder="B.Tech CSE, BCA, MCA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editExpYears}
                    onChange={(e) => setEditExpYears(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Skills Chips */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Skills</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
                  {editSkills.map(sk => (
                    <span key={sk} className="bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1">
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => setEditSkills(editSkills.filter(s => s !== sk))}
                        className="text-blue-500 hover:text-blue-800 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {editSkills.length === 0 && (
                    <span className="text-slate-400 italic text-xs">No skills assigned</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add custom skill (e.g. Spring Boot, React)..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSkillInput.trim() && !editSkills.includes(newSkillInput.trim())) {
                          setEditSkills([...editSkills, newSkillInput.trim()]);
                          setNewSkillInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSkillInput.trim() && !editSkills.includes(newSkillInput.trim())) {
                        setEditSkills([...editSkills, newSkillInput.trim()]);
                        setNewSkillInput('');
                      }
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Raw Resume Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Resume Plain Text</label>
                  <button
                    type="button"
                    onClick={handleReparseInEdit}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Re-parse Skills from Text</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editRawResumeText}
                  onChange={(e) => setEditRawResumeText(e.target.value)}
                  placeholder="Paste or edit candidate's resume text..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Candidate Account</h3>
                <p className="text-xs text-slate-500">Create a candidate profile directly in the database.</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3 py-2 rounded-xl font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={createLocation}
                    onChange={(e) => setCreateLocation(e.target.value)}
                    placeholder="Delhi, India"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Degree</label>
                  <input
                    type="text"
                    value={createDegree}
                    onChange={(e) => setCreateDegree(e.target.value)}
                    placeholder="B.Tech CSE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Years of Exp</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={createExpYears}
                    onChange={(e) => setCreateExpYears(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Resume Text (Optional - Skills will be auto-extracted)
                </label>
                <textarea
                  rows={4}
                  value={createResumeText}
                  onChange={(e) => setCreateResumeText(e.target.value)}
                  placeholder="Paste candidate resume text or technical background (e.g. 'Skilled in Java, Spring Boot, MySQL, Git and REST APIs')..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-colors"
                >
                  Create Candidate Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
