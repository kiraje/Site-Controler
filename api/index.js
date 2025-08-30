import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove } from 'firebase/database';

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDHbDfqa-LdsbbtNg0QUr7rSeXomqx6n-c",
    authDomain: "tlemons-46212.firebaseapp.com",
    databaseURL: "https://tlemons-46212-default-rtdb.firebaseio.com/",
    projectId: "tlemons-46212"
};

const API_KEY = process.env.API_KEY || 'your-secure-api-key-12345';

// Initialize Firebase
const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(firebaseApp);

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to check API key
const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Helper function to convert name to ID
const nameToId = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Generate PHP code for a site
const generatePHPCode = (siteId, siteName) => {
    return `<?php
// ${siteName} - Firebase Control
$firebase_url = 'https://tlemons-46212-default-rtdb.firebaseio.com/sites/${siteId}/status.json';

// Get filter status
$status = trim(@file_get_contents($firebase_url), '"');

// Apply filter only if status is ON
if ($status === 'on') {
    require __DIR__ . '/filter.php';
}

// Continue with normal site
?>`;
};

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Filter Switch API',
        version: '1.0.0',
        endpoints: {
            createSite: 'POST /api/sites',
            listSites: 'GET /api/sites',
            getSite: 'GET /api/sites/:id',
            updateStatus: 'PUT /api/sites/:id/status',
            deleteSite: 'DELETE /api/sites/:id',
            getPhpCode: 'GET /api/sites/:id/php-code'
        }
    });
});

// 1. Create Site
app.post('/api/sites', authenticate, async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name required' });
        }
        
        const siteId = nameToId(name);
        const sitesRef = ref(db, `sites/${siteId}`);
        
        // Check if site exists
        const snapshot = await get(sitesRef);
        if (snapshot.exists()) {
            return res.status(409).json({ error: 'Site already exists' });
        }
        
        // Create site
        const siteData = {
            name: name,
            status: 'off',
            created: Date.now()
        };
        
        await set(sitesRef, siteData);
        
        // Generate PHP code
        const phpCode = generatePHPCode(siteId, name);
        
        res.status(201).json({
            success: true,
            siteId: siteId,
            name: name,
            phpCode: phpCode,
            instructions: {
                step1: 'Add the PHP code to the beginning of your site\'s main PHP file',
                step2: 'Ensure filter.php exists in the same directory',
                step3: 'The filter will activate when status is set to "on" in Firebase'
            }
        });
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get Site
app.get('/api/sites/:siteId', authenticate, async (req, res) => {
    try {
        const { siteId } = req.params;
        const siteRef = ref(db, `sites/${siteId}`);
        
        const snapshot = await get(siteRef);
        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Site not found' });
        }
        
        res.json({
            success: true,
            siteId: siteId,
            data: snapshot.val()
        });
    } catch (error) {
        console.error('Error getting site:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Update Site Status
app.put('/api/sites/:siteId/status', authenticate, async (req, res) => {
    try {
        const { siteId } = req.params;
        const { status } = req.body;
        
        if (!status || !['on', 'off'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "on" or "off"' });
        }
        
        const siteRef = ref(db, `sites/${siteId}`);
        
        // Check if site exists
        const snapshot = await get(siteRef);
        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Site not found' });
        }
        
        // Update status
        const statusRef = ref(db, `sites/${siteId}/status`);
        await set(statusRef, status);
        
        res.json({
            success: true,
            siteId: siteId,
            status: status,
            updated: Date.now()
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Delete Site
app.delete('/api/sites/:siteId', authenticate, async (req, res) => {
    try {
        const { siteId } = req.params;
        const siteRef = ref(db, `sites/${siteId}`);
        
        // Check if site exists
        const snapshot = await get(siteRef);
        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Site not found' });
        }
        
        await remove(siteRef);
        
        res.json({
            success: true,
            siteId: siteId,
            message: 'Site deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. List All Sites
app.get('/api/sites', authenticate, async (req, res) => {
    try {
        const sitesRef = ref(db, 'sites');
        const snapshot = await get(sitesRef);
        
        const sites = snapshot.val() || {};
        const sitesList = Object.entries(sites).map(([id, data]) => ({
            siteId: id,
            ...data
        }));
        
        res.json({
            success: true,
            count: sitesList.length,
            sites: sitesList
        });
    } catch (error) {
        console.error('Error listing sites:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Get PHP Code for existing site
app.get('/api/sites/:siteId/php-code', authenticate, async (req, res) => {
    try {
        const { siteId } = req.params;
        const siteRef = ref(db, `sites/${siteId}`);
        
        const snapshot = await get(siteRef);
        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Site not found' });
        }
        
        const site = snapshot.val();
        const phpCode = generatePHPCode(siteId, site.name);
        
        res.json({
            success: true,
            siteId: siteId,
            name: site.name,
            phpCode: phpCode
        });
    } catch (error) {
        console.error('Error getting PHP code:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

export default app;