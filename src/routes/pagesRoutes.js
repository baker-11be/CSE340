import express from 'express';
import { showHome, showAbout, showSuccessStories } from '../controllers/pagesController.js';

const router = express.Router();

router.get('/', showHome);
router.get('/about', showAbout);
router.get('/success-stories', showSuccessStories);

export default router;
