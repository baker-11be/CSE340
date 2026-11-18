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

const getCategoriesByServiceProjectId = async (projectId) => {
    const query = `
        SELECT category.category_id, category.name
        FROM public.categories AS category
        JOIN public.project_categories AS project_category
            ON project_category.category_id = category.category_id
        WHERE project_category.project_id = $1
        ORDER BY category.name;
    `;

    const result = await db.query(query, [projectId]);

    return result.rows;
};

const createCategory = async (name) => {
    const query = `
        INSERT INTO public.categories (name)
        VALUES ($1)
        RETURNING category_id;
    `;

    const result = await db.query(query, [name]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new category with ID:', result.rows[0].category_id);
    }

    return result.rows[0].category_id;
};

const updateCategory = async (id, name) => {
    const query = `
        UPDATE public.categories
        SET name = $1
        WHERE category_id = $2
        RETURNING category_id;
    `;

    const result = await db.query(query, [name, id]);

    if (result.rows.length === 0) {
        throw new Error('Category not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated category with ID:', id);
    }

    return result.rows[0].category_id;
};

const assignCategoryToProject = async (projectId, categoryId, client = db) => {
    const query = `
        INSERT INTO public.project_categories (project_id, category_id)
        VALUES ($1, $2);
    `;

    await client.query(query, [projectId, categoryId]);
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');
        await client.query(
            'DELETE FROM public.project_categories WHERE project_id = $1;',
            [projectId]
        );

        for (const categoryId of categoryIds) {
            await assignCategoryToProject(projectId, categoryId, client);
        }

        await client.query('COMMIT');
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Failed to roll back category assignment transaction:', rollbackError);
        }
        throw error;
    } finally {
        client.release();
    }
};

export {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesByServiceProjectId,
    createCategory,
    updateCategory,
    updateCategoryAssignments
};
