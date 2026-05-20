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
        if (data.projects && data.projects.length) {
            window.cachedProjects = data.projects;
            renderProjects(data.projects);
        }
        if (data.experience.length) renderExperience(data.experience);
        if (data.skills.length) {
            skills = data.skills.map(s => s.name);
            renderSkills(data.skills);
        }
        if (data.certifications && data.certifications.length) renderCertifications(data.certifications);
        if (data.education.length) renderEducation(data.education);
        if (data.achievements) {
            window.cachedAchievements = data.achievements;
            renderAchievements(data.achievements);
        }
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
    // 1. Render on Home page (showcased projects in .projects-grid)
    const homeGrid = document.querySelector('.projects-grid');
    if (homeGrid) {
        const homeProjects = projects.filter(p => p.show_on_home === true || p.show_on_home === 'true' || p.show_on_home === 1);
        if (homeProjects.length === 0) {
            homeGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px 0; width: 100%;">
                    No showcased projects.
                </div>
            `;
        } else {
            homeGrid.innerHTML = homeProjects.map((p) => {
                const imagesGrid = renderProjectImagesGrid(p.image_urls, p.id, 'home');
                return `
                    <div class="card proj-card reveal active" onclick="openProjectDetailsById(${p.id})" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            ${imagesGrid}
                            <div class="proj-tags" style="margin-top: 10px;">
                                ${(p.tags || '').split(',').map(tag => tag.trim() ? `<span class="proj-tag">${tag.trim()}</span>` : '').join('')}
                            </div>
                            <h3>${p.title}</h3>
                            <p>${p.description ? p.description.substring(0, 120) + (p.description.length > 120 ? '...' : '') : ''}</p>
                        </div>
                        ${p.link ? `<a href="${p.link}" target="_blank" class="proj-link" style="align-self: flex-start; margin-top: 10px;" onclick="event.stopPropagation();">GitHub ↗</a>` : ''}
                    </div>
                `;
            }).join('');
        }
        initProjectDots();
    }

    // 2. Render on Projects page (all projects)
    const listContainer = document.getElementById('dynamic-projects-list');
    if (listContainer) {
        if (projects.length === 0) {
            listContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px 0; width: 100%;">No projects available.</div>`;
        } else {
            listContainer.innerHTML = projects.map((p) => {
                const imagesGrid = renderProjectImagesGrid(p.image_urls, p.id, 'all');
                return `
                    <div class="card proj-card reveal active" onclick="openProjectDetailsById(${p.id})" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; max-width: 500px; width: 100%;">
                        <div>
                            ${imagesGrid}
                            <div class="proj-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <div class="proj-tags">
                                    ${(p.tags || '').split(',').map(tag => tag.trim() ? `<span class="proj-tag">${tag.trim()}</span>` : '').join('')}
                                </div>
                                <span class="proj-date" style="font-size:0.85rem; color:var(--text-secondary); font-family:'Space Grotesk', sans-serif;">${p.date || ''}</span>
                            </div>
                            <h3 style="font-size: 1.4rem; margin-bottom: 12px; color: white;">${p.title}</h3>
                            <p style="color: rgba(255,255,255,0.7); font-size: 0.95rem; line-height: 1.5; margin-bottom: 15px;">${p.description}</p>
                        </div>
                        ${p.link ? `<a href="${p.link}" target="_blank" class="proj-link" style="align-self: flex-start; margin-top: 10px;" onclick="event.stopPropagation();">GitHub ↗</a>` : ''}
                    </div>
                `;
            }).join('');
        }
    }
}

function renderProjectImagesGrid(imageUrls, projectId, source) {
    let urls = [];
    try {
        urls = JSON.parse(imageUrls || '[]');
    } catch(e) {
        if (imageUrls) urls = [imageUrls];
    }
    if (urls.length === 0) return '';

    if (urls.length === 1) {
        return `
            <div class="project-media-grid single">
                <img src="${urls[0]}" class="project-grid-img main" onclick="openLightbox(event, ${projectId}, '${source}', 0)">
            </div>
        `;
    }

    if (urls.length === 2) {
        return `
            <div class="project-media-grid grid-2">
                <img src="${urls[0]}" onclick="openLightbox(event, ${projectId}, '${source}', 0)">
                <img src="${urls[1]}" onclick="openLightbox(event, ${projectId}, '${source}', 1)">
            </div>
        `;
    }

    if (urls.length === 3) {
        return `
            <div class="project-media-grid grid-3">
                <div class="main-cell"><img src="${urls[0]}" onclick="openLightbox(event, ${projectId}, '${source}', 0)"></div>
                <div class="side-cell"><img src="${urls[1]}" onclick="openLightbox(event, ${projectId}, '${source}', 1)"></div>
                <div class="side-cell"><img src="${urls[2]}" onclick="openLightbox(event, ${projectId}, '${source}', 2)"></div>
            </div>
        `;
    }

    // 4 or more images: 2x2 grid with +N overlay on 4th cell
    const extraCount = urls.length - 4;
    return `
        <div class="project-media-grid grid-4">
            ${[0,1,2,3].map(i => `
                <div class="grid-cell">
                    <img src="${urls[i]}" onclick="openLightbox(event, ${projectId}, '${source}', ${i})">
                    ${i === 3 && extraCount > 0 ? `
                        <div onclick="event.stopPropagation(); openProjectDetailsById(${projectId})" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem;cursor:pointer;">+${extraCount}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

window.openProjectDetailsById = function(projectId) {
    const projects = window.cachedProjects || [];
    const project = projects.find(p => p.id === projectId);
    if (project) {
        openProjectDetails(project);
    }
};

window.openProjectDetails = function(project) {
    let urls = [];
    try {
        urls = JSON.parse(project.image_urls || '[]');
    } catch(e) {
        if (project.image_urls) urls = [project.image_urls];
    }
    
    const modal = document.createElement('div');
    modal.id = 'project-details-modal';
    modal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div class="project-modal-content" style="
            background: rgba(20, 20, 25, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 35px;
            position: relative;
            box-shadow: 0 25px 60px rgba(0,0,0,0.6);
        ">
            <button onclick="closeProjectDetails()" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.6);
                font-size: 32px;
                cursor: pointer;
                transition: color 0.2s;
            " onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.6)'">&times;</button>
            
            <span style="color: var(--accent-cyan); font-size: 0.8rem; font-family:'Space Grotesk', sans-serif; letter-spacing: 2px; text-transform: uppercase;">${project.date || ''}</span>
            <h2 style="font-size: 1.8rem; font-weight: 700; color: white; margin: 8px 0 20px 0; line-height: 1.3;">${project.title}</h2>
            
            ${urls.length > 0 ? `
                <div class="project-modal-images" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; margin-bottom: 25px;">
                    ${urls.map((url, uIdx) => `
                        <img src="${url}" style="width:100%; height:100px; object-fit:cover; border-radius:8px; cursor:pointer; border:1px solid rgba(255,255,255,0.06); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'" onclick="openLightbox(event, ${project.id}, 'all', ${uIdx})">
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="font-size: 1.1rem; color: rgba(255,255,255,0.75); line-height: 1.6; margin-bottom: 25px; white-space: pre-wrap;">
                ${project.description}
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                    ${(project.tags || '').split(',').map(tag => tag.trim() ? `<span class="tag" style="background:rgba(255,255,255,0.04); color:white; padding:4px 10px; border-radius:30px; font-size:0.8rem; border:1px solid rgba(255,255,255,0.05);">${tag}</span>` : '').join('')}
                </div>
                ${project.link ? `<a href="${project.link}" target="_blank" class="btn-primary" style="padding: 10px 20px; font-size:0.9rem; text-decoration:none; display:inline-block; border-radius:8px;">Visit Project ↗</a>` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.closeProjectDetails = function() {
    const m = document.getElementById('project-details-modal');
    if (m) m.remove();
};

window.openLightbox = function(e, projectId, source, imageIdx) {
    if (e) e.stopPropagation();
    
    const projects = window.cachedProjects || [];
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    let urls = [];
    try {
        urls = JSON.parse(project.image_urls || '[]');
    } catch(err) {
        if (project.image_urls) urls = [project.image_urls];
    }
    if (urls.length === 0) return;
    
    let currentIndex = imageIdx;
    
    const lb = document.createElement('div');
    lb.id = 'image-lightbox';
    lb.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 11000;
    `;
    
    lb.onclick = (event) => {
        if (event.target.id === 'image-lightbox' || event.target.classList.contains('lightbox-close')) {
            cleanup();
        }
    };
    
    const renderContent = () => {
        lb.innerHTML = `
            <button class="lightbox-close" style="position:absolute; top:20px; right:20px; background:none; border:none; color:rgba(255,255,255,0.7); font-size:45px; cursor:pointer; z-index:12000; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">&times;</button>
            
            ${urls.length > 1 ? `
                <button id="lightbox-prev" style="position: absolute; left: 30px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 50px; height: 50px; color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 12000; font-family: sans-serif;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">&#10094;</button>
                <button id="lightbox-next" style="position: absolute; right: 30px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 50px; height: 50px; color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 12000; font-family: sans-serif;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">&#10095;</button>
            ` : ''}
            
            <div style="max-width: 85%; max-height: 85%; display: flex; flex-direction: column; align-items: center; gap: 15px; position: relative;">
                <img id="lightbox-img" src="${urls[currentIndex]}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 45px rgba(0,0,0,0.85); transition: opacity 0.15s ease-in-out;">
                <div style="color: rgba(255,255,255,0.5); font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; letter-spacing: 1px;">
                    ${currentIndex + 1} / ${urls.length}
                </div>
            </div>
        `;
        
        if (urls.length > 1) {
            const prevBtn = lb.querySelector('#lightbox-prev');
            const nextBtn = lb.querySelector('#lightbox-next');
            if (prevBtn) {
                prevBtn.onclick = (evt) => {
                    evt.stopPropagation();
                    navigate(-1);
                };
            }
            if (nextBtn) {
                nextBtn.onclick = (evt) => {
                    evt.stopPropagation();
                    navigate(1);
                };
            }
        }
    };
    
    const navigate = (direction) => {
        currentIndex = (currentIndex + direction + urls.length) % urls.length;
        const img = document.getElementById('lightbox-img');
        if (img) {
            img.style.opacity = '0';
            setTimeout(() => {
                renderContent();
            }, 150);
        }
    };
    
    const handleKeydown = (event) => {
        if (event.key === 'ArrowLeft') {
            navigate(-1);
        } else if (event.key === 'ArrowRight') {
            navigate(1);
        } else if (event.key === 'Escape') {
            cleanup();
        }
    };
    
    const cleanup = () => {
        lb.remove();
        document.removeEventListener('keydown', handleKeydown);
    };
    
    document.addEventListener('keydown', handleKeydown);
    renderContent();
    document.body.appendChild(lb);
};

// Dynamic style injection for layout grids
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .project-media-grid {
            width: 100%;
            height: 220px;
            margin-bottom: 20px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.02);
        }
        .project-media-grid img {
            cursor: pointer;
            transition: transform 0.3s ease, filter 0.3s ease;
        }
        .project-media-grid img:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
        }
        .project-media-grid.single {
            background: #000;
        }
        .project-media-grid.single .main {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        .project-media-grid.grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            height: 100%;
        }
        .project-media-grid.grid-2 img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            border-radius: 6px;
        }
        .project-media-grid.grid-3 {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 6px;
            height: 100%;
        }
        .project-media-grid.grid-3 .main-cell {
            grid-row: span 2;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 6px;
        }
        .project-media-grid.grid-3 .main-cell img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .project-media-grid.grid-3 .side-cell {
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 6px;
        }
        .project-media-grid.grid-3 .side-cell img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .project-media-grid.grid-4 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 6px;
            height: 100%;
        }
        .project-media-grid.grid-4 .grid-cell {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            border-radius: 6px;
        }
        .project-media-grid.grid-4 .grid-cell img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    `;
    document.head.appendChild(style);
})();

function renderExperience(exp) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
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
    const certContainer = document.getElementById('home-certs-grid');
    if (certContainer) {
        const homeCerts = certs.filter(c => c.show_on_home === true || c.show_on_home === 'true' || c.show_on_home === 1);
        if (homeCerts.length === 0) {
            certContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px 0;">
                    No showcased certifications.
                </div>
            `;
            return;
        }
        certContainer.innerHTML = homeCerts.map(c => `
            <div class="card edu-card reveal active" style="display: flex; flex-direction: column; justify-content: space-between;">
                ${c.image_url ? `<img src="${c.image_url}" style="width: 100%; height: 160px; object-fit: contain; background: #000; border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.08);" alt="${c.name}">` : ''}
                <div style="flex-grow: 1;">
                    <span class="edu-inst">${c.status || 'Verification Available'}</span>
                    <h3 class="edu-degree" style="font-size: 1.2rem; margin: 8px 0;">${c.name}</h3>
                </div>
                ${c.link ? `<a href="${c.link}" target="_blank" class="proj-link" style="margin-top: 15px; display: inline-block;">Verify Credentials ↗</a>` : ''}
            </div>
        `).join('');
    }
}

function renderEducation(edu) {
    const grid = document.querySelector('.edu-grid');
    if (!grid) return;
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

function renderAchievements(achievements) {
    const container = document.getElementById('dynamic-achievements-container');
    if (!container) return;

    if (!achievements || achievements.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px 0; width: 100%; font-size: 0.95rem;">No achievements added yet.</div>`;
        return;
    }

    // Filter achievements by category
    const wonItems = achievements.filter(a => (a.category || '').toLowerCase().includes('won') || (a.category || '').toLowerCase().includes('achieve'));
    const appreciationItems = achievements.filter(a => (a.category || '').toLowerCase().includes('apprec'));
    const participatedItems = achievements.filter(a => (a.category || '').toLowerCase().includes('particip') || (!(a.category || '').toLowerCase().includes('won') && !(a.category || '').toLowerCase().includes('achieve') && !(a.category || '').toLowerCase().includes('apprec')));

    let html = '';
    let gridsToInit = [];

    const buildCategoryHTML = (title, items, uniqueKey) => {
        if (items.length === 0) return '';
        const gridId = `achievements-grid-${uniqueKey}`;
        const dotsId = `achievements-dots-${uniqueKey}`;
        gridsToInit.push({ gridId, dotsId });

        return `
            <div class="achievement-section reveal active" style="margin-bottom: 60px; width: 100%;">
                <h3 class="achievement-section-title" style="font-size: 1.5rem; font-weight: 600; color: var(--accent-cyan); border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px; margin-bottom: 25px; letter-spacing: 1px; text-transform: uppercase;">${title}</h3>
                <div class="projects-slider-wrapper">
                    <div class="projects-grid home-projects-grid" id="${gridId}">
                        ${items.map((a) => {
                            const imagesGrid = renderAchievementImagesGrid(a.image_urls, a.id, 'all');
                            return `
                                <div class="card proj-card reveal active" onclick="openAchievementDetailsById(${a.id})" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        ${imagesGrid}
                                        <div class="proj-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; margin-top: 15px;">
                                            <span style="color: var(--accent-cyan); font-size: 0.75rem; text-transform: uppercase; font-family:'Space Grotesk', sans-serif;">${a.date || ''}</span>
                                        </div>
                                        <h3 style="margin-top: 5px;">${a.title}</h3>
                                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px; line-height: 1.5;">
                                            ${a.description ? a.description.substring(0, 120) + (a.description.length > 120 ? '...' : '') : ''}
                                        </p>
                                    </div>
                                    ${a.link ? `<a href="${a.link}" target="_blank" class="proj-link" style="align-self: flex-start; margin-top: 15px;" onclick="event.stopPropagation();">Details ↗</a>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${items.length > 1 ? `<div class="project-dots" id="${dotsId}"></div>` : ''}
                </div>
            </div>
        `;
    };

    html += buildCategoryHTML('Won / Achieved', wonItems, 'won');
    html += buildCategoryHTML('Appreciation Received', appreciationItems, 'apprec');
    html += buildCategoryHTML('Participated', participatedItems, 'particip');

    if (!html) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px 0; width: 100%; font-size: 0.95rem;">No achievements added yet.</div>`;
    } else {
        container.innerHTML = html;
        // Initialize dynamic dot controls for each category slider
        gridsToInit.forEach(({ gridId, dotsId }) => {
            initAchievementDots(gridId, dotsId);
        });
    }
}

function initAchievementDots(gridId, dotsId) {
    const grid = document.getElementById(gridId);
    const dotsContainer = document.getElementById(dotsId);
    if (!grid || !dotsContainer) return;

    const cards = grid.querySelectorAll('.proj-card');
    if (cards.length === 0) return;

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

function renderAchievementImagesGrid(imageUrls, achievementId, source) {
    let urls = [];
    try {
        urls = JSON.parse(imageUrls || '[]');
    } catch(e) {
        if (imageUrls) urls = [imageUrls];
    }
    if (urls.length === 0) return '';

    if (urls.length === 1) {
        return `
            <div class="project-media-grid single">
                <img src="${urls[0]}" class="project-grid-img main" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 0)">
            </div>
        `;
    }

    if (urls.length === 2) {
        return `
            <div class="project-media-grid grid-2">
                <img src="${urls[0]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 0)">
                <img src="${urls[1]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 1)">
            </div>
        `;
    }

    if (urls.length === 3) {
        return `
            <div class="project-media-grid grid-3">
                <div class="main-cell"><img src="${urls[0]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 0)"></div>
                <div class="side-cell"><img src="${urls[1]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 1)"></div>
                <div class="side-cell"><img src="${urls[2]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 2)"></div>
            </div>
        `;
    }

    // 4 or more images: 2x2 grid with +N overlay on 4th cell
    const extraCount = urls.length - 4;
    return `
        <div class="project-media-grid grid-4">
            ${[0,1,2,3].map(i => `
                <div class="grid-cell">
                    <img src="${urls[i]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', ${i})">
                    ${i === 3 && extraCount > 0 ? `
                        <div onclick="event.stopPropagation(); openAchievementDetailsById(${achievementId})" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem;cursor:pointer;">+${extraCount}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

window.openAchievementDetailsById = function(achievementId) {
    const achievements = window.cachedAchievements || [];
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
        openAchievementDetails(achievement);
    }
};

window.openAchievementDetails = function(achievement) {
    let urls = [];
    try {
        urls = JSON.parse(achievement.image_urls || '[]');
    } catch(e) {
        if (achievement.image_urls) urls = [achievement.image_urls];
    }
    
    const modal = document.createElement('div');
    modal.id = 'achievement-details-modal';
    modal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div class="project-modal-content" style="
            background: rgba(20, 20, 25, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 35px;
            position: relative;
            box-shadow: 0 25px 60px rgba(0,0,0,0.6);
        ">
            <button onclick="closeAchievementDetails()" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.6);
                font-size: 32px;
                cursor: pointer;
                transition: color 0.2s;
            " onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.6)'">&times;</button>
            
            <span style="color: var(--accent-cyan); font-size: 0.8rem; font-family:'Space Grotesk', sans-serif; letter-spacing: 2px; text-transform: uppercase;">${achievement.date || ''}</span>
            <h2 style="font-size: 1.8rem; font-weight: 700; color: white; margin: 8px 0 20px 0; line-height: 1.3;">${achievement.title}</h2>
            
            ${urls.length > 0 ? `
                <div class="project-modal-images" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; margin-bottom: 25px;">
                    ${urls.map((url, uIdx) => `
                        <img src="${url}" style="width:100%; height:100px; object-fit:cover; border-radius:8px; cursor:pointer; border:1px solid rgba(255,255,255,0.06); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'" onclick="openAchievementLightbox(event, ${achievement.id}, 'all', ${uIdx})">
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="font-size: 1.1rem; color: rgba(255,255,255,0.75); line-height: 1.6; margin-bottom: 25px; white-space: pre-wrap;">
                ${achievement.description || ''}
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                    <span class="tag" style="background:rgba(0, 242, 254, 0.1); color:var(--accent-cyan); padding:4px 10px; border-radius:30px; font-size:0.8rem; border:1px solid rgba(0, 242, 254, 0.2);">${achievement.category}</span>
                </div>
                ${achievement.link ? `<a href="${achievement.link}" target="_blank" class="btn-primary" style="padding: 10px 20px; font-size:0.9rem; text-decoration:none; display:inline-block; border-radius:8px;">Details ↗</a>` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.closeAchievementDetails = function() {
    const m = document.getElementById('achievement-details-modal');
    if (m) m.remove();
};

window.openAchievementLightbox = function(e, achievementId, source, imageIdx) {
    if (e) e.stopPropagation();
    
    const achievements = window.cachedAchievements || [];
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    let urls = [];
    try {
        urls = JSON.parse(achievement.image_urls || '[]');
    } catch(err) {
        if (achievement.image_urls) urls = [achievement.image_urls];
    }
    if (urls.length === 0) return;
    
    let currentIndex = imageIdx;
    
    const lb = document.createElement('div');
    lb.id = 'image-lightbox';
    lb.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 11000;
    `;
    
    const renderContent = () => {
        lb.innerHTML = `
            <button onclick="closeLightbox(event)" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 35px; cursor: pointer; z-index:100;">&times;</button>
            
            ${urls.length > 1 ? `
                <button onclick="prevImage(event)" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.08); border: none; color: white; font-size: 24px; padding: 15px 20px; border-radius: 50%; cursor: pointer; transition: all 0.2s; z-index:100;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">&#10094;</button>
                <button onclick="nextImage(event)" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.08); border: none; color: white; font-size: 24px; padding: 15px 20px; border-radius: 50%; cursor: pointer; transition: all 0.2s; z-index:100;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">&#10095;</button>
            ` : ''}
            
            <div style="max-width: 90%; max-height: 90%; display: flex; flex-direction: column; align-items: center; gap: 15px; position:relative;">
                <img src="${urls[currentIndex]}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                ${urls.length > 1 ? `
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem; font-family: sans-serif; background: rgba(0,0,0,0.6); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08);">
                        ${currentIndex + 1} / ${urls.length}
                    </div>
                ` : ''}
            </div>
        `;
    };
    
    window.prevImage = function(event) {
        if(event) event.stopPropagation();
        currentIndex = (currentIndex - 1 + urls.length) % urls.length;
        renderContent();
    };
    
    window.nextImage = function(event) {
        if(event) event.stopPropagation();
        currentIndex = (currentIndex + 1) % urls.length;
        renderContent();
    };
    
    window.closeLightbox = function(event) {
        if(event) event.stopPropagation();
        lb.remove();
        document.removeEventListener('keydown', handleKeyDown);
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'ArrowRight') {
            nextImage();
        } else if (event.key === 'ArrowLeft') {
            prevImage();
        } else if (event.key === 'Escape') {
            closeLightbox();
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    renderContent();
    document.body.appendChild(lb);
};

