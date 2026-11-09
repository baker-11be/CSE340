import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT name
        FROM (
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
        ) AS categories
        ORDER BY
            CASE name
                WHEN 'Environmental' THEN 1
                WHEN 'Educational' THEN 2
                WHEN 'Community Service' THEN 3
                WHEN 'Health and Wellness' THEN 4
                ELSE 5
            END,
            name;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllCategories };
