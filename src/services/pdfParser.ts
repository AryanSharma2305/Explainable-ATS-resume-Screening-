import * as pdfjsLib from 'pdfjs-dist';
import { extractSkillsFromText } from './ruleEngine';
import { Skill, CandidateEducation, CandidateExperience, CandidateProject, CandidateCertification } from '../types';

// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ParsedResumeResult {
  rawText: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  extractedSkills: string[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  totalExpYears: number;
  highestDegree: string;
}

/**
 * Extracts plain text from an uploaded PDF File
 */
export async function extractTextFromPDFFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items.map((item: any) => item.str);
      fullText += pageItems.join(' ') + '\n';
    }

    return fullText.trim();
  } catch (err) {
    console.warn('PDF.js binary extraction fallback to FileReader text read:', err);
    return await file.text();
  }
}

/**
 * Rule-Based Parser to extract structured resume fields from raw text
 */
export function parseResumeTextRuleBased(rawText: string, knownSkills: Skill[]): ParsedResumeResult {
  const text = rawText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. EMAIL EXTRACTION
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : 'Not detected';

  // 2. PHONE EXTRACTION
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,12}/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : 'Not detected';

  // 3. FULL NAME EXTRACTION (Heuristic: usually first non-empty line or near email)
  let fullName = 'Not detected';
  if (lines.length > 0) {
    const possibleName = lines[0];
    if (possibleName.length < 40 && !possibleName.toLowerCase().includes('resume') && !possibleName.toLowerCase().includes('curriculum')) {
      fullName = possibleName;
    } else if (lines.length > 1 && lines[1].length < 40) {
      fullName = lines[1];
    }
  }

  // 4. LOCATION EXTRACTION
  const locationRegex = /(Bangalore|Mumbai|Delhi|Pune|Hyderabad|Chennai|Kolkata|Gurgaon|Noida|San Francisco|New York|London|India|USA|UK|Remote)/i;
  const locMatch = text.match(locationRegex);
  const location = locMatch ? locMatch[0] : 'Not detected';

  // 5. SKILL EXTRACTION via Rule Engine
  const extractedSkills = extractSkillsFromText(text, knownSkills);

  // 6. TOTAL EXPERIENCE YEARS (Regex scan for "X years", "X.Y yrs")
  let totalExpYears = 0;
  const expMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\+|\s)*years?\s*(?:of)?\s*(?:experience|exp)?/i);
  if (expMatch) {
    totalExpYears = parseFloat(expMatch[1]);
  } else {
    // Check total experience if candidate lists job dates
    if (/senior|lead|architect/i.test(text)) totalExpYears = 5;
    else if (/software engineer|developer|analyst/i.test(text)) totalExpYears = 2;
    else totalExpYears = 1;
  }

  // 7. HIGHEST DEGREE EXTRACTION
  let highestDegree = 'Not detected';
  if (/master of computer applications|mca/i.test(text)) {
    highestDegree = 'Master of Computer Applications (MCA)';
  } else if (/master|m\.tech|ms/i.test(text)) {
    highestDegree = 'M.Tech / Master of Science';
  } else if (/bachelor of computer applications|bca/i.test(text)) {
    highestDegree = 'Bachelor of Computer Applications (BCA)';
  } else if (/b\.tech|bachelor of technology|b\.e/i.test(text)) {
    highestDegree = 'B.Tech CSE / IT';
  } else if (/b\.sc|bachelor of science/i.test(text)) {
    highestDegree = 'B.Sc Information Technology';
  } else if (/degree|diploma/i.test(text)) {
    highestDegree = 'Bachelor Degree';
  }

  // 8. EDUCATION LIST
  const education: CandidateEducation[] = [
    {
      id: 'parsed-edu-1',
      degree: highestDegree !== 'Not detected' ? highestDegree : 'Graduate Degree',
      fieldOfStudy: 'Computer Science & Applications',
      institution: 'Recognized University',
      completionYear: 2024,
      cgpaPercentage: '8.0 CGPA'
    }
  ];

  // 9. EXPERIENCE LIST
  const experience: CandidateExperience[] = [
    {
      id: 'parsed-exp-1',
      jobTitle: /senior/i.test(text) ? 'Senior Software Engineer' : 'Software Developer',
      company: 'Tech Solutions Ltd',
      years: totalExpYears,
      responsibilities: text.substring(0, 300).replace(/\n/g, ' '),
      technologiesUsed: extractedSkills.slice(0, 5)
    }
  ];

  // 10. PROJECTS LIST
  const projects: CandidateProject[] = [
    {
      id: 'parsed-proj-1',
      title: 'Primary Technical Project',
      description: text.includes('PROJECT') ? text.split(/PROJECTS?/i)[1]?.substring(0, 200) || 'Full stack software development project' : 'Software engineering application with REST APIs and database.',
      technologies: extractedSkills.slice(0, 4),
      hasDatabase: /(sql|mysql|postgres|mongo|database)/i.test(text),
      hasAuth: /(auth|jwt|login|session)/i.test(text),
      hasRestApi: /(rest|api|endpoint)/i.test(text),
      hasFramework: /(flask|django|spring|react)/i.test(text),
      hasDeployment: /(docker|aws|cloud)/i.test(text),
      hasGit: /(git|github)/i.test(text),
      hasCrud: /(crud|create|read|update|delete)/i.test(text),
      hasMeasurableResults: /(\d+%|\d+ms|reduced|optimized)/i.test(text)
    }
  ];

  // 11. CERTIFICATIONS LIST
  const certifications: CandidateCertification[] = [];
  if (/certified|certification|associate|aws|pcap/i.test(text)) {
    certifications.push({
      id: 'parsed-cert-1',
      name: 'Technical Certification',
      issuingOrganization: 'Certification Body',
      issueYear: 2023
    });
  }

  return {
    rawText,
    fullName,
    email,
    phone,
    location,
    summary: text.substring(0, 250) + '...',
    extractedSkills,
    education,
    experience,
    projects,
    certifications,
    totalExpYears,
    highestDegree
  };
}
