import express from 'express';
import { showProjects, showProjectDetails } from '../controllers/projectsController.js';

const router = express.Router();

router.get('/projects', showProjects);
router.get('/project/:id', showProjectDetails);

export default router;
