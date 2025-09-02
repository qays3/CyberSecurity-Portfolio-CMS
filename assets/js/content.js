let portfolioData = {};
let isLoading = false;

async function loadPortfolioData() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const response = await fetch('/index.php?api=content', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        portfolioData = await response.json();
        console.log('Portfolio data loaded:', portfolioData);
        initializePortfolio();
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
    } finally {
        isLoading = false;
    }
}

function initializePortfolio() {
    updateFavicons();
    updateProfileSection();
    updateAboutSection();
    updateServicesSection();
    updateProjectsSection();
    updateContactSection();
    updateSkillsSection();
    updateResumeSection();
    updateAchievementsSection();
    updateSocialLinks();
    updateCVButtons();
    applyThemeStyles();
    
    window.dispatchEvent(new CustomEvent('portfolioLoaded', { detail: portfolioData }));
}

function updateFavicons() {
    const userData = portfolioData.userData || {};
    const personal = userData.personal || {};
    
    if (personal.logo) {
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
            existingFavicon.remove();
        }
        
        const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        if (existingAppleIcon) {
            existingAppleIcon.remove();
        }
        
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        favicon.href = personal.logo;
        document.head.appendChild(favicon);
        
        const appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        appleIcon.href = personal.logo;
        document.head.appendChild(appleIcon);
    }
}

function updateProfileSection() {
    const userData = portfolioData.userData || {};
    const personal = userData.personal || {};
    
    if (personal.name) {
        updateElement('#profileName', personal.name);
        updateElement('.profile-name', personal.name);
    }
    
    if (personal.title) {
        updateElement('#profileTitle', personal.title);
        updateElement('.profile-title', personal.title);
    }
    
    if (personal.logo) {
        updateImage('#profileLogo', personal.logo);
    }
}

function updateAboutSection() {
    const userData = portfolioData.userData || {};
    const personal = userData.personal || {};
    
    if (userData.about) {
        const aboutElement = document.querySelector('#aboutContent');
        if (aboutElement) {
            aboutElement.innerHTML = userData.about;
        }
    }
    
    if (personal.img) {
        updateImage('#aboutImage', personal.img);
    }
}

function updateServicesSection() {
    const userData = portfolioData.userData || {};
    const services = userData.services || [];
    
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid && services.length > 0) {
        servicesGrid.innerHTML = '';
        
        services.forEach(service => {
            const serviceCard = createServiceCard(service);
            servicesGrid.appendChild(serviceCard);
        });
    }
}

function createServiceCard(service) {
    const serviceDiv = document.createElement('div');
    serviceDiv.className = 'service-card';
    
    serviceDiv.innerHTML = `
        <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ${service.icon || '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'}
            </svg>
        </div>
        <h3>${service.title || 'Service'}</h3>
        <p>${service.description || 'Service description'}</p>
    `;
    
    return serviceDiv;
}

function updateProjectsSection() {
    const userData = portfolioData.userData || {};
    const projects = userData.projects || [];
    
    const worksGrid = document.querySelector('#worksGrid');
    if (worksGrid && projects.length > 0) {
        worksGrid.innerHTML = '';
        
        projects.forEach((project, index) => {
            const projectElement = createProjectElement(project, index);
            worksGrid.appendChild(projectElement);
        });
    }
}

function createProjectElement(project, index) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-card';
    
    if (project.categories && Array.isArray(project.categories)) {
        projectDiv.setAttribute('data-categories', project.categories.join(' '));
    }
    
    projectDiv.innerHTML = `
        <div class="project-header">
            <h3 class="project-name">${project.name || 'Untitled Project'}</h3>
            <div class="project-categories">
                ${project.categories ? project.categories.map(cat => 
                    `<span class="project-category">${cat}</span>`
                ).join('') : ''}
            </div>
        </div>
        <p class="project-description">${project.description || 'No description available'}</p>
        <div class="project-buttons">
            ${project.github ? `
                <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-btn github-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                    GitHub
                </a>
            ` : ''}
            ${project.live ? `
                <a href="${project.live}" target="_blank" rel="noopener noreferrer" class="project-btn live-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Live Demo
                </a>
            ` : ''}
        </div>
    `;
    
    return projectDiv;
}

function updateContactSection() {
    const userData = portfolioData.userData || {};
    const contact = userData.contact || {};
    
    if (contact.phone) {
        updateElement('#phoneValue', contact.phone);
        updateAttribute('#callBtn', 'href', `tel:${contact.phone}`);
    }
    
    if (contact.email) {
        updateElement('#emailValue', contact.email);
        updateAttribute('#emailBtn', 'href', `mailto:${contact.email}`);
    }
}

function updateSocialLinks() {
    const userData = portfolioData.userData || {};
    const contact = userData.contact || {};
    const socialArray = contact.social || [];
    
    const contactSocialLinks = document.querySelector('#contactSocialLinks');
    if (contactSocialLinks && socialArray.length > 0) {
        contactSocialLinks.innerHTML = '';
        
        socialArray.forEach(social => {
            const linkElement = document.createElement('a');
            linkElement.className = 'contact-social-link';
            linkElement.href = social.url || '#';
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            
            linkElement.innerHTML = `
                <div class="contact-social-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        ${social.icon || ''}
                    </svg>
                </div>
                <div class="contact-social-name">${social.name || ''}</div>
            `;
            
            contactSocialLinks.appendChild(linkElement);
        });
    }
}

function updateSkillsSection() {
    const userData = portfolioData.userData || {};
    const skills = userData.skills || {};
    
    const skillsGrid = document.querySelector('#skillsGrid');
    if (skillsGrid && Object.keys(skills).length > 0) {
        skillsGrid.innerHTML = '';
        
        Object.keys(skills).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'skills-category-grid';
            categoryDiv.setAttribute('data-category', category);
            categoryDiv.style.display = 'none';
            
            if (Array.isArray(skills[category])) {
                skills[category].forEach(skill => {
                    const skillCard = document.createElement('div');
                    skillCard.className = 'skill-card';
                    skillCard.textContent = skill;
                    categoryDiv.appendChild(skillCard);
                });
            }
            
            skillsGrid.appendChild(categoryDiv);
        });
        
        const firstCategory = skillsGrid.querySelector('.skills-category-grid');
        if (firstCategory) {
            firstCategory.style.display = 'grid';
            firstCategory.classList.add('single-category');
        }
    }
}

function updateResumeSection() {
    const userData = portfolioData.userData || {};
    const resume = userData.resume || [];
    
    const resumeTimeline = document.querySelector('#resumeTimeline');
    if (resumeTimeline && resume.length > 0) {
        resumeTimeline.innerHTML = '';
        
        resume.forEach((item, index) => {
            const resumeElement = createResumeElement(item, index);
            resumeTimeline.appendChild(resumeElement);
        });
    }
}

function createResumeElement(item, index) {
    const resumeDiv = document.createElement('div');
    resumeDiv.className = 'resume-item';
    
    if (item.type) {
        resumeDiv.setAttribute('data-type', item.type);
    }
    
    const typeClass = item.type ? item.type.toLowerCase().replace(/\s+/g, '-') : 'default';
    
    resumeDiv.innerHTML = `
        <div class="resume-marker"></div>
        <div class="resume-content">
            <div class="resume-header">
                <div class="resume-header-left">
                    <span class="resume-type ${typeClass}">${item.type || 'Experience'}</span>
                    ${item.link ? `
                        <button class="resume-open-btn" data-url="${item.link}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15,3 21,3 21,9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Open
                        </button>
                    ` : ''}
                </div>
                <div class="resume-date">${item.date || ''}</div>
            </div>
            <h4 class="resume-title">${item.title || 'Title'}</h4>
            <p class="resume-organization">${item.organization || ''}</p>
            <div class="resume-description">
                <p>${item.description || ''}</p>
            </div>
            ${item.details && Array.isArray(item.details) ? `
                <div class="resume-details">
                    <ul>
                        ${item.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
    const openBtn = resumeDiv.querySelector('.resume-open-btn');
    if (openBtn) {
        openBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const url = this.dataset.url;
            if (url) {
                window.open(url, '_blank');
            }
        });
    }
    
    const resumeContent = resumeDiv.querySelector('.resume-content');
    if (resumeContent) {
        resumeContent.addEventListener('click', function(e) {
            if (e.target.closest('.resume-open-btn')) {
                return;
            }
            
            e.stopPropagation();
            e.preventDefault();
            resumeDiv.classList.toggle('expanded');
        });
    }
    
    return resumeDiv;
}

function updateAchievementsSection() {
    const userData = portfolioData.userData || {};
    const achievements = userData.achievements || {};
    
    const achievementsGrid = document.querySelector('#achievementsGrid');
    if (achievementsGrid && Object.keys(achievements).length > 0) {
        achievementsGrid.innerHTML = '';
        
        Object.keys(achievements).forEach(key => {
            const achievementBox = document.createElement('div');
            achievementBox.className = 'achievement-box';
            
            achievementBox.innerHTML = `
                <div class="achievement-number">${achievements[key] || '0'}</div>
                <div class="achievement-label">${key}</div>
            `;
            
            achievementsGrid.appendChild(achievementBox);
        });
    }
}

function updateCVButtons() {
    const userData = portfolioData.userData || {};
    const personal = userData.personal || {};
    
    if (personal.cv) {
        const resumeBtn = document.querySelector('#resumeBtn');
        const cvBtn = document.querySelector('#cvBtn');
        
        if (resumeBtn) {
            resumeBtn.onclick = function() {
                window.open(personal.cv, '_blank');
            };
        }
        
        if (cvBtn) {
            cvBtn.onclick = function() {
                window.open(personal.cv, '_blank');
            };
        }
    }
}

function applyThemeStyles() {
    setTimeout(() => {
        const strongTags = document.querySelectorAll('#aboutContent strong');
        strongTags.forEach(strong => {
            strong.style.color = 'var(--dark-primary)';
            strong.style.fontWeight = '700';
            strong.style.background = 'linear-gradient(45deg, var(--dark-primary), var(--dark-accent))';
            strong.style.webkitBackgroundClip = 'text';
            strong.style.backgroundClip = 'text';
            strong.style.webkitTextFillColor = 'transparent';
        });
    }, 100);
}

function updateElement(selector, content) {
    if (!content) return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element) {
            element.textContent = content;
        }
    });
}

function updateImage(selector, src) {
    if (!src) return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element) {
            element.src = src;
            element.alt = src.split('/').pop().split('.')[0] || '';
        }
    });
}

function updateAttribute(selector, attribute, value) {
    if (!value) return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element) {
            element.setAttribute(attribute, value);
        }
    });
}

function refreshPortfolio() {
    loadPortfolioData();
}

function getPortfolioData() {
    return portfolioData;
}

function updatePortfolioData(newData) {
    portfolioData = { ...portfolioData, ...newData };
    initializePortfolio();
}

function startAutoRefresh(intervalMinutes = 5) {
    setInterval(() => {
        loadPortfolioData();
    }, intervalMinutes * 60 * 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPortfolioData);
} else {
    loadPortfolioData();
}

if (typeof window !== 'undefined') {
    window.portfolioData = portfolioData;
    window.refreshPortfolio = refreshPortfolio;
    window.getPortfolioData = getPortfolioData;
    window.updatePortfolioData = updatePortfolioData;
    window.loadPortfolioData = loadPortfolioData;
    window.startAutoRefresh = startAutoRefresh;
}