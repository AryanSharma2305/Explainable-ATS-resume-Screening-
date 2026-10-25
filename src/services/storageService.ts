import { 
  User, 
  CompanyTenant, 
  JobDescription, 
  CandidateProfile, 
  JobApplication, 
  Skill, 
  SkillRelationship, 
  ScoringWeights, 
  ScoringThresholds, 
  ProjectQualityRule, 
  Course, 
  AuditLog 
} from '../types';

export interface StoragePayload {
  users: User[];
  companies: CompanyTenant[];
  jobs: JobDescription[];
  candidates: CandidateProfile[];
  applications: JobApplication[];
  skills: Skill[];
  relationships: SkillRelationship[];
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  projectRules: ProjectQualityRule[];
  courses: Course[];
  auditLogs: AuditLog[];
  lastUpdated?: string;
  expiresAt?: string;
  retentionDays?: number;
}

const STORAGE_KEYS = [
  'ats_users',
  'ats_companies',
  'ats_jobs',
  'ats_candidates',
  'ats_applications',
  'ats_skills_v4',
  'ats_relationships_v4',
  'ats_weights',
  'ats_thresholds',
  'ats_project_rules',
  'ats_courses_v3',
  'ats_audit_logs',
  'ats_current_user'
];

/**
 * Fetch persisted data from Express backend
 */
export async function fetchServerStorage(): Promise<StoragePayload | null> {
  try {
    const res = await fetch('/api/storage');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as StoragePayload;
    }
    return null;
  } catch (err) {
    console.warn('[StorageService] Server storage unreachable, using local storage cache:', err);
    return null;
  }
}

/**
 * Persist data to both Express backend disk & local storage
 */
export async function syncStorageToServer(payload: StoragePayload): Promise<boolean> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const fullPayload = {
      ...payload,
      lastUpdated: now.toISOString(),
      expiresAt,
      retentionDays: 30
    };

    // Save to localStorage as immediate offline cache
    try {
      localStorage.setItem('ats_last_synced_at', now.toISOString());
      localStorage.setItem('ats_expires_at', expiresAt);
    } catch {
      // ignore quota errors
    }

    // Post to server file database
    const res = await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload)
    });

    return res.ok;
  } catch (err) {
    console.warn('[StorageService] Error syncing to server:', err);
    return false;
  }
}

/**
 * Get detailed stats on stored records and storage size
 */
export function calculateStorageStats(payload?: Partial<StoragePayload>) {
  let totalBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ats_') || STORAGE_KEYS.includes(key))) {
        const val = localStorage.getItem(key) || '';
        totalBytes += (key.length + val.length) * 2; // UTF-16 ~2 bytes per char
      }
    }
  } catch {
    totalBytes = 250000;
  }

  const kb = Math.max(1, Math.round(totalBytes / 1024));

  const now = new Date();
  const storedDateStr = localStorage.getItem('ats_last_synced_at') || new Date().toISOString();
  const storedDate = new Date(storedDateStr);
  const diffDays = Math.floor((now.getTime() - storedDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(1, 30 - diffDays);

  return {
    sizeKb: kb,
    retentionDaysTotal: 30,
    daysRemaining,
    lastSavedDate: storedDate.toLocaleString(),
    policy: '30-Day Guaranteed Retention Window'
  };
}

/**
 * Export complete database as JSON download
 */
export function downloadBackupJSON(payload: StoragePayload) {
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ats_screener_30day_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
