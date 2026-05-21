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
    try { await sql`ALTER TABLE profile ADD COLUMN current_focus TEXT;`; } catch(e) {}
    try { await sql`ALTER TABLE profile ADD COLUMN core_philosophy TEXT;`; } catch(e) {}
    await sql`CREATE TABLE IF NOT EXISTS about_page (id SERIAL PRIMARY KEY, journey_vision TEXT, current_focus TEXT, core_philosophy TEXT, location_text TEXT, languages_list TEXT, academics_text TEXT);`;
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
    await sql`CREATE TABLE IF NOT EXISTS achievements (id SERIAL PRIMARY KEY, title TEXT, description TEXT, category TEXT, date TEXT, link TEXT, image_urls TEXT, show_on_home BOOLEAN DEFAULT FALSE, sort_order INT DEFAULT 0);`;

    if (method === 'POST') {
      if (type === 'profile') {
        const { name='', subtitle='', hero_badge='', email='', phone='', linkedin='', github='', about_text='', location='', languages='', project_count='', club_count='', current_year='', image_url='', cgpa='', current_focus='', core_philosophy='' } = data || {};
        if (image_url && image_url.length > 3000000) {
          return response.status(400).json({ error: 'Image exceeds 2MB size limit' });
        }
        const exists = await sql`SELECT * FROM profile LIMIT 1;`;
        if (exists.rows.length > 0) {
          await sql`UPDATE profile SET name=${name}, subtitle=${subtitle}, hero_badge=${hero_badge}, email=${email}, phone=${phone}, linkedin=${linkedin}, github=${github}, about_text=${about_text}, location=${location}, languages=${languages}, project_count=${project_count}, club_count=${club_count}, current_year=${current_year}, image_url=${image_url}, cgpa=${cgpa}, current_focus=${current_focus}, core_philosophy=${core_philosophy} WHERE id=${exists.rows[0].id};`;
        } else {
          await sql`INSERT INTO profile (name, subtitle, hero_badge, email, phone, linkedin, github, about_text, location, languages, project_count, club_count, current_year, image_url, cgpa, current_focus, core_philosophy) VALUES (${name}, ${subtitle}, ${hero_badge}, ${email}, ${phone}, ${linkedin}, ${github}, ${about_text}, ${location}, ${languages}, ${project_count}, ${club_count}, ${current_year}, ${image_url}, ${cgpa}, ${current_focus}, ${core_philosophy});`;
        }
      } else if (type === 'about_page') {
        const { journey_vision='', current_focus='', core_philosophy='', location_text='', languages_list='', academics_text='' } = data || {};
        const exists = await sql`SELECT * FROM about_page LIMIT 1;`;
        if (exists.rows.length > 0) {
          await sql`UPDATE about_page SET journey_vision=${journey_vision}, current_focus=${current_focus}, core_philosophy=${core_philosophy}, location_text=${location_text}, languages_list=${languages_list}, academics_text=${academics_text} WHERE id=${exists.rows[0].id};`;
        } else {
          await sql`INSERT INTO about_page (journey_vision, current_focus, core_philosophy, location_text, languages_list, academics_text) VALUES (${journey_vision}, ${current_focus}, ${core_philosophy}, ${location_text}, ${languages_list}, ${academics_text});`;
        }
      } else if (type === 'project') {
        const { id, title='', description='', tags='', link='', link_name='', date='', image_urls='', show_on_home=false } = data || {};
        if (id) {
          await sql`UPDATE projects SET title=${title}, description=${description}, tags=${tags}, link=${link}, link_name=${link_name}, date=${date}, image_urls=${image_urls}, show_on_home=${show_on_home} WHERE id=${id};`;
        } else {
          // Find max sort_order to place new project at the end
          const maxOrderRes = await sql`SELECT MAX(sort_order) as max_order FROM projects;`;
          const nextOrder = (maxOrderRes.rows[0]?.max_order || 0) + 1;
          await sql`INSERT INTO projects (title, description, tags, link, link_name, date, image_urls, show_on_home, sort_order) VALUES (${title}, ${description}, ${tags}, ${link}, ${link_name}, ${date}, ${image_urls}, ${show_on_home}, ${nextOrder});`;
        }
      } else if (type === 'reorder-projects') {
        const { ids } = data || {};
        if (Array.isArray(ids)) {
          for (let i = 0; i < ids.length; i++) {
            await sql`UPDATE projects SET sort_order = ${i} WHERE id = ${ids[i]};`;
          }
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
        const { id, name='', status='', link='', link_name='', image_url='', show_on_home=false } = data || {};
        if (image_url && image_url.length > 3000000) {
          return response.status(400).json({ error: 'Image exceeds 2MB size limit' });
        }
        if (id) {
          await sql`UPDATE certifications SET name=${name}, status=${status}, link=${link}, link_name=${link_name}, image_url=${image_url}, show_on_home=${show_on_home} WHERE id=${id};`;
        } else {
          await sql`INSERT INTO certifications (name, status, link, link_name, image_url, show_on_home) VALUES (${name}, ${status}, ${link}, ${link_name}, ${image_url}, ${show_on_home});`;
        }
      } else if (type === 'achievement') {
        const { id, title='', description='', category='', date='', link='', link_name='', image_urls='', show_on_home=false } = data || {};
        if (id) {
          await sql`UPDATE achievements SET title=${title}, description=${description}, category=${category}, date=${date}, link=${link}, link_name=${link_name}, image_urls=${image_urls}, show_on_home=${show_on_home} WHERE id=${id};`;
        } else {
          const maxOrderRes = await sql`SELECT MAX(sort_order) as max_order FROM achievements;`;
          const nextOrder = (maxOrderRes.rows[0]?.max_order || 0) + 1;
          await sql`INSERT INTO achievements (title, description, category, date, link, link_name, image_urls, show_on_home, sort_order) VALUES (${title}, ${description}, ${category}, ${date}, ${link}, ${link_name}, ${image_urls}, ${show_on_home}, ${nextOrder});`;
        }
      } else if (type === 'reorder-achievements') {
        const { ids } = data || {};
        if (Array.isArray(ids)) {
          for (let i = 0; i < ids.length; i++) {
            await sql`UPDATE achievements SET sort_order = ${i} WHERE id = ${ids[i]};`;
          }
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
      if (type === 'achievement') await sql`DELETE FROM achievements WHERE id = ${id};`;
      return response.status(200).json({ success: true });
    }

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
