setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');
  if (loadingScreen && mainContent) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'flex';
        mainContent.style.opacity = '0';
        setTimeout(() => {
            mainContent.style.transition = 'opacity 1s ease';
            mainContent.style.opacity = '1';
        }, 50);
        startSkillsCycling();
      }, 500);
  }
}, 3000);

let skills = ["PCB Design", "Altium Designer", "Verilog", "Python", "Embedded Systems", "Machine Learning"];

async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        
        if (data.profile) renderProfile(data.profile);
        if (data.projects.length) renderProjects(data.projects);
        if (data.experience.length) renderExperience(data.experience);
        if (data.skills.length) {
            skills = data.skills.map(s => s.name);
            renderSkills(data.skills);
        }
        if (data.certifications && data.certifications.length) renderCertifications(data.certifications);
        if (data.education.length) renderEducation(data.education);
    } catch (e) {
        console.log("Using local fallback data");
    }
}

function renderProfile(p) {
    const loadingName = document.querySelector('.loading-screen .name');
    if (loadingName) loadingName.textContent = p.name;

    const heroH1 = document.querySelector('.hero-text h1');
    if (heroH1) {
        const names = p.name.split(' ');
        heroH1.innerHTML = `<span>${names[0]}</span> ${names.slice(1).join(' ')}`;
    }
    
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) heroSub.textContent = p.subtitle;

    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge && p.hero_badge) heroBadge.innerHTML = `<span></span>${p.hero_badge}`;

    // Hydrate Image and CGPA
    const heroImg = document.getElementById('hero-image');
    if (heroImg && p.image_url) {
        heroImg.src = p.image_url;
    }
    const cgpaBadge = document.querySelector('.avatar-badge');
    if (cgpaBadge && p.cgpa) {
        cgpaBadge.textContent = `${p.cgpa} CGPA`;
    }

    const contacts = document.querySelectorAll('.hero-contact a, .hero-contact span');
    if (contacts.length >= 3) {
        contacts[0].textContent = p.email;
        contacts[0].href = `mailto:${p.email}`;
        contacts[1].textContent = p.phone;
        contacts[2].href = p.linkedin;
    }

    // About Section Stats (Image 1)
    const aboutText = document.querySelector('.about-main p');
    if (aboutText) aboutText.textContent = p.about_text;

    const stats = document.querySelectorAll('.stat-num');
    if (stats.length >= 2) {
        stats[0].textContent = p.project_count;
        stats[1].textContent = p.club_count;
    }

    const locationText = document.querySelector('.about-grid .card:nth-child(2) p');
    if (locationText) locationText.textContent = p.location;

    const languagesContainer = document.querySelector('.lang-pills');
    if (languagesContainer && p.languages) {
        languagesContainer.innerHTML = p.languages.split(',').map(l => `<span class="pill">${l.trim()}</span>`).join('');
    }

    const yearNum = document.querySelector('.about-grid .card:nth-child(3) .stat-num');
    if (yearNum) yearNum.textContent = p.current_year;
}

function renderProjects(projects) {
    const grid = document.querySelector('.projects-grid');
    grid.innerHTML = projects.map(p => `
        <div class="card proj-card">
            <div class="proj-tags">
                ${(p.tags || '').split(',').map(tag => `<span class="proj-tag">${tag.trim()}</span>`).join('')}
            </div>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            ${p.link ? `<a href="${p.link}" target="_blank" class="proj-link">GitHub</a>` : ''}
        </div>
    `).join('');
    initProjectDots();
}

function renderExperience(exp) {
    const timeline = document.querySelector('.timeline');
    timeline.innerHTML = exp.map(e => `
        <div class="tl-item reveal active">
            <div class="tl-date">${e.date}</div>
            <div class="tl-body">
                <div class="tl-dot"></div>
                <div class="tl-card">
                    <div class="tl-role">${e.role}</div>
                    <span class="tl-org">${e.organization}</span>
                    <div class="tl-desc">
                        <ul>${(e.description || '').split('\n').map(li => `<li>${li}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSkills(skillsData) {
    const coreContainer = document.querySelector('.bento-grid .card:nth-child(1) .skill-chips');
    const softContainer = document.querySelector('.bento-grid .card:nth-child(2) .skill-chips');
    
    if (coreContainer && softContainer) {
        coreContainer.innerHTML = skillsData.filter(s => s.category.toLowerCase().includes('core')).map(s => `<span class="chip">${s.name}</span>`).join('');
        softContainer.innerHTML = skillsData.filter(s => s.category.toLowerCase().includes('soft')).map(s => `<span class="chip soft">${s.name}</span>`).join('');
    }
}

function renderCertifications(certs) {
    const certContainer = document.querySelector('.bento-grid .card:nth-child(3)');
    if (certContainer) {
        certContainer.innerHTML = '<h3>Certifications</h3>' + certs.map(c => `
            <div class="edu-score-box" style="margin-bottom: 10px;">
                <span class="edu-score" style="font-size: 1.2rem;">${c.name}</span>
                <span class="edu-score-label">${c.status}</span>
                ${c.link ? `<a href="${c.link}" target="_blank" style="color:var(--accent-cyan); font-size: 0.8rem; margin-left: 10px;">Link ↗</a>` : ''}
            </div>
        `).join('');
    }
}

function renderEducation(edu) {
    const grid = document.querySelector('.edu-grid');
    grid.innerHTML = edu.map(e => `
        <div class="card edu-card reveal active">
            <span class="edu-inst">${e.institution}</span>
            <h3 class="edu-degree">${e.degree}</h3>
            <span class="edu-year">${e.year}</span>
            <div class="edu-score-box">
                <span class="edu-score">${e.score}</span>
                <span class="edu-score-label">${e.score_label}</span>
            </div>
        </div>
    `).join('');
}

let skillsInterval;

function startSkillsCycling() {
  const skillDisplay = document.getElementById('skill-display');
  let currentIndex = 0;
  
  if (skills.length > 0) {
    skillDisplay.textContent = skills[currentIndex];
    skillDisplay.style.opacity = '1';
    
    skillsInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % skills.length;
      
      skillDisplay.style.opacity = '0';
      skillDisplay.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
          skillDisplay.textContent = skills[currentIndex];
          skillDisplay.style.opacity = '1';
          skillDisplay.style.transform = 'translateY(0)';
      }, 300); // Faster fade-in
      
    }, 1200); // Faster cycling
  }
}

let mobileMenuInitialized = false;
function initMobileMenu() {
    if (mobileMenuInitialized) return;
    mobileMenuInitialized = true;
    
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('#menu-toggle');
        const sideMenu = document.getElementById('premium-sidebar');
        const sideClose = e.target.closest('#ps-close-btn');
        const sideLink = e.target.closest('#premium-sidebar a');
        
        if (toggle && sideMenu) {
            sideMenu.classList.toggle('active');
            const toggleBtn = document.getElementById('menu-toggle');
            if(toggleBtn) toggleBtn.classList.toggle('active');
            
            if (sideMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            return;
        }
        
        if ((sideClose || sideLink) && sideMenu) {
            sideMenu.classList.remove('active');
            const toggleBtn = document.getElementById('menu-toggle');
            if(toggleBtn) toggleBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

const enterBtn = document.getElementById('enter-btn');
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      clearInterval(skillsInterval);
      const transitionOverlay = document.getElementById('page-transition');
      if(transitionOverlay) transitionOverlay.classList.add('active');
      
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 800);
    });
} else {
    // Directly initialize on subpages without intro
    initScrollReveal();
    initScrollProgress();
    initMobileMenu();
    initProjectDots();
    fetchData();
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => observer.observe(el));
}

function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const blobs = document.querySelectorAll('.prism-blob');

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (progressBar) progressBar.style.width = scrolled + "%";

        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 0.2;
            blob.style.top = (index * 20) + (winScroll * speed * -1) + "px";
        });

        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 200)) current = section.getAttribute('id');
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) link.classList.add('active');
        });
    });
}

document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    const blobs = document.querySelectorAll('.prism-blob');
    blobs.forEach((blob, index) => {
        const speed = (index + 1) * 30;
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;
        blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});

function initProjectDots() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    const dotsContainer = document.getElementById('project-dots');
    const cards = grid.querySelectorAll('.proj-card');
    
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            grid.scrollTo({
                left: cards[i].offsetLeft - grid.offsetLeft,
                behavior: 'smooth'
            });
        });
        dotsContainer.appendChild(dot);
    });

    grid.addEventListener('scroll', () => {
        const scrollPos = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth + 30; // 30 is the gap
        const index = Math.round(scrollPos / cardWidth);
        
        dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    });
}

const style = document.createElement('style');
style.textContent = `#main-content, #skill-display { transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1); }`;
document.head.appendChild(style);
