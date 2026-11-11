import { getCategoriesByProjectId, getProjectDetails, getUpcomingProjects } from '../models/projects.js';
import { getAllCategories } from '../models/categories.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const showProjects = async (req, res) => {
    const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const selectedCategory = typeof req.query.category === 'string' ? req.query.category : '';
    const allProjects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
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
        title: 'Upcoming Service Projects',
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

    const categories = await getCategoriesByProjectId(projectId);

    res.render('project', {
        title: project.title,
        project,
        categories
    });
};

export { showProjects, showProjectDetails };
