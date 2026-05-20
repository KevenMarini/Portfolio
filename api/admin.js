import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  const { method } = request;
  const reqPassword = (request.body && request.body.password) || (request.query && request.query.password);
  const type = request.body && request.body.type;
  const data = request.body && request.body.data;

  if (reqPassword !== process.env.ADMIN_PASSWORD) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Initialize tables
    await sql`CREATE TABLE IF NOT EXISTS profile (id SERIAL PRIMARY KEY, name TEXT, subtitle TEXT, hero_badge TEXT, email TEXT, phone TEXT, linkedin TEXT, github TEXT, about_text TEXT, location TEXT, languages TEXT, project_count TEXT, club_count TEXT, current_year TEXT);`;
    try { await sql`ALTER TABLE profile ADD COLUMN image_url TEXT;`; } catch(e) {}
    try { await sql`ALTER TABLE profile ADD COLUMN cgpa TEXT;`; } catch(e) {}
    await sql`CREATE TABLE IF NOT EXISTS projects (id SERIAL PRIMARY KEY, title TEXT, description TEXT, tags TEXT, link TEXT, date TEXT);`;
    try { await sql`ALTER TABLE projects ADD COLUMN image_urls TEXT;`; } catch(e) {}
    try { await sql`ALTER TABLE projects ADD COLUMN show_on_home BOOLEAN DEFAULT FALSE;`; } catch(e) {}
    await sql`CREATE TABLE IF NOT EXISTS experience (id SERIAL PRIMARY KEY, role TEXT, organization TEXT, description TEXT, date TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS skills (id SERIAL PRIMARY KEY, name TEXT, category TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS education (id SERIAL PRIMARY KEY, degree TEXT, institution TEXT, year TEXT, score TEXT, score_label TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS certifications (id SERIAL PRIMARY KEY, name TEXT, status TEXT, link TEXT);`;
    try { await sql`ALTER TABLE certifications ADD COLUMN image_url TEXT;`; } catch(e) {}
    try { await sql`ALTER TABLE certifications ADD COLUMN show_on_home BOOLEAN DEFAULT FALSE;`; } catch(e) {}

    if (method === 'POST') {
      if (type === 'profile') {
        const { name='', subtitle='', hero_badge='', email='', phone='', linkedin='', github='', about_text='', location='', languages='', project_count='', club_count='', current_year='', image_url='', cgpa='' } = data || {};
        if (image_url && image_url.length > 3000000) {
          return response.status(400).json({ error: 'Image exceeds 2MB size limit' });
        }
        const exists = await sql`SELECT * FROM profile LIMIT 1;`;
        if (exists.rows.length > 0) {
          await sql`UPDATE profile SET name=${name}, subtitle=${subtitle}, hero_badge=${hero_badge}, email=${email}, phone=${phone}, linkedin=${linkedin}, github=${github}, about_text=${about_text}, location=${location}, languages=${languages}, project_count=${project_count}, club_count=${club_count}, current_year=${current_year}, image_url=${image_url}, cgpa=${cgpa} WHERE id=${exists.rows[0].id};`;
        } else {
          await sql`INSERT INTO profile (name, subtitle, hero_badge, email, phone, linkedin, github, about_text, location, languages, project_count, club_count, current_year, image_url, cgpa) VALUES (${name}, ${subtitle}, ${hero_badge}, ${email}, ${phone}, ${linkedin}, ${github}, ${about_text}, ${location}, ${languages}, ${project_count}, ${club_count}, ${current_year}, ${image_url}, ${cgpa});`;
        }
      } else if (type === 'project') {
        const { id, title='', description='', tags='', link='', date='', image_urls='', show_on_home=false } = data || {};
        if (id) {
          await sql`UPDATE projects SET title=${title}, description=${description}, tags=${tags}, link=${link}, date=${date}, image_urls=${image_urls}, show_on_home=${show_on_home} WHERE id=${id};`;
        } else {
          await sql`INSERT INTO projects (title, description, tags, link, date, image_urls, show_on_home) VALUES (${title}, ${description}, ${tags}, ${link}, ${date}, ${image_urls}, ${show_on_home});`;
        }
      } else if (type === 'experience') {
        const { id, role='', organization='', description='', date='' } = data || {};
        if (id) {
          await sql`UPDATE experience SET role=${role}, organization=${organization}, description=${description}, date=${date} WHERE id=${id};`;
        } else {
          await sql`INSERT INTO experience (role, organization, description, date) VALUES (${role}, ${organization}, ${description}, ${date});`;
        }
      } else if (type === 'skill') {
        const { name='', category='' } = data || {};
        await sql`INSERT INTO skills (name, category) VALUES (${name}, ${category});`;
      } else if (type === 'education') {
        const { id, degree='', institution='', year='', score='', score_label='' } = data || {};
        if (id) {
            await sql`UPDATE education SET degree=${degree}, institution=${institution}, year=${year}, score=${score}, score_label=${score_label} WHERE id=${id};`;
        } else {
            await sql`INSERT INTO education (degree, institution, year, score, score_label) VALUES (${degree}, ${institution}, ${year}, ${score}, ${score_label});`;
        }
      } else if (type === 'certification') {
        const { id, name='', status='', link='', image_url='', show_on_home=false } = data || {};
        if (image_url && image_url.length > 3000000) {
          return response.status(400).json({ error: 'Image exceeds 2MB size limit' });
        }
        if (id) {
          await sql`UPDATE certifications SET name=${name}, status=${status}, link=${link}, image_url=${image_url}, show_on_home=${show_on_home} WHERE id=${id};`;
        } else {
          await sql`INSERT INTO certifications (name, status, link, image_url, show_on_home) VALUES (${name}, ${status}, ${link}, ${image_url}, ${show_on_home});`;
        }
      }
      return response.status(200).json({ success: true });
    }

    if (method === 'DELETE') {
      const { id, type } = request.query;
      if (type === 'project') await sql`DELETE FROM projects WHERE id = ${id};`;
      if (type === 'experience') await sql`DELETE FROM experience WHERE id = ${id};`;
      if (type === 'skill') await sql`DELETE FROM skills WHERE id = ${id};`;
      if (type === 'education') await sql`DELETE FROM education WHERE id = ${id};`;
      if (type === 'certification') await sql`DELETE FROM certifications WHERE id = ${id};`;
      return response.status(200).json({ success: true });
    }

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
