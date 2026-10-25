import { 
  User, 
  Skill, 
  SkillRelationship, 
  CandidateProfile, 
  JobDescription, 
  JobApplication,
  ScoringWeights, 
  ScoringThresholds, 
  Course, 
  ProjectQualityRule,
  CompanyTenant
} from '../types';

export const INITIAL_COMPANIES: CompanyTenant[] = [
  {
    id: 'comp-1',
    name: 'TechCorp Solutions',
    industry: 'Software & Cloud Engineering',
    contactEmail: 'recruiter@techcorp.com',
    website: 'https://techcorp.example.com',
    plan: 'Enterprise',
    status: 'Active',
    maxJobPostings: 25,
    recruiterCount: 2,
    joinedDate: '2026-01-15'
  },
  {
    id: 'comp-2',
    name: 'CloudScale Dynamics',
    industry: 'DevOps & Distributed Systems',
    contactEmail: 'hr@cloudscale.io',
    website: 'https://cloudscale.example.com',
    plan: 'Professional',
    status: 'Active',
    maxJobPostings: 10,
    recruiterCount: 1,
    joinedDate: '2026-03-20'
  },
  {
    id: 'comp-3',
    name: 'HealthPulse AI',
    industry: 'Healthcare Technology & Data Science',
    contactEmail: 'careers@healthpulse.ai',
    website: 'https://healthpulse.example.com',
    plan: 'Professional',
    status: 'Active',
    maxJobPostings: 10,
    recruiterCount: 1,
    joinedDate: '2026-05-10'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin (Software Owner)',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'ADMIN',
    companyName: 'ATS Screener SaaS Platform',
    title: 'Platform Software Owner & Super Admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01'
  },
  {
    id: 'user-recruiter-1',
    name: 'Sarah Jenkins',
    email: 'recruiter@techcorp.com',
    password: 'password123',
    role: 'RECRUITER',
    companyName: 'TechCorp Solutions',
    title: 'Lead Technical Recruiter & HR Manager',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15'
  },
  {
    id: 'user-recruiter-2',
    name: 'Marcus Vance',
    email: 'hr@cloudscale.io',
    password: 'password123',
    role: 'RECRUITER',
    companyName: 'CloudScale Dynamics',
    title: 'Senior Talent Acquisition Specialist',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-20'
  },
  {
    id: 'user-cand-1',
    name: 'Aryan Sharma',
    email: 'aryanmsharma23@gmail.com',
    password: 'password123',
    role: 'CANDIDATE',
    title: 'Full Stack & Python Engineer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01'
  },
  {
    id: 'user-cand-2',
    name: 'Aryan Sharma (Demo)',
    email: 'aryan@example.com',
    password: 'password123',
    role: 'CANDIDATE',
    title: 'Full Stack & Python Engineer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01'
  }
];

export const INITIAL_SKILLS: Skill[] = [
  // Programming Languages
  { id: 's1', name: 'Python', category: 'Programming Languages', aliases: ['py', 'python3', 'python 3', 'python developer', 'python backend developer'] },
  { id: 's2', name: 'Java', category: 'Programming Languages', aliases: ['java8', 'java11', 'java17', 'core java', 'java developer'] },
  { id: 's3', name: 'JavaScript', category: 'Programming Languages', aliases: ['js', 'es6', 'ecmascript', 'javascript developer'] },
  { id: 's4', name: 'TypeScript', category: 'Programming Languages', aliases: ['ts', 'typescript developer'] },
  { id: 's5', name: 'C++', category: 'Programming Languages', aliases: ['cpp', 'c plus plus', 'c++ developer'] },
  { id: 's6', name: 'C#', category: 'Programming Languages', aliases: ['csharp', 'c sharp', 'c# developer', '.net'] },
  { id: 's6b', name: 'C', category: 'Programming Languages', aliases: ['c language', 'ansi c', 'c programming'] },
  { id: 's7', name: 'PHP', category: 'Programming Languages', aliases: ['php7', 'php8', 'php developer'] },
  { id: 's7b', name: 'Ruby', category: 'Programming Languages', aliases: ['ruby programming', 'ruby dev'] },
  { id: 's7c', name: 'Go', category: 'Programming Languages', aliases: ['golang', 'go language'] },
  { id: 's7d', name: 'Kotlin', category: 'Programming Languages', aliases: ['kotlin lang', 'kotlin developer'] },
  { id: 's7e', name: 'Swift', category: 'Programming Languages', aliases: ['swift lang', 'swift developer', 'ios swift'] },
  { id: 's7f', name: 'Dart', category: 'Programming Languages', aliases: ['dart lang', 'dart programming'] },

  // Frameworks & Libraries
  { id: 's8', name: 'Flask', category: 'Frameworks', aliases: ['flask framework', 'py-flask', 'flask developer'] },
  { id: 's9', name: 'Django', category: 'Frameworks', aliases: ['django framework', 'py-django', 'django rest framework', 'drf', 'django developer'] },
  { id: 's10', name: 'FastAPI', category: 'Frameworks', aliases: ['fast api', 'fastapi developer'] },
  { id: 's11', name: 'Spring Boot', category: 'Frameworks', aliases: ['spring-boot', 'springboot', 'spring boot developer'] },
  { id: 's11b', name: 'Spring', category: 'Frameworks', aliases: ['spring framework', 'spring mvc', 'spring developer'] },
  { id: 's11c', name: 'Hibernate', category: 'Frameworks', aliases: ['hibernate orm', 'hibernate framework'] },
  { id: 's11d', name: 'Maven', category: 'Tools & DevOps', aliases: ['apache maven', 'mvn'] },
  { id: 's11e', name: 'JSP', category: 'Frameworks', aliases: ['java server pages', 'javaserver pages'] },
  { id: 's11f', name: 'Servlets', category: 'Frameworks', aliases: ['java servlets', 'servlet'] },
  { id: 's11g', name: 'Struts', category: 'Frameworks', aliases: ['apache struts', 'struts2', 'struts framework'] },
  { id: 's12', name: 'React', category: 'Frameworks', aliases: ['reactjs', 'react.js', 'react developer'] },
  { id: 's13', name: 'Angular', category: 'Frameworks', aliases: ['angularjs', 'angular2+', 'angular developer'] },
  { id: 's14', name: 'Node.js', category: 'Frameworks', aliases: ['nodejs', 'node', 'node developer'] },
  { id: 's15', name: 'Express', category: 'Frameworks', aliases: ['expressjs', 'express.js'] },
  { id: 's15b', name: 'Vue', category: 'Frameworks', aliases: ['vuejs', 'vue developer'] },
  { id: 's15b2', name: 'Vue.js', category: 'Frameworks', aliases: ['vue.js framework'] },
  { id: 's15c', name: 'Next.js', category: 'Frameworks', aliases: ['nextjs', 'next.js developer'] },
  { id: 's15c2', name: 'jQuery', category: 'Frameworks', aliases: ['jquery lib', 'jquery library'] },
  { id: 's15d', name: 'Laravel', category: 'Frameworks', aliases: ['laravel framework', 'laravel developer'] },
  { id: 's15d2', name: 'CodeIgniter', category: 'Frameworks', aliases: ['code igniter', 'codeigniter framework'] },
  { id: 's15d3', name: 'Symfony', category: 'Frameworks', aliases: ['symfony framework', 'symfony php'] },
  { id: 's15d4', name: 'WordPress', category: 'Frameworks', aliases: ['wp', 'wordpress cms', 'wordpress developer'] },
  { id: 's15e', name: 'ASP.NET', category: 'Frameworks', aliases: ['asp net', 'aspnet'] },
  { id: 's15e2', name: 'ASP.NET Core', category: 'Frameworks', aliases: ['asp.net core', 'dotnet core', 'aspnetcore'] },
  { id: 's15e3', name: '.NET', category: 'Frameworks', aliases: ['dotnet', '.net framework'] },
  { id: 's15e4', name: 'Entity Framework', category: 'Frameworks', aliases: ['entity framework core', 'ef core', 'ef'] },
  { id: 's15e5', name: 'Xamarin', category: 'Frameworks', aliases: ['xamarin forms', 'xamarin.forms'] },
  { id: 's15e6', name: 'WPF', category: 'Frameworks', aliases: ['windows presentation foundation'] },
  { id: 's15e7', name: 'WinForms', category: 'Frameworks', aliases: ['windows forms', 'win forms'] },
  { id: 's15e8', name: 'Blazor', category: 'Frameworks', aliases: ['blazor webassembly', 'blazor server'] },
  { id: 's15f', name: 'Qt', category: 'Frameworks', aliases: ['qt framework', 'qt5', 'qt6', 'pyqt'] },
  { id: 's15f2', name: 'Unreal Engine', category: 'Tools & DevOps', aliases: ['ue4', 'ue5', 'unreal'] },
  { id: 's15g', name: 'Embedded C', category: 'Programming Languages', aliases: ['embedded systems c', 'microcontroller c'] },
  { id: 's15h', name: 'Ruby on Rails', category: 'Frameworks', aliases: ['ror', 'ruby-on-rails'] },
  { id: 's15h2', name: 'Rails', category: 'Frameworks', aliases: ['rails framework'] },
  { id: 's15i', name: 'Gin', category: 'Frameworks', aliases: ['gin-gonic', 'gin framework'] },
  { id: 's15i2', name: 'Fiber', category: 'Frameworks', aliases: ['gofiber', 'fiber framework'] },
  { id: 's15j', name: 'Jetpack Compose', category: 'Frameworks', aliases: ['compose', 'android compose'] },
  { id: 's15j2', name: 'SwiftUI', category: 'Frameworks', aliases: ['swift ui', 'swiftui framework'] },
  { id: 's15k', name: 'Flutter', category: 'Frameworks', aliases: ['flutter framework', 'flutter sdk'] },

  // Web & UI
  { id: 's15m1', name: 'CSS', category: 'Web Technologies', aliases: ['css3', 'cascading style sheets'] },
  { id: 's15m2', name: 'Bootstrap', category: 'Web Technologies', aliases: ['bootstrap 4', 'bootstrap 5', 'twitter bootstrap'] },
  { id: 's15m3', name: 'Tailwind', category: 'Web Technologies', aliases: ['tailwind css', 'tailwindcss'] },
  { id: 's15m3b', name: 'Tailwind CSS', category: 'Web Technologies', aliases: ['tailwind-css'] },
  { id: 's15m4', name: 'SASS', category: 'Web Technologies', aliases: ['sass css'] },
  { id: 's15m5', name: 'SCSS', category: 'Web Technologies', aliases: ['scss css'] },
  { id: 's15m6', name: 'Material UI', category: 'Web Technologies', aliases: ['mui', 'material-ui'] },
  { id: 's34', name: 'HTML5', category: 'Web Technologies', aliases: ['html'] },

  // Databases & Query Languages
  { id: 's16', name: 'SQL', category: 'Databases', aliases: ['structured query language', 'ansi sql', 'sql developer', 'sql database'] },
  { id: 's17', name: 'MySQL', category: 'Databases', aliases: ['my-sql', 'mysql database'] },
  { id: 's18', name: 'PostgreSQL', category: 'Databases', aliases: ['postgres', 'pg', 'postgresql database'] },
  { id: 's19', name: 'MongoDB', category: 'Databases', aliases: ['mongo', 'mongodb database'] },
  { id: 's20', name: 'Oracle', category: 'Databases', aliases: ['oracle db', 'oracle sql', 'oracle database'] },
  { id: 's20b', name: 'SQLite', category: 'Databases', aliases: ['sqlite3'] },
  { id: 's20c', name: 'SQL Server', category: 'Databases', aliases: ['mssql', 'microsoft sql server', 'ms sql'] },
  { id: 's20d', name: 'T-SQL', category: 'Databases', aliases: ['tsql', 'transact-sql'] },
  { id: 's20e', name: 'PL/SQL', category: 'Databases', aliases: ['plsql', 'procedural sql'] },
  { id: 's20f', name: 'Redis', category: 'Databases', aliases: ['redis cache'] },

  // Tools & DevOps
  { id: 's21', name: 'Git', category: 'Tools & DevOps', aliases: ['git version control'] },
  { id: 's22', name: 'GitHub', category: 'Tools & DevOps', aliases: ['github actions'] },
  { id: 's22b', name: 'GitLab', category: 'Tools & DevOps', aliases: ['gitlab ci', 'gitlab ci/cd'] },
  { id: 's23', name: 'Docker', category: 'Tools & DevOps', aliases: ['docker container', 'containerization'] },
  { id: 's26b', name: 'Kubernetes', category: 'Tools & DevOps', aliases: ['k8s', 'kube'] },
  { id: 's26b2', name: 'Helm', category: 'Tools & DevOps', aliases: ['helm charts', 'helm chart'] },
  { id: 's26c', name: 'Terraform', category: 'Tools & DevOps', aliases: ['hashicorp terraform', 'iac terraform'] },
  { id: 's26d', name: 'Cloud', category: 'Cloud Platforms', aliases: ['cloud computing', 'multi-cloud'] },
  { id: 's24', name: 'Jenkins', category: 'Tools & DevOps', aliases: ['jenkins ci/cd'] },
  { id: 's25', name: 'Postman', category: 'Tools & DevOps', aliases: ['postman api tool'] },
  { id: 's26', name: 'REST API', category: 'Tools & DevOps', aliases: ['restful api', 'rest apis', 'restful web services'] },

  // Cloud Platforms
  { id: 's27', name: 'AWS', category: 'Cloud Platforms', aliases: ['amazon web services'] },
  { id: 's27b', name: 'EKS', category: 'Cloud Platforms', aliases: ['amazon eks', 'aws eks'] },
  { id: 's27c', name: 'Lambda', category: 'Cloud Platforms', aliases: ['aws lambda', 'serverless lambda'] },
  { id: 's27d', name: 'EC2', category: 'Cloud Platforms', aliases: ['amazon ec2', 'aws ec2'] },
  { id: 's27e', name: 'S3', category: 'Cloud Platforms', aliases: ['amazon s3', 'aws s3'] },
  { id: 's28', name: 'Azure', category: 'Cloud Platforms', aliases: ['microsoft azure'] },
  { id: 's29', name: 'Google Cloud', category: 'Cloud Platforms', aliases: ['gcp', 'google cloud platform'] },

  // Data Science, ML & Analytics
  { id: 's30', name: 'Pandas', category: 'Data Science & AI/ML', aliases: ['py-pandas', 'pandas dataframe'] },
  { id: 's31', name: 'NumPy', category: 'Data Science & AI/ML', aliases: ['numpy lib'] },
  { id: 's31a', name: 'Matplotlib', category: 'Data Science & AI/ML', aliases: ['mat-plot-lib', 'pyplot'] },
  { id: 's31b', name: 'PyTorch', category: 'Data Science & AI/ML', aliases: ['pytorch deep learning', 'torch'] },
  { id: 's31c', name: 'TensorFlow', category: 'Data Science & AI/ML', aliases: ['tf', 'tensorflow 2'] },
  { id: 's31c2', name: 'Keras', category: 'Data Science & AI/ML', aliases: ['keras lib', 'tf.keras'] },
  { id: 's31c3', name: 'Scikit-learn', category: 'Data Science & AI/ML', aliases: ['sklearn', 'scikit learn'] },
  { id: 's31c4', name: 'Streamlit', category: 'Data Science & AI/ML', aliases: ['streamlit app', 'streamlit dashboard'] },
  { id: 's31d', name: 'Machine Learning', category: 'Data Science & AI/ML', aliases: ['ml', 'deep learning', 'machine learning algorithms'] },
  { id: 's31e', name: 'Data Analysis', category: 'Data Science & AI/ML', aliases: ['data analytics', 'exploratory data analysis', 'eda'] },
  { id: 's32', name: 'Power BI', category: 'Data Science & AI/ML', aliases: ['powerbi', 'ms power bi'] },
  { id: 's33', name: 'Tableau', category: 'Data Science & AI/ML', aliases: ['tableau desktop'] },

  // Core CS
  { id: 's36', name: 'Linux', category: 'Core CS & Software Design', aliases: ['ubuntu', 'debian', 'redhat'] },
  { id: 's37', name: 'Computer Networks', category: 'Core CS & Software Design', aliases: ['networking', 'tcp/ip'] }
];

export const INITIAL_RELATIONSHIPS: SkillRelationship[] = [
  // PYTHON
  { id: 'rel-py-1', skill: 'Flask', relatedSkill: 'Python', relationshipType: 'framework_of', strength: 1.0, description: 'Flask implies Python' },
  { id: 'rel-py-2', skill: 'Django', relatedSkill: 'Python', relationshipType: 'framework_of', strength: 1.0, description: 'Django implies Python' },
  { id: 'rel-py-3', skill: 'FastAPI', relatedSkill: 'Python', relationshipType: 'framework_of', strength: 1.0, description: 'FastAPI implies Python' },
  { id: 'rel-py-4', skill: 'Pandas', relatedSkill: 'Python', relationshipType: 'ecosystem_partner', strength: 1.0, description: 'Pandas implies Python' },
  { id: 'rel-py-5', skill: 'NumPy', relatedSkill: 'Python', relationshipType: 'ecosystem_partner', strength: 1.0, description: 'NumPy implies Python' },
  { id: 'rel-py-6', skill: 'Matplotlib', relatedSkill: 'Python', relationshipType: 'ecosystem_partner', strength: 1.0, description: 'Matplotlib implies Python' },
  { id: 'rel-py-7', skill: 'Scikit-learn', relatedSkill: 'Python', relationshipType: 'ecosystem_partner', strength: 1.0, description: 'Scikit-learn implies Python' },
  { id: 'rel-py-8', skill: 'TensorFlow', relatedSkill: 'Python', relationshipType: 'ecosystem_partner', strength: 1.0, description: 'TensorFlow implies Python' },
  { id: 'rel-py-9', skill: 'PyTorch', relatedSkill: 'Python', relationshipType: 'ecosystem_partner', strength: 1.0, description: 'PyTorch implies Python' },
  { id: 'rel-py-10', skill: 'Keras', relatedSkill: 'Python', relationshipType: 'ecosystem_partner', strength: 1.0, description: 'Keras implies Python' },
  { id: 'rel-py-11', skill: 'Streamlit', relatedSkill: 'Python', relationshipType: 'framework_of', strength: 1.0, description: 'Streamlit implies Python' },

  // JAVASCRIPT
  { id: 'rel-js-1', skill: 'React', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'React implies JavaScript' },
  { id: 'rel-js-2', skill: 'Angular', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'Angular implies JavaScript' },
  { id: 'rel-js-3', skill: 'Vue', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'Vue implies JavaScript' },
  { id: 'rel-js-4', skill: 'Vue.js', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'Vue.js implies JavaScript' },
  { id: 'rel-js-5', skill: 'Node.js', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'Node.js implies JavaScript' },
  { id: 'rel-js-6', skill: 'Express', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'Express implies JavaScript' },
  { id: 'rel-js-7', skill: 'Express.js', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'Express.js implies JavaScript' },
  { id: 'rel-js-8', skill: 'Next.js', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'Next.js implies JavaScript' },
  { id: 'rel-js-9', skill: 'jQuery', relatedSkill: 'JavaScript', relationshipType: 'framework_of', strength: 1.0, description: 'jQuery implies JavaScript' },
  { id: 'rel-js-10', skill: 'TypeScript', relatedSkill: 'JavaScript', relationshipType: 'subset_of', strength: 1.0, description: 'TypeScript implies JavaScript' },

  // JAVA
  { id: 'rel-java-1', skill: 'Spring', relatedSkill: 'Java', relationshipType: 'framework_of', strength: 1.0, description: 'Spring implies Java' },
  { id: 'rel-java-2', skill: 'Spring Boot', relatedSkill: 'Java', relationshipType: 'framework_of', strength: 1.0, description: 'Spring Boot implies Java' },
  { id: 'rel-java-3', skill: 'Hibernate', relatedSkill: 'Java', relationshipType: 'framework_of', strength: 1.0, description: 'Hibernate implies Java' },
  { id: 'rel-java-4', skill: 'Maven', relatedSkill: 'Java', relationshipType: 'tool_for', strength: 1.0, description: 'Maven implies Java' },
  { id: 'rel-java-5', skill: 'JSP', relatedSkill: 'Java', relationshipType: 'dialect_of', strength: 1.0, description: 'JSP implies Java' },
  { id: 'rel-java-6', skill: 'Servlets', relatedSkill: 'Java', relationshipType: 'framework_of', strength: 1.0, description: 'Servlets implies Java' },
  { id: 'rel-java-7', skill: 'Struts', relatedSkill: 'Java', relationshipType: 'framework_of', strength: 1.0, description: 'Struts implies Java' },
  { id: 'rel-java-8', skill: 'Spring Boot', relatedSkill: 'Spring', relationshipType: 'subset_of', strength: 1.0, description: 'Spring Boot implies Spring' },

  // C# / .NET
  { id: 'rel-cs-1', skill: '.NET', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: '.NET implies C#' },
  { id: 'rel-cs-2', skill: 'ASP.NET', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: 'ASP.NET implies C#' },
  { id: 'rel-cs-3', skill: 'ASP.NET Core', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: 'ASP.NET Core implies C#' },
  { id: 'rel-cs-4', skill: 'Entity Framework', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: 'Entity Framework implies C#' },
  { id: 'rel-cs-5', skill: 'Xamarin', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: 'Xamarin implies C#' },
  { id: 'rel-cs-6', skill: 'WPF', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: 'WPF implies C#' },
  { id: 'rel-cs-7', skill: 'WinForms', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: 'WinForms implies C#' },
  { id: 'rel-cs-8', skill: 'Blazor', relatedSkill: 'C#', relationshipType: 'framework_of', strength: 1.0, description: 'Blazor implies C#' },

  // PHP
  { id: 'rel-php-1', skill: 'Laravel', relatedSkill: 'PHP', relationshipType: 'framework_of', strength: 1.0, description: 'Laravel implies PHP' },
  { id: 'rel-php-2', skill: 'CodeIgniter', relatedSkill: 'PHP', relationshipType: 'framework_of', strength: 1.0, description: 'CodeIgniter implies PHP' },
  { id: 'rel-php-3', skill: 'Symfony', relatedSkill: 'PHP', relationshipType: 'framework_of', strength: 1.0, description: 'Symfony implies PHP' },
  { id: 'rel-php-4', skill: 'WordPress', relatedSkill: 'PHP', relationshipType: 'framework_of', strength: 1.0, description: 'WordPress implies PHP' },

  // C++
  { id: 'rel-cpp-1', skill: 'Qt', relatedSkill: 'C++', relationshipType: 'framework_of', strength: 1.0, description: 'Qt implies C++' },
  { id: 'rel-cpp-2', skill: 'Unreal Engine', relatedSkill: 'C++', relationshipType: 'tool_for', strength: 1.0, description: 'Unreal Engine implies C++' },

  // C
  { id: 'rel-c-1', skill: 'Embedded C', relatedSkill: 'C', relationshipType: 'dialect_of', strength: 1.0, description: 'Embedded C implies C' },

  // RUBY
  { id: 'rel-rb-1', skill: 'Ruby on Rails', relatedSkill: 'Ruby', relationshipType: 'framework_of', strength: 1.0, description: 'Ruby on Rails implies Ruby' },
  { id: 'rel-rb-2', skill: 'Rails', relatedSkill: 'Ruby', relationshipType: 'framework_of', strength: 1.0, description: 'Rails implies Ruby' },

  // GO
  { id: 'rel-go-1', skill: 'Gin', relatedSkill: 'Go', relationshipType: 'framework_of', strength: 1.0, description: 'Gin implies Go' },
  { id: 'rel-go-2', skill: 'Fiber', relatedSkill: 'Go', relationshipType: 'framework_of', strength: 1.0, description: 'Fiber implies Go' },

  // KOTLIN / SWIFT (mobile)
  { id: 'rel-mob-1', skill: 'Jetpack Compose', relatedSkill: 'Kotlin', relationshipType: 'framework_of', strength: 1.0, description: 'Jetpack Compose implies Kotlin' },
  { id: 'rel-mob-2', skill: 'SwiftUI', relatedSkill: 'Swift', relationshipType: 'framework_of', strength: 1.0, description: 'SwiftUI implies Swift' },

  // DART
  { id: 'rel-dart-1', skill: 'Flutter', relatedSkill: 'Dart', relationshipType: 'framework_of', strength: 1.0, description: 'Flutter implies Dart' },

  // HTML / CSS (web basics)
  { id: 'rel-css-1', skill: 'Bootstrap', relatedSkill: 'CSS', relationshipType: 'framework_of', strength: 1.0, description: 'Bootstrap implies CSS' },
  { id: 'rel-css-2', skill: 'Tailwind', relatedSkill: 'CSS', relationshipType: 'framework_of', strength: 1.0, description: 'Tailwind implies CSS' },
  { id: 'rel-css-3', skill: 'Tailwind CSS', relatedSkill: 'CSS', relationshipType: 'framework_of', strength: 1.0, description: 'Tailwind CSS implies CSS' },
  { id: 'rel-css-4', skill: 'SASS', relatedSkill: 'CSS', relationshipType: 'dialect_of', strength: 1.0, description: 'SASS implies CSS' },
  { id: 'rel-css-5', skill: 'SCSS', relatedSkill: 'CSS', relationshipType: 'dialect_of', strength: 1.0, description: 'SCSS implies CSS' },
  { id: 'rel-css-6', skill: 'Material UI', relatedSkill: 'CSS', relationshipType: 'framework_of', strength: 1.0, description: 'Material UI implies CSS' },

  // DATABASES / SQL
  { id: 'rel-sql-1', skill: 'MySQL', relatedSkill: 'SQL', relationshipType: 'dialect_of', strength: 1.0, description: 'MySQL implies SQL' },
  { id: 'rel-sql-2', skill: 'PostgreSQL', relatedSkill: 'SQL', relationshipType: 'dialect_of', strength: 1.0, description: 'PostgreSQL implies SQL' },
  { id: 'rel-sql-3', skill: 'Oracle', relatedSkill: 'SQL', relationshipType: 'dialect_of', strength: 1.0, description: 'Oracle implies SQL' },
  { id: 'rel-sql-4', skill: 'SQL Server', relatedSkill: 'SQL', relationshipType: 'dialect_of', strength: 1.0, description: 'SQL Server implies SQL' },
  { id: 'rel-sql-5', skill: 'SQLite', relatedSkill: 'SQL', relationshipType: 'dialect_of', strength: 1.0, description: 'SQLite implies SQL' },
  { id: 'rel-sql-6', skill: 'T-SQL', relatedSkill: 'SQL', relationshipType: 'dialect_of', strength: 1.0, description: 'T-SQL implies SQL' },
  { id: 'rel-sql-7', skill: 'PL/SQL', relatedSkill: 'SQL', relationshipType: 'dialect_of', strength: 1.0, description: 'PL/SQL implies SQL' },

  // DEVOPS / CLOUD / TOOLS
  { id: 'rel-dev-1', skill: 'Kubernetes', relatedSkill: 'Docker', relationshipType: 'tool_for', strength: 1.0, description: 'Kubernetes implies Docker' },
  { id: 'rel-dev-2', skill: 'Helm', relatedSkill: 'Kubernetes', relationshipType: 'tool_for', strength: 1.0, description: 'Helm implies Kubernetes' },
  { id: 'rel-dev-3', skill: 'GitHub', relatedSkill: 'Git', relationshipType: 'tool_for', strength: 1.0, description: 'GitHub implies Git' },
  { id: 'rel-dev-4', skill: 'GitLab', relatedSkill: 'Git', relationshipType: 'tool_for', strength: 1.0, description: 'GitLab implies Git' },
  { id: 'rel-dev-5', skill: 'Terraform', relatedSkill: 'Cloud', relationshipType: 'tool_for', strength: 1.0, description: 'Terraform implies Cloud' },
  { id: 'rel-dev-6', skill: 'EKS', relatedSkill: 'AWS', relationshipType: 'subset_of', strength: 1.0, description: 'EKS implies AWS' },
  { id: 'rel-dev-7', skill: 'Lambda', relatedSkill: 'AWS', relationshipType: 'subset_of', strength: 1.0, description: 'Lambda implies AWS' },
  { id: 'rel-dev-8', skill: 'EC2', relatedSkill: 'AWS', relationshipType: 'subset_of', strength: 1.0, description: 'EC2 implies AWS' },
  { id: 'rel-dev-9', skill: 'S3', relatedSkill: 'AWS', relationshipType: 'subset_of', strength: 1.0, description: 'S3 implies AWS' },

  // DATA / ML (higher-level implications)
  { id: 'rel-ml-1', skill: 'TensorFlow', relatedSkill: 'Machine Learning', relationshipType: 'subset_of', strength: 1.0, description: 'TensorFlow implies Machine Learning' },
  { id: 'rel-ml-2', skill: 'PyTorch', relatedSkill: 'Machine Learning', relationshipType: 'subset_of', strength: 1.0, description: 'PyTorch implies Machine Learning' },
  { id: 'rel-ml-3', skill: 'Keras', relatedSkill: 'Machine Learning', relationshipType: 'subset_of', strength: 1.0, description: 'Keras implies Machine Learning' },
  { id: 'rel-ml-4', skill: 'Scikit-learn', relatedSkill: 'Machine Learning', relationshipType: 'subset_of', strength: 1.0, description: 'Scikit-learn implies Machine Learning' },
  { id: 'rel-ml-5', skill: 'Power BI', relatedSkill: 'Data Analysis', relationshipType: 'tool_for', strength: 1.0, description: 'Power BI implies Data Analysis' },
  { id: 'rel-ml-6', skill: 'Tableau', relatedSkill: 'Data Analysis', relationshipType: 'tool_for', strength: 1.0, description: 'Tableau implies Data Analysis' },
  { id: 'rel-ml-7', skill: 'Pandas', relatedSkill: 'Data Analysis', relationshipType: 'tool_for', strength: 1.0, description: 'Pandas implies Data Analysis' }
];

export const INITIAL_WEIGHTS: ScoringWeights = {
  skillMatch: 40,
  projectQuality: 20,
  experience: 20,
  education: 10,
  certification: 10
};

export const INITIAL_THRESHOLDS: ScoringThresholds = {
  excellent: 95,
  strong: 85,
  good: 70,
  moderate: 55
};

export const INITIAL_PROJECT_RULES: ProjectQualityRule[] = [
  { id: 'pr-1', ruleName: 'Uses Relational/NoSQL Database', description: 'Integrates persistent storage (MySQL, PostgreSQL, MongoDB, SQLite)', points: 10, checkType: 'database' },
  { id: 'pr-2', ruleName: 'Authentication & Security', description: 'Implements user authentication (JWT, Session, OAuth, Role-based access)', points: 10, checkType: 'auth' },
  { id: 'pr-3', ruleName: 'RESTful API Architecture', description: 'Provides structured REST API routes and endpoints', points: 10, checkType: 'rest_api' },
  { id: 'pr-4', ruleName: 'Framework Integration', description: 'Built using recognized web or backend frameworks (Flask, Django, Express, React)', points: 10, checkType: 'framework' },
  { id: 'pr-5', ruleName: 'Cloud & Container Deployment', description: 'Includes deployment configuration (Docker, AWS, Cloud Run, Heroku)', points: 10, checkType: 'cloud' },
  { id: 'pr-6', ruleName: 'Git Version Control', description: 'Version-controlled repository with clean commit practices', points: 10, checkType: 'git' },
  { id: 'pr-7', ruleName: 'CRUD Functional Operations', description: 'Supports Create, Read, Update, Delete data lifecycles', points: 10, checkType: 'crud' },
  { id: 'pr-8', ruleName: 'Descriptive Technical Scope', description: 'Thorough description of architecture and technical choices (>30 words)', points: 10, checkType: 'description' },
  { id: 'pr-9', ruleName: 'Measurable Outcomes/Metrics', description: 'Quantifies impact (e.g., "reduced latency by 30%", "served 500+ users")', points: 10, checkType: 'metrics' },
  { id: 'pr-10', ruleName: 'Multi-Technology Stack', description: 'Uses at least 3 complementary technologies cohesively', points: 10, checkType: 'multi_tech' }
];

import { COMPREHENSIVE_COURSES } from './courseService';

export const INITIAL_COURSES: Course[] = COMPREHENSIVE_COURSES;


export const INITIAL_JOBS: JobDescription[] = [
  {
    id: 'job-0',
    recruiterId: 'user-recruiter-1',
    companyName: 'TechCorp India',
    title: 'Python Developer',
    department: 'Software Engineering',
    location: 'Bangalore, India (Hybrid)',
    jobType: 'Full-time',
    descriptionText: 'We are seeking a Python Developer with strong knowledge of Python, Django web framework, MySQL database, and Docker containerization.',
    requiredSkills: ['Python', 'Django', 'MySQL', 'Docker'],
    preferredSkills: ['Git', 'REST API', 'Redis'],
    minExperienceYears: 2,
    minEducationDegree: 'Bachelor of Computer Applications (BCA)',
    requiredCertifications: [],
    responsibilities: [
      'Build scalable web backends with Django and Python.',
      'Design MySQL relational schemas and query optimizations.',
      'Deploy services with Docker containers.'
    ],
    createdAt: '2026-08-10',
    status: 'Active'
  },
  {
    id: 'job-1',
    recruiterId: 'user-recruiter-1',
    companyName: 'TechCorp Solutions',
    title: 'Python Backend Developer',
    department: 'Engineering',
    location: 'Bangalore, India (Hybrid)',
    jobType: 'Full-time',
    descriptionText: 'We are looking for a Python Backend Developer proficient in Flask or Django web frameworks. The candidate will design scalable REST APIs, work with SQL databases (MySQL/PostgreSQL), use Git version control, and containerize applications with Docker for cloud deployment.',
    requiredSkills: ['Python', 'Flask', 'SQL', 'REST API', 'Git', 'Docker'],
    preferredSkills: ['AWS', 'Redis', 'PostgreSQL'],
    minExperienceYears: 2,
    minEducationDegree: 'Bachelor of Computer Applications (BCA)',
    requiredCertifications: [],
    responsibilities: [
      'Build and maintain robust backend RESTful APIs using Python and Flask.',
      'Optimize SQL queries and manage relational database schemas.',
      'Containerize backend services using Docker and docker-compose.',
      'Participate in code reviews and maintain clean Git branching standards.'
    ],
    createdAt: '2026-08-01',
    status: 'Active'
  },
  {
    id: 'job-2',
    recruiterId: 'user-recruiter-1',
    companyName: 'TechCorp Solutions',
    title: 'Java Full Stack Engineer',
    department: 'Core Product',
    location: 'Hyderabad, India (Onsite)',
    jobType: 'Full-time',
    descriptionText: 'Seeking an experienced Java Developer specializing in Spring Boot microservices, MySQL database management, REST API integration, and Git workflows.',
    requiredSkills: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'Git'],
    preferredSkills: ['React', 'Docker'],
    minExperienceYears: 3,
    minEducationDegree: 'B.Tech CSE',
    requiredCertifications: ['Java SE Certified Associate'],
    responsibilities: [
      'Develop microservices using Spring Boot and Java 17.',
      'Design database schemas and write efficient SQL queries in MySQL.',
      'Integrate backend services with React frontend applications.'
    ],
    createdAt: '2026-08-05',
    status: 'Active'
  }
];

export const INITIAL_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-prof-1',
    userId: 'user-cand-1',
    fullName: 'Aryan Sharma',
    email: 'aryanmsharma23@gmail.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    summary: 'Developer experienced in web development with Python, Flask, Django, and MySQL.',
    rawResumeText: 'Flask Developer. Built projects using Django and MySQL. Version control with Git.',
    extractedSkills: ['Flask', 'Django', 'MySQL', 'Git'],
    totalExpYears: 2.0,
    highestDegree: 'Bachelor of Computer Applications (BCA)',
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Computer Applications (BCA)',
        fieldOfStudy: 'Computer Science',
        institution: 'Bangalore University',
        completionYear: 2024,
        cgpaPercentage: '82%'
      }
    ],
    experience: [
      {
        id: 'exp-1',
        jobTitle: 'Software Developer',
        company: 'WebTech',
        years: 2.0,
        responsibilities: 'Built backend services using Flask and Django with MySQL database.',
        technologiesUsed: ['Flask', 'Django', 'MySQL', 'Git']
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'E-Commerce Microservices Backend',
        description: 'Built REST API with Flask and MySQL for student project.',
        technologies: ['Flask', 'Django', 'MySQL', 'Git'],
        hasDatabase: true,
        hasAuth: true,
        hasRestApi: true,
        hasFramework: true,
        hasDeployment: false,
        hasGit: true,
        hasCrud: true,
        hasMeasurableResults: false
      }
    ],
    certifications: [],
    updatedAt: '2026-08-08'
  },
  {
    id: 'cand-prof-2',
    userId: 'user-cand-2',
    fullName: 'Aryan Sharma (Demo)',
    email: 'aryan@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    summary: 'Developer experienced in web development with Python, Flask, Django, and MySQL.',
    rawResumeText: 'Flask Developer. Built projects using Django and MySQL. Version control with Git.',
    extractedSkills: ['Flask', 'Django', 'MySQL', 'Git'],
    totalExpYears: 2.0,
    highestDegree: 'Bachelor of Computer Applications (BCA)',
    education: [
      {
        id: 'edu-2',
        degree: 'Bachelor of Computer Applications (BCA)',
        fieldOfStudy: 'Computer Science',
        institution: 'Bangalore University',
        completionYear: 2024,
        cgpaPercentage: '82%'
      }
    ],
    experience: [
      {
        id: 'exp-2',
        jobTitle: 'Software Developer',
        company: 'WebTech',
        years: 2.0,
        responsibilities: 'Built backend services using Flask and Django with MySQL database.',
        technologiesUsed: ['Flask', 'Django', 'MySQL', 'Git']
      }
    ],
    projects: [],
    certifications: [],
    updatedAt: '2026-08-08'
  }
];

export const INITIAL_APPLICATIONS: JobApplication[] = [];
