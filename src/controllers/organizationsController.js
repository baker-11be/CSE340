import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganization } from '../models/projects.js';

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

export { showOrganizations, showOrganizationDetails };
