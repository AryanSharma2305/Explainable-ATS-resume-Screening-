import { Course } from '../types';

export const COMPREHENSIVE_COURSES: Course[] = [
  // Java & Spring Ecosystem
  {
    id: 'c-spring-boot',
    skillName: 'Spring Boot',
    title: 'Spring Boot 3, Spring 6 & Hibernate for Beginners',
    provider: 'Udemy / Baeldung',
    level: 'Intermediate',
    duration: '22 Hours',
    url: 'https://spring.io/guides',
    description: 'Master Spring Boot 3, REST APIs, Spring Data JPA, Hibernate ORM, Spring Security, and microservice containerization.'
  },
  {
    id: 'c-spring',
    skillName: 'Spring',
    title: 'Spring Framework Specialization: Core & MVC',
    provider: 'Coursera / LearnSpring',
    level: 'Intermediate',
    duration: '18 Hours',
    url: 'https://spring.io/projects/spring-framework',
    description: 'Deep dive into Dependency Injection, ApplicationContext, Spring MVC controllers, annotations, and Bean lifecycle.'
  },
  {
    id: 'c-java',
    skillName: 'Java',
    title: 'Java 17 & 21 Masterclass: Core Java, OOP & Collections',
    provider: 'Oracle University / Coursera',
    level: 'Beginner',
    duration: '25 Hours',
    url: 'https://dev.java/learn/',
    description: 'Learn modern Java syntax, Object-Oriented Programming, Java Collections Framework, Streams API, and multithreading.'
  },
  {
    id: 'c-hibernate',
    skillName: 'Hibernate',
    title: 'Hibernate and JPA Fundamentals with Java',
    provider: 'Baeldung / Udemy',
    level: 'Intermediate',
    duration: '10 Hours',
    url: 'https://hibernate.org/orm/documentation/',
    description: 'Learn Entity mappings, JPQL, HQL queries, lazy loading, caching strategies, and database transaction management.'
  },
  {
    id: 'c-maven',
    skillName: 'Maven',
    title: 'Apache Maven: Beginner to Master',
    provider: 'freeCodeCamp / Apache',
    level: 'Beginner',
    duration: '5 Hours',
    url: 'https://maven.apache.org/guides/',
    description: 'Understand POM.xml configuration, dependency management, plugins, lifecycle phases, and multi-module builds.'
  },

  // Python Ecosystem
  {
    id: 'c-python',
    skillName: 'Python',
    title: 'Complete Python BootCamp: Zero to Hero',
    provider: 'EdX / Coursera',
    level: 'Beginner',
    duration: '15 Hours',
    url: 'https://www.python.org/doc/',
    description: 'Comprehensive Python programming covering OOP, data structures, scripting, algorithms, and modular design.'
  },
  {
    id: 'c-django',
    skillName: 'Django',
    title: 'Django 5 Web Development & Django REST Framework',
    provider: 'freeCodeCamp / Coursera',
    level: 'Intermediate',
    duration: '16 Hours',
    url: 'https://docs.djangoproject.com/',
    description: 'Build robust web applications with Django ORM, authentication, admin panel, models, migrations, and REST APIs.'
  },
  {
    id: 'c-flask',
    skillName: 'Flask',
    title: 'RESTful API Development with Python Flask',
    provider: 'Real Python / Coursera',
    level: 'Intermediate',
    duration: '10 Hours',
    url: 'https://flask.palletsprojects.com/',
    description: 'Build lightweight microservices, route blueprints, SQLAlchemy integration, JWT authentication, and unit testing.'
  },
  {
    id: 'c-fastapi',
    skillName: 'FastAPI',
    title: 'Modern High-Performance APIs with FastAPI & Python',
    provider: 'Udemy / FastAPI Docs',
    level: 'Intermediate',
    duration: '12 Hours',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    description: 'Learn asynchronous Python, Pydantic type validation, automatic Swagger/OpenAPI docs, and SQLAlchemy integration.'
  },

  // JavaScript & Frontend / Full Stack
  {
    id: 'c-javascript',
    skillName: 'JavaScript',
    title: 'Modern JavaScript (ES6+): The Complete Guide',
    provider: 'freeCodeCamp / MDN',
    level: 'Beginner',
    duration: '20 Hours',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    description: 'Master async/await, closures, promises, DOM manipulation, ES modules, and modern JavaScript design patterns.'
  },
  {
    id: 'c-typescript',
    skillName: 'TypeScript',
    title: 'Understanding TypeScript: 2026 Edition',
    provider: 'Udemy / TypeScript Official',
    level: 'Intermediate',
    duration: '14 Hours',
    url: 'https://www.typescriptlang.org/docs/',
    description: 'Learn interfaces, generics, type guards, strict typing, TSConfig setup, and TypeScript in React & Node backends.'
  },
  {
    id: 'c-react',
    skillName: 'React',
    title: 'Full Modern React with Hooks & Context',
    provider: 'freeCodeCamp / React.dev',
    level: 'Intermediate',
    duration: '18 Hours',
    url: 'https://react.dev/learn',
    description: 'Component architecture, custom hooks, state management, memoization, performance optimization, and React 19.'
  },
  {
    id: 'c-angular',
    skillName: 'Angular',
    title: 'Angular - The Complete Guide: Signals & Standalone Components',
    provider: 'Coursera / Angular.dev',
    level: 'Intermediate',
    duration: '22 Hours',
    url: 'https://angular.dev/',
    description: 'Learn components, signals, RxJS reactive extensions, dependency injection, routing, and form validation.'
  },
  {
    id: 'c-vue',
    skillName: 'Vue',
    title: 'Vue.js 3 Fundamentals & Composition API',
    provider: 'Vue Mastery / freeCodeCamp',
    level: 'Beginner',
    duration: '12 Hours',
    url: 'https://vuejs.org/guide/introduction.html',
    description: 'Composition API, reactivity with ref and reactive, Pinia state store, Vue Router, and Vite tooling.'
  },
  {
    id: 'c-vuejs',
    skillName: 'Vue.js',
    title: 'Vue.js 3 Fundamentals & Composition API',
    provider: 'Vue Mastery / freeCodeCamp',
    level: 'Beginner',
    duration: '12 Hours',
    url: 'https://vuejs.org/guide/introduction.html',
    description: 'Composition API, reactivity with ref and reactive, Pinia state store, Vue Router, and Vite tooling.'
  },
  {
    id: 'c-nodejs',
    skillName: 'Node.js',
    title: 'Node.js, Express & MongoDB Developer Bootcamp',
    provider: 'Coursera / freeCodeCamp',
    level: 'Intermediate',
    duration: '24 Hours',
    url: 'https://nodejs.org/en/docs/',
    description: 'Build backend event-driven servers, event loop mechanics, streams, file systems, and production REST architectures.'
  },
  {
    id: 'c-express',
    skillName: 'Express',
    title: 'Express.js Fundamentals & Middleware Architecture',
    provider: 'freeCodeCamp / MDN',
    level: 'Intermediate',
    duration: '8 Hours',
    url: 'https://expressjs.com/',
    description: 'Learn route handlers, custom middleware, error handling, CORS, session management, and JWT authentication.'
  },
  {
    id: 'c-nextjs',
    skillName: 'Next.js',
    title: 'Next.js 14+ App Router & Server Components Masterclass',
    provider: 'Vercel / freeCodeCamp',
    level: 'Intermediate',
    duration: '16 Hours',
    url: 'https://nextjs.org/docs',
    description: 'Server-side rendering (SSR), Static Site Generation (SSG), React Server Components, server actions, and API routes.'
  },

  // Databases & SQL
  {
    id: 'c-sql',
    skillName: 'SQL',
    title: 'The Complete SQL Bootcamp: From Basics to Advanced Queries',
    provider: 'Coursera / freeCodeCamp',
    level: 'Beginner',
    duration: '14 Hours',
    url: 'https://www.w3schools.com/sql/',
    description: 'Master SELECT queries, joins, group by, aggregations, subqueries, indexes, transactions, and schema normalization.'
  },
  {
    id: 'c-mysql',
    skillName: 'MySQL',
    title: 'MySQL Database Administration & High Performance Queries',
    provider: 'Coursera / MySQL Docs',
    level: 'Intermediate',
    duration: '16 Hours',
    url: 'https://dev.mysql.com/doc/',
    description: 'Relational schemas, foreign keys, stored procedures, indexing, EXPLAIN plan optimization, and backup strategies.'
  },
  {
    id: 'c-postgresql',
    skillName: 'PostgreSQL',
    title: 'PostgreSQL for Everybody Specialization',
    provider: 'University of Michigan / Coursera',
    level: 'Intermediate',
    duration: '18 Hours',
    url: 'https://www.postgresql.org/docs/',
    description: 'ACID transactions, JSONB columns, window functions, CTEs, full-text search, and database tuning.'
  },
  {
    id: 'c-mongodb',
    skillName: 'MongoDB',
    title: 'MongoDB Complete Developer Guide & Aggregation Pipeline',
    provider: 'MongoDB University / Coursera',
    level: 'Intermediate',
    duration: '14 Hours',
    url: 'https://www.mongodb.com/docs/',
    description: 'NoSQL document schemas, BSON data types, CRUD operations, indexing, aggregation framework, and Mongoose ODM.'
  },
  {
    id: 'c-redis',
    skillName: 'Redis',
    title: 'Redis for Developers: In-Memory Caching & Pub/Sub',
    provider: 'Redis University',
    level: 'Intermediate',
    duration: '8 Hours',
    url: 'https://redis.io/docs/',
    description: 'Key-value data structures, cache expiration strategies, Pub/Sub messaging, session stores, and rate limiting.'
  },

  // DevOps, Cloud & Tools
  {
    id: 'c-docker',
    skillName: 'Docker',
    title: 'Docker & Containerization: The Practical Guide',
    provider: 'Coursera / Udemy',
    level: 'Intermediate',
    duration: '12 Hours',
    url: 'https://docs.docker.com/get-started/',
    description: 'Master containerization, Dockerfiles, docker-compose, multi-stage builds, volumes, and networking.'
  },
  {
    id: 'c-kubernetes',
    skillName: 'Kubernetes',
    title: 'Certified Kubernetes Administrator (CKA) Preparation',
    provider: 'The Linux Foundation / Coursera',
    level: 'Advanced',
    duration: '26 Hours',
    url: 'https://kubernetes.io/docs/home/',
    description: 'Pods, Deployments, ReplicaSets, Services, Ingress controllers, Helm charts, ConfigMaps, and cluster orchestration.'
  },
  {
    id: 'c-git',
    skillName: 'Git',
    title: 'Version Control with Git & GitHub Masterclass',
    provider: 'Udacity / freeCodeCamp',
    level: 'Beginner',
    duration: '6 Hours',
    url: 'https://git-scm.com/doc',
    description: 'Master commits, branching strategies, rebasing, merge conflicts, pull requests, and Git workflows.'
  },
  {
    id: 'c-github',
    skillName: 'GitHub',
    title: 'GitHub & CI/CD Actions for Modern Developers',
    provider: 'GitHub Skills / Coursera',
    level: 'Beginner',
    duration: '8 Hours',
    url: 'https://skills.github.com/',
    description: 'Learn collaborative pull requests, issue tracking, GitHub Actions CI/CD workflows, and code security scanning.'
  },
  {
    id: 'c-rest-api',
    skillName: 'REST API',
    title: 'RESTful API Architecture, Design & Security',
    provider: 'Coursera / Pluralsight',
    level: 'Intermediate',
    duration: '10 Hours',
    url: 'https://restfulapi.net/',
    description: 'HTTP verbs, status codes, idempotent methods, JSON serialization, pagination, versioning, and API authentication.'
  },
  {
    id: 'c-aws',
    skillName: 'AWS',
    title: 'AWS Certified Solutions Architect & Developer Specialization',
    provider: 'Amazon Web Services / Coursera',
    level: 'Intermediate',
    duration: '24 Hours',
    url: 'https://aws.amazon.com/training/',
    description: 'Learn EC2, S3, Lambda, DynamoDB, VPC networking, IAM security, and cloud deployment pipelines.'
  },
  {
    id: 'c-cloud',
    skillName: 'Cloud',
    title: 'Cloud Computing Concepts & Architecture Fundamentals',
    provider: 'Coursera / Cloud Academy',
    level: 'Beginner',
    duration: '12 Hours',
    url: 'https://aws.amazon.com/what-is-cloud-computing/',
    description: 'Understand IaaS, PaaS, SaaS, virtualization, distributed architectures, high availability, and disaster recovery.'
  },
  {
    id: 'c-terraform',
    skillName: 'Terraform',
    title: 'HashiCorp Certified: Terraform Associate Bootcamp',
    provider: 'HashiCorp / Udemy',
    level: 'Intermediate',
    duration: '12 Hours',
    url: 'https://developer.hashicorp.com/terraform/tutorials',
    description: 'Infrastructure as Code (IaC), HCL syntax, state management, provider configuration, and automated cloud deployments.'
  },

  // C# & .NET
  {
    id: 'c-csharp',
    skillName: 'C#',
    title: 'C# 12 & .NET 8 Fundamentals: Object-Oriented Mastery',
    provider: 'Microsoft Learn / Coursera',
    level: 'Beginner',
    duration: '18 Hours',
    url: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
    description: 'Modern C# syntax, classes, interfaces, LINQ expressions, asynchronous programming with async/await, and memory management.'
  },
  {
    id: 'c-dotnet',
    skillName: '.NET',
    title: '.NET 8 Web API & Microservices Development',
    provider: 'Microsoft Learn / Pluralsight',
    level: 'Intermediate',
    duration: '20 Hours',
    url: 'https://dotnet.microsoft.com/learn',
    description: 'Build enterprise cross-platform applications with .NET 8 runtime, dependency injection, and REST endpoints.'
  },
  {
    id: 'c-aspnet',
    skillName: 'ASP.NET',
    title: 'ASP.NET Core Web API Development from Scratch',
    provider: 'Microsoft Learn / Udemy',
    level: 'Intermediate',
    duration: '16 Hours',
    url: 'https://learn.microsoft.com/en-us/aspnet/core/',
    description: 'Middleware pipelines, Entity Framework Core, JWT authentication, Swagger documentation, and SQL Server integration.'
  },

  // Data Science, AI & Machine Learning
  {
    id: 'c-ml',
    skillName: 'Machine Learning',
    title: 'Machine Learning Specialization by Andrew Ng',
    provider: 'Stanford / DeepLearning.AI (Coursera)',
    level: 'Intermediate',
    duration: '35 Hours',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    description: 'Supervised learning, linear regression, logistic regression, decision trees, neural networks, and model evaluation metrics.'
  },
  {
    id: 'c-tf',
    skillName: 'TensorFlow',
    title: 'DeepLearning.AI TensorFlow Developer Professional Certificate',
    provider: 'DeepLearning.AI / Coursera',
    level: 'Intermediate',
    duration: '28 Hours',
    url: 'https://www.tensorflow.org/tutorials',
    description: 'Build neural networks with Keras & TensorFlow, computer vision CNNs, NLP sequence models, and model deployment.'
  },
  {
    id: 'c-pytorch',
    skillName: 'PyTorch',
    title: 'Deep Learning with PyTorch: Zero to GANs',
    provider: 'freeCodeCamp / PyTorch.org',
    level: 'Intermediate',
    duration: '20 Hours',
    url: 'https://pytorch.org/tutorials/',
    description: 'Tensors, autograd, PyTorch nn.Module, custom training loops, convolutional networks, and transformer models.'
  },
  {
    id: 'c-scikit',
    skillName: 'Scikit-learn',
    title: 'Applied Machine Learning in Python with Scikit-Learn',
    provider: 'University of Michigan / Coursera',
    level: 'Intermediate',
    duration: '15 Hours',
    url: 'https://scikit-learn.org/stable/tutorial/index.html',
    description: 'Feature preprocessing, pipelines, classification, regression, clustering, cross-validation, and hyperparameter tuning.'
  },
  {
    id: 'c-pandas',
    skillName: 'Pandas',
    title: 'Data Analysis with Python & Pandas',
    provider: 'freeCodeCamp / DataCamp',
    level: 'Beginner',
    duration: '10 Hours',
    url: 'https://pandas.pydata.org/docs/user_guide/index.html',
    description: 'DataFrames, Series, filtering, grouping, merging, missing value imputation, and exploratory data analysis (EDA).'
  },
  {
    id: 'c-numpy',
    skillName: 'NumPy',
    title: 'NumPy Data Science Essential Training',
    provider: 'freeCodeCamp / NumPy.org',
    level: 'Beginner',
    duration: '6 Hours',
    url: 'https://numpy.org/learn/',
    description: 'N-dimensional arrays, vectorization, broadcasting, mathematical operations, slicing, and linear algebra.'
  },
  {
    id: 'c-powerbi',
    skillName: 'Power BI',
    title: 'Microsoft Power BI Data Analyst Professional Certificate',
    provider: 'Microsoft / Coursera',
    level: 'Beginner',
    duration: '20 Hours',
    url: 'https://learn.microsoft.com/en-us/power-bi/',
    description: 'Data ingestion with Power Query, DAX measures and calculated columns, interactive dashboard visualization, and reports.'
  },
  {
    id: 'c-tableau',
    skillName: 'Tableau',
    title: 'Tableau Desktop for Business Intelligence & Visual Analytics',
    provider: 'Tableau / Coursera',
    level: 'Beginner',
    duration: '16 Hours',
    url: 'https://www.tableau.com/learn/training',
    description: 'Connect datasets, create charts, build dynamic dashboards, calculate fields, and present business intelligence insights.'
  },

  // CSS & Web UI
  {
    id: 'c-css',
    skillName: 'CSS',
    title: 'Modern CSS & Responsive Web Design Masterclass',
    provider: 'freeCodeCamp / MDN',
    level: 'Beginner',
    duration: '12 Hours',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    description: 'Flexbox, CSS Grid, animations, media queries, mobile-first design, CSS custom properties, and modern UI layouts.'
  },
  {
    id: 'c-tailwind',
    skillName: 'Tailwind CSS',
    title: 'Tailwind CSS: From Zero to Production UI',
    provider: 'Tailwind Labs / YouTube',
    level: 'Beginner',
    duration: '8 Hours',
    url: 'https://tailwindcss.com/docs',
    description: 'Utility-first styling, responsive prefixes, dark mode, custom plugins, component abstraction, and theme config.'
  },
  {
    id: 'c-bootstrap',
    skillName: 'Bootstrap',
    title: 'Bootstrap 5 Responsive Web Development',
    provider: 'freeCodeCamp / GetBootstrap',
    level: 'Beginner',
    duration: '6 Hours',
    url: 'https://getbootstrap.com/docs/5.3/getting-started/introduction/',
    description: 'Bootstrap grid system, navbars, cards, modals, utilities, and rapid responsive page prototyping.'
  },

  // C++ & Low-Level / Systems
  {
    id: 'c-cpp',
    skillName: 'C++',
    title: 'Modern C++ (C++17/20): Memory Management & STL',
    provider: 'Coursera / edX',
    level: 'Intermediate',
    duration: '22 Hours',
    url: 'https://en.cppreference.com/w/',
    description: 'Pointers, smart pointers, RAII, Standard Template Library (STL), templates, move semantics, and systems design.'
  },
  {
    id: 'c-c',
    skillName: 'C',
    title: 'C Programming for Systems & Microcontrollers',
    provider: 'Coursera / edX',
    level: 'Beginner',
    duration: '16 Hours',
    url: 'https://en.cppreference.com/w/c',
    description: 'Pointers, memory allocation (malloc/free), structs, file I/O, bitwise operators, and low-level algorithms.'
  },
  {
    id: 'c-go',
    skillName: 'Go',
    title: 'Go: The Complete Developer Guide (Golang)',
    provider: 'Udemy / Go.dev',
    level: 'Intermediate',
    duration: '15 Hours',
    url: 'https://go.dev/learn/',
    description: 'Goroutines, channels, interfaces, structs, error handling, standard HTTP library, and concurrent microservices.'
  },
  {
    id: 'c-kotlin',
    skillName: 'Kotlin',
    title: 'Kotlin for Android & Backend Developers',
    provider: 'Google Developers / JetBrains',
    level: 'Intermediate',
    duration: '14 Hours',
    url: 'https://kotlinlang.org/docs/home.html',
    description: 'Null safety, extension functions, coroutines, data classes, Jetpack Compose, and Spring Boot with Kotlin.'
  },
  {
    id: 'c-flutter',
    skillName: 'Flutter',
    title: 'Flutter & Dart: Cross-Platform Mobile Apps',
    provider: 'Google Developers / freeCodeCamp',
    level: 'Intermediate',
    duration: '20 Hours',
    url: 'https://docs.flutter.dev/',
    description: 'Stateless & Stateful widgets, Provider/Bloc state management, REST API integration, animations, and iOS/Android builds.'
  },
  {
    id: 'c-php',
    skillName: 'PHP',
    title: 'Modern PHP 8 & Object-Oriented Web Development',
    provider: 'Coursera / PHP.net',
    level: 'Beginner',
    duration: '14 Hours',
    url: 'https://www.php.net/docs.php',
    description: 'PHP 8 typed properties, attributes, match expressions, Composer package management, and MySQL database connection.'
  },
  {
    id: 'c-laravel',
    skillName: 'Laravel',
    title: 'Laravel 11 from Scratch: Master PHP Web Framework',
    provider: 'Laracasts / Coursera',
    level: 'Intermediate',
    duration: '18 Hours',
    url: 'https://laravel.com/docs',
    description: 'Blade templating, Eloquent ORM, database migrations, authentication, queues, and REST API development.'
  }
];

/**
 * Resolves one or more recommended courses for a specific missing skill name.
 * Performs case-insensitive matching, alias matching, and falls back to dynamic high-quality course synthesis.
 */
export function getCoursesForSkill(skillName: string, customCatalog?: Course[]): Course[] {
  const catalog = customCatalog && customCatalog.length > 0 ? customCatalog : COMPREHENSIVE_COURSES;
  const targetClean = skillName.trim().toLowerCase();

  // 1. Direct or alias match in catalog
  const matches = catalog.filter(c => {
    const cClean = c.skillName.trim().toLowerCase();
    return cClean === targetClean ||
      cClean.replace(/[^a-z0-9]/g, '') === targetClean.replace(/[^a-z0-9]/g, '');
  });

  if (matches.length > 0) {
    return matches;
  }

  // 2. Partial containment match (e.g. "Spring Boot" matching "Spring")
  const partials = catalog.filter(c => {
    const cClean = c.skillName.trim().toLowerCase();
    return targetClean.includes(cClean) || cClean.includes(targetClean);
  });

  if (partials.length > 0) {
    return partials;
  }

  // 3. Dynamic synthesis fallback with authoritative documentation & tutorials
  const synthesized: Course = {
    id: `dyn-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    skillName: skillName,
    title: `Mastering ${skillName}: Fundamentals, Practical Projects & Best Practices`,
    provider: 'freeCodeCamp / Coursera / Official Docs',
    level: 'Intermediate',
    duration: '12-15 Hours',
    url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' official tutorial course documentation')}`,
    description: `Targeted, comprehensive curriculum designed to learn ${skillName}, complete practical coding exercises, and satisfy job requirements.`
  };

  return [synthesized];
}

/**
 * Resolves a list of courses covering all missing skills in an ATS gap.
 */
export function getRecommendedCoursesForGaps(missingSkills: string[], catalog?: Course[]): Array<{
  skillName: string;
  courses: Course[];
}> {
  return missingSkills.map(skill => ({
    skillName: skill,
    courses: getCoursesForSkill(skill, catalog)
  }));
}
