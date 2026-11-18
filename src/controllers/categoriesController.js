import { body, validationResult } from 'express-validator';
import {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId,
    createCategory,
    updateCategory,
    getCategoriesByServiceProjectId,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

const showCategories = async (req, res) => {
    const categories = await getAllCategories();

    res.render('categories', {
        title: 'Service Project Categories',
        categories
    });
};

const showCategoryDetails = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const categoryId = Number(req.params.id);
    if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projects = await getProjectsByCategoryId(categoryId);

    res.render('category-detail', {
        title: category.name,
        category,
        projects
    });
};

const showAssignCategoriesForm = async (req, res) => {
    if (!/^\d+$/.test(req.params.projectId)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projectId = Number(req.params.projectId);
    if (!Number.isSafeInteger(projectId) || projectId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projectDetails = await getProjectDetails(projectId);
    if (!projectDetails) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const [categories, assignedCategories] = await Promise.all([
        getAllCategories(),
        getCategoriesByServiceProjectId(projectId)
    ]);

    res.render('assign-categories', {
        title: 'Assign Categories to Project',
        projectId,
        projectDetails,
        categories,
        assignedCategories
    });
};

const processAssignCategoriesForm = async (req, res) => {
    if (!/^\d+$/.test(req.params.projectId)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const projectId = Number(req.params.projectId);
    if (!Number.isSafeInteger(projectId) || projectId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const project = await getProjectDetails(projectId);
    if (!project) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const submittedIds = req.body.categoryIds ?? [];
    const categoryIdValues = Array.isArray(submittedIds) ? submittedIds : [submittedIds];
    const categoryIds = categoryIdValues.map(value => {
        if (typeof value !== 'string' || !/^\d+$/.test(value)) {
            return NaN;
        }

        return Number(value);
    });

    if (categoryIds.some(id => !Number.isSafeInteger(id) || id < 1)) {
        req.flash('error', 'Select valid project categories.');
        return res.redirect(`/assign-categories/${projectId}`);
    }

    const categories = await getAllCategories();
    const existingCategoryIds = new Set(categories.map(category => category.category_id));
    if (categoryIds.some(id => !existingCategoryIds.has(id))) {
        req.flash('error', 'One or more selected categories no longer exist.');
        return res.redirect(`/assign-categories/${projectId}`);
    }

    await updateCategoryAssignments(projectId, [...new Set(categoryIds)]);
    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/project/${projectId}`);
};

const showNewCategoryForm = (req, res) => {
    res.render('new-category', {
        title: 'Add New Category'
    });
};

const processNewCategoryForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/new-category');
    }

    await createCategory(req.body.name);
    req.flash('success', 'Category created successfully!');
    res.redirect('/categories');
};

const showEditCategoryForm = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const categoryId = Number(req.params.id);
    if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const categoryDetails = await getCategoryById(categoryId);
    if (!categoryDetails) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    res.render('edit-category', {
        title: 'Edit Category',
        categoryDetails
    });
};

const processEditCategoryForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/edit-category/${req.params.id}`);
    }

    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const categoryId = Number(req.params.id);
    if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
        return res.status(404).render('404', { title: 'Page not found' });
    }

    await updateCategory(categoryId, req.body.name);
    req.flash('success', 'Category updated successfully!');
    res.redirect('/categories');
};

export {
    showCategories,
    showCategoryDetails,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
};
