import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT
            project.project_id,
            project.title,
            project.description,
            project.location,
            project.project_date,
            TO_CHAR(project.project_date, 'FMMonth DD, YYYY') AS project_date_display,
            organization.organization_id,
            organization.name AS organization_name,
            organization.contact_email AS organization_contact_email,
            STRING_AGG(DISTINCT category.name, ', ' ORDER BY category.name) AS category_names
        FROM public.service_projects AS project
        JOIN public.organizations AS organization
            ON organization.organization_id = project.organization_id
        LEFT JOIN public.project_categories AS project_category
            ON project_category.project_id = project.project_id
        LEFT JOIN public.categories AS category
            ON category.category_id = project_category.category_id
        GROUP BY
            project.project_id,
            project.title,
            project.description,
            project.location,
            project.project_date,
            organization.organization_id,
            organization.name,
            organization.contact_email
        ORDER BY project.project_date, project.title;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
    if (!Number.isInteger(numberOfProjects) || numberOfProjects < 1) {
        throw new RangeError('The number of upcoming projects must be a positive integer.');
    }

    const query = `
        WITH project_details AS (
            SELECT
                project.project_id,
                project.title,
                project.description,
                project.project_date,
                TO_CHAR(project.project_date, 'FMMonth DD, YYYY') AS date,
                project.location,
                organization.organization_id,
                organization.name AS organization_name,
                organization.contact_email AS organization_contact_email,
                STRING_AGG(DISTINCT category.name, ', ' ORDER BY category.name) AS category_names
            FROM public.service_projects AS project
            JOIN public.organizations AS organization
                ON organization.organization_id = project.organization_id
            LEFT JOIN public.project_categories AS project_category
                ON project_category.project_id = project.project_id
            LEFT JOIN public.categories AS category
                ON category.category_id = project_category.category_id
            WHERE project.project_date >= CURRENT_DATE
            GROUP BY
                project.project_id,
                project.title,
                project.description,
                project.project_date,
                project.location,
                organization.organization_id,
                organization.name,
                organization.contact_email
        ),
        unique_projects AS (
            SELECT DISTINCT ON (organization_name, title) *
            FROM project_details
            ORDER BY organization_name, title, project_id, organization_id
        )
        SELECT
            project_id,
            title,
            description,
            date,
            location,
            organization_id,
            organization_name,
            organization_contact_email,
            category_names
        FROM unique_projects
        ORDER BY project_date ASC, title ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);

    return result.rows;
};

const getProjectDetails = async (id) => {
    const query = `
        SELECT
            project.project_id,
            project.title,
            project.description,
            TO_CHAR(project.project_date, 'FMMonth DD, YYYY') AS date,
            TO_CHAR(project.project_date, 'YYYY-MM-DD') AS project_date_input,
            project.location,
            organization.organization_id,
            organization.name AS organization_name
        FROM public.service_projects AS project
        JOIN public.organizations AS organization
            ON organization.organization_id = project.organization_id
        WHERE project.project_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0] ?? null;
};

const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO public.service_projects (title, description, location, project_date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id;
    `;

    const result = await db.query(query, [title, description, location, date, organizationId]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new project with ID:', result.rows[0].project_id);
    }

    return result.rows[0].project_id;
};

const updateProject = async (id, title, description, location, date, organizationId) => {
    const query = `
        UPDATE public.service_projects
        SET title = $1,
            description = $2,
            location = $3,
            project_date = $4,
            organization_id = $5
        WHERE project_id = $6
        RETURNING project_id;
    `;

    const result = await db.query(query, [title, description, location, date, organizationId, id]);

    if (result.rows.length === 0) {
        throw new Error('Project not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated project with ID:', id);
    }

    return result.rows[0].project_id;
};

const getProjectsByOrganization = async (organizationId) => {
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
        LEFT JOIN public.project_categories AS project_category
            ON project_category.project_id = project.project_id
        LEFT JOIN public.categories AS category
            ON category.category_id = project_category.category_id
        WHERE organization.organization_id = $1
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

    const result = await db.query(query, [organizationId]);

    return result.rows;
};

export {
    getAllProjects,
    getUpcomingProjects,
    getProjectDetails,
    getProjectsByOrganization,
    createProject,
    updateProject
};
