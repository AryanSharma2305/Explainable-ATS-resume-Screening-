import { 
  CandidateProfile, 
  JobDescription, 
  Skill, 
  SkillRelationship, 
  ScoringWeights, 
  ScoringThresholds, 
  ATSScoreBreakdown, 
  MatchClassification, 
  RelatedMatchDetail, 
  ProjectEvaluationDetail, 
  ProjectQualityRule 
} from '../types';

/**
 * Programming Domain Knowledge Base:
 * Maps Parent Languages and Core Technical Categories to their Frameworks, Libraries, ORMs, and Tools.
 */
export const PROGRAMMING_ECOSYSTEM_MAP: Record<string, { parentLanguage: string; category: string; description: string }> = {
  // Python Ecosystem
  'flask': { parentLanguage: 'Python', category: 'Frameworks', description: 'Lightweight Python web framework' },
  'django': { parentLanguage: 'Python', category: 'Frameworks', description: 'High-level Python web framework' },
  'fastapi': { parentLanguage: 'Python', category: 'Frameworks', description: 'Modern, high-performance Python API framework' },
  'pandas': { parentLanguage: 'Python', category: 'Data Science', description: 'Core Python data analysis library' },
  'numpy': { parentLanguage: 'Python', category: 'Data Science', description: 'Numerical computing library for Python' },
  'scikit-learn': { parentLanguage: 'Python', category: 'Data Science', description: 'Python machine learning framework' },
  'pytorch': { parentLanguage: 'Python', category: 'AI/ML', description: 'Deep learning library for Python' },
  'tensorflow': { parentLanguage: 'Python', category: 'AI/ML', description: 'Machine learning platform for Python' },
  'sqlalchemy': { parentLanguage: 'Python', category: 'Frameworks', description: 'Python SQL toolkit and ORM' },
  'celery': { parentLanguage: 'Python', category: 'Tools & DevOps', description: 'Asynchronous task queue for Python' },
  'tornado': { parentLanguage: 'Python', category: 'Frameworks', description: 'Asynchronous web framework for Python' },
  'streamlit': { parentLanguage: 'Python', category: 'Data Science', description: 'Python app framework for data scripts' },

  // Java Ecosystem
  'spring boot': { parentLanguage: 'Java', category: 'Frameworks', description: 'Enterprise Java microservice framework' },
  'spring': { parentLanguage: 'Java', category: 'Frameworks', description: 'Java application framework' },
  'hibernate': { parentLanguage: 'Java', category: 'Frameworks', description: 'Java ORM persistence framework' },
  'maven': { parentLanguage: 'Java', category: 'Tools & DevOps', description: 'Java project build management tool' },
  'gradle': { parentLanguage: 'Java', category: 'Tools & DevOps', description: 'Java build automation system' },
  'junit': { parentLanguage: 'Java', category: 'Testing', description: 'Java unit testing framework' },

  // JavaScript / TypeScript Ecosystem
  'react': { parentLanguage: 'JavaScript', category: 'Frameworks', description: 'Frontend JavaScript component library' },
  'angular': { parentLanguage: 'TypeScript', category: 'Frameworks', description: 'TypeScript web app framework' },
  'vue': { parentLanguage: 'JavaScript', category: 'Frameworks', description: 'Progressive JavaScript UI framework' },
  'node.js': { parentLanguage: 'JavaScript', category: 'Frameworks', description: 'Server-side JavaScript runtime' },
  'express': { parentLanguage: 'JavaScript', category: 'Frameworks', description: 'Fast web framework for Node.js / JS' },
  'next.js': { parentLanguage: 'JavaScript', category: 'Frameworks', description: 'React framework for server rendering' },
  'nestjs': { parentLanguage: 'TypeScript', category: 'Frameworks', description: 'TypeScript backend framework' },
  'redux': { parentLanguage: 'JavaScript', category: 'Frameworks', description: 'JavaScript state management library' },

  // SQL Databases
  'mysql': { parentLanguage: 'SQL', category: 'Databases', description: 'Relational database using SQL' },
  'postgresql': { parentLanguage: 'SQL', category: 'Databases', description: 'Advanced open-source SQL database' },
  'sqlite': { parentLanguage: 'SQL', category: 'Databases', description: 'Embedded relational SQL database' },
  'oracle db': { parentLanguage: 'SQL', category: 'Databases', description: 'Enterprise relational SQL database' },
  'sql server': { parentLanguage: 'SQL', category: 'Databases', description: 'Microsoft SQL relational database' },
  'mariadb': { parentLanguage: 'SQL', category: 'Databases', description: 'Open-source relational SQL database' },

  // C# / .NET Ecosystem
  'asp.net': { parentLanguage: 'C#', category: 'Frameworks', description: 'Web application framework for C#' },
  'entity framework': { parentLanguage: 'C#', category: 'Frameworks', description: 'ORM for C# / .NET' },

  // PHP Ecosystem
  'laravel': { parentLanguage: 'PHP', category: 'Frameworks', description: 'Web application framework for PHP' },
  'symfony': { parentLanguage: 'PHP', category: 'Frameworks', description: 'PHP web framework' },

  // C++ Ecosystem
  'qt': { parentLanguage: 'C++', category: 'Frameworks', description: 'C++ cross-platform framework' },
  'unreal engine': { parentLanguage: 'C++', category: 'Frameworks', description: 'C++ 3D game engine' }
};

/**
 * Canonicalizes a skill string to its primary identity for robust comparison,
 * handling case, punctuation, and common variants (e.g. "Node" = "Node.js", "postgres" = "PostgreSQL").
 */
export function getCanonicalSkill(name: string): string {
  if (!name) return '';
  const raw = name.toLowerCase().trim();
  // Strip trailing descriptors
  const stripped = raw
    .replace(/\s+(developer|framework|engineer|library|cms|language|runtime|core)$/g, '')
    .trim();

  // Common variant mapping
  const variants: Record<string, string> = {
    'node': 'node.js',
    'nodejs': 'node.js',
    'node.js': 'node.js',
    'postgres': 'postgresql',
    'postgresql': 'postgresql',
    'postgres dba': 'postgresql',
    'pg': 'postgresql',
    'vue': 'vue.js',
    'vuejs': 'vue.js',
    'vue.js': 'vue.js',
    'express': 'express',
    'expressjs': 'express',
    'express.js': 'express',
    'react': 'react',
    'reactjs': 'react',
    'react.js': 'react',
    'next': 'next.js',
    'nextjs': 'next.js',
    'next.js': 'next.js',
    'k8s': 'kubernetes',
    'kubernetes': 'kubernetes',
    'kube': 'kubernetes',
    'sklearn': 'scikit-learn',
    'scikit learn': 'scikit-learn',
    'scikit-learn': 'scikit-learn',
    'tf': 'tensorflow',
    'tensorflow': 'tensorflow',
    'pytorch': 'pytorch',
    'torch': 'pytorch',
    'rails': 'ruby on rails',
    'ruby on rails': 'ruby on rails',
    'tailwind': 'tailwind css',
    'tailwindcss': 'tailwind css',
    'tailwind css': 'tailwind css',
    'dotnet': '.net',
    '.net': '.net',
    'asp.net': 'asp.net',
    'aspnet': 'asp.net',
    'asp.net core': 'asp.net core',
    'aspnetcore': 'asp.net core',
    'dotnet core': 'asp.net core',
    'powerbi': 'power bi',
    'power bi': 'power bi',
    'tsql': 't-sql',
    't-sql': 't-sql',
    'plsql': 'pl/sql',
    'pl/sql': 'pl/sql',
    'c++': 'c++',
    'cpp': 'c++',
    'c plus plus': 'c++',
    'c#': 'c#',
    'csharp': 'c#',
    'c sharp': 'c#',
    'golang': 'go',
    'go': 'go',
    'helm': 'helm',
    'docker': 'docker',
    'git': 'git',
    'github': 'github',
    'gitlab': 'gitlab',
    'aws': 'aws',
    'amazon web services': 'aws',
    'spring boot': 'spring boot',
    'springboot': 'spring boot',
    'spring': 'spring',
    'spring framework': 'spring',
    'material ui': 'material ui',
    'material-ui': 'material ui',
    'mui': 'material ui',
    'bootstrap': 'bootstrap',
    'bootstrap 5': 'bootstrap',
    'bootstrap 4': 'bootstrap',
    'sql': 'sql',
    'mysql': 'mysql',
    'sqlite': 'sqlite',
    'oracle': 'oracle',
    'sql server': 'sql server'
  };

  if (variants[stripped]) {
    return variants[stripped];
  }

  // Remove non-alphanumeric except + # .
  return stripped.replace(/[^a-z0-9+#\.]/g, '').trim();
}

/**
 * Checks if two skill names refer to the same skill, case-insensitively and handling variants.
 * Strictly prevents false positives like Java == JavaScript or C == C++ or C == C#.
 */
export function areSkillsEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normA = a.toLowerCase().trim();
  const normB = b.toLowerCase().trim();
  if (normA === normB) return true;

  // Strict negative boundaries: distinct programming languages must never cross-match
  if ((normA === 'java' && normB.includes('javascript')) || (normB === 'java' && normA.includes('javascript'))) {
    return false;
  }
  if ((normA === 'c' && (normB === 'c++' || normB === 'c#')) || (normB === 'c' && (normA === 'c++' || normA === 'c#'))) {
    return false;
  }
  if ((normA === 'c++' && normB === 'c#') || (normB === 'c++' && normA === 'c#')) {
    return false;
  }

  const canonA = getCanonicalSkill(a);
  const canonB = getCanonicalSkill(b);

  if (canonA && canonB && canonA === canonB) {
    return true;
  }

  const tA = normalizeText(a);
  const tB = normalizeText(b);
  if (tA && tB && tA === tB) {
    return true;
  }

  return false;
}

export interface InferredSkillMatch {
  skill: string;             // Right-side implied skill, e.g. "Python"
  sourceSkill: string;       // Left-side skill from resume that implies it, e.g. "Flask"
  viaChain: string[];        // Derivation chain, e.g. ["Helm", "Kubernetes", "Docker"]
  relationshipType: string;
  strength: number;
  description: string;
}

/**
 * Applies the Skill Relationship Map transitively and strictly one-way (LEFT -> RIGHT).
 * Rules:
 * 1. Direction is strict: each entry is SKILL -> IMPLIES. If candidate has the left skill,
 *    automatically add the right skill. A base language must NEVER add a framework.
 * 2. Apply transitively: e.g. Helm -> Kubernetes -> Docker yields both Kubernetes and Docker.
 *    Spring Boot -> Spring -> Java yields both Spring and Java.
 *    Keep applying until no new skills are added.
 * 3. Multiple implications: e.g. TensorFlow -> Python AND TensorFlow -> Machine Learning both get added.
 * 4. Matching is case-insensitive and handles common variants ("Node" = "Node.js", "postgres" = "PostgreSQL").
 */
export function getTransitiveInferredSkills(
  candidateSkills: string[],
  relationships: SkillRelationship[]
): InferredSkillMatch[] {
  if (!candidateSkills || candidateSkills.length === 0 || !relationships || relationships.length === 0) {
    return [];
  }

  const inferred: InferredSkillMatch[] = [];

  type QueueItem = {
    skill: string;
    sourceSkill: string;
    chain: string[];
    strength: number;
    relType: string;
    desc: string;
  };

  const queue: QueueItem[] = candidateSkills.map(sk => ({
    skill: sk,
    sourceSkill: sk,
    chain: [sk],
    strength: 1.0,
    relType: 'framework_of',
    desc: ''
  }));

  const visitedExpansions = new Set<string>();
  let loopCount = 0;
  const maxLoops = 50;

  while (queue.length > 0 && loopCount < maxLoops) {
    loopCount++;
    const current = queue.shift()!;

    // Find all relationships where rel.skill matches current.skill
    // STRICT ONE-WAY: rel.skill -> rel.relatedSkill. Never reverse.
    for (const rel of relationships) {
      if (areSkillsEqual(rel.skill, current.skill)) {
        const implied = rel.relatedSkill;
        const expansionKey = `${current.skill.toLowerCase()}->${implied.toLowerCase()}`;
        if (visitedExpansions.has(expansionKey)) continue;
        visitedExpansions.add(expansionKey);

        const newChain = [...current.chain, implied];
        const newStrength = Math.min(current.strength, rel.strength);

        // Record if not already inferred for this implied skill
        const alreadyInferred = inferred.some(item => areSkillsEqual(item.skill, implied));
        if (!alreadyInferred) {
          inferred.push({
            skill: implied,
            sourceSkill: current.sourceSkill,
            viaChain: newChain,
            relationshipType: rel.relationshipType,
            strength: newStrength,
            description: rel.description || `${current.sourceSkill} implies ${implied}`
          });
        }

        // Push into queue for transitive chain continuation (e.g. Helm -> Kubernetes -> Docker)
        queue.push({
          skill: implied,
          sourceSkill: current.sourceSkill,
          chain: newChain,
          strength: newStrength,
          relType: rel.relationshipType,
          desc: rel.description
        });
      }
    }
  }

  return inferred;
}

/**
 * Normalizes string for fuzzy/exact string matching (lowercasing, trimming, removing special symbols)
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts recognized skills from arbitrary text (Resume or JD) using rules, regex, aliases,
 * AND automatic programming language ecosystem inference (e.g. Flask -> Python).
 */
export function extractSkillsFromText(text: string, knownSkills: Skill[]): string[] {
  const normText = ` ${normalizeText(text)} `;
  const detected = new Set<string>();

  // 1. Direct and Alias Scanning
  for (const skill of knownSkills) {
    const mainNorm = normalizeText(skill.name);
    if (mainNorm.length === 0) continue;

    // Check main skill name regex boundary
    const regexMain = new RegExp(`(?:^|\\s)${escapeRegex(mainNorm)}(?:$|\\s|\\sdeveloper|\\sframework|\\sengineer)`, 'i');
    if (regexMain.test(normText) || normText.includes(` ${mainNorm} `)) {
      detected.add(skill.name);
      continue;
    }

    // Check aliases
    for (const alias of skill.aliases) {
      const aliasNorm = normalizeText(alias);
      if (aliasNorm.length > 0) {
        const regexAlias = new RegExp(`(?:^|\\s)${escapeRegex(aliasNorm)}(?:$|\\s)`, 'i');
        if (regexAlias.test(normText) || normText.includes(` ${aliasNorm} `)) {
          detected.add(skill.name);
          break;
        }
      }
    }
  }

  // 2. Extra Phrase Scanning for Developer Titles (e.g., "Flask Developer", "React Engineer", "Postgres DBA")
  const phraseMatches: Record<string, string> = {
    'flask developer': 'Flask',
    'django developer': 'Django',
    'python developer': 'Python',
    'python backend developer': 'Python',
    'java developer': 'Java',
    'react developer': 'React',
    'node developer': 'Node.js',
    'node.js developer': 'Node.js',
    'postgres dba': 'PostgreSQL',
    'sql developer': 'SQL',
    'fastapi developer': 'FastAPI',
    'spring developer': 'Spring Boot',
    'spring boot developer': 'Spring Boot'
  };

  for (const [phrase, skillName] of Object.entries(phraseMatches)) {
    if (normText.includes(phrase)) {
      detected.add(skillName);
    }
  }

  return Array.from(detected);
}

/**
 * Rule-Based Project Quality Evaluator
 */
export function evaluateCandidateProjects(
  candidate: CandidateProfile, 
  rules: ProjectQualityRule[]
): ProjectEvaluationDetail[] {
  if (!candidate.projects || candidate.projects.length === 0) {
    return [{
      projectId: 'p-none',
      projectTitle: 'No Projects Listed',
      score: 0,
      detectedCriteria: [],
      missingSuggestions: ['Add at least 1-2 technical projects to demonstrate practical skills.']
    }];
  }

  return candidate.projects.map((proj) => {
    let rawScore = 0;
    const detected: string[] = [];
    const missing: string[] = [];

    const techText = (proj.technologies || []).join(' ') + ' ' + (proj.description || '');
    const normTech = normalizeText(techText);

    for (const rule of rules) {
      let passed = false;

      switch (rule.checkType) {
        case 'database':
          passed = proj.hasDatabase === true || /(database|sql|mysql|postgres|mongo|sqlite|oracle|db)/i.test(normTech);
          break;

        case 'auth':
          passed = proj.hasAuth === true || /(auth|jwt|login|session|password|oauth|role|access control)/i.test(normTech);
          break;

        case 'rest_api':
          passed = proj.hasRestApi === true || /(rest|api|endpoint|http|route|postman|json)/i.test(normTech);
          break;

        case 'framework':
          passed = proj.hasFramework === true || /(flask|django|fastapi|spring|react|angular|express|vue|next)/i.test(normTech);
          break;

        case 'cloud':
          passed = proj.hasDeployment === true || /(docker|aws|azure|gcp|heroku|cloud|kubernetes|deploy|ci\/cd)/i.test(normTech);
          break;

        case 'git':
          passed = proj.hasGit === true || /(git|github|gitlab|version control)/i.test(normTech);
          break;

        case 'crud':
          passed = proj.hasCrud === true || /(crud|create|read|update|delete|management|portal)/i.test(normTech);
          break;

        case 'description':
          passed = (proj.description || '').trim().length >= 35;
          break;

        case 'metrics':
          passed = proj.hasMeasurableResults === true || /(\d+%|\d+ms|\d+ users|\d+k|reduced|increased|latency|optimized|sub-)/i.test(proj.description || '');
          break;

        case 'multi_tech':
          passed = (proj.technologies || []).length >= 3 || normTech.split(' ').length > 15;
          break;
      }

      if (passed) {
        rawScore += rule.points;
        detected.push(rule.ruleName);
      } else {
        missing.push(`Consider: ${rule.description}`);
      }
    }

    const finalProjectScore = Math.min(100, Math.max(0, rawScore));

    return {
      projectId: proj.id,
      projectTitle: proj.title,
      score: finalProjectScore,
      detectedCriteria: detected,
      missingSuggestions: missing.slice(0, 3)
    };
  });
}

/**
 * Transparent ATS Scoring Engine
 */
export function calculateATSScore(
  candidate: CandidateProfile,
  job: JobDescription,
  relationships: SkillRelationship[],
  weights: ScoringWeights = { skillMatch: 40, projectQuality: 20, experience: 20, education: 10, certification: 10 },
  thresholds: ScoringThresholds = { excellent: 95, strong: 85, good: 70, moderate: 55 },
  projectRules: ProjectQualityRule[] = []
): ATSScoreBreakdown {
  const auditTrail: string[] = [];
  auditTrail.push(`--- ATS SCORING AUDIT START ---`);
  auditTrail.push(`Candidate: ${candidate.fullName} | Job: ${job.title} at ${job.companyName}`);

  const candSkillList = candidate.extractedSkills || [];
  const requiredSkills = job.requiredSkills || [];
  const exactMatches: string[] = [];
  const relatedMatches: RelatedMatchDetail[] = [];
  const missingSkills: string[] = [];

  // Transitively expand candidate skills through strict one-way relationship map
  const candidateInferredSkills = getTransitiveInferredSkills(candSkillList, relationships);

  let skillPointsEarned = 0;
  const totalRequiredSkillsCount = requiredSkills.length || 1;
  const pointsPerSkill = 100 / totalRequiredSkillsCount;

  for (const reqSkill of requiredSkills) {
    // A. Check Direct / Exact Skill Match (case-insensitive & variant-aware)
    let exactFound = false;
    for (const candSk of candSkillList) {
      if (areSkillsEqual(candSk, reqSkill)) {
        exactFound = true;
        exactMatches.push(reqSkill);
        skillPointsEarned += pointsPerSkill;
        auditTrail.push(`✔ [Skill Direct Match] Found resume skill "${candSk}" matching required "${reqSkill}" (+${pointsPerSkill.toFixed(1)} pts)`);
        break;
      }
    }

    if (exactFound) continue;

    // B. Check Related Skill Match via Transitive One-Way Relationship Map
    let foundRelated = false;
    for (const inf of candidateInferredSkills) {
      if (areSkillsEqual(inf.skill, reqSkill)) {
        foundRelated = true;
        const creditPercent = inf.strength * 100;
        const pointsFromRelated = pointsPerSkill * inf.strength;
        skillPointsEarned += pointsFromRelated;

        const chainDesc = inf.viaChain.length > 2
          ? ` (${inf.viaChain.join(' → ')})`
          : '';

        relatedMatches.push({
          requiredSkill: reqSkill,
          candidateSkill: inf.sourceSkill,
          relationshipType: inf.relationshipType as any,
          strength: inf.strength,
          creditEarnedPercentage: Math.round(creditPercent),
          explanation: `Candidate skill "${inf.sourceSkill}" implies required skill "${reqSkill}"${chainDesc}. Full credit granted.`
        });

        auditTrail.push(`⚡ [Relationship Map Match] Required "${reqSkill}" satisfied via candidate's "${inf.sourceSkill}"${chainDesc}. (+${pointsFromRelated.toFixed(1)} pts)`);
        break;
      }
    }

    // C. Fallback: Check Programming Ecosystem Knowledge Map
    if (!foundRelated) {
      for (const candidateSkill of candSkillList) {
        const candKey = normalizeText(candidateSkill).replace(/ developer| framework| engineer/g, '').trim();
        const ecoInfo = PROGRAMMING_ECOSYSTEM_MAP[candKey];

        if (ecoInfo && areSkillsEqual(ecoInfo.parentLanguage, reqSkill)) {
          foundRelated = true;
          const strength = 1.0;
          const pointsFromRelated = pointsPerSkill * strength;
          skillPointsEarned += pointsFromRelated;

          relatedMatches.push({
            requiredSkill: reqSkill,
            candidateSkill: candidateSkill,
            relationshipType: 'framework_of',
            strength: strength,
            creditEarnedPercentage: 100,
            explanation: `Candidate skill "${candidateSkill}" is a recognized ${ecoInfo.description} belonging to ${ecoInfo.parentLanguage}. 100% credit granted.`
          });

          auditTrail.push(`⚡ [Domain Knowledge Match] Required "${reqSkill}" satisfied via "${candidateSkill}" (${ecoInfo.description}). (+${pointsFromRelated.toFixed(1)} pts)`);
          break;
        }
      }
    }

    // D. Missing Skill
    if (!foundRelated) {
      missingSkills.push(reqSkill);
      auditTrail.push(`✘ [Skill Missing] Required skill "${reqSkill}" not detected or implied in candidate's resume.`);
    }
  }

  const skillScoreRaw = Math.min(100, Math.max(0, Math.round(skillPointsEarned)));
  const skillScoreWeighted = Number(((skillScoreRaw / 100) * weights.skillMatch).toFixed(1));

  // 2. PROJECT QUALITY EVALUATION
  const projectEvals = evaluateCandidateProjects(candidate, projectRules);
  let avgProjectRaw = 0;
  if (projectEvals.length > 0) {
    const totalProjScore = projectEvals.reduce((acc, p) => acc + p.score, 0);
    avgProjectRaw = Math.round(totalProjScore / projectEvals.length);
  }
  const projectScoreWeighted = Number(((avgProjectRaw / 100) * weights.projectQuality).toFixed(1));
  auditTrail.push(`📁 [Project Quality] Raw Score: ${avgProjectRaw}/100 -> Weighted: ${projectScoreWeighted}/${weights.projectQuality}`);

  // 3. WORK EXPERIENCE EVALUATION
  const requiredYears = job.minExperienceYears || 0;
  const candYears = candidate.totalExpYears || 0;
  let expScoreRaw = 100;

  if (requiredYears > 0) {
    if (candYears >= requiredYears) {
      expScoreRaw = 100;
      auditTrail.push(`💼 [Experience] Meets requirement (${candYears} yrs vs required ${requiredYears} yrs). Raw: 100/100`);
    } else {
      expScoreRaw = Math.round((candYears / requiredYears) * 100);
      auditTrail.push(`💼 [Experience Gap] ${candYears} yrs vs required ${requiredYears} yrs. Raw: ${expScoreRaw}/100`);
    }
  } else {
    expScoreRaw = 100;
  }
  const expScoreWeighted = Number(((expScoreRaw / 100) * weights.experience).toFixed(1));

  // 4. EDUCATION EVALUATION WITH DEGREE LEVEL HIERARCHY
  let eduScoreRaw = 70;
  const reqDegreeNorm = normalizeText(job.minEducationDegree || '');
  const candDegreeNorm = normalizeText(candidate.highestDegree || '');

  // Helper degree level rank: 3 = Master/Phd, 2 = Bachelor, 1 = Diploma
  const getDegreeLevel = (text: string): number => {
    if (/(phd|doctor|master|mca|m\.tech|m\.sc|ms)/i.test(text)) return 3;
    if (/(bachelor|bca|b\.tech|b\.e|b\.sc|bs|degree)/i.test(text)) return 2;
    return 1;
  };

  const reqLevel = getDegreeLevel(reqDegreeNorm);
  const candLevel = getDegreeLevel(candDegreeNorm);

  if (candLevel >= reqLevel || reqDegreeNorm === '') {
    eduScoreRaw = 100;
    auditTrail.push(`🎓 [Education] Candidate degree level (${candidate.highestDegree}) satisfies required (${job.minEducationDegree}). Raw: 100/100`);
  } else if (candLevel === reqLevel - 1) {
    eduScoreRaw = 80;
    auditTrail.push(`🎓 [Education Partial] Candidate degree level (${candidate.highestDegree}) is 1 step below required (${job.minEducationDegree}). Raw: 80/100`);
  } else {
    eduScoreRaw = 60;
    auditTrail.push(`🎓 [Education Gap] Candidate degree level (${candidate.highestDegree}) below required (${job.minEducationDegree}). Raw: 60/100`);
  }
  const eduScoreWeighted = Number(((eduScoreRaw / 100) * weights.education).toFixed(1));

  // 5. CERTIFICATION EVALUATION
  let certScoreRaw = 100;
  if (job.requiredCertifications && job.requiredCertifications.length > 0) {
    const candCerts = (candidate.certifications || []).map(c => c.name.toLowerCase());
    let matchedCerts = 0;
    for (const reqCert of job.requiredCertifications) {
      if (candCerts.some(c => c.includes(reqCert.toLowerCase()))) {
        matchedCerts++;
      }
    }
    certScoreRaw = Math.round((matchedCerts / job.requiredCertifications.length) * 100);
    auditTrail.push(`📜 [Certifications] Matched ${matchedCerts}/${job.requiredCertifications.length} required certifications. Raw: ${certScoreRaw}/100`);
  } else {
    if (candidate.certifications && candidate.certifications.length > 0) {
      certScoreRaw = 100;
      auditTrail.push(`📜 [Certifications] Candidate possesses ${candidate.certifications.length} relevant certifications. Raw: 100/100`);
    } else {
      certScoreRaw = 70;
      auditTrail.push(`📜 [Certifications] Baseline score granted; no required certifications specified. Raw: 70/100`);
    }
  }
  const certScoreWeighted = Number(((certScoreRaw / 100) * weights.certification).toFixed(1));

  // OVERALL MATHEMATICAL SUM
  const totalScoreUnrounded = skillScoreWeighted + projectScoreWeighted + expScoreWeighted + eduScoreWeighted + certScoreWeighted;
  const overallScore = Math.min(100, Math.max(0, Math.round(totalScoreUnrounded)));

  // NEUTRAL CLASSIFICATION THRESHOLDS
  let classification: MatchClassification = 'Low Match';
  if (overallScore >= thresholds.excellent) {
    classification = 'Excellent Match';
  } else if (overallScore >= thresholds.strong) {
    classification = 'Strong Match';
  } else if (overallScore >= thresholds.good) {
    classification = 'Good Match';
  } else if (overallScore >= thresholds.moderate) {
    classification = 'Moderate Match';
  } else {
    classification = 'Low Match';
  }

  // FORMULA BREAKDOWN EXPLANATION
  const formulaBreakdown = `Overall ATS Score: ${overallScore}% (${classification})\n` +
    `Decomposed Mathematical Formula:\n` +
    `- Skill Match (${weights.skillMatch}% weight): ${skillScoreWeighted} / ${weights.skillMatch} pts (Raw: ${skillScoreRaw}%)\n` +
    `- Project Quality (${weights.projectQuality}% weight): ${projectScoreWeighted} / ${weights.projectQuality} pts (Raw: ${avgProjectRaw}%)\n` +
    `- Work Experience (${weights.experience}% weight): ${expScoreWeighted} / ${weights.experience} pts (Raw: ${expScoreRaw}%)\n` +
    `- Education (${weights.education}% weight): ${eduScoreWeighted} / ${weights.education} pts (Raw: ${eduScoreRaw}%)\n` +
    `- Certifications (${weights.certification}% weight): ${certScoreWeighted} / ${weights.certification} pts (Raw: ${certScoreRaw}%)\n` +
    `Formula: ${skillScoreWeighted} + ${projectScoreWeighted} + ${expScoreWeighted} + ${eduScoreWeighted} + ${certScoreWeighted} = ${overallScore}%`;

  // ACTIONABLE RECOMMENDATIONS
  const improvementSuggestions: string[] = [];
  if (missingSkills.length > 0) {
    improvementSuggestions.push(`Acquire core missing skills required by Job: ${missingSkills.join(', ')}.`);
  }
  if (relatedMatches.length > 0) {
    improvementSuggestions.push(`Explicitly list direct terms like "${relatedMatches.map(r => r.requiredSkill).join(', ')}" alongside your framework expertise (${relatedMatches.map(r => r.candidateSkill).join(', ')}).`);
  }
  if (requiredYears > candYears) {
    improvementSuggestions.push(`Highlight key accomplishments and practical project hours to compensate for the ${requiredYears - candYears} year experience gap.`);
  }
  if (avgProjectRaw < 80) {
    improvementSuggestions.push(`Enhance project descriptions with metrics, API architectures, authentication, and Docker deployment info.`);
  }
  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push('Profile demonstrates high alignment with job requirements!');
  }

  return {
    overallScore,
    classification,
    skillScoreRaw,
    skillScoreWeighted,
    projectScoreRaw: avgProjectRaw,
    projectScoreWeighted,
    expScoreRaw,
    expScoreWeighted,
    eduScoreRaw,
    eduScoreWeighted,
    certScoreRaw,
    certScoreWeighted,
    exactMatchedSkills: exactMatches,
    relatedMatchedSkills: relatedMatches,
    missingSkills,
    bonusPreferredSkills: [],
    projectEvaluations: projectEvals,
    experienceGapYears: Math.max(0, requiredYears - candYears),
    formulaBreakdown,
    auditTrail,
    improvementSuggestions
  };
}

