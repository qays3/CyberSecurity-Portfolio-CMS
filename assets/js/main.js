function loadTestimonials() {
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=get_comments'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayTestimonials(data.comments);
        }
    })
    .catch(error => console.error('Error loading testimonials:', error));
}

function displayTestimonials(comments) {
    const testimonialsContainer = document.getElementById('testimonialsContainer');
    if (!testimonialsContainer) return;
    
    if (comments.length === 0) {
        testimonialsContainer.innerHTML = '<div class="no-testimonials">No testimonials yet. Be the first to share your thoughts!</div>';
        return;
    }
    
    const testimonialsHTML = `
        <div class="auto-play-toggle" id="autoPlayToggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="5,3 19,12 5,21"/>
            </svg>
            Auto
        </div>
        <div class="testimonials-slider" id="testimonialsSlider">
            ${comments.map(comment => {
                const stars = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);
                const firstLetter = comment.name.charAt(0).toUpperCase();
                const formattedDate = formatDate(comment.timestamp);
                
                return `
                    <div class="testimonial-card">
                        <div class="testimonial-rating">${stars}</div>
                        <div class="testimonial-message">"${comment.message}"</div>
                        <div class="testimonial-author">
                            <div class="author-avatar">${firstLetter}</div>
                            <div class="author-info">
                                <div class="author-name">${comment.name}</div>
                                <div class="author-date">${formattedDate}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="slider-controls">
            <div class="slider-navigation">
                <button class="slider-btn" id="prevBtn" type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="slider-indicators" id="sliderIndicators"></div>
                <button class="slider-btn" id="nextBtn" type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <div class="slider-info">
                <span id="currentSlide">1</span> / <span id="totalSlides">${comments.length}</span>
            </div>
        </div>
    `;
    
    testimonialsContainer.innerHTML = testimonialsHTML;
    initializeSlider();
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    return Math.floor(diff / 86400000) + ' days ago';
}

window.loadTestimonials = loadTestimonials;

window.handleLike = function() {
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn && likeBtn.getAttribute('data-liked') === 'true') {
        return;
    }

    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=like'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && likeBtn) {
            likeBtn.setAttribute('data-liked', 'true');
            likeBtn.classList.add('liked');
            const svg = likeBtn.querySelector('svg');
            const span = likeBtn.querySelector('span');
            if (svg) svg.setAttribute('fill', 'currentColor');
            if (span) span.textContent = 'Liked';
            
            const likeCount = document.getElementById('likeCount');
            if (likeCount) likeCount.textContent = data.likes;
            
            showHeartAnimation();
        }
    })
    .catch(error => console.error('Error liking:', error));
};

window.openModal = function() {
    const commentModal = document.getElementById('commentModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    if (commentModal && modalBackdrop) {
        commentModal.classList.add('active');
        modalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

let currentSlideIndex = 0;
let totalSlides = 0;
let autoPlayInterval = null;
let isAutoPlaying = false;

function initializeSlider() {
    const slider = document.getElementById('testimonialsSlider');
    if (!slider) return;
    
    totalSlides = slider.children.length;
    currentSlideIndex = 0;
    
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    
    const sliderIndicators = document.getElementById('sliderIndicators');
    if (sliderIndicators) {
        sliderIndicators.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            sliderIndicators.appendChild(dot);
        }
    }
    
    function updateSlider() {
        const translateX = -currentSlideIndex * 100;
        slider.style.transform = `translateX(${translateX}%)`;
        
        const indicators = document.querySelectorAll('.slider-dot');
        indicators.forEach((dot, index) => {
            if (index === currentSlideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        const currentSlideSpan = document.getElementById('currentSlide');
        if (currentSlideSpan) {
            currentSlideSpan.textContent = currentSlideIndex + 1;
        }
    }
    
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        updateSlider();
    }
    
    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    }
    
    function goToSlide(index) {
        currentSlideIndex = index;
        updateSlider();
    }
    
    function startAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
        isAutoPlaying = true;
        autoPlayInterval = setInterval(nextSlide, 4000);
        const autoPlayToggle = document.getElementById('autoPlayToggle');
        if (autoPlayToggle) {
            autoPlayToggle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
                Auto
            `;
            autoPlayToggle.classList.add('active');
        }
    }
    
    function stopAutoPlay() {
        isAutoPlaying = false;
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        const autoPlayToggle = document.getElementById('autoPlayToggle');
        if (autoPlayToggle) {
            autoPlayToggle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                </svg>
                Auto
            `;
            autoPlayToggle.classList.remove('active');
        }
    }
    
    function toggleAutoPlay() {
        if (isAutoPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    }
    
    setTimeout(() => {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const autoPlayToggle = document.getElementById('autoPlayToggle');
        const indicators = document.querySelectorAll('.slider-dot');
        
        if (prevBtn) {
            prevBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                stopAutoPlay();
                prevSlide();
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                stopAutoPlay();
                nextSlide();
            };
        }
        
        if (autoPlayToggle) {
            autoPlayToggle.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleAutoPlay();
            };
        }
        
        indicators.forEach((dot, index) => {
            dot.onclick = function() {
                stopAutoPlay();
                goToSlide(index);
            };
        });
        
        let startX = 0;
        let isDragging = false;
        
        slider.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
            stopAutoPlay();
        });
        
        slider.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            isDragging = false;
            
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        });
        
        slider.addEventListener('mousedown', function(e) {
            startX = e.clientX;
            isDragging = true;
            stopAutoPlay();
            e.preventDefault();
        });
        
        slider.addEventListener('mouseup', function(e) {
            if (!isDragging) return;
            isDragging = false;
            
            const endX = e.clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        });
        
        slider.addEventListener('mouseleave', function() {
            isDragging = false;
        });
        
        const testimonialsContainer = document.getElementById('testimonialsContainer');
        if (testimonialsContainer) {
            testimonialsContainer.addEventListener('mouseenter', function() {
                if (isAutoPlaying && autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    autoPlayInterval = null;
                }
            });
            
            testimonialsContainer.addEventListener('mouseleave', function() {
                if (isAutoPlaying && !autoPlayInterval) {
                    autoPlayInterval = setInterval(nextSlide, 4000);
                }
            });
        }
        
    }, 100);
    
    updateSlider();
    
    if (totalSlides > 1) {
        setTimeout(startAutoPlay, 1000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
    const mainContent = document.getElementById('mainContent');
    const commentModal = document.getElementById('commentModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const commentForm = document.getElementById('commentForm');
    const starRating = document.getElementById('starRating');

    let sidebarOpen = window.innerWidth > 768;
    let selectedRating = 0;

    function updateSidebarTogglePosition() {
        if (sidebarToggle) {
            const menuIcon = sidebarToggle.querySelector('.menu-icon');
            if (sidebarOpen && window.innerWidth > 768) {
                sidebarToggle.style.left = '296px';
                if (menuIcon) menuIcon.style.transform = 'rotate(0deg)';
            } else {
                sidebarToggle.style.left = '2rem';
                if (menuIcon) menuIcon.style.transform = 'rotate(180deg)';
            }
        }
    }

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
        
        if (sidebarOpen) {
            sidebar.classList.remove('closed');
            mainContent.classList.remove('sidebar-closed');
            if (window.innerWidth <= 768) {
                sidebar.classList.add('open');
            }
        } else {
            sidebar.classList.add('closed');
            mainContent.classList.add('sidebar-closed');
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        }
        
        updateSidebarTogglePosition();
    }

    function updateActiveSection() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let currentSection = '';
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollTop >= sectionTop - 160 && scrollTop < sectionTop + sectionHeight - 160) {
                currentSection = sectionId;
            }
        });
        
        if (currentSection) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === currentSection) {
                    link.classList.add('active');
                }
            });
        }
    }

    function scrollToSection(targetSection) {
        const target = document.getElementById(targetSection);
        if (target) {
            const targetPosition = target.offsetTop - 80;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === targetSection) {
                    link.classList.add('active');
                }
            });
        }
        
        if (window.innerWidth <= 768 && sidebarOpen) {
            toggleSidebar();
        }
    }

    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebarOpen = false;
            sidebar.classList.add('closed');
            sidebar.classList.remove('open');
            mainContent.classList.add('sidebar-closed');
        } else {
            if (sidebarOpen) {
                sidebar.classList.remove('closed', 'open');
                mainContent.classList.remove('sidebar-closed');
            } else {
                sidebar.classList.add('closed');
                mainContent.classList.add('sidebar-closed');
            }
        }
        updateSidebarTogglePosition();
    }

    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = this.getAttribute('data-section');
                scrollToSection(targetSection);
                
                if (history.pushState) {
                    history.pushState(null, null, window.location.pathname);
                }
            });
        });
    }

    function setupEventListeners() {
        setTimeout(() => {
            const likeBtn = document.getElementById('likeBtn');
            const cvBtn = document.getElementById('cvBtn');
            const commentBtn = document.getElementById('commentBtn');
            const testimonialCommentBtn = document.getElementById('testimonialCommentBtn');
            const resumeBtn = document.getElementById('resumeBtn');
            
            if (likeBtn) {
                likeBtn.addEventListener('click', window.handleLike);
            }
            
            if (cvBtn) {
                cvBtn.addEventListener('click', function() {
                    const userData = window.portfolioData?.userData || {};
                    const personal = userData.personal || {};
                    if (personal.cv) {
                        window.open(personal.cv, '_blank');
                    }
                });
            }
            
            if (commentBtn) {
                commentBtn.addEventListener('click', window.openModal);
            }
            
            if (testimonialCommentBtn) {
                testimonialCommentBtn.addEventListener('click', window.openModal);
            }
            
            if (resumeBtn) {
                resumeBtn.addEventListener('click', function() {
                    const userData = window.portfolioData?.userData || {};
                    const personal = userData.personal || {};
                    if (personal.cv) {
                        window.open(personal.cv, '_blank');
                    }
                });
            }
            
            setupFilters();
            setupResumeEventListeners();
        }, 500);
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

    function updateStats() {
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=get_stats'
        })
        .then(response => response.json())
        .then(data => {
            const visitorCount = document.getElementById('visitorCount');
            const likeCount = document.getElementById('likeCount');
            const likeBtn = document.getElementById('likeBtn');
            
            if (visitorCount) visitorCount.textContent = data.visitors;
            if (likeCount) likeCount.textContent = data.likes;
            
            if (likeBtn && data.has_liked) {
                likeBtn.setAttribute('data-liked', 'true');
                likeBtn.classList.add('liked');
                const svg = likeBtn.querySelector('svg');
                const span = likeBtn.querySelector('span');
                if (svg) svg.setAttribute('fill', 'currentColor');
                if (span) span.textContent = 'Liked';
            }
        })
        .catch(error => console.error('Error updating stats:', error));
    }

    function showHeartAnimation() {
        const heart = document.createElement('div');
        heart.className = 'cyber-heart';
        heart.innerHTML = '❤️';
        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (document.body.contains(heart)) {
                document.body.removeChild(heart);
            }
        }, 2000);
    }

    function closeModal() {
        if (commentModal && modalBackdrop) {
            commentModal.classList.remove('active');
            modalBackdrop.classList.remove('active');
            document.body.style.overflow = '';
            
            if (commentForm) {
                commentForm.reset();
            }
            selectedRating = 0;
            updateStarDisplay();
        }
    }

    function setupModalSystem() {
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', closeModal);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && commentModal && commentModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function setupStarRating() {
        if (starRating) {
            const stars = starRating.querySelectorAll('.star');
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    selectedRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay();
                });
                
                star.addEventListener('mouseenter', function() {
                    const hoverRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay(hoverRating);
                });
            });
            
            starRating.addEventListener('mouseleave', function() {
                updateStarDisplay();
            });
        }
    }

    function updateStarDisplay(hoverRating) {
        if (!starRating) return;
        
        const stars = starRating.querySelectorAll('.star');
        const rating = hoverRating || selectedRating;
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function handleCommentSubmit(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('commentName');
        const messageInput = document.getElementById('commentMessage');
        
        if (!nameInput || !messageInput) return;
        
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!message || selectedRating === 0) {
            showNotification('Please add a message and select a rating', 'error');
            return;
        }
        
        const submitBtn = commentForm.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';
        }
        
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=add_comment&name=' + encodeURIComponent(name) + '&message=' + encodeURIComponent(message) + '&rating=' + selectedRating
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Thank you for your comment!', 'success');
                closeModal();
                loadTestimonials();
            } else {
                showNotification('Error submitting comment', 'error');
            }
        })
        .catch(error => {
            console.error('Error submitting comment:', error);
            showNotification('Error submitting comment', 'error');
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>Submit Comment';
            }
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.textContent = message;
        notification.style.top = '6rem';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function initializeAll() {
        updateStats();
        setInterval(updateStats, 30000);
        setupModalSystem();
        setupStarRating();
        handleResize();
        updateActiveSection();
        updateSidebarTogglePosition();
        
        setTimeout(() => {
            setupNavigation();
            setupEventListeners();
            
            const resumeFilterButtons = document.querySelectorAll('.resume-filter-btn');
            const workExperienceBtn = Array.from(resumeFilterButtons).find(btn => 
                btn.getAttribute('data-filter') === 'Work EXPERIENCE'
            );
            
            if (workExperienceBtn) {
                resumeFilterButtons.forEach(b => b.classList.remove('active'));
                workExperienceBtn.classList.add('active');
                workExperienceBtn.click();
            }
        }, 1000);
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (sidebarToggleMobile) {
        sidebarToggleMobile.addEventListener('click', toggleSidebar);
    }

    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }

    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('resize', handleResize);

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            sidebarOpen && 
            !sidebar.contains(e.target) && 
            (!sidebarToggle || !sidebarToggle.contains(e.target)) &&
            (!sidebarToggleMobile || !sidebarToggleMobile.contains(e.target))) {
            toggleSidebar();
        }
    });

    window.addEventListener('portfolioLoaded', function() {
        setTimeout(() => {
            initializeAll();
            loadTestimonials();
        }, 100);
    });

    initializeAll();
    
    setTimeout(() => {
        loadTestimonials();
    }, 1000);
});