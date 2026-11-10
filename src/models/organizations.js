import db from './db.js';

const getAllOrganizations = async () => {
    const query = `
        SELECT DISTINCT ON (name)
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM public.organization
        ORDER BY name, organization_id;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllOrganizations };
