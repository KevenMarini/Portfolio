import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    const profile = await sql`SELECT * FROM profile LIMIT 1;`;
    const projects = await sql`SELECT * FROM projects ORDER BY id DESC;`;
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
    return response.status(200).json({
      profile: null,
      projects: [],
      experience: [],
      skills: [],
      education: [],
      certifications: []
    });
  }
}
