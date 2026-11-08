import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';

const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'production';
const port = process.env.PORT || 3000;
const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);

const app = express();

app.use(express.static(path.join(directoryName, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(directoryName, 'src', 'views'));

app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/organizations', async (req, res) => {
  const organizations = await getAllOrganizations();
  res.render('organizations', { title: 'Our Partner Organizations', organizations });
});

app.get('/projects', (req, res) => {
  res.render('projects', { title: 'Service Projects' });
});

app.get('/categories', (req, res) => {
  res.render('categories', { title: 'Service Project Categories' });
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