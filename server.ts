import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  INITIAL_USERS, 
  INITIAL_COMPANIES, 
  INITIAL_JOBS, 
  INITIAL_CANDIDATES, 
  INITIAL_SKILLS, 
  INITIAL_RELATIONSHIPS, 
  INITIAL_WEIGHTS, 
  INITIAL_THRESHOLDS, 
  INITIAL_PROJECT_RULES, 
  INITIAL_COURSES,
  INITIAL_APPLICATIONS
} from './src/services/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'ats_storage.json');

// Ensure data directory exists on disk for persistent storage
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Pre-seed storage file if it does not exist
if (!fs.existsSync(DATA_FILE)) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const initialDocument = {
    users: INITIAL_USERS,
    companies: INITIAL_COMPANIES,
    jobs: INITIAL_JOBS,
    candidates: INITIAL_CANDIDATES,
    applications: INITIAL_APPLICATIONS,
    skills: INITIAL_SKILLS,
    relationships: INITIAL_RELATIONSHIPS,
    weights: INITIAL_WEIGHTS,
    thresholds: INITIAL_THRESHOLDS,
    projectRules: INITIAL_PROJECT_RULES,
    courses: INITIAL_COURSES,
    auditLogs: [
      {
        id: 'log-init',
        timestamp: new Date().toLocaleTimeString(),
        actorEmail: 'admin@gmail.com',
        action: 'STORAGE_INITIALIZED',
        details: 'Persistent 30-day file storage initialized on server disk.'
      }
    ],
    lastUpdated: now.toISOString(),
    expiresAt,
    retentionDays: 30,
    retentionPolicy: '30_DAYS_ACTIVE',
    storageEngine: 'server_filesystem_json'
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(initialDocument, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      storageType: 'persistent_filesystem',
      retentionPolicy: '30_DAYS'
    });
  });

  // GET /api/storage - Retrieve persistently stored application database
  app.get('/api/storage', (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return res.json({
          success: true,
          data: parsed,
          lastSaved: parsed.lastUpdated || null,
          retentionPolicy: '30_DAYS_ONE_MONTH'
        });
      }
      return res.json({ success: true, data: null, message: 'No stored backup on server yet' });
    } catch (err: any) {
      console.error('[Server Storage] Error reading storage file:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/storage - Save / sync entire application state with 30-day retention
  app.post('/api/storage', (req, res) => {
    try {
      const payload = req.body || {};
      const now = new Date();
      // Retention: 30 Days (1 Month) from now
      const retentionDays = 30;
      const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000).toISOString();

      let currentFileDoc: any = {};
      if (fs.existsSync(DATA_FILE)) {
        try {
          currentFileDoc = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch (e) {
          console.error('[Server Storage] Error parsing existing DATA_FILE:', e);
        }
      }

      // Safely merge users so existing accounts are never wiped out by partial client state
      const userMap = new Map<string, any>();
      INITIAL_USERS.forEach(u => userMap.set(u.email.toLowerCase(), { ...u, password: u.password || 'password123' }));
      (currentFileDoc.users || []).forEach((u: any) => {
        if (u && u.email) userMap.set(u.email.toLowerCase(), { ...u, password: u.password || 'password123' });
      });
      (payload.users || []).forEach((u: any) => {
        if (u && u.email) {
          const prev = userMap.get(u.email.toLowerCase()) || {};
          userMap.set(u.email.toLowerCase(), { ...prev, ...u, password: u.password || prev.password || 'password123' });
        }
      });
      const mergedUsers = Array.from(userMap.values());

      // Safely merge candidates
      const candMap = new Map<string, any>();
      INITIAL_CANDIDATES.forEach(c => candMap.set(c.email.toLowerCase(), c));
      (currentFileDoc.candidates || []).forEach((c: any) => {
        if (c && c.email) candMap.set(c.email.toLowerCase(), c);
      });
      (payload.candidates || []).forEach((c: any) => {
        if (c && c.email) {
          const prev = candMap.get(c.email.toLowerCase()) || {};
          candMap.set(c.email.toLowerCase(), { ...prev, ...c });
        }
      });
      const mergedCandidates = Array.from(candMap.values());

      const document = {
        ...currentFileDoc,
        ...payload,
        users: mergedUsers,
        candidates: mergedCandidates,
        lastUpdated: now.toISOString(),
        expiresAt,
        retentionDays,
        retentionPolicy: '30_DAYS_ACTIVE',
        storageEngine: 'server_filesystem_json'
      };

      fs.writeFileSync(DATA_FILE, JSON.stringify(document, null, 2), 'utf-8');
      console.log(`[Server Storage] Saved database with ${mergedUsers.length} users and ${mergedCandidates.length} candidates.`);
      
      return res.json({
        success: true,
        lastUpdated: document.lastUpdated,
        expiresAt: document.expiresAt,
        retentionDays: 30,
        userCount: mergedUsers.length,
        candidateCount: mergedCandidates.length
      });
    } catch (err: any) {
      console.error('[Server Storage] Error writing storage file:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/login - Server-authoritative persistent login verification
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email address is required.' });
      }
      const emailNorm = email.trim().toLowerCase();

      let storedUsers: any[] = [...INITIAL_USERS];
      let storedCandidates: any[] = [...INITIAL_CANDIDATES];
      let fileDoc: any = null;

      if (fs.existsSync(DATA_FILE)) {
        try {
          fileDoc = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
          if (Array.isArray(fileDoc.users)) {
            storedUsers = [...storedUsers, ...fileDoc.users];
          }
          if (Array.isArray(fileDoc.candidates)) {
            storedCandidates = [...storedCandidates, ...fileDoc.candidates];
          }
        } catch (e) {
          console.error('[Auth] Error reading DATA_FILE in login:', e);
        }
      }

      // 1. Look up user by email in storedUsers
      let user = storedUsers.find((u: any) => u && u.email && u.email.trim().toLowerCase() === emailNorm);

      // 2. If not found in users, check candidate profiles
      if (!user) {
        const candidateProf = storedCandidates.find((c: any) => c && c.email && c.email.trim().toLowerCase() === emailNorm);
        if (candidateProf) {
          user = {
            id: candidateProf.userId || `user-cand-${Date.now()}`,
            name: candidateProf.fullName || 'Candidate',
            email: emailNorm,
            password: 'password123',
            role: 'CANDIDATE',
            title: candidateProf.summary || 'Job Seeker',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            createdAt: candidateProf.updatedAt || new Date().toISOString().split('T')[0]
          };

          // Save synthesized user into fileDoc so it's permanently stored
          if (fileDoc) {
            fileDoc.users = [...(fileDoc.users || []), user];
            fs.writeFileSync(DATA_FILE, JSON.stringify(fileDoc, null, 2), 'utf-8');
          }
        }
      }

      // 3. Fallback for aryanmsharma23@gmail.com and admin@gmail.com default seeds
      if (!user) {
        const seedUser = INITIAL_USERS.find(u => u.email.trim().toLowerCase() === emailNorm);
        if (seedUser) {
          user = { ...seedUser, password: seedUser.password || 'password123' };
          if (fileDoc) {
            fileDoc.users = [...(fileDoc.users || []), user];
            fs.writeFileSync(DATA_FILE, JSON.stringify(fileDoc, null, 2), 'utf-8');
          }
        }
      }

      if (!user) {
        return res.status(404).json({ success: false, error: 'No account found with this email address.' });
      }

      // Normalize user role and password
      const normalizedUser = {
        ...user,
        role: user.email.toLowerCase() === 'admin@gmail.com' ? 'ADMIN' : (user.role?.toUpperCase() || 'CANDIDATE'),
        password: user.password || 'password123'
      };

      const expectedPassword = normalizedUser.password;
      if (password && expectedPassword && expectedPassword !== password) {
        return res.status(401).json({ success: false, error: 'Incorrect password. Please verify your password and try again.' });
      }

      return res.json({ success: true, user: normalizedUser });
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/register - Register user directly into persistent 30-day file storage
  app.post('/api/auth/register', (req, res) => {
    try {
      const { user, candidateProfile } = req.body;
      if (!user || !user.email) {
        return res.status(400).json({ success: false, error: 'Valid user profile required.' });
      }

      let fileDoc: any = {
        users: INITIAL_USERS,
        companies: INITIAL_COMPANIES,
        jobs: INITIAL_JOBS,
        candidates: INITIAL_CANDIDATES,
        applications: INITIAL_APPLICATIONS,
        skills: INITIAL_SKILLS,
        relationships: INITIAL_RELATIONSHIPS,
        weights: INITIAL_WEIGHTS,
        thresholds: INITIAL_THRESHOLDS,
        projectRules: INITIAL_PROJECT_RULES,
        courses: INITIAL_COURSES,
        auditLogs: []
      };

      if (fs.existsSync(DATA_FILE)) {
        try {
          fileDoc = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch (e) {
          console.error('[Auth] Error reading DATA_FILE in register:', e);
        }
      }

      const emailNorm = user.email.trim().toLowerCase();
      const safeUser = {
        ...user,
        email: emailNorm,
        password: user.password || 'password123',
        role: user.role?.toUpperCase() || 'CANDIDATE'
      };

      const existingUserIdx = (fileDoc.users || []).findIndex(
        (u: any) => u.email?.trim().toLowerCase() === emailNorm
      );

      if (existingUserIdx >= 0) {
        fileDoc.users[existingUserIdx] = { ...fileDoc.users[existingUserIdx], ...safeUser };
      } else {
        fileDoc.users = [...(fileDoc.users || []), safeUser];
      }

      if (candidateProfile) {
        const safeCand = {
          ...candidateProfile,
          email: emailNorm,
          fullName: candidateProfile.fullName || safeUser.name
        };
        const candIdx = (fileDoc.candidates || []).findIndex(
          (c: any) => c.userId === safeUser.id || c.email?.trim().toLowerCase() === emailNorm
        );
        if (candIdx >= 0) {
          fileDoc.candidates[candIdx] = { ...fileDoc.candidates[candIdx], ...safeCand };
        } else {
          fileDoc.candidates = [...(fileDoc.candidates || []), safeCand];
        }
      }

      const now = new Date();
      fileDoc.lastUpdated = now.toISOString();
      fileDoc.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      fileDoc.retentionDays = 30;

      fs.writeFileSync(DATA_FILE, JSON.stringify(fileDoc, null, 2), 'utf-8');
      console.log(`[Auth] Registered & stored user ${safeUser.email} (expires in 30 days)`);

      return res.json({ success: true, user: safeUser, message: 'Account saved to 30-day persistent disk storage.' });
    } catch (err: any) {
      console.error('[Auth] Register error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/storage/download - Direct JSON backup download
  app.get('/api/storage/download', (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        res.setHeader('Content-Disposition', 'attachment; filename="ats_screener_30day_backup.json"');
        res.setHeader('Content-Type', 'application/json');
        return res.sendFile(DATA_FILE);
      }
      return res.status(404).json({ error: 'No stored file found' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Development vs Production Middleware
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite in dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ATS Screener Full-Stack] Server active on http://0.0.0.0:${PORT} with 30-Day Persistent Storage`);
  });
}

startServer();
