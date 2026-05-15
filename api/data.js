import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // 1. Fetch all data from tables
    const projects = await sql`SELECT * FROM projects ORDER BY id DESC;`;
    const experience = await sql`SELECT * FROM experience ORDER BY id DESC;`;
    const skills = await sql`SELECT * FROM skills;`;
    const education = await sql`SELECT * FROM education ORDER BY year DESC;`;

    // 2. Return combined data
    return response.status(200).json({
      projects: projects.rows,
      experience: experience.rows,
      skills: skills.rows,
      education: education.rows
    });
  } catch (error) {
    // If tables don't exist, return empty arrays (first run)
    return response.status(200).json({
      projects: [],
      experience: [],
      skills: [],
      education: []
    });
  }
}
