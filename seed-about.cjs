require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

const journey = `Hi, I’m Keven Marini, an Electronics and Communication Engineering student at Vellore Institute of Technology with a strong passion for technology, innovation, and creative problem-solving. I enjoy exploring the intersection of hardware and software while continuously learning new technologies and building practical solutions.

My interests mainly revolve around Embedded Systems, IoT, VLSI Design, PCB Development, and modern software technologies. I am passionate about creating projects that not only solve real-world problems but also improve my technical understanding and creativity. I enjoy working on ideas that combine engineering concepts with innovation and functionality.

Apart from engineering, I also have a deep interest in design, creativity, and digital content creation. I believe that combining technical skills with creativity helps in building better and more user-friendly solutions. I constantly challenge myself to improve my skills, learn emerging technologies, and gain hands-on experience through projects, internships, and continuous learning.

My goal is to grow as a versatile engineer and creator while contributing to meaningful and impactful technological solutions. I believe in consistency, curiosity, and continuous self-improvement as the foundation for success.

Thank you for visiting my portfolio — feel free to explore my projects, skills, and creative work.`;

const academics = `Vellore Institute of Technology
Bachelor of Technology (B.Tech) in Electronics and Communication Engineering

Currently pursuing my undergraduate degree with a focus on core electronics, embedded systems, digital design, and emerging technologies.

I am actively improving my technical knowledge through academic learning, self-study, projects, certifications, and practical implementation of engineering concepts.`;

const focus = `Embedded Systems & IoT
VLSI Design & Verilog HDL
PCB Design and Circuit Development
Learning Modern Software Technologies
Building Technical and Creative Projects
Improving Problem-Solving and Development Skills
Exploring Innovation in Electronics and Technology`;

const philosophy = `I believe in continuous learning, practical innovation, and combining creativity with technology to build meaningful solutions.

My approach focuses on consistency, curiosity, discipline, and hands-on learning. I strongly believe that growth comes from constantly exploring new ideas, challenging limitations, and improving through real-world experience.

I aim to create projects that are not only technically strong but also practical, creative, and impactful.`;

const locationText = `Chennai`;

async function seed() {
    try {
        const exists = await sql`SELECT * FROM about_page LIMIT 1;`;
        if (exists.rows.length > 0) {
            await sql`UPDATE about_page SET journey_vision=${journey}, academics_text=${academics}, current_focus=${focus}, core_philosophy=${philosophy}, location_text=${locationText} WHERE id=${exists.rows[0].id};`;
        } else {
            await sql`INSERT INTO about_page (journey_vision, academics_text, current_focus, core_philosophy, location_text) VALUES (${journey}, ${academics}, ${focus}, ${philosophy}, ${locationText});`;
        }
        console.log("Successfully seeded about_page data.");
    } catch (e) {
        console.error("Error seeding:", e);
    }
}

seed();
