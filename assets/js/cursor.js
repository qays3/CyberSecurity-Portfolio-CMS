document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.createElement('div');
    cursor.className = 'cyber-cursor';
    document.body.appendChild(cursor);
    
    let isModalOpen = false;
    
    function updateCursor(e) {
        cursor.style.left = e.clientX - 4 + 'px';
        cursor.style.top = e.clientY - 4 + 'px';
    }
    
    function handleHoverEffects() {
        const hoverElements = document.querySelectorAll('a, button, .nav-link, .social-link, .action-btn, .stat-item, .resume-btn, .sidebar-toggle, .modal-close, .btn-cancel, .btn-submit, .star, input, textarea, .filter-btn, .resume-filter-btn, .skills-filter-btn, .project-btn, .contact-cta-btn, .dashboard-card, .modal-btn, .logout-btn, .slider-btn, .auto-play-toggle, .testimonial-comment-btn, .skill-card, .service-card, .project-card, .resume-item, .contact-method, .contact-social-link');
        
        hoverElements.forEach(element => {
            if (!element.hasAttribute('data-cursor-listener')) {
                element.setAttribute('data-cursor-listener', 'true');
                
                element.addEventListener('mouseenter', () => {
                    cursor.classList.add('hover');
                });
                
                element.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hover');
                });
            }
        });
    }
    
    function updateCursorZIndex() {
        const modal = document.querySelector('.modal.active');
        const newModalState = modal && modal.classList.contains('active');
        
        if (newModalState !== isModalOpen) {
            isModalOpen = newModalState;
            cursor.style.zIndex = isModalOpen ? '10004' : '10000';
        }
    }
    
    document.addEventListener('mousemove', updateCursor);
    
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
    
    handleHoverEffects();
    
    const observer = new MutationObserver((mutations) => {
        let shouldUpdateHover = false;
        let shouldUpdateZIndex = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                shouldUpdateHover = true;
            } else if (mutation.type === 'attributes' && 
                       mutation.attributeName === 'class' &&
                       mutation.target.classList.contains('modal')) {
                shouldUpdateZIndex = true;
            }
        });
        
        if (shouldUpdateHover) {
            handleHoverEffects();
        }
        if (shouldUpdateZIndex) {
            updateCursorZIndex();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: false
    });
    
    updateCursorZIndex();
});