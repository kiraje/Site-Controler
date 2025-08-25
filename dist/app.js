const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDHbDfqa-LdsbbtNg0QUr7rSeXomqx6n-c",
    authDomain: "tlemons-46212.firebaseapp.com",
    databaseURL: "https://tlemons-46212-default-rtdb.firebaseio.com/",
    projectId: "tlemons-46212"
};

class FirebaseService {
    constructor() {
        this.db = null;
        this.sitesRef = null;
    }

    async init() {
        if (typeof firebase === 'undefined') {
            await this.loadFirebaseSDK();
        }
        
        firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();
        this.sitesRef = this.db.ref('sites');
    }

    async loadFirebaseSDK() {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js'
        ];

        for (const src of scripts) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }

    onSitesChange(callback) {
        return this.sitesRef.on('value', (snapshot) => {
            callback(snapshot.val() || {});
        });
    }

    async addSite(siteId, siteData) {
        return this.sitesRef.child(siteId).set(siteData);
    }

    async updateSiteStatus(siteId, status) {
        return this.sitesRef.child(siteId).child('status').set(status);
    }

    async deleteSite(siteId) {
        return this.sitesRef.child(siteId).remove();
    }

    offSitesChange() {
        this.sitesRef.off();
    }
}

function nameToId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    icon.textContent = icons[type] || icons.success;
    msg.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }
}

function generatePHPCode(siteId, siteName) {
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
}

class UIComponents {
    static createSiteCard(siteId, site) {
        const card = document.createElement('div');
        card.className = 'site-card';
        card.innerHTML = `
            <div class="site-header">
                <div>
                    <div class="site-name">${site.name}</div>
                    <div class="site-id">ID: ${siteId}</div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="code-btn" data-site-id="${siteId}">Get Code</button>
                    <button class="delete-btn" data-site-id="${siteId}">Delete</button>
                </div>
            </div>
            
            <div class="site-controls">
                <div class="control-item">
                    <span>Filter Status:</span>
                    <label class="switch">
                        <input type="checkbox" 
                               class="status-toggle"
                               data-site-id="${siteId}"
                               ${site.status === 'on' ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <span class="status-label" style="color: ${site.status === 'on' ? '#28a745' : '#999'}; font-weight: bold;">
                        ${site.status === 'on' ? 'ON' : 'OFF'}
                    </span>
                </div>
            </div>
        `;
        return card;
    }

    static createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No sites added yet. Add your first site above!';
        return emptyState;
    }

    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    static showConfirmDelete(siteName) {
        document.getElementById('deleteSiteName').textContent = siteName;
        document.getElementById('confirmDelete').classList.add('show');
    }

    static hideConfirmDelete() {
        document.getElementById('confirmDelete').classList.remove('show');
    }

    static updateCodeModal(siteName, phpCode) {
        document.getElementById('modalSiteName').textContent = siteName;
        document.getElementById('phpCode').textContent = phpCode;
    }

    static setCopyButtonState(copied) {
        const btn = document.getElementById('copyBtn');
        if (copied) {
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 2000);
        } else {
            btn.classList.remove('copied');
        }
    }

    static setInputError(inputId, hasError) {
        const input = document.getElementById(inputId);
        if (hasError) {
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    }

    static clearInput(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    }
}

class SiteControlApp {
    constructor() {
        this.firebase = new FirebaseService();
        this.sitesData = {};
        this.siteToDelete = null;
    }

    async init() {
        await this.firebase.init();
        this.setupEventListeners();
        this.loadSites();
    }

    setupEventListeners() {
        document.getElementById('addSiteBtn').addEventListener('click', () => this.addSite());
        
        document.getElementById('newSiteName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSite();
        });
        
        document.getElementById('newSiteName').addEventListener('input', function() {
            this.classList.remove('error');
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            UIComponents.hideModal('codeModal');
            UIComponents.setCopyButtonState(false);
        });

        document.getElementById('copyBtn').addEventListener('click', () => this.copyCode());
        
        document.getElementById('confirmYesBtn').addEventListener('click', () => this.confirmDeleteSite());
        document.getElementById('confirmNoBtn').addEventListener('click', () => this.cancelDelete());

        window.addEventListener('click', (event) => {
            const modal = document.getElementById('codeModal');
            if (event.target === modal) {
                UIComponents.hideModal('codeModal');
            }
        });

        document.getElementById('sites-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('code-btn')) {
                const siteId = e.target.dataset.siteId;
                this.showCode(siteId);
            } else if (e.target.classList.contains('delete-btn')) {
                const siteId = e.target.dataset.siteId;
                this.deleteSite(siteId);
            }
        });

        document.getElementById('sites-container').addEventListener('change', (e) => {
            if (e.target.classList.contains('status-toggle')) {
                const siteId = e.target.dataset.siteId;
                this.toggleStatus(siteId, e.target.checked);
            }
        });
    }

    loadSites() {
        this.firebase.onSitesChange((data) => {
            this.sitesData = data;
            this.renderSites();
        });
    }

    renderSites() {
        const container = document.getElementById('sites-container');
        container.innerHTML = '';
        
        if (Object.keys(this.sitesData).length === 0) {
            container.appendChild(UIComponents.createEmptyState());
            return;
        }
        
        Object.entries(this.sitesData).forEach(([siteId, site]) => {
            container.appendChild(UIComponents.createSiteCard(siteId, site));
        });
    }

    async addSite() {
        const input = document.getElementById('newSiteName');
        const siteName = input.value.trim();
        
        if (!siteName) {
            UIComponents.setInputError('newSiteName', true);
            showToast('Please enter a site name', 'error');
            return;
        }
        
        const siteId = nameToId(siteName);
        
        if (this.sitesData[siteId]) {
            UIComponents.setInputError('newSiteName', true);
            showToast('A site with this name already exists', 'error');
            return;
        }
        
        const siteData = {
            name: siteName,
            status: 'off'
        };
        
        await this.firebase.addSite(siteId, siteData);
        UIComponents.clearInput('newSiteName');
        UIComponents.setInputError('newSiteName', false);
        showToast(`Site "${siteName}" added successfully!`, 'success');
    }

    async toggleStatus(siteId, isChecked) {
        const status = isChecked ? 'on' : 'off';
        await this.firebase.updateSiteStatus(siteId, status);
        showToast(`Status changed to ${status.toUpperCase()}`, 'info');
    }

    deleteSite(siteId) {
        this.siteToDelete = siteId;
        UIComponents.showConfirmDelete(this.sitesData[siteId].name);
    }

    async confirmDeleteSite() {
        if (this.siteToDelete) {
            const siteName = this.sitesData[this.siteToDelete].name;
            await this.firebase.deleteSite(this.siteToDelete);
            showToast(`Site "${siteName}" deleted`, 'success');
            this.siteToDelete = null;
        }
        UIComponents.hideConfirmDelete();
    }

    cancelDelete() {
        this.siteToDelete = null;
        UIComponents.hideConfirmDelete();
    }

    showCode(siteId) {
        const site = this.sitesData[siteId];
        const phpCode = generatePHPCode(siteId, site.name);
        UIComponents.updateCodeModal(site.name, phpCode);
        UIComponents.showModal('codeModal');
    }

    async copyCode() {
        const code = document.getElementById('phpCode').textContent;
        const success = await copyToClipboard(code);
        if (success) {
            UIComponents.setCopyButtonState(true);
        }
    }
}

const app = new SiteControlApp();
app.init();