import express from 'express';
import { showCategories, showCategoryDetails } from '../controllers/categoriesController.js';

const router = express.Router();

router.get('/categories', showCategories);
router.get('/category/:id', showCategoryDetails);

export default router;
