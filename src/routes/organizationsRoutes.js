import express from 'express';
import { showOrganizations, showOrganizationDetails } from '../controllers/organizationsController.js';

const router = express.Router();

router.get('/organizations', showOrganizations);
router.get('/organization/:id', showOrganizationDetails);

export default router;
