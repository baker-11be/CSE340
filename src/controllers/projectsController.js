import { body, validationResult } from 'express-validator';
import {
    getAllProjects,
    getProjectDetails,
    createProject,
    updateProject
} from '../models/projects.js';
import {
    getAllCategories,
    getCategoriesByServiceProjectId
} from '../models/categories.js';
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';

const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Project title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required')
        .isLength({ max: 999 })
        .withMessage('Project description must be fewer than 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Project location is required')
        .isLength({ max: 199 })
        .withMessage('Project location must be fewer than 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Project date is required')
        .isISO8601({ strict: true })
        .withMessage('Enter a valid project date'),
    body('organizationId')
        .notEmpty()
        .withMessage('Select an organization')
        .isInt({ min: 1 })
        .withMessage('Select a valid organization')
        .toInt()
];

const showProjects = async (req, res) => {
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
        title: 'Service Projects',
        projects,
        categories,
        searchTerm,
        selectedCategory
    });
};

const showProjectDetails = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projectId = Number(req.params.id);
    if (!Number.isSafeInteger(projectId) || projectId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const project = await getProjectDetails(projectId);
    if (!project) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const categories = await getCategoriesByServiceProjectId(projectId);

    res.render('project', {
        title: project.title,
        project,
        categories
    });
};

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();

    res.render('new-project', {
        title: 'Add New Service Project',
        organizations
    });
};

const processNewProjectForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/new-project');
    }

    const { title, description, location, date, organizationId } = req.body;
    const organization = await getOrganizationDetails(organizationId);
    if (!organization) {
        req.flash('error', 'Select an existing organization.');
        return res.redirect('/new-project');
    }

    await createProject(title, description, location, date, organizationId);

    req.flash('success', 'New service project created successfully!');
    res.redirect('/projects');
};

const showEditProjectForm = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projectId = Number(req.params.id);
    if (!Number.isSafeInteger(projectId) || projectId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const project = await getProjectDetails(projectId);
    if (!project) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const organizations = await getAllOrganizations();

    res.render('edit-project', {
        title: 'Edit Service Project',
        project,
        organizations
    });
};

const processEditProjectForm = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projectId = Number(req.params.id);
    if (!Number.isSafeInteger(projectId) || projectId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/edit-project/${projectId}`);
    }

    const project = await getProjectDetails(projectId);
    if (!project) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const { title, description, location, date, organizationId } = req.body;
    const organization = await getOrganizationDetails(organizationId);
    if (!organization) {
        req.flash('error', 'Select an existing organization.');
        return res.redirect(`/edit-project/${projectId}`);
    }

    await updateProject(projectId, title, description, location, date, organizationId);

    req.flash('success', 'Service project updated successfully!');
    res.redirect(`/project/${projectId}`);
};

export {
    showProjects,
    showProjectDetails,
    projectValidation,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm
};
