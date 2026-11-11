import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { testConnection } from './src/models/db.js';
import organizationsRoutes from './src/routes/organizationsRoutes.js';
import projectsRoutes from './src/routes/projectsRoutes.js';
import categoriesRoutes from './src/routes/categoriesRoutes.js';
import pagesRoutes from './src/routes/pagesRoutes.js';
import { showNotFound, showServerError } from './src/controllers/errorsController.js';

const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'production';
const port = process.env.PORT || 3000;
const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);

const app = express();

app.use(express.static(path.join(directoryName, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(directoryName, 'src', 'views'));

app.use(pagesRoutes);
app.use(organizationsRoutes);
app.use(projectsRoutes);
app.use(categoriesRoutes);

app.use(showNotFound);
app.use(showServerError);

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