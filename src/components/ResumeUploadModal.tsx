import React, { useState, useMemo } from 'react';
import { CandidateProfile, Skill, SkillRelationship, CandidateEducation, CandidateExperience, CandidateProject, CandidateCertification } from '../types';
import { extractTextFromPDFFile, parseResumeTextRuleBased } from '../services/pdfParser';
import { getTransitiveInferredSkills } from '../services/ruleEngine';
import { INITIAL_RELATIONSHIPS } from '../services/seedData';
import { Upload, FileText, Check, AlertCircle, X, Plus, Trash2, Code, Briefcase, GraduationCap, Award, Sparkles } from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  knownSkills: Skill[];
  candidateProfile: CandidateProfile;
  onSaveProfile: (updatedProfile: CandidateProfile) => void;
  relationships?: SkillRelationship[];
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  knownSkills,
  candidateProfile,
  onSaveProfile,
  relationships = INITIAL_RELATIONSHIPS
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'review'>('upload');
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState(candidateProfile.rawResumeText || '');
  const [newSkillInput, setNewSkillInput] = useState('');

  // Editable Profile Form State
  const [fullName, setFullName] = useState(candidateProfile.fullName);
  const [email, setEmail] = useState(candidateProfile.email);
  const [phone, setPhone] = useState(candidateProfile.phone);
  const [location, setLocation] = useState(candidateProfile.location);
  const [highestDegree, setHighestDegree] = useState(candidateProfile.highestDegree);
  const [totalExpYears, setTotalExpYears] = useState(candidateProfile.totalExpYears);
  const [extractedSkills, setExtractedSkills] = useState<string[]>(candidateProfile.extractedSkills || []);

  const inferredSkills = useMemo(() => {
    return getTransitiveInferredSkills(extractedSkills, relationships || INITIAL_RELATIONSHIPS);
  }, [extractedSkills, relationships]);
  const [education, setEducation] = useState<CandidateEducation[]>(candidateProfile.education || []);
  const [experience, setExperience] = useState<CandidateExperience[]>(candidateProfile.experience || []);
  const [projects, setProjects] = useState<CandidateProject[]>(candidateProfile.projects || []);
  const [certifications, setCertifications] = useState<CandidateCertification[]>(candidateProfile.certifications || []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const applyParsedAndSave = (parsed: ReturnType<typeof parseResumeTextRuleBased>, text: string) => {
    const updatedName = parsed.fullName !== 'Not detected' ? parsed.fullName : fullName;
    const updatedEmail = parsed.email !== 'Not detected' ? parsed.email : email;
    const updatedPhone = parsed.phone !== 'Not detected' ? parsed.phone : phone;
    const updatedLocation = parsed.location !== 'Not detected' ? parsed.location : location;
    const updatedDegree = parsed.highestDegree !== 'Not detected' ? parsed.highestDegree : highestDegree;

    setFullName(updatedName);
    setEmail(updatedEmail);
    setPhone(updatedPhone);
    setLocation(updatedLocation);
    setHighestDegree(updatedDegree);
    setTotalExpYears(parsed.totalExpYears);
    setExtractedSkills(parsed.extractedSkills);
    setEducation(parsed.education);
    setExperience(parsed.experience);
    setProjects(parsed.projects);
    setCertifications(parsed.certifications);

    const updatedProfile: CandidateProfile = {
      ...candidateProfile,
      fullName: updatedName,
      email: updatedEmail,
      phone: updatedPhone,
      location: updatedLocation,
      highestDegree: updatedDegree,
      totalExpYears: Number(parsed.totalExpYears),
      extractedSkills: parsed.extractedSkills,
      education: parsed.education,
      experience: parsed.experience,
      projects: parsed.projects,
      certifications: parsed.certifications,
      rawResumeText: text,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveProfile(updatedProfile);
    setSuccessNotice(`Rule extraction complete: ${parsed.extractedSkills.length} skills detected and saved to profile!`);
    setActiveTab('review');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);
    try {
      const text = await extractTextFromPDFFile(file);
      setRawText(text);
      
      // Parse text rule-based immediately
      const parsed = parseResumeTextRuleBased(text, knownSkills);
      applyParsedAndSave(parsed, text);
    } catch (err) {
      setErrorMessage('Unable to extract text from PDF file. Please use the "Paste Raw Resume Text" tab directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleParsePastedText = () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);
    const parsed = parseResumeTextRuleBased(rawText, knownSkills);
    applyParsedAndSave(parsed, rawText);
    setLoading(false);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !extractedSkills.includes(newSkillInput.trim())) {
      setExtractedSkills([...extractedSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExtractedSkills(extractedSkills.filter(s => s !== skillToRemove));
  };

  const handleFinalSave = () => {
    const updated: CandidateProfile = {
      ...candidateProfile,
      fullName,
      email,
      phone,
      location,
      highestDegree,
      totalExpYears: Number(totalExpYears),
      extractedSkills,
      education,
      experience,
      projects,
      certifications,
      rawResumeText: rawText,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Upload Resume & Verify Rule Parsing</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-center border-b-2 ${
              activeTab === 'upload' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            1. Upload PDF
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 text-center border-b-2 ${
              activeTab === 'text' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            2. Paste Raw Resume Text
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-3 text-center border-b-2 ${
              activeTab === 'review' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            3. Review & Edit Extracted Profile
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center justify-between">
              <span>⚠️ {errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">✕</button>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="text-center space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 rounded-2xl p-8 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Select PDF Resume File</p>
                <p className="text-xs text-slate-400 mb-4">Rule-based parser extracts skills, education, experience, and projects</p>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload-input"
                />
                <label
                  htmlFor="pdf-upload-input"
                  className="cursor-pointer inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow transition-colors"
                >
                  <span>Choose PDF File</span>
                </label>
              </div>
              {loading && <p className="text-xs text-emerald-600 font-semibold animate-pulse">Extracting resume text via Rule Engine...</p>}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3 text-xs">
              <label className="font-semibold text-slate-700 block">Paste Resume Text:</label>
              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste full resume text here..."
                className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleParsePastedText}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Run Rule-Based Skill & Field Parser
              </button>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-5 text-xs">
              {successNotice && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successNotice}</span>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Review Parsed Fields:</strong> Rule-based automatic parsing extracts skills, projects, and experience. You may review and modify any value below before running ATS screening.
                </span>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Highest Education Degree</label>
                  <input
                    type="text"
                    value={highestDegree}
                    onChange={(e) => setHighestDegree(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={totalExpYears}
                    onChange={(e) => setTotalExpYears(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Skill Tagging */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Detected / Verified Skills ({extractedSkills.length}):
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 min-h-[50px]">
                  {extractedSkills.map((sk) => (
                    <span key={sk} className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded flex items-center space-x-1">
                      <span>{sk}</span>
                      <button onClick={() => handleRemoveSkill(sk)} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {extractedSkills.length === 0 && (
                    <span className="text-slate-400 italic text-xs">No direct skills detected yet.</span>
                  )}
                </div>

                {/* Inferred via Relationship Map */}
                {inferredSkills.length > 0 && (
                  <div className="mb-2">
                    <label className="font-semibold text-indigo-800 block mb-1 flex items-center space-x-1 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Inferred via Relationship Map ({inferredSkills.length}):</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                      {inferredSkills.map((inf) => (
                        <span
                          key={inf.skill}
                          className="bg-white text-indigo-900 border border-indigo-200 font-semibold text-xs px-2.5 py-0.5 rounded-md flex items-center space-x-1 shadow-2xs"
                          title={inf.viaChain.length > 2 ? `Derived from ${inf.sourceSkill} (${inf.viaChain.join(' → ')})` : `Derived from ${inf.sourceSkill}`}
                        >
                          <span>{inf.skill}</span>
                          <span className="text-[10px] text-indigo-500 font-normal">
                            ({inf.viaChain.length > 2 ? inf.viaChain.join(' → ') : `via ${inf.sourceSkill}`})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Skill */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add missing skill (e.g. Docker, Redis)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-2 rounded-lg flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>

              {/* Parsed Projects Overview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center space-x-2 font-bold text-slate-800 mb-2">
                  <Code className="w-4 h-4 text-emerald-600" />
                  <span>Technical Projects ({projects.length})</span>
                </div>
                {projects.length === 0 ? (
                  <p className="text-slate-500 italic">No projects extracted.</p>
                ) : (
                  <div className="space-y-2">
                    {projects.map((p) => (
                      <div key={p.id} className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-semibold text-slate-800">{p.title}</div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{p.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                          {p.technologies?.map(tech => (
                            <span key={tech} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between shrink-0">
          <button onClick={onClose} className="text-xs font-semibold text-slate-600 hover:text-slate-800">
            Cancel
          </button>

          <button
            onClick={handleFinalSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile & Ready for Screening</span>
          </button>
        </div>

      </div>
    </div>
  );
};

