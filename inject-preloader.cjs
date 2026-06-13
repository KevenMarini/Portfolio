const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.html') && file !== 'admin.html') {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('id="global-preloader"')) {
            content = content.replace(/<body[^>]*>/i, match => `${match}\n    <div id="global-preloader"><div class="preloader-spinner"></div></div>`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
console.log('Done.');
