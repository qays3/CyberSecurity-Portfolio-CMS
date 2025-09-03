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
    updatePageTitle();
    updateFavicons();
    updateProfileSection();
    updateSocialLinks();
    createNavigation();
    createAllSections();
    setupEventListeners();
    applyThemeStyles();
    
    window.dispatchEvent(new CustomEvent('portfolioLoaded', { detail: portfolioData }));
}

function updatePageTitle() {
    const userData = portfolioData.userData || {};
    const personal = userData.personal || {};
    
    if (personal.name) {
        document.title = `${personal.name} - Portfolio`;
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = `${personal.name} - Portfolio`;
        }
    }
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

function updateSocialLinks() {
    const userData = portfolioData.userData || {};
    const contact = userData.contact || {};
    const socialArray = contact.social || [];
    
    const socialLinks = document.querySelector('#socialLinks');
    if (socialLinks && socialArray.length > 0) {
        socialLinks.innerHTML = '';
        
        socialArray.forEach(social => {
            if (social.url && social.icon) {
                const linkElement = document.createElement('a');
                linkElement.href = social.url || '#';
                linkElement.target = '_blank';
                linkElement.className = 'social-link';
                linkElement.setAttribute('aria-label', social.name || 'Social Link');
                
                linkElement.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        ${social.icon || ''}
                    </svg>
                `;
                
                socialLinks.appendChild(linkElement);
            }
        });
    }
}

function createNavigation() {
    const userData = portfolioData.userData || {};
    const navList = document.getElementById('navList');
    
    if (!navList) return;
    
    const sections = [
        { id: 'about', name: 'About', condition: userData.about || (userData.personal && Object.keys(userData.personal).length > 0) },
        { id: 'services', name: 'Services', condition: userData.services && userData.services.length > 0 },
        { id: 'works', name: 'Works', condition: userData.projects && userData.projects.length > 0 },
        { id: 'resume', name: 'Resume', condition: userData.resume && userData.resume.length > 0 },
        { id: 'skills', name: 'Skills', condition: userData.skills && Object.keys(userData.skills).length > 0 },
        { id: 'testimonials', name: 'Testimonials', condition: true },
        { id: 'contact', name: 'Contact', condition: hasValidContact(userData.contact) }
    ];
    
    navList.innerHTML = '';
    
    sections.forEach((section, index) => {
        if (section.condition) {
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';
            
            const navLink = document.createElement('a');
            navLink.href = `#${section.id}`;
            navLink.className = index === 0 ? 'nav-link active' : 'nav-link';
            navLink.setAttribute('data-section', section.id);
            navLink.innerHTML = `<span>${section.name}</span>`;
            
            navItem.appendChild(navLink);
            navList.appendChild(navItem);
        }
    });
}

function hasValidContact(contact) {
    if (!contact) return false;
    
    const hasPhone = contact.phone && contact.phone.trim() !== '';
    const hasEmail = contact.email && contact.email.trim() !== '';
    const hasSocial = contact.social && contact.social.length > 0 && 
                     contact.social.some(social => social.url && social.url.trim() !== '');
    
    return hasPhone || hasEmail || hasSocial;
}

function createAllSections() {
    const contentWrapper = document.getElementById('contentWrapper');
    if (!contentWrapper) return;
    
    contentWrapper.innerHTML = '';
    
    const userData = portfolioData.userData || {};
    
    if (userData.about || (userData.personal && Object.keys(userData.personal).length > 0)) {
        contentWrapper.appendChild(createAboutSection());
    }
    
    if (userData.services && userData.services.length > 0) {
        contentWrapper.appendChild(createServicesSection());
    }
    
    if (userData.projects && userData.projects.length > 0) {
        contentWrapper.appendChild(createWorksSection());
    }
    
    if (userData.resume && userData.resume.length > 0) {
        contentWrapper.appendChild(createResumeSection());
    }
    
    if (userData.skills && Object.keys(userData.skills).length > 0) {
        contentWrapper.appendChild(createSkillsSection());
    }
    
    contentWrapper.appendChild(createTestimonialsSection());
    
    if (hasValidContact(userData.contact)) {
        contentWrapper.appendChild(createContactSection());
    }
}

function createAboutSection() {
    const userData = portfolioData.userData || {};
    const personal = userData.personal || {};
    
    const section = document.createElement('section');
    section.className = 'section about-section';
    section.id = 'about';
    
    section.innerHTML = `
        <div class="about-content">
            <div class="about-left">
                <div class="about-image-container">
                    <img alt="About Image" class="about-image" id="aboutImage" src="${personal.img || ''}">
                </div>
                <div class="about-actions">
                    <button class="action-btn like-btn" id="likeBtn" data-liked="false">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span>Like</span>
                    </button>
                    <button class="action-btn comment-btn" id="commentBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <path d="M13 8H7"/>
                            <path d="M17 12H7"/>
                        </svg>
                        Leave Comment
                    </button>
                    ${personal.cv ? `
                        <button class="action-btn cv-btn" id="cvBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            My CV
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="about-right">
                <h2 id="aboutTitle">About Me</h2>
                <div id="aboutContent">${userData.about || ''}</div>
            </div>
        </div>
        
        ${userData.achievements && Object.keys(userData.achievements).length > 0 ? `
            <div class="achievements-section">
                <h3>Achievements</h3>
                <div class="achievements-grid" id="achievementsGrid">
                    ${Object.keys(userData.achievements).map(key => `
                        <div class="achievement-box">
                            <div class="achievement-number">${userData.achievements[key] || '0'}</div>
                            <div class="achievement-label">${key}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    return section;
}

function createServicesSection() {
    const userData = portfolioData.userData || {};
    const services = userData.services || [];
    
    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'services';
    
    section.innerHTML = `
        <h2 id="servicesTitle">Services</h2>
        <div class="services-grid">
            ${services.map(service => `
                <div class="service-card">
                    <div class="service-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            ${service.icon || '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'}
                        </svg>
                    </div>
                    <h3>${service.title || 'Service'}</h3>
                    <p>${service.description || 'Service description'}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    return section;
}

function createWorksSection() {
    const userData = portfolioData.userData || {};
    const projects = userData.projects || [];
    
    const allCategories = ['All'];
    projects.forEach(project => {
        if (project.categories && Array.isArray(project.categories)) {
            project.categories.forEach(category => {
                if (!allCategories.includes(category)) {
                    allCategories.push(category);
                }
            });
        }
    });
    
    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'works';
    
    section.innerHTML = `
        <h2 id="worksTitle">My Works</h2>
        <div class="works-container">
            <div class="works-filter" id="worksFilter">
                ${allCategories.map(category => `
                    <button class="filter-btn ${category === 'All' ? 'active' : ''}" data-filter="${category}">${category}</button>
                `).join('')}
            </div>
            <div class="works-grid" id="worksGrid">
                ${projects.map(project => `
                    <div class="project-card" data-categories="${project.categories ? project.categories.join(' ') : ''}">
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
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    return section;
}

function createResumeSection() {
    const userData = portfolioData.userData || {};
    const resume = userData.resume || [];
    
    const allTypes = resume.map(item => item.type).filter((type, index, self) => self.indexOf(type) === index);
    
    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'resume';
    
    section.innerHTML = `
        <h2 id="resumeTitle">Resume</h2>
        <div class="resume-container">
            <div class="resume-filter" id="resumeFilter">
                ${allTypes.map((type, index) => `
                    <button class="resume-filter-btn ${index === 0 ? 'active' : ''}" data-filter="${type}">${type}</button>
                `).join('')}
            </div>
            <div class="resume-timeline" id="resumeTimeline">
                ${resume.map(item => `
                    <div class="resume-item" data-type="${item.type || 'Experience'}">
                        <div class="resume-marker"></div>
                        <div class="resume-content">
                            <div class="resume-header">
                                <div class="resume-header-left">
                                    <span class="resume-type ${(item.type || '').toLowerCase().replace(/\s+/g, '-')}">${item.type || 'Experience'}</span>
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
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    return section;
}

function createSkillsSection() {
    const userData = portfolioData.userData || {};
    const skills = userData.skills || {};
    
    const skillCategories = Object.keys(skills);
    
    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'skills';
    
    section.innerHTML = `
        <h2 id="skillsTitle">Skills</h2>
        <div class="skills-container">
            <div class="skills-filter" id="skillsFilter">
                ${skillCategories.map((category, index) => `
                    <button class="skills-filter-btn ${index === 0 ? 'active' : ''}" data-filter="${category}">${category}</button>
                `).join('')}
            </div>
            <div class="skills-grid" id="skillsGrid">
                ${skillCategories.map((category, index) => `
                    <div class="skills-category-grid" data-category="${category}" style="${index === 0 ? 'display: grid;' : 'display: none;'}">
                        ${Array.isArray(skills[category]) ? skills[category].map(skill => `
                            <div class="skill-card">${skill}</div>
                        `).join('') : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    return section;
}

function createTestimonialsSection() {
    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'testimonials';
    
    section.innerHTML = `
        <div class="testimonials-header">
            <h2 id="testimonialsTitle">What People Say</h2>
            <button class="testimonial-comment-btn" id="testimonialCommentBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <path d="M13 8H7"/>
                    <path d="M17 12H7"/>
                </svg>
                Leave Comment
            </button>
        </div>
        <div class="testimonials-container" id="testimonialsContainer">
            <div class="loading-message">Loading testimonials...</div>
        </div>
    `;
    
    return section;
}

function createContactSection() {
    const userData = portfolioData.userData || {};
    const contact = userData.contact || {};
    
    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'contact';
    
    section.innerHTML = `
        <h2 id="contactTitle">Contact</h2>
        <div class="contact-container">
            <div class="contact-grid">
                <div class="contact-info">
                    <h3>Get In Touch</h3>
                    <div class="contact-methods">
                        ${contact.phone ? `
                            <div class="contact-method" id="phoneContact">
                                <div class="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                </div>
                                <div class="contact-details">
                                    <div class="contact-label">Phone</div>
                                    <div class="contact-value" id="phoneValue">${contact.phone}</div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${contact.email ? `
                            <div class="contact-method" id="emailContact">
                                <div class="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </div>
                                <div class="contact-details">
                                    <div class="contact-label">Email</div>
                                    <div class="contact-value" id="emailValue">${contact.email}</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${contact.social && contact.social.length > 0 && contact.social.some(social => social.url) ? `
                    <div class="contact-social">
                        <h3>Connect With Me</h3>
                        <div class="contact-social-links" id="contactSocialLinks">
                            ${contact.social.map(social => {
                                if (social.url && social.icon) {
                                    return `
                                        <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="contact-social-link">
                                            <div class="contact-social-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    ${social.icon}
                                                </svg>
                                            </div>
                                            <div class="contact-social-name">${social.name || ''}</div>
                                        </a>
                                    `;
                                }
                                return '';
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="contact-cta">
                <h3>Let's Work Together</h3>
                <div class="contact-cta-buttons">
                    ${contact.phone ? `
                        <a href="tel:${contact.phone}" class="contact-cta-btn" id="callBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            Call Now
                        </a>
                    ` : ''}
                    ${contact.email ? `
                        <a href="mailto:${contact.email}" class="contact-cta-btn" id="emailBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            Send Email
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    return section;
}

function setupEventListeners() {
    setTimeout(() => {
        const likeBtn = document.getElementById('likeBtn');
        const cvBtn = document.getElementById('cvBtn');
        const commentBtn = document.getElementById('commentBtn');
        const testimonialCommentBtn = document.getElementById('testimonialCommentBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        
        if (likeBtn) {
            likeBtn.addEventListener('click', function() {
                if (window.handleLike) {
                    window.handleLike();
                }
            });
        }
        
        if (cvBtn) {
            cvBtn.addEventListener('click', function() {
                const userData = portfolioData?.userData || {};
                const personal = userData.personal || {};
                if (personal.cv) {
                    window.open(personal.cv, '_blank');
                }
            });
        }
        
        if (commentBtn) {
            commentBtn.addEventListener('click', function() {
                if (window.openModal) {
                    window.openModal();
                }
            });
        }
        
        if (testimonialCommentBtn) {
            testimonialCommentBtn.addEventListener('click', function() {
                if (window.openModal) {
                    window.openModal();
                }
            });
        }
        
        if (resumeBtn) {
            resumeBtn.addEventListener('click', function() {
                const userData = portfolioData?.userData || {};
                const personal = userData.personal || {};
                if (personal.cv) {
                    window.open(personal.cv, '_blank');
                }
            });
        }
        
        setupFilters();
        setupResumeEventListeners();
        setupNavigation();
        
        // Load testimonials after everything is set up
        setTimeout(() => {
            if (window.loadTestimonials) {
                window.loadTestimonials();
            }
        }, 500);
    }, 500);
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            window.dispatchEvent(new CustomEvent('scrollToSection', { detail: targetSection }));
            
            if (history.pushState) {
                history.pushState(null, null, window.location.pathname);
            }
        });
    });
}

function setupFilters() {
    const worksFilter = document.getElementById('worksFilter');
    const resumeFilter = document.getElementById('resumeFilter');
    const skillsFilter = document.getElementById('skillsFilter');

    if (worksFilter) {
        const filterButtons = worksFilter.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                const projectCards = document.querySelectorAll('.project-card');
                
                projectCards.forEach(card => {
                    if (filter === 'All') {
                        card.style.display = 'block';
                    } else {
                        const categories = card.getAttribute('data-categories') || '';
                        if (categories.includes(filter)) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });
    }

    if (resumeFilter) {
        const filterButtons = resumeFilter.querySelectorAll('.resume-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                const resumeItems = document.querySelectorAll('.resume-item');
                
                resumeItems.forEach(item => {
                    const type = item.getAttribute('data-type');
                    if (filter === 'All' || type === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    if (skillsFilter) {
        const filterButtons = skillsFilter.querySelectorAll('.skills-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                const skillsGrid = document.getElementById('skillsGrid');
                if (skillsGrid) {
                    const categoryGrids = skillsGrid.querySelectorAll('.skills-category-grid');
                    
                    categoryGrids.forEach(grid => {
                        const category = grid.getAttribute('data-category');
                        if (category === filter) {
                            grid.style.display = 'grid';
                            grid.classList.add('single-category');
                        } else {
                            grid.style.display = 'none';
                            grid.classList.remove('single-category');
                        }
                    });
                }
            });
        });
    }
}

function setupResumeEventListeners() {
    const resumeItems = document.querySelectorAll('.resume-item');
    resumeItems.forEach(item => {
        const openBtn = item.querySelector('.resume-open-btn');
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
        
        const resumeContent = item.querySelector('.resume-content');
        if (resumeContent) {
            resumeContent.addEventListener('click', function(e) {
                if (e.target.closest('.resume-open-btn')) {
                    return;
                }
                
                e.stopPropagation();
                e.preventDefault();
                item.classList.toggle('expanded');
            });
        }
    });
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