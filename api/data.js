import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // Initialize tables and schema upgrades
    await sql`CREATE TABLE IF NOT EXISTS profile (id SERIAL PRIMARY KEY, name TEXT, subtitle TEXT, hero_badge TEXT, email TEXT, phone TEXT, linkedin TEXT, github TEXT, about_text TEXT, location TEXT, languages TEXT, project_count TEXT, club_count TEXT, current_year TEXT);`;
    try { await sql`ALTER TABLE profile ADD COLUMN image_url TEXT;`; } catch(e) {}
    try { await sql`ALTER TABLE profile ADD COLUMN cgpa TEXT;`; } catch(e) {}
    await sql`CREATE TABLE IF NOT EXISTS projects (id SERIAL PRIMARY KEY, title TEXT, description TEXT, tags TEXT, link TEXT, date TEXT);`;
    try { await sql`ALTER TABLE projects ADD COLUMN image_urls TEXT;`; } catch(e) {}
    try { await sql`ALTER TABLE projects ADD COLUMN show_on_home BOOLEAN DEFAULT FALSE;`; } catch(e) {}
    try { await sql`ALTER TABLE projects ADD COLUMN sort_order INT DEFAULT 0;`; } catch(e) {}
    await sql`CREATE TABLE IF NOT EXISTS experience (id SERIAL PRIMARY KEY, role TEXT, organization TEXT, description TEXT, date TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS skills (id SERIAL PRIMARY KEY, name TEXT, category TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS education (id SERIAL PRIMARY KEY, degree TEXT, institution TEXT, year TEXT, score TEXT, score_label TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS certifications (id SERIAL PRIMARY KEY, name TEXT, status TEXT, link TEXT);`;
    try { await sql`ALTER TABLE certifications ADD COLUMN image_url TEXT;`; } catch(e) {}
    try { await sql`ALTER TABLE certifications ADD COLUMN show_on_home BOOLEAN DEFAULT FALSE;`; } catch(e) {}

    const profile = await sql`SELECT * FROM profile LIMIT 1;`;
    const projects = await sql`SELECT * FROM projects ORDER BY sort_order ASC, id DESC;`;
    const experience = await sql`SELECT * FROM experience ORDER BY id DESC;`;
    const skills = await sql`SELECT * FROM skills;`;
    const education = await sql`SELECT * FROM education ORDER BY year DESC;`;
    const certifications = await sql`SELECT * FROM certifications ORDER BY id DESC;`;

    return response.status(200).json({
      profile: profile.rows[0] || null,
      projects: projects.rows,
      experience: experience.rows,
      skills: skills.rows,
      education: education.rows,
      certifications: certifications.rows
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return response.status(200).json({
      error: error.message,
      profile: null,
      projects: [],
      experience: [],
      skills: [],
      education: [],
      certifications: []
    });
  }
}
