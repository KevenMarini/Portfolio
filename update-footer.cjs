const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir);

const newFooterHtml = `
<footer class="premium-footer">
    <div class="footer-content">
        <div class="footer-brand">
            <img src="image3.png" alt="Logo" class="footer-logo-img">
            <h3>KEVEN MARINI</h3>
            <p>Bridging hardware systems with intelligent software solutions.</p>
        </div>
        <div class="footer-section">
            <h4>Navigation</h4>
            <a href="home.html">Home</a>
            <a href="about.html">About</a>
            <a href="projects.html">Projects</a>
            <a href="resume.html">Resume</a>
            <a href="contact.html">Contact</a>
        </div>
        <div class="footer-section">
            <h4>Explore</h4>
            <a href="skills.html">Skills</a>
            <a href="education.html">Education</a>
            <a href="certifications.html">Certifications</a>
            <a href="achievements.html">Achievements</a>
            <a href="announcement.html">Announcements</a>
        </div>
        <div class="footer-section">
            <h4>Connect</h4>
            <a href="mailto:kevenmarini07@gmail.com">Email</a>
            <a href="https://www.linkedin.com/in/kevenmarini/" target="_blank">LinkedIn</a>
            <a href="https://github.com/KevenMarini" target="_blank">GitHub</a>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2026 Keven Marini. All rights reserved.</p>
    </div>
</footer>
`;

files.forEach(file => {
    if (file.endsWith('.html') && file !== 'index.html' && file !== 'admin.html') {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace everything between <footer> and </footer> including the tags
        const footerRegex = /<footer[^>]*>[\s\S]*?<\/footer>/g;
        if (footerRegex.test(content)) {
            content = content.replace(footerRegex, newFooterHtml.trim());
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated footer in ${file}`);
        }
    }
});

// Update style.css with media queries for the footer
const stylePath = path.join(dir, 'style.css');
let styleContent = fs.readFileSync(stylePath, 'utf8');
if (!styleContent.includes('grid-template-columns: 1fr; /* Footer mobile */')) {
    styleContent += `
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr; /* Footer mobile */
    gap: 40px;
    text-align: center;
  }
  
  .footer-brand {
    align-items: center;
  }
  
  .footer-section h4::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .footer-section a {
    margin: 0 auto;
  }
  
  .footer-section a:hover {
    transform: translateY(-2px);
  }
}
`;
    fs.writeFileSync(stylePath, styleContent, 'utf8');
    console.log('Updated style.css with responsive footer rules');
}
