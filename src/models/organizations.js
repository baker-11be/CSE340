import db from './db.js';

const getAllOrganizations = async () => {
    const query = `
        SELECT DISTINCT ON (name)
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM public.organizations
        ORDER BY name, organization_id;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getOrganizationDetails = async (id) => {
    const query = `
        SELECT
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM public.organizations
        WHERE organization_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0] ?? null;
};

export { getAllOrganizations, getOrganizationDetails };
