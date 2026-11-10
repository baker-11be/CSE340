import db from './db.js';

const getAllProjects = async () => {
    const query = `
        WITH project_details AS (
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
            FROM public.project
            JOIN public.organization
                ON organization.organization_id = project.organization_id
            LEFT JOIN public.project_category
                ON project_category.project_id = project.project_id
            LEFT JOIN public.category
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
            location,
            project_date_display,
            organization_id,
            organization_name,
            organization_contact_email,
            category_names
        FROM unique_projects
        ORDER BY project_date, title;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllProjects };
