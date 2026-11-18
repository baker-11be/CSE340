import express from 'express';
import {
    showOrganizations,
    showOrganizationDetails,
    organizationValidation,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm
} from '../controllers/organizationsController.js';

const router = express.Router();

router.get('/organizations', showOrganizations);
router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);
router.get('/organization/:id', showOrganizationDetails);

export default router;
