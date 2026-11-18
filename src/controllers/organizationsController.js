import { body, validationResult } from 'express-validator';
import {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization,
    updateOrganization
} from '../models/organizations.js';
import { getProjectsByOrganization } from '../models/projects.js';

const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 1000 })
        .withMessage('Organization description must be 1000 characters or fewer'),
    body('contactEmail')
        .trim()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Enter a valid contact email')
        .isLength({ max: 255 })
        .withMessage('Contact email must be 255 characters or fewer'),
    body('logoFilename')
        .trim()
        .notEmpty()
        .withMessage('Logo filename is required')
        .isLength({ max: 255 })
        .withMessage('Logo filename must be 255 characters or fewer')
];

const showOrganizations = async (req, res) => {
    const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const allOrganizations = await getAllOrganizations();
    const normalizedSearch = searchTerm.toLocaleLowerCase();
    const organizations = allOrganizations
        .filter((organization) => {
            const searchableText = `${organization.name} ${organization.description}`.toLocaleLowerCase();
            return searchableText.includes(normalizedSearch);
        })
        .sort((first, second) => first.name.localeCompare(second.name));

    res.render('organizations', {
        title: 'Find an Organization',
        organizations,
        searchTerm
    });
};

const showOrganizationDetails = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const organizationId = Number(req.params.id);
    if (!Number.isSafeInteger(organizationId) || organizationId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const organization = await getOrganizationDetails(organizationId);
    if (!organization) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projects = await getProjectsByOrganization(organizationId);

    res.render('organization', {
        title: organization.name,
        organization,
        projects
    });
};

const showNewOrganizationForm = (req, res) => {
    res.render('new-organization', { title: 'Add New Organization' });
};

const processNewOrganizationForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail, logoFilename } = req.body;
    await createOrganization(name, description, contactEmail, logoFilename);

    req.flash('success', 'Organization created successfully!');
    res.redirect('/organizations');
};

const showEditOrganizationForm = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const organizationId = Number(req.params.id);
    if (!Number.isSafeInteger(organizationId) || organizationId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const organization = await getOrganizationDetails(organizationId);
    if (!organization) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    res.render('edit-organization', {
        title: 'Edit Organization',
        organization
    });
};

const processEditOrganizationForm = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const organizationId = Number(req.params.id);
    if (!Number.isSafeInteger(organizationId) || organizationId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/edit-organization/${organizationId}`);
    }

    const organization = await getOrganizationDetails(organizationId);
    if (!organization) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const { name, description, contactEmail, logoFilename } = req.body;
    await updateOrganization(organizationId, name, description, contactEmail, logoFilename);

    req.flash('success', 'Organization updated successfully!');
    res.redirect(`/organization/${organizationId}`);
};

export {
    showOrganizations,
    showOrganizationDetails,
    organizationValidation,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm
};
