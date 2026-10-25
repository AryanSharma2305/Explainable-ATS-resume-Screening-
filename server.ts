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
      const payload = req.body;
      const now = new Date();
      // Retention: 30 Days (1 Month) from now
      const retentionDays = 30;
      const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000).toISOString();

      const document = {
        ...payload,
        lastUpdated: now.toISOString(),
        expiresAt,
        retentionDays,
        retentionPolicy: '30_DAYS_ACTIVE',
        storageEngine: 'server_filesystem_json'
      };

      fs.writeFileSync(DATA_FILE, JSON.stringify(document, null, 2), 'utf-8');
      console.log(`[Server Storage] Saved database with ${document.users?.length || 0} users, expires at ${expiresAt}`);
      
      return res.json({
        success: true,
        lastUpdated: document.lastUpdated,
        expiresAt: document.expiresAt,
        retentionDays: 30
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

      let storedUsers = INITIAL_USERS;
      let fileDoc: any = null;
      if (fs.existsSync(DATA_FILE)) {
        try {
          fileDoc = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
          if (Array.isArray(fileDoc.users) && fileDoc.users.length > 0) {
            storedUsers = fileDoc.users;
          }
        } catch (e) {
          console.error('[Auth] Error reading DATA_FILE:', e);
        }
      }

      // Look up user in disk storage
      let user = storedUsers.find((u: any) => u.email?.trim().toLowerCase() === emailNorm);

      // If not in disk storage, check INITIAL_USERS (e.g. aryanmsharma23@gmail.com, admin@gmail.com)
      if (!user) {
        const seedUser = INITIAL_USERS.find(u => u.email.trim().toLowerCase() === emailNorm);
        if (seedUser) {
          user = seedUser;
          // Seed permanently into DATA_FILE so account is never lost
          if (fileDoc) {
            fileDoc.users = [...(fileDoc.users || []), seedUser];
            fs.writeFileSync(DATA_FILE, JSON.stringify(fileDoc, null, 2), 'utf-8');
          }
        }
      }

      if (!user) {
        return res.status(404).json({ success: false, error: 'No account found with this email address.' });
      }

      if (password && user.password && user.password !== password) {
        return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
      }

      return res.json({ success: true, user });
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
      const existingUserIdx = (fileDoc.users || []).findIndex(
        (u: any) => u.email?.trim().toLowerCase() === emailNorm
      );

      if (existingUserIdx >= 0) {
        fileDoc.users[existingUserIdx] = { ...fileDoc.users[existingUserIdx], ...user };
      } else {
        fileDoc.users = [...(fileDoc.users || []), user];
      }

      if (candidateProfile) {
        const candIdx = (fileDoc.candidates || []).findIndex(
          (c: any) => c.userId === user.id || c.email?.trim().toLowerCase() === emailNorm
        );
        if (candIdx >= 0) {
          fileDoc.candidates[candIdx] = { ...fileDoc.candidates[candIdx], ...candidateProfile };
        } else {
          fileDoc.candidates = [...(fileDoc.candidates || []), candidateProfile];
        }
      }

      const now = new Date();
      fileDoc.lastUpdated = now.toISOString();
      fileDoc.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      fileDoc.retentionDays = 30;

      fs.writeFileSync(DATA_FILE, JSON.stringify(fileDoc, null, 2), 'utf-8');
      console.log(`[Auth] Registered & stored user ${user.email} (expires in 30 days)`);

      return res.json({ success: true, user, message: 'Account saved to 30-day persistent disk storage.' });
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
