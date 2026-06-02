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
        if (data.about_page) renderAboutPage(data.about_page, data.profile || {});
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
            renderHomeAchievements(data.achievements);
        }
        if (data.announcements) {
            window.cachedAnnouncements = data.announcements;
            renderAnnouncements(data.announcements);
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
    const logoImgs = document.querySelectorAll('.nav-logo-img, .footer-logo-img');
    logoImgs.forEach(img => {
        if (p.image_url) {
            img.src = p.image_url;
        }
    });
    const favicon = document.getElementById('dynamic-favicon');
    if (favicon && p.image_url) {
        favicon.href = p.image_url;
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
    const aboutText = document.querySelector('.about-grid .about-main p');
    if (aboutText) aboutText.textContent = p.about_text || "I'm a first-year B.Tech student at Vellore Institute of Technology, focused on bridging the gap between hardware and intelligence. My passion lies in AI, embedded systems, and creating technology that solves real-world problems.";

    const stats = document.querySelectorAll('.about-grid .stat-num');
    if (stats.length >= 2) {
        stats[0].textContent = p.project_count || '8+';
        stats[1].textContent = p.club_count || '2';
    }

    const locationText = document.querySelector('.about-grid .card:nth-child(2) p');
    if (locationText) locationText.textContent = p.location || 'Chennai, Tamil Nadu';

    const languagesContainer = document.querySelector('.about-grid .lang-pills');
    if (languagesContainer && p.languages) {
        languagesContainer.innerHTML = p.languages.split(',').map(l => `<span class="pill">${l.trim()}</span>`).join('');
    }

    const yearNum = document.querySelector('.about-grid .card:nth-child(3) .stat-num');
    if (yearNum) yearNum.textContent = p.current_year || '1st';

    // Contact Page population
    const contactIntro = document.getElementById('contact-intro-text');
    if (contactIntro && p.contact_text) {
        contactIntro.innerHTML = p.contact_text.split('\n\n').map(pt => `${pt.trim()}`).join('<br><br>');
    }

    const contactEmail = document.getElementById('contact-email');
    if (contactEmail && p.email) {
        contactEmail.textContent = p.email;
        contactEmail.href = `mailto:${p.email}`;
    }

    const contactPhone = document.getElementById('contact-phone');
    if (contactPhone && p.phone) {
        contactPhone.textContent = p.phone;
    }

    const contactLinkedin = document.getElementById('contact-linkedin');
    if (contactLinkedin && p.linkedin) {
        contactLinkedin.textContent = p.linkedin.replace(/^https?:\/\/(www\.)?/, '');
        contactLinkedin.href = p.linkedin;
    }

    // Resume Link handling
    if (p.resume_url) {
        // Inject into navbar
        document.querySelectorAll('.nav-right').forEach(navRight => {
            if (!navRight.querySelector('.download-resume-btn')) {
                const btn = document.createElement('a');
                btn.href = p.resume_url;
                btn.download = 'Resume';
                btn.className = 'download-resume-btn';
                btn.style = 'padding: 8px 18px; font-size: 0.9rem; margin-left: 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; text-decoration: none; transition: all 0.3s ease; background: rgba(255,255,255,0.05); font-weight: 500; display: inline-block;';
                btn.textContent = 'Download Resume';
                btn.onmouseover = () => { btn.style.background = 'white'; btn.style.color = 'black'; };
                btn.onmouseout = () => { btn.style.background = 'rgba(255,255,255,0.05)'; btn.style.color = 'white'; };
                navRight.appendChild(btn);
            } else {
                navRight.querySelector('.download-resume-btn').href = p.resume_url;
            }
        });

        // Inject into hero section if present
        const heroCta = document.querySelector('.hero-cta');
        if (heroCta && !heroCta.querySelector('.hero-resume-btn')) {
            const heroBtn = document.createElement('a');
            heroBtn.href = p.resume_url;
            heroBtn.download = 'Resume';
            heroBtn.className = 'btn-ghost hero-resume-btn';
            heroBtn.textContent = 'Download Resume';
            heroCta.appendChild(heroBtn);
        } else if (heroCta && heroCta.querySelector('.hero-resume-btn')) {
            heroCta.querySelector('.hero-resume-btn').href = p.resume_url;
        }

        // Inject at the bottom of the home page
        const homeMain = document.querySelector('body.portfolio-mode main');
        const isHomePage = document.getElementById('home') !== null || window.location.pathname.includes('home.html');
        if (homeMain && isHomePage && !document.getElementById('home-resume-section')) {
            const section = document.createElement('section');
            section.id = 'home-resume-section';
            section.style = 'text-align: center; padding: 60px 5%; margin-top: 40px;';
            section.innerHTML = `
                <h2 class="section-title" style="margin-bottom: 30px;">Looking for <span>more details?</span></h2>
                <a href="${p.resume_url}" download="Resume" class="btn-primary" style="font-size: 1.1rem; padding: 15px 40px; display: inline-block;">Download Resume</a>
            `;
            homeMain.appendChild(section);
        } else if (document.getElementById('home-resume-section')) {
            document.querySelector('#home-resume-section a').href = p.resume_url;
        }
        
        // Handle dedicated Resume Page buttons
        const dedicatedResumeBtn = document.getElementById('resume-download-btn');
        const resumeUnavailableMsg = document.getElementById('resume-unavailable-msg');
        if (dedicatedResumeBtn) {
            dedicatedResumeBtn.href = p.resume_url;
            dedicatedResumeBtn.style.display = 'inline-block';
            if (resumeUnavailableMsg) resumeUnavailableMsg.style.display = 'none';
        }
    } else {
        // If no resume is uploaded, handle the dedicated page state
        const dedicatedResumeBtn = document.getElementById('resume-download-btn');
        const resumeUnavailableMsg = document.getElementById('resume-unavailable-msg');
        if (dedicatedResumeBtn) {
            dedicatedResumeBtn.style.display = 'none';
            if (resumeUnavailableMsg) resumeUnavailableMsg.style.display = 'block';
        }
    }
}

// Add Resume to navigation links dynamically across all pages
document.addEventListener("DOMContentLoaded", () => {
    // Top nav links (home page usually)
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !navLinks.querySelector('a[href="resume.html"]')) {
        const resumeLink = document.createElement('a');
        resumeLink.href = 'resume.html';
        resumeLink.textContent = 'Resume';
        navLinks.appendChild(resumeLink);
    }
    
    // Premium Sidebar links
    document.querySelectorAll('.ps-links').forEach(psLinks => {
        if (!psLinks.querySelector('a[href="resume.html"]')) {
            const resumeSideLink = document.createElement('a');
            resumeSideLink.href = 'resume.html';
            resumeSideLink.textContent = 'Resume';
            psLinks.appendChild(resumeSideLink);
        }
    });
});

function renderAboutPage(a, p) {
    const parseText = (text) => text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');

    const journeyText = a.journey_vision || `Hi, I’m **Keven Marini**, an Electronics and Communication Engineering student at Vellore Institute of Technology with a strong passion for technology, innovation, and creative problem-solving. I enjoy exploring the intersection of hardware and software while continuously learning new technologies and building practical solutions.\n\nMy interests mainly revolve around Embedded Systems, IoT, VLSI Design, PCB Development, and modern software technologies. I am passionate about creating projects that not only solve real-world problems but also improve my technical understanding and creativity. I enjoy working on ideas that combine engineering concepts with innovation and functionality.\n\nApart from engineering, I also have a deep interest in design, creativity, and digital content creation. I believe that combining technical skills with creativity helps in building better and more user-friendly solutions. I constantly challenge myself to improve my skills, learn emerging technologies, and gain hands-on experience through projects, internships, and continuous learning.\n\nMy goal is to grow as a versatile engineer and creator while contributing to meaningful and impactful technological solutions. I believe in consistency, curiosity, and continuous self-improvement as the foundation for success.\n\nThank you for visiting my portfolio — feel free to explore my projects, skills, and creative work.`;
    const journeyDiv = document.getElementById('about-journey-content');
    if (journeyDiv) journeyDiv.innerHTML = parseText(journeyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));

    const academicsText = a.academics_text || `**Vellore Institute of Technology**\n**Bachelor of Technology (B.Tech) in Electronics and Communication Engineering**\n\nCurrently pursuing my undergraduate degree with a focus on core electronics, embedded systems, digital design, and emerging technologies.\n\nI am actively improving my technical knowledge through academic learning, self-study, projects, certifications, and practical implementation of engineering concepts.`;
    const academicsDiv = document.getElementById('about-academics-content');
    if (academicsDiv) academicsDiv.innerHTML = parseText(academicsText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n(?!\n)/g, '<br>'));

    const focusText = a.current_focus || `Embedded Systems & IoT\n\nVLSI Design & Verilog HDL\n\nPCB Design and Circuit Development\n\nLearning Modern Software Technologies\n\nBuilding Technical and Creative Projects\n\nImproving Problem-Solving and Development Skills\n\nExploring Innovation in Electronics and Technology`;
    const focusDiv = document.getElementById('about-focus-content');
    if (focusDiv) focusDiv.innerHTML = parseText(focusText);

    const philosophyText = a.core_philosophy || `I believe in continuous learning, practical innovation, and combining creativity with technology to build meaningful solutions.\n\nMy approach focuses on consistency, curiosity, discipline, and hands-on learning. I strongly believe that growth comes from constantly exploring new ideas, challenging limitations, and improving through real-world experience.\n\nI aim to create projects that are not only technically strong but also practical, creative, and impactful.`;
    const philosophyDiv = document.getElementById('about-philosophy-content');
    if (philosophyDiv) philosophyDiv.innerHTML = parseText(philosophyText);

    const locationText = a.location_text || `Chennai`;
    const locationDiv = document.getElementById('about-location-content');
    if (locationDiv) locationDiv.innerHTML = parseText(locationText);
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
                        ${p.link ? `<a href="${p.link}" target="_blank" class="proj-link" style="align-self: flex-start; margin-top: auto;" onclick="event.stopPropagation();">${p.link_name || 'GitHub'}</a>` : ''}
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
                    <div class="card proj-card reveal active" onclick="openProjectDetailsById(${p.id})" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; width: 100%;">
                        <div>
                            ${imagesGrid}
                            <div class="proj-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <div class="proj-tags">
                                    ${(p.tags || '').split(',').map(tag => tag.trim() ? `<span class="proj-tag">${tag.trim()}</span>` : '').join('')}
                                </div>
                                <span class="proj-date" style="font-size:0.85rem; color:var(--text-secondary); font-family:'Space Grotesk', sans-serif;">${p.date || ''}</span>
                            </div>
                            <h3 style="font-size: 1.4rem; margin-bottom: 12px; color: white;">${p.title}</h3>
                            <p style="color: rgba(255,255,255,0.7); font-size: 0.95rem; line-height: 1.5; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${p.description ? p.description.substring(0, 160) + (p.description.length > 160 ? '...' : '') : ''}</p>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                            <span style="color: var(--accent-cyan); font-size: 0.9rem; text-decoration: none;">Read More &rarr;</span>
                            ${p.link ? `<a href="${p.link}" target="_blank" class="proj-link" style="align-self: flex-start; margin-top: 0;" onclick="event.stopPropagation();">${p.link_name || 'GitHub'}</a>` : ''}
                        </div>
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
                <img src="${urls[0]}" onclick="openLightbox(event, ${projectId}, '${source}', 0)">
            </div>
        `;
    }

    // 2+ images: big main on top + thumbnail strip below
    const thumbs = urls.slice(1, 4); // up to 3 thumbnails
    const extraCount = urls.length - 4; // extras beyond 4th image
    return `
        <div class="project-media-grid multi">
            <img class="main-img" src="${urls[0]}" onclick="openLightbox(event, ${projectId}, '${source}', 0)">
            <div class="thumbs-strip">
                ${thumbs.map((url, i) => {
                    const isLast = i === 2 && extraCount > 0;
                    return `
                        <div class="thumb-cell">
                            <img src="${url}" onclick="openLightbox(event, ${projectId}, '${source}', ${i + 1})">
                            ${isLast ? `<div class="more-overlay" onclick="event.stopPropagation(); openProjectDetailsById(${projectId})">+${extraCount}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
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
                ${project.link ? `<a href="${project.link}" target="_blank" class="btn-primary" style="padding: 10px 20px; font-size:0.9rem; text-decoration:none; display:inline-block; border-radius:8px; margin-top: auto;">${project.link_name || 'Visit Project'}</a>` : ''}
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
            height: auto;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-sizing: border-box;
        }
        .project-media-grid img {
            cursor: pointer;
            transition: transform 0.3s ease, filter 0.3s ease;
            display: block;
        }
        .project-media-grid img:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
        }
        /* Single image – fill full box */
        .project-media-grid.single {
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .project-media-grid.single img {
            width: auto;
            max-width: 100%;
            height: auto;
            max-height: 400px;
            object-fit: contain;
            border-radius: 12px;
        }
        /* Multi layout: big top image + thumbnails strip */
        .project-media-grid.multi {
            background: transparent;
        }
        .project-media-grid.multi .main-img {
            width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: contain;
            border-radius: 12px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.2);
        }
        .project-media-grid.multi .thumbs-strip {
            display: flex;
            flex-direction: row;
            gap: 8px;
            height: 60px;
            box-sizing: border-box;
        }
        .project-media-grid.multi .thumbs-strip .thumb-cell {
            flex: 1;
            position: relative;
            overflow: hidden;
            border-radius: 8px;
        }
        .project-media-grid.multi .thumbs-strip .thumb-cell img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
        }
        .project-media-grid.multi .thumbs-strip .thumb-cell .more-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.70);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 1.1rem;
            cursor: pointer;
            border-radius: 8px;
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
                ${c.link ? `<a href="${c.link}" target="_blank" class="proj-link" style="margin-top: auto; display: inline-block;">${c.link_name || 'Verify Credentials'}</a>` : ''}
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

function renderAnnouncements(announcements) {
    const container = document.getElementById('dynamic-announcements-container');
    if (!container) return;

    if (!announcements || announcements.length === 0) {
        container.innerHTML = `<div class="flow-section reveal active"><div style="text-align: center; color: var(--text-secondary); padding: 40px 0;">No announcements at the moment. Check back later!</div></div>`;
        return;
    }

    let html = '';
    // Reverse array to display old to new
    const sortedAnnouncements = [...announcements].reverse();
    sortedAnnouncements.forEach((a) => {
        const imagesGrid = renderAchievementImagesGrid(a.image_urls, a.id, 'announcement');
        html += `
            <div class="flow-section reveal active" style="margin-bottom: 30px; cursor: default;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0; color: var(--accent-cyan); font-size: 1.4rem; font-weight: 600;">${a.title}</h3>
                    <span style="color: var(--text-secondary); font-size: 0.85rem; background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 20px;">${a.date || ''}</span>
                </div>
                ${imagesGrid}
                <div style="margin-top: 15px; font-size: 0.95rem; line-height: 1.6; color: rgba(255, 255, 255, 0.85);">
                    ${(a.description || '').split('\n').map(p => `<p style="margin-bottom: 10px;">${p}</p>`).join('')}
                </div>
                ${a.link ? `<a href="${a.link}" target="_blank" style="display: inline-block; margin-top: 15px; color: var(--accent-cyan); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--accent-cyan); padding-bottom: 2px;">${a.link_name || 'Read More ↗'}</a>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

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
                                <div class="card proj-card reveal active" onclick="openAchievementDetailsById(${a.id}, 'all')" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
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
                                    ${a.link ? `<a href="${a.link}" target="_blank" class="proj-link" style="align-self: flex-start; margin-top: auto;" onclick="event.stopPropagation();">${a.link_name || 'Details'}</a>` : ''}
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
function renderHomeAchievements(achievements) {
    const grid = document.getElementById('home-achievements-grid');
    if (!grid) return;

    const homeAchievements = achievements.filter(a => a.show_on_home === true || a.show_on_home === 'true' || a.show_on_home === 1);

    if (homeAchievements.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px 0; width: 100%;">
                No showcased achievements.
            </div>
        `;
        return;
    }

    grid.innerHTML = homeAchievements.map((a) => {
        const imagesGrid = renderAchievementImagesGrid(a.image_urls, a.id, 'home');
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
                ${a.link ? `<a href="${a.link}" target="_blank" class="proj-link" style="align-self: flex-start; margin-top: auto;" onclick="event.stopPropagation();">${a.link_name || 'Details'}</a>` : ''}
            </div>
        `;
    }).join('');
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
                <img src="${urls[0]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 0)">
            </div>
        `;
    }

    // 2+ images: big main on top + thumbnail strip below
    const thumbs = urls.slice(1, 4);
    const extraCount = urls.length - 4;
    return `
        <div class="project-media-grid multi">
            <img class="main-img" src="${urls[0]}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', 0)">
            <div class="thumbs-strip">
                ${thumbs.map((url, i) => {
                    const isLast = i === 2 && extraCount > 0;
                    return `
                        <div class="thumb-cell">
                            <img src="${url}" onclick="openAchievementLightbox(event, ${achievementId}, '${source}', ${i + 1})">
                            ${isLast ? `<div class="more-overlay" onclick="event.stopPropagation(); openAchievementDetailsById(${achievementId}, '${source}')">+${extraCount}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

window.openAchievementDetailsById = function(achievementId, source) {
    let item = null;
    if (source === 'announcement') {
        const announcements = window.cachedAnnouncements || [];
        item = announcements.find(a => a.id === achievementId);
    } else {
        const achievements = window.cachedAchievements || [];
        item = achievements.find(a => a.id === achievementId);
    }
    if (item) {
        openAchievementDetails(item);
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
                ${achievement.link ? `<a href="${achievement.link}" target="_blank" class="btn-primary" style="padding: 10px 20px; font-size:0.9rem; text-decoration:none; display:inline-block; border-radius:8px; margin-top: auto;">${achievement.link_name || 'Details'}</a>` : ''}
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
    
    let item = null;
    if (source === 'announcement') {
        const announcements = window.cachedAnnouncements || [];
        item = announcements.find(a => a.id === achievementId);
    } else {
        const achievements = window.cachedAchievements || [];
        item = achievements.find(a => a.id === achievementId);
    }
    if (!item) return;
    
    let urls = [];
    try {
        urls = JSON.parse(item.image_urls || '[]');
    } catch(err) {
        if (item.image_urls) urls = [item.image_urls];
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

