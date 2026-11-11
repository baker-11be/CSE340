import {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId
} from '../models/categories.js';

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

export { showCategories, showCategoryDetails };
