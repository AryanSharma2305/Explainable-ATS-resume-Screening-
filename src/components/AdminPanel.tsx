import React, { useState } from 'react';
import { 
  ScoringWeights, 
  ScoringThresholds, 
  Skill, 
  SkillRelationship, 
  ProjectQualityRule, 
  Course, 
  AuditLog,
  SkillCategory,
  RelationshipType
} from '../types';
import { 
  Shield, 
  Sliders, 
  Database, 
  Network, 
  FolderCheck, 
  BookOpen, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw,
  BarChart3,
  ListFilter
} from 'lucide-react';

interface AdminPanelProps {
  weights: ScoringWeights;
  onUpdateWeights: (weights: ScoringWeights) => void;
  thresholds: ScoringThresholds;
  onUpdateThresholds: (thresholds: ScoringThresholds) => void;
  skills: Skill[];
  onAddSkill: (skill: Skill) => void;
  onDeleteSkill: (skillId: string) => void;
  relationships: SkillRelationship[];
  onAddRelationship: (rel: SkillRelationship) => void;
  onDeleteRelationship: (relId: string) => void;
  projectRules: ProjectQualityRule[];
  onUpdateProjectRule: (ruleId: string, updatedPoints: number) => void;
  courses: Course[];
  onAddCourse: (course: Course) => void;
  auditLogs: AuditLog[];
  initialTab?: 'weights' | 'skills' | 'relationships' | 'projects' | 'courses' | 'logs';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  weights,
  onUpdateWeights,
  thresholds,
  onUpdateThresholds,
  skills,
  onAddSkill,
  onDeleteSkill,
  relationships,
  onAddRelationship,
  onDeleteRelationship,
  projectRules,
  onUpdateProjectRule,
  courses,
  onAddCourse,
  auditLogs,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'weights' | 'skills' | 'relationships' | 'projects' | 'courses' | 'logs'>(
    initialTab || 'weights'
  );

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Programming Languages');
  const [newSkillAliases, setNewSkillAliases] = useState('');

  // New Relationship Form
  const [relSkill, setRelSkill] = useState('Flask');
  const [relRelatedSkill, setRelRelatedSkill] = useState('Python');
  const [relType, setRelType] = useState<RelationshipType>('framework_of');
  const [relStrength, setRelStrength] = useState(1.0);
  const [relDesc, setRelDesc] = useState('');

  // New Course Form
  const [courseSkillName, setCourseSkillName] = useState('Spring Boot');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseProvider, setCourseProvider] = useState('Coursera / Udemy');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [courseDuration, setCourseDuration] = useState('15 Hours');
  const [courseUrl, setCourseUrl] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  // Form handlers
  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      id: `s-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      aliases: newSkillAliases.split(',').map(a => a.trim()).filter(a => a.length > 0)
    };
    onAddSkill(newSkill);
    setNewSkillName('');
    setNewSkillAliases('');
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseSkillName.trim() || !courseTitle.trim()) return;
    const newCourse: Course = {
      id: `c-${Date.now()}`,
      skillName: courseSkillName.trim(),
      title: courseTitle.trim(),
      provider: courseProvider.trim(),
      level: courseLevel,
      duration: courseDuration.trim(),
      url: courseUrl.trim() || 'https://www.coursera.org',
      description: courseDesc.trim() || `Comprehensive curriculum for mastering ${courseSkillName}.`
    };
    onAddCourse(newCourse);
    setCourseTitle('');
    setCourseUrl('');
    setCourseDesc('');
  };

  const handleAddRelationshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relSkill.trim() || !relRelatedSkill.trim()) return;
    const newRel: SkillRelationship = {
      id: `rel-${Date.now()}`,
      skill: relSkill.trim(),
      relatedSkill: relRelatedSkill.trim(),
      relationshipType: relType,
      strength: Number(relStrength),
      description: relDesc || `${relSkill} is a ${relType} of ${relRelatedSkill}`
    };
    onAddRelationship(newRel);
    setRelDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator Governance Panel</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            System Configuration & Taxonomy Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure transparent scoring weights, skill relationships, project evaluation rules, and audit logs.
          </p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-slate-900 text-white rounded-2xl p-1.5 shadow-md flex flex-wrap gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('weights')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'weights' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Scoring Weights & Thresholds</span>
        </button>

        <button
          onClick={() => setActiveTab('relationships')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'relationships' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>2. Skill Relationship Map ({relationships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'skills' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>3. Skill Taxonomy ({skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'projects' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FolderCheck className="w-4 h-4" />
          <span>4. Project Quality Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'courses' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>5. Course Recommendations ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'logs' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>6. Audit Logs & Analytics</span>
        </button>
      </div>

      {/* Tab 1: Weights & Thresholds */}
      {activeTab === 'weights' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">ATS Weight Distribution Configuration</h3>
            <p className="text-slate-500 mb-4">Total sum must equal 100%. Adjust weights according to recruiter priority.</p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">Skill Match Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.skillMatch}
                  onChange={(e) => onUpdateWeights({ ...weights, skillMatch: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">Project Quality Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.projectQuality}
                  onChange={(e) => onUpdateWeights({ ...weights, projectQuality: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">Experience Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.experience}
                  onChange={(e) => onUpdateWeights({ ...weights, experience: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">Education Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.education}
                  onChange={(e) => onUpdateWeights({ ...weights, education: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">Certification Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.certification}
                  onChange={(e) => onUpdateWeights({ ...weights, certification: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>
            </div>

            <div className="mt-3 text-right">
              <span className={`font-bold px-3 py-1 rounded text-xs ${
                (weights.skillMatch + weights.projectQuality + weights.experience + weights.education + weights.certification) === 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                Current Weight Sum: {weights.skillMatch + weights.projectQuality + weights.experience + weights.education + weights.certification}%
              </span>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Thresholds */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Neutral Classification Thresholds</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Excellent Match (&ge;)</label>
                <input
                  type="number"
                  value={thresholds.excellent}
                  onChange={(e) => onUpdateThresholds({ ...thresholds, excellent: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Strong Match (&ge;)</label>
                <input
                  type="number"
                  value={thresholds.strong}
                  onChange={(e) => onUpdateThresholds({ ...thresholds, strong: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Good Match (&ge;)</label>
                <input
                  type="number"
                  value={thresholds.good}
                  onChange={(e) => onUpdateThresholds({ ...thresholds, good: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Moderate Match (&ge;)</label>
                <input
                  type="number"
                  value={thresholds.moderate}
                  onChange={(e) => onUpdateThresholds({ ...thresholds, moderate: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skill Relationships */}
      {activeTab === 'relationships' && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Add Skill Relationship Rule Mapping</h3>
            <form onSubmit={handleAddRelationshipSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Source Skill (Candidate)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flask"
                  value={relSkill}
                  onChange={(e) => setRelSkill(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Related Required Skill (Job)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python"
                  value={relRelatedSkill}
                  onChange={(e) => setRelRelatedSkill(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relationship Type</label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as RelationshipType)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option value="framework_of">framework_of</option>
                  <option value="dialect_of">dialect_of</option>
                  <option value="tool_for">tool_for</option>
                  <option value="subset_of">subset_of</option>
                  <option value="ecosystem_partner">ecosystem_partner</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Strength (0.1 to 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  value={relStrength}
                  onChange={(e) => setRelStrength(parseFloat(e.target.value) || 1.0)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Relationship</span>
                </button>
              </div>
            </form>
          </div>

          {/* Relationship Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white font-bold flex justify-between">
              <span>Curated Skill Relationship Database</span>
              <span className="text-slate-400 font-normal">Total Rules: {relationships.length}</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="p-3">Candidate Skill</th>
                  <th className="p-3">Required Skill</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Strength</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {relationships.map((rel) => (
                  <tr key={rel.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{rel.skill}</td>
                    <td className="p-3 font-bold text-emerald-700">{rel.relatedSkill}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                        {rel.relationshipType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{(rel.strength * 100).toFixed(0)}%</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{rel.description}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteRelationship(rel.id)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Skill Taxonomy */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Add Skill to Taxonomy</h3>
            <form onSubmit={handleAddSkillSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FastAPI"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option value="Programming Languages">Programming Languages</option>
                  <option value="Frameworks">Frameworks</option>
                  <option value="Databases">Databases</option>
                  <option value="Tools & DevOps">Tools & DevOps</option>
                  <option value="Cloud Platforms">Cloud Platforms</option>
                  <option value="Data Science & AI/ML">Data Science & AI/ML</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Aliases (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. py, python3"
                  value={newSkillAliases}
                  onChange={(e) => setNewSkillAliases(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Recognized Skill Repository</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {skills.map((s) => (
                <div key={s.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-[10px] text-slate-500">{s.category}</span>
                  </div>
                  <button onClick={() => onDeleteSkill(s.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Project Quality Rules */}
      {activeTab === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Rule-Based Project Quality Criteria (100 Points Total)</h3>
          <div className="space-y-3">
            {projectRules.map((r) => (
              <div key={r.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{r.ruleName}</span>
                  <p className="text-[11px] text-slate-500">{r.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-700">Points:</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={r.points}
                    onChange={(e) => onUpdateProjectRule(r.id, Number(e.target.value))}
                    className="w-16 p-1 border border-slate-300 rounded font-bold text-emerald-700 text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Course Recommendations Management */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Add Course Recommendation</h3>
            <p className="text-slate-500 mb-4">
              Curate recommended courses provided to candidates when missing skills are detected on their resume.
            </p>
            <form onSubmit={handleAddCourseSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring Boot"
                    value={courseSkillName}
                    onChange={(e) => setCourseSkillName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring Boot 3 & Hibernate Masterclass"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Provider *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coursera / Udemy / freeCodeCamp"
                    value={courseProvider}
                    onChange={(e) => setCourseProvider(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Difficulty Level</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Hours"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={courseUrl}
                    onChange={(e) => setCourseUrl(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Syllabus / Description</label>
                <textarea
                  rows={2}
                  placeholder="Outline key learning outcomes and tools covered..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow transition-colors flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Course to Curriculum</span>
                </button>
              </div>
            </form>
          </div>

          {/* Courses Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white font-bold flex justify-between items-center">
              <span>Curated Skill Remediation Courses ({courses.length})</span>
              <span className="text-slate-400 font-normal">Active Curriculum</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-3">Skill Target</th>
                    <th className="p-3">Course Title</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Level & Duration</th>
                    <th className="p-3">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">
                        <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                          {c.skillName}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{c.title}</td>
                      <td className="p-3 text-slate-600">{c.provider}</td>
                      <td className="p-3 text-slate-500">{c.duration} • {c.level}</td>
                      <td className="p-3">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-bold"
                        >
                          Visit →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-sm text-xs space-y-4 font-mono">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>System Audit & Governance Logs</span>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <div className="text-emerald-400 text-[10px]">{log.timestamp} • {log.actorEmail}</div>
                <div className="font-bold text-slate-100 mt-0.5">{log.action}</div>
                <div className="text-slate-400 text-[11px]">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
