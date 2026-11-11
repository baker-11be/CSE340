import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT category_id, name
        FROM public.categories
        ORDER BY name;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getCategoryById = async (id) => {
    const query = `
        SELECT category_id, name
        FROM public.categories
        WHERE category_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0] ?? null;
};

const getProjectsByCategoryId = async (id) => {
    const query = `
        SELECT
            project.project_id,
            project.title,
            project.description,
            project.location,
            TO_CHAR(project.project_date, 'FMMonth DD, YYYY') AS project_date_display,
            organization.organization_id,
            organization.name AS organization_name,
            STRING_AGG(DISTINCT category.name, ', ' ORDER BY category.name) AS category_names
        FROM public.service_projects AS project
        JOIN public.organizations AS organization
            ON organization.organization_id = project.organization_id
        JOIN public.project_categories AS project_category
            ON project_category.project_id = project.project_id
        JOIN public.categories AS category
            ON category.category_id = project_category.category_id
        WHERE category.category_id = $1
        GROUP BY
            project.project_id,
            project.title,
            project.description,
            project.location,
            project.project_date,
            organization.organization_id,
            organization.name
        ORDER BY project.project_date ASC, project.title ASC;
    `;

    const result = await db.query(query, [id]);

    return result.rows;
};

export { getAllCategories, getCategoryById, getProjectsByCategoryId };
