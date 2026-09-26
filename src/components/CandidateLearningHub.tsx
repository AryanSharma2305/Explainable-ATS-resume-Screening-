import { useState, useMemo, FC } from 'react';
import { Course, JobDescription, CandidateProfile, Skill, SkillRelationship, ScoringWeights, ScoringThresholds, ProjectQualityRule } from '../types';
import { calculateATSScore } from '../services/ruleEngine';
import { getCoursesForSkill, getRecommendedCoursesForGaps } from '../services/courseService';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Plus, 
  Award, 
  Clock, 
  Layers, 
  ArrowRight,
  Check,
  Briefcase,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

interface CandidateLearningHubProps {
  candidate: CandidateProfile;
  jobs: JobDescription[];
  courses: Course[];
  knownSkills: Skill[];
  relationships: SkillRelationship[];
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  projectRules: ProjectQualityRule[];
  onAddLearnedSkill: (skillName: string) => void;
  onNavigateToTab?: (tab: 'applications' | 'browse' | 'courses' | 'profile') => void;
}

export const CandidateLearningHub: FC<CandidateLearningHubProps> = ({
  candidate,
  jobs,
  courses,
  knownSkills,
  relationships,
  weights,
  thresholds,
  projectRules,
  onAddLearnedSkill,
  onNavigateToTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'Beginner' | 'Intermediate' | 'Advanced'>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Compute all missing skills across active jobs
  const skillGapsByJob = useMemo(() => {
    const map = new Map<string, { jobs: JobDescription[]; courses: Course[] }>();

    jobs.forEach(job => {
      const score = calculateATSScore(candidate, job, relationships, weights, thresholds, projectRules);
      score.missingSkills.forEach(skill => {
        const key = skill.trim();
        if (!map.has(key)) {
          map.set(key, {
            jobs: [],
            courses: getCoursesForSkill(key, courses)
          });
        }
        map.get(key)!.jobs.push(job);
      });
    });

    return Array.from(map.entries()).map(([skillName, data]) => ({
      skillName,
      jobs: data.jobs,
      courses: data.courses,
      isAlreadyAcquired: (candidate.extractedSkills || []).some(
        s => s.toLowerCase() === skillName.toLowerCase()
      )
    }));
  }, [candidate, jobs, relationships, weights, thresholds, projectRules, courses]);

  // Filter courses in catalog
  const filteredCatalog = useMemo(() => {
    return courses.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.title.toLowerCase().includes(q) ||
        c.skillName.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [courses, searchQuery, levelFilter]);

  const totalGapsCount = skillGapsByJob.filter(g => !g.isAlreadyAcquired).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Skill Gap Remediation & Career Growth</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Upskill to Qualify for Target Roles
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 leading-relaxed">
            The ATS rule engine identifies precise missing skill gaps between your resume and open job requirements.
            Follow these curated courses, then click <strong>"I Learned This"</strong> to add the skill to your profile and re-apply!
          </p>
        </div>
      </div>

      {/* SECTION 1: TARGETED MISSING SKILLS GAPS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Prioritized Skill Gaps</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Missing Skills Detected Across Target Jobs ({totalGapsCount})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acquiring these skills will directly increase your ATS match percentage on open listings.
            </p>
          </div>

          {totalGapsCount > 0 ? (
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto border border-rose-200">
              {totalGapsCount} skill {totalGapsCount === 1 ? 'gap' : 'gaps'} to close
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto border border-emerald-200">
              ✓ All required skills satisfied!
            </span>
          )}
        </div>

        {skillGapsByJob.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-800">No Skill Gaps Detected</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your profile currently satisfies all skill requirements across posted openings!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {skillGapsByJob.map(({ skillName, jobs, courses: skillCourses, isAlreadyAcquired }) => (
              <div 
                key={skillName}
                className={`border rounded-2xl p-5 transition-all ${
                  isAlreadyAcquired 
                    ? 'bg-slate-50/60 border-slate-200 opacity-75' 
                    : 'bg-white border-slate-200 shadow-2xs hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                        isAlreadyAcquired
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-rose-100 text-rose-900 border border-rose-200'
                      }`}>
                        {skillName}
                      </span>
                      {isAlreadyAcquired ? (
                        <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Profile</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold text-xs">
                          Missing in your profile
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1.5 flex items-center flex-wrap gap-1">
                      <span>Required by:</span>
                      {jobs.map(j => (
                        <span key={j.id} className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {j.title} ({j.companyName})
                        </span>
                      ))}
                    </div>
                  </div>

                  {!isAlreadyAcquired && (
                    <button
                      onClick={() => onAddLearnedSkill(skillName)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-colors flex items-center space-x-1.5 self-start md:self-auto shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>I Learned This (Add to Profile)</span>
                    </button>
                  )}
                </div>

                {/* Recommended Course Cards for this Gap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                  {skillCourses.map(c => (
                    <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
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

                      <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">Official Curriculum</span>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors"
                        >
                          <span>Start Learning</span>
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: FULL COURSE CATALOG */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Full Curriculum Directory</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Browse All Career Up-skilling Courses ({courses.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Learn technologies recognized in our Skill Taxonomy and automated relationship maps.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by skill (e.g. Spring Boot, Python, SQL, Docker, React, Machine Learning)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map(course => {
            const isAcquired = (candidate.extractedSkills || []).some(
              s => s.toLowerCase() === course.skillName.toLowerCase()
            );

            return (
              <div 
                key={course.id} 
                className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1.5">
                    <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                      {course.skillName}
                    </span>
                    <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[9px]">
                      {course.level}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 mt-1 leading-snug">
                    {course.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {course.provider} • {course.duration}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center space-x-1"
                  >
                    <span>Open Syllabus</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {isAcquired ? (
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center space-x-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                      <Check className="w-3 h-3" />
                      <span>In Profile</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onAddLearnedSkill(course.skillName)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Skill</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
