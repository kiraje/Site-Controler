import FirebaseService from './firebase.js';
import { UIComponents } from './ui.js';
import { nameToId, showToast, copyToClipboard, generatePHPCode } from './utils.js';

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