export class UIComponents {
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