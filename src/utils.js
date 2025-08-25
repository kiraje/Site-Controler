export function nameToId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function showToast(message, type = 'success') {
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

export async function copyToClipboard(text) {
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

export function generatePHPCode(siteId, siteName) {
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