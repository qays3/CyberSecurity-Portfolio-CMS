let isFirstTime = false;

function openModal(modalType) {
    const modal = document.getElementById(modalType + 'Modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalType) {
    const modal = document.getElementById(modalType + 'Modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function authenticate() {
    const password = document.getElementById('authPassword').value;
    const errorDiv = document.getElementById('authError');
    
    if (!password) {
        showError(errorDiv, 'Password required');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', window.isFirstTime ? 'setup' : 'auth');
        formData.append('password', password);
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            location.reload();
        } else {
            showError(errorDiv, result.error || 'Authentication failed');
        }
    } catch (error) {
        showError(errorDiv, 'Connection error');
    }
}

async function logout() {
    openModal('logout');
}

async function confirmLogout() {
    try {
        const formData = new FormData();
        formData.append('action', 'logout');
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.location.href = result.redirect || '../';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '../';
    }
}

async function uploadCV() {
    const fileInput = document.getElementById('cvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessageModal('Error', 'Please select a CV file');
        return;
    }
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
        showMessageModal('Error', 'Please select a PDF, DOC, or DOCX file');
        return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessageModal('Error', 'File too large. Maximum size is 10MB');
        return;
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
        showMessageModal('Error', 'Invalid file name. Only letters, numbers, dots, underscores and hyphens are allowed');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'upload_cv');
        formData.append('file', file);
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessageModal('Success', `CV uploaded successfully: ${result.path}`);
            fileInput.value = '';
            closeModal('uploadCV');
        } else {
            showMessageModal('Error', result.error || 'CV upload failed');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function uploadProfile() {
    const fileInput = document.getElementById('profileFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessageModal('Error', 'Please select a profile image file');
        return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
        showMessageModal('Error', 'Please select a valid image file (JPG, PNG, GIF, WebP)');
        return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessageModal('Error', 'File too large. Maximum size is 5MB');
        return;
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
        showMessageModal('Error', 'Invalid file name. Only letters, numbers, dots, underscores and hyphens are allowed');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'upload_profile');
        formData.append('file', file);
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessageModal('Success', `Profile image uploaded successfully: ${result.path}`);
            fileInput.value = '';
            closeModal('uploadProfile');
        } else {
            showMessageModal('Error', result.error || 'Profile image upload failed');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function updateContent() {
    const contentData = document.getElementById('contentData').value;
    
    if (!contentData.trim()) {
        showMessageModal('Error', 'Content cannot be empty');
        return;
    }
    
    try {
        JSON.parse(contentData);
    } catch (e) {
        showMessageModal('Error', 'Invalid JSON format: ' + e.message);
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('data', contentData);
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessageModal('Success', 'Content updated successfully');
        } else {
            showMessageModal('Error', result.error || 'Update failed');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function loadBackupContent() {
    try {
        const formData = new FormData();
        formData.append('action', 'load_backup_json');
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('contentData').value = result.content;
            showMessageModal('Success', 'Backup content loaded successfully');
        } else {
            showMessageModal('Error', result.error || 'Failed to load backup');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function loadTemplateContent() {
    try {
        const formData = new FormData();
        formData.append('action', 'load_template_json');
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('contentData').value = result.content;
            showMessageModal('Success', 'Template content loaded successfully');
        } else {
            showMessageModal('Error', result.error || 'Failed to load template');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function loadCurrentColors() {
    try {
        const formData = new FormData();
        formData.append('action', 'load_current_colors');
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            createColorEditor(result.content);
        } else {
            showMessageModal('Error', result.error || 'Failed to load current colors');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

function convertToHex(color) {
    if (!color) return '#000000';
    
    color = color.trim();
    
    if (color.startsWith('#')) {
        return color.length === 7 ? color : color + '000000'.slice(color.length - 1);
    }
    
    if (color.startsWith('rgb')) {
        const values = color.match(/\d+/g);
        if (values && values.length >= 3) {
            const r = parseInt(values[0]).toString(16).padStart(2, '0');
            const g = parseInt(values[1]).toString(16).padStart(2, '0');
            const b = parseInt(values[2]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
    }
    
    const namedColors = {
        'white': '#ffffff',
        'black': '#000000',
        'red': '#ff0000',
        'green': '#008000',
        'blue': '#0000ff',
        'yellow': '#ffff00',
        'cyan': '#00ffff',
        'magenta': '#ff00ff',
        'transparent': '#000000'
    };
    
    return namedColors[color.toLowerCase()] || '#000000';
}

function createColorEditor(colorsText) {
    const colorEditor = document.getElementById('colorEditor');
    colorEditor.innerHTML = '';
    
    const lines = colorsText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        const [varName, value] = line.split(':').map(s => s.trim());
        if (varName && value) {
            const colorRow = document.createElement('div');
            colorRow.className = 'color-row';
            
            const cleanVarName = varName.replace('--', '');
            
            colorRow.innerHTML = `
                <span class="color-label">--${cleanVarName}:</span>
                <input type="text" class="color-input" data-var="${cleanVarName}" value="${value}" placeholder="${value}">
                <div class="color-preview" style="background-color: ${value}"></div>
            `;
            
            colorEditor.appendChild(colorRow);
            
            const input = colorRow.querySelector('.color-input');
            const preview = colorRow.querySelector('.color-preview');
            
            input.addEventListener('input', function() {
                const newValue = this.value.trim();
                if (newValue) {
                    preview.style.backgroundColor = newValue;
                }
            });
        }
    });
}

async function updateColors() {
    const colorInputs = document.querySelectorAll('.color-input');
    let colorsData = '';
    
    colorInputs.forEach(input => {
        const varName = input.dataset.var;
        const value = input.value.trim();
        if (varName && value) {
            colorsData += `--${varName}: ${value}\n`;
        }
    });
    
    if (!colorsData.trim()) {
        showMessageModal('Error', 'No color data to update');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'update_colors');
        formData.append('data', colorsData);
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessageModal('Success', 'Colors updated successfully. Press Ctrl + F5 to clear cache and see changes.');
        } else {
            showMessageModal('Error', result.error || 'Colors update failed');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function loadBackupColors() {
    try {
        const formData = new FormData();
        formData.append('action', 'load_backup_colors');
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            createColorEditor(result.content);
            showMessageModal('Success', 'Backup colors loaded successfully');
        } else {
            showMessageModal('Error', result.error || 'Failed to load backup colors');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function loadTemplateColors() {
    try {
        const formData = new FormData();
        formData.append('action', 'load_template_colors');
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            createColorEditor(result.content);
            showMessageModal('Success', 'Template colors loaded successfully');
        } else {
            showMessageModal('Error', result.error || 'Failed to load template colors');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function uploadLogo() {
    const fileInput = document.getElementById('logoFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessageModal('Error', 'Please select a logo file');
        return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
        showMessageModal('Error', 'Please select a valid image file (JPG, PNG, GIF, WebP, SVG)');
        return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessageModal('Error', 'File too large. Maximum size is 5MB');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'upload_logo');
        formData.append('file', file);
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessageModal('Success', `Logo uploaded successfully: ${result.path}`);
            fileInput.value = '';
            closeModal('upload');
        } else {
            showMessageModal('Error', result.error || 'Logo upload failed');
        }
    } catch (error) {
        showMessageModal('Error', 'Connection error');
    }
}

async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const resultDiv = document.getElementById('resetResult');
    
    if (!newPassword || !confirmPassword) {
        showResetResult('Please fill in both password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showResetResult('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showResetResult('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'reset_password');
        formData.append('new_password', newPassword);
        
        const response = await fetch('', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResetResult('Password updated successfully', 'success');
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            setTimeout(() => closeModal('resetPassword'), 2000);
        } else {
            showResetResult(result.error || 'Password reset failed', 'error');
        }
    } catch (error) {
        showResetResult('Connection error', 'error');
    }
}

function formatJSON() {
    const textarea = document.getElementById('contentData');
    if (textarea) {
        try {
            const json = JSON.parse(textarea.value);
            textarea.value = JSON.stringify(json, null, 2);
            showMessageModal('Success', 'JSON formatted successfully');
        } catch (e) {
            showMessageModal('Error', 'Invalid JSON format: ' + e.message);
        }
    }
}

function validateJSON() {
    const textarea = document.getElementById('contentData');
    if (textarea) {
        try {
            JSON.parse(textarea.value);
            showMessageModal('Success', 'JSON is valid');
        } catch (e) {
            showMessageModal('Error', 'Invalid JSON: ' + e.message);
        }
    }
}

function showMessageModal(title, message) {
    const modalTitle = document.getElementById('messageModalTitle');
    const modalContent = document.getElementById('messageModalContent');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.textContent = message;
    
    openModal('message');
}

function showError(element, message) {
    element.textContent = message;
    element.className = 'error';
    setTimeout(() => {
        element.textContent = '';
        element.className = '';
    }, 5000);
}

function showModalResult(message, type, modalType) {
    let resultDiv = document.querySelector(`#${modalType}Modal .result-message`);
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.className = 'result-message';
        const modalBody = document.querySelector(`#${modalType}Modal .modal-body`);
        if (modalBody) {
            modalBody.appendChild(resultDiv);
        }
    }
    
    resultDiv.className = `result-message ${type}`;
    resultDiv.textContent = message;
    
    setTimeout(() => {
        if (resultDiv.parentNode) {
            resultDiv.remove();
        }
    }, 5000);
}

function showUploadResult(message, type) {
    const resultDiv = document.getElementById('uploadResult');
    if (resultDiv) {
        resultDiv.className = type;
        resultDiv.textContent = message;
        
        setTimeout(() => {
            resultDiv.textContent = '';
            resultDiv.className = '';
        }, 5000);
    }
}

function showResetResult(message, type) {
    const resultDiv = document.getElementById('resetResult');
    if (resultDiv) {
        resultDiv.className = type;
        resultDiv.textContent = message;
        
        setTimeout(() => {
            resultDiv.textContent = '';
            resultDiv.className = '';
        }, 5000);
    }
}

window.goToPortfolio = function() {
    window.location.href = '../';
};

async function loadPortfolioIcon() {
    try {
        const response = await fetch('../?api=content');
        const data = await response.json();
        
        if (data.userData && data.userData.personal && data.userData.personal.logo) {
            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/png';
            favicon.href = '../' + data.userData.personal.logo;
            document.head.appendChild(favicon);
            
            const appleIcon = document.createElement('link');
            appleIcon.rel = 'apple-touch-icon';
            appleIcon.href = '../' + data.userData.personal.logo;
            document.head.appendChild(appleIcon);
        }
    } catch (error) {
        console.log('Could not load portfolio icon');
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal && activeModal.id !== 'authModal') {
            activeModal.classList.remove('active');
        }
    }
    
    if (e.key === 'Enter') {
        const authModal = document.getElementById('authModal');
        if (authModal && authModal.classList.contains('active')) {
            const authPassword = document.getElementById('authPassword');
            if (authPassword === document.activeElement) {
                authenticate();
            }
        }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal') && e.target.id !== 'authModal') {
        e.target.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (typeof isFirstTime !== 'undefined') {
        window.isFirstTime = isFirstTime;
    }
    
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardText = this.querySelector('h3').textContent.toLowerCase();
            if (cardText.includes('content')) {
                openModal('content');
            } else if (cardText.includes('upload logo')) {
                openModal('upload');
            } else if (cardText.includes('upload profile')) {
                openModal('uploadProfile');
            } else if (cardText.includes('upload cv')) {
                openModal('uploadCV');
            } else if (cardText.includes('colors')) {
                loadCurrentColors();
                openModal('colors');
            }
        });
    });
    
    loadPortfolioIcon();
});