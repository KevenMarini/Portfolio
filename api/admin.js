import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  const { method } = request;
  const { password, type, data } = request.body;

  // Basic security check
  if (password !== process.env.ADMIN_PASSWORD) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (method === 'POST') {
      // Setup Tables if they don't exist
      await sql`CREATE TABLE IF NOT EXISTS projects (id SERIAL PRIMARY KEY, title TEXT, description TEXT, tags TEXT, link TEXT, date TEXT);`;
      await sql`CREATE TABLE IF NOT EXISTS experience (id SERIAL PRIMARY KEY, role TEXT, organization TEXT, description TEXT, date TEXT);`;
      await sql`CREATE TABLE IF NOT EXISTS skills (id SERIAL PRIMARY KEY, name TEXT, category TEXT);`;
      await sql`CREATE TABLE IF NOT EXISTS education (id SERIAL PRIMARY KEY, degree TEXT, institution TEXT, year TEXT, score TEXT, score_label TEXT);`;

      if (type === 'project') {
        const { title, description, tags, link, date } = data;
        await sql`INSERT INTO projects (title, description, tags, link, date) VALUES (${title}, ${description}, ${tags}, ${link}, ${date});`;
      } else if (type === 'experience') {
        const { role, organization, description, date } = data;
        await sql`INSERT INTO experience (role, organization, description, date) VALUES (${role}, ${organization}, ${description}, ${date});`;
      } else if (type === 'skill') {
        const { name, category } = data;
        await sql`INSERT INTO skills (name, category) VALUES (${name}, ${category});`;
      } else if (type === 'education') {
        const { degree, institution, year, score, score_label } = data;
        await sql`INSERT INTO education (degree, institution, year, score, score_label) VALUES (${degree}, ${institution}, ${year}, ${score}, ${score_label});`;
      }

      return response.status(200).json({ success: true });
    }

    if (method === 'DELETE') {
      const { id, type } = request.query;
      if (type === 'project') await sql`DELETE FROM projects WHERE id = ${id};`;
      if (type === 'experience') await sql`DELETE FROM experience WHERE id = ${id};`;
      if (type === 'skill') await sql`DELETE FROM skills WHERE id = ${id};`;
      if (type === 'education') await sql`DELETE FROM education WHERE id = ${id};`;
      
      return response.status(200).json({ success: true });
    }

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
