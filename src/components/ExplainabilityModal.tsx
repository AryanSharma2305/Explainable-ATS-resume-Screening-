import React from 'react';
import { ATSScoreBreakdown, CandidateProfile, JobDescription } from '../types';
import { generateCandidateReportPDF } from '../services/reportGenerator';
import { CheckCircle2, AlertTriangle, XCircle, Download, X, HelpCircle, Layers, Award } from 'lucide-react';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  job: JobDescription;
  breakdown: ATSScoreBreakdown;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  candidate,
  job,
  breakdown
}) => {
  if (!isOpen) return null;

  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case 'Excellent Match': return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'Strong Match': return 'bg-teal-500/10 text-teal-700 border-teal-300';
      case 'Good Match': return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'Moderate Match': return 'bg-amber-500/10 text-amber-700 border-amber-300';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                Explainability Audit Inspector
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getBadgeStyle(breakdown.classification)}`}>
                {breakdown.classification}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-slate-100">
              Score Analysis: {candidate.fullName} vs {job.title}
            </h2>
            <p className="text-xs text-slate-400">
              Transparent, rule-based mathematical decomposition without black-box machine learning models.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Top Score Scorecard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Match Score</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {breakdown.overallScore}%
              </div>
              <span className="text-[11px] text-slate-300 mt-1">Weighted Rule Sum</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Skill Match</span>
              <span className="text-lg font-bold text-slate-800">{breakdown.skillScoreWeighted} / 40</span>
              <span className="text-[10px] text-slate-500 block font-medium">({breakdown.skillScoreRaw}%)</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Project Quality</span>
              <span className="text-lg font-bold text-slate-800">{breakdown.projectScoreWeighted} / 20</span>
              <span className="text-[10px] text-slate-500 block font-medium">({breakdown.projectScoreRaw}%)</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Experience</span>
              <span className="text-lg font-bold text-slate-800">{breakdown.expScoreWeighted} / 20</span>
              <span className="text-[10px] text-slate-500 block font-medium">({breakdown.expScoreRaw}%)</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Edu & Certs</span>
              <span className="text-lg font-bold text-slate-800">{(breakdown.eduScoreWeighted + breakdown.certScoreWeighted).toFixed(1)} / 20</span>
              <span className="text-[10px] text-slate-500 block font-medium">({breakdown.eduScoreRaw}% / {breakdown.certScoreRaw}%)</span>
            </div>
          </div>

          {/* Mathematical Formula Breakdown */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm mb-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Mathematical Formula & Component Calculation</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs text-amber-950 bg-amber-100/50 p-3 rounded-lg border border-amber-200 leading-relaxed">
              {breakdown.formulaBreakdown}
            </pre>
          </div>

          {/* Skill Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Exact Matched Skills */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Exact Matched Skills ({breakdown.exactMatchedSkills.length})</span>
              </div>
              {breakdown.exactMatchedSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No exact skill matches detected.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.exactMatchedSkills.map((sk) => (
                    <span key={sk} className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-md">
                      ✔ {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Related Skill Matches */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm mb-3">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Related Skill Matches ({breakdown.relatedMatchedSkills.length})</span>
              </div>
              {breakdown.relatedMatchedSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No related skill mappings applied.</p>
              ) : (
                <div className="space-y-2">
                  {breakdown.relatedMatchedSkills.map((rel, idx) => (
                    <div key={idx} className="bg-white border border-amber-300 rounded-lg p-2.5 text-xs shadow-sm">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span>Req: {rel.requiredSkill}</span>
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                          {rel.creditEarnedPercentage}% Credit
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">
                        Satisfied via <span className="font-semibold text-slate-800">"{rel.candidateSkill}"</span> ({rel.relationshipType}).
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm mb-3">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Missing Required Skills ({breakdown.missingSkills.length})</span>
              </div>
              {breakdown.missingSkills.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium">All required job skills are satisfied!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.missingSkills.map((ms) => (
                    <span key={ms} className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold px-2.5 py-1 rounded-md">
                      ✘ {ms}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Project Evaluation Rules & Improvement Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Project Evaluation Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 font-bold text-sm text-slate-800 mb-2">
                <Award className="w-4 h-4 text-slate-600" />
                <span>Rule-Based Project Evaluation</span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {breakdown.projectEvaluations.map((proj) => (
                  <div key={proj.projectId} className="bg-white border border-slate-200 p-3 rounded-lg text-xs">
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{proj.projectTitle}</span>
                      <span className="text-emerald-700">{proj.score} / 100 pts</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700 block">Criteria Detected:</span>
                      <p>{proj.detectedCriteria.join(', ') || 'Standard description'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 font-bold text-sm text-slate-800 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Actionable Recommendations</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {breakdown.improvementSuggestions.map((sug, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* System Audit Log Trail */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] border border-slate-800">
            <span className="text-slate-400 font-bold block mb-1">System Execution Audit Trail Log:</span>
            <div className="max-h-36 overflow-y-auto space-y-1 text-slate-300">
              {breakdown.auditTrail.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={() => generateCandidateReportPDF(candidate, job, breakdown)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Evaluation Report PDF</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
