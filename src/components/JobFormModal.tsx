import React, { useState } from 'react';
import { JobDescription, Skill } from '../types';
import { extractSkillsFromText } from '../services/ruleEngine';
import { extractTextFromPDFFile } from '../services/pdfParser';
import { Briefcase, Upload, Plus, X, Check } from 'lucide-react';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  knownSkills: Skill[];
  onSaveJob: (job: JobDescription) => void;
  existingJob?: JobDescription | null;
  recruiterId?: string;
  defaultCompanyName?: string;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  knownSkills,
  onSaveJob,
  existingJob,
  recruiterId,
  defaultCompanyName
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(existingJob?.title || '');
  const [companyName, setCompanyName] = useState(existingJob?.companyName || defaultCompanyName || 'My Company');
  const [department, setDepartment] = useState(existingJob?.department || 'Engineering');
  const [location, setLocation] = useState(existingJob?.location || 'Bangalore, India');
  const [minExperienceYears, setMinExperienceYears] = useState(existingJob?.minExperienceYears || 2);
  const [minEducationDegree, setMinEducationDegree] = useState(existingJob?.minEducationDegree || 'Bachelor Degree');
  const [descriptionText, setDescriptionText] = useState(existingJob?.descriptionText || '');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(existingJob?.requiredSkills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExtractFromDescription = () => {
    if (!descriptionText.trim()) return;
    const extracted = extractSkillsFromText(descriptionText, knownSkills);
    setRequiredSkills(Array.from(new Set([...requiredSkills, ...extracted])));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const text = await extractTextFromPDFFile(file);
      setDescriptionText(text);
      const extracted = extractSkillsFromText(text, knownSkills);
      setRequiredSkills(Array.from(new Set([...requiredSkills, ...extracted])));
    } catch (err) {
      setErrorMessage('Unable to parse PDF file. Please paste the job description text below directly.');
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JobDescription = {
      id: existingJob?.id || `job-${Date.now()}`,
      recruiterId: existingJob?.recruiterId || recruiterId || 'user-recruiter-1',
      companyName,
      title,
      department,
      location,
      jobType: 'Full-time',
      descriptionText,
      requiredSkills,
      preferredSkills: ['AWS', 'Redis'],
      minExperienceYears: Number(minExperienceYears),
      minEducationDegree,
      requiredCertifications: [],
      responsibilities: ['Build scalable web applications', 'Collaborate with team'],
      createdAt: existingJob?.createdAt || new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    onSaveJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {existingJob ? 'Edit Job Description' : 'Post New Job Description'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center justify-between">
              <span>⚠️ {errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">✕</button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Python Backend Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Min Experience (Years)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Min Education Required</label>
              <input
                type="text"
                placeholder="e.g. BCA / B.Tech / MCA"
                value={minEducationDegree}
                onChange={(e) => setMinEducationDegree(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Job Description Text & Upload */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Job Description Text / Responsibilities:</label>
              <label className="cursor-pointer text-emerald-600 font-semibold hover:underline flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JD PDF</span>
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              rows={4}
              required
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Paste full job description requirements here..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
            />
            <button
              type="button"
              onClick={handleExtractFromDescription}
              className="mt-1 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded text-[11px] font-semibold"
            >
              Auto-Detect Required Skills via Rule Engine
            </button>
          </div>

          {/* Required Skills list */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Required Skills for Screening ({requiredSkills.length}):
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 min-h-[50px]">
              {requiredSkills.map((sk) => (
                <span key={sk} className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded flex items-center space-x-1">
                  <span>{sk}</span>
                  <button type="button" onClick={() => handleRemoveSkill(sk)}>
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Python, Docker, SQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-2 rounded-lg flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center space-x-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Save Job Description</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
