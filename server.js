import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';

const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'production';
const port = process.env.PORT || 3000;
const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);

const app = express();

app.use(express.static(path.join(directoryName, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(directoryName, 'src', 'views'));

app.get('/', async (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

app.get('/success-stories', (req, res) => {
  res.render('success-stories', { title: 'Success Stories' });
});

app.get('/organizations', async (req, res) => {
  const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const allOrganizations = await getAllOrganizations();
  const organizations = allOrganizations
    .filter((organization) => {
      const searchableText = `${organization.name} ${organization.description}`.toLocaleLowerCase();
      return searchableText.includes(searchTerm.toLocaleLowerCase());
    })
    .sort((first, second) => first.name.localeCompare(second.name));

  res.render('organizations', {
    title: 'Find an Organization',
    organizations,
    searchTerm
  });
});

app.get('/projects', async (req, res) => {
  const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const selectedCategory = typeof req.query.category === 'string' ? req.query.category : '';
  const allProjects = await getAllProjects();
  const categories = await getAllCategories();
  const normalizedSearch = searchTerm.toLocaleLowerCase();
  const projects = allProjects.filter((project) => {
    const searchableText = [
      project.title,
      project.description,
      project.location,
      project.organization_name,
      project.category_names
    ].join(' ').toLocaleLowerCase();
    const matchesSearch = searchableText.includes(normalizedSearch);
    const projectCategories = (project.category_names || '').split(', ');
    const matchesCategory = !selectedCategory || projectCategories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  res.render('projects', {
    title: 'Find a Project',
    projects,
    categories,
    searchTerm,
    selectedCategory
  });
});

app.get('/categories', async (req, res) => {
  const categories = await getAllCategories();
  res.render('categories', { title: 'Service Project Categories', categories });
});

app.use((error, req, res, next) => {
    console.error(`Request failed for ${req.method} ${req.path}:`, error);
    if (res.headersSent) {
        return next(error);
    }
    res.status(500).send('Unable to load this page right now.');
});

app.listen(port, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${port}`);
        console.log(`Environment: ${nodeEnv}`);
    } catch (error) {
        // This will print the ACTUAL error message to the console so you can see what's wrong
        console.error('Error connecting to the database:', error);
        // Removed process.exit(1) so the server stays alive while you fix the issue
    }
});