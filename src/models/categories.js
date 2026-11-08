import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT name
        FROM public.category
        UNION
        SELECT required.name
        FROM (VALUES
            ('Environmental'),
            ('Educational'),
            ('Community Service'),
            ('Health and Wellness')
        ) AS required(name)
        ORDER BY name;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllCategories };
