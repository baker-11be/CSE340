import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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

app.get('/organizations', (req, res) => {
  res.render('organizations', { title: 'Our Partner Organizations' });
});

app.get('/projects', (req, res) => {
  res.render('projects', { title: 'Service Projects' });
});

app.get('/categories', (req, res) => {
  res.render('categories', { title: 'Service Project Categories' });
});

app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
  console.log(`Environment: ${nodeEnv}`);
});
