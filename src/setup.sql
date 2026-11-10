-- ========================================
-- Organization Table
-- ========================================

BEGIN;

CREATE TABLE IF NOT EXISTS organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

INSERT INTO organization (name, description, contact_email, logo_filename)
SELECT sample.name, sample.description, sample.contact_email, sample.logo_filename
FROM (VALUES
    ('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.svg'),
    ('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.svg'),
    ('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.svg')
) AS sample(name, description, contact_email, logo_filename)
WHERE NOT EXISTS (
    SELECT 1
    FROM organization existing
    WHERE existing.name = sample.name
);

UPDATE organization
SET logo_filename = CASE name
    WHEN 'BrightFuture Builders' THEN 'brightfuture-logo.svg'
    WHEN 'GreenHarvest Growers' THEN 'greenharvest-logo.svg'
    WHEN 'UnityServe Volunteers' THEN 'unityserve-logo.svg'
END
WHERE (name = 'BrightFuture Builders' AND logo_filename <> 'brightfuture-logo.svg')
   OR (name = 'GreenHarvest Growers' AND logo_filename <> 'greenharvest-logo.svg')
   OR (name = 'UnityServe Volunteers' AND logo_filename <> 'unityserve-logo.svg');

CREATE TABLE IF NOT EXISTS project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    project_date DATE NOT NULL,
    UNIQUE (organization_id, title)
);

CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS project_category (
    project_id INTEGER NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

INSERT INTO category (name)
SELECT sample.name
FROM (VALUES
    ('Environmental'),
    ('Educational'),
    ('Community Service'),
    ('Health and Wellness')
) AS sample(name)
WHERE NOT EXISTS (
    SELECT 1
    FROM category existing
    WHERE existing.name = sample.name
);

INSERT INTO project (organization_id, title, description, location, project_date)
SELECT organization.organization_id, sample.title, sample.description, sample.location, sample.project_date
FROM (VALUES
    ('BrightFuture Builders', 'Community Center Renovation', 'Help renovate a shared community space with sustainable materials and accessible facilities.', 'Downtown', DATE '2027-01-16'),
    ('BrightFuture Builders', 'Greenway Cleanup and Repair', 'Remove litter and make small repairs along a well-used neighborhood walking path.', 'River District', DATE '2027-03-20'),
    ('GreenHarvest Growers', 'Urban Garden Workshop', 'Teach neighbors how to grow vegetables using sustainable gardening practices.', 'East Side', DATE '2027-01-23'),
    ('GreenHarvest Growers', 'Healthy Cooking and Nutrition Class', 'Prepare simple meals and share practical nutrition tips using seasonal produce.', 'Community Kitchen', DATE '2027-03-27'),
    ('UnityServe Volunteers', 'Community Food Drive', 'Collect, sort, and pack shelf-stable groceries for households experiencing food insecurity.', 'Citywide', DATE '2027-01-30'),
    ('UnityServe Volunteers', 'Senior Wellness Check-In', 'Visit older neighbors and connect them with helpful community resources.', 'North End', DATE '2027-02-27')
) AS sample(organization_name, title, description, location, project_date)
JOIN organization
    ON organization.name = sample.organization_name
WHERE NOT EXISTS (
    SELECT 1
    FROM project existing
    WHERE existing.organization_id = organization.organization_id
      AND existing.title = sample.title
);

INSERT INTO project_category (project_id, category_id)
SELECT project.project_id, category.category_id
FROM (VALUES
    ('BrightFuture Builders', 'Community Center Renovation', 'Community Service'),
    ('BrightFuture Builders', 'Greenway Cleanup and Repair', 'Environmental'),
    ('GreenHarvest Growers', 'Urban Garden Workshop', 'Environmental'),
    ('GreenHarvest Growers', 'Urban Garden Workshop', 'Educational'),
    ('GreenHarvest Growers', 'Healthy Cooking and Nutrition Class', 'Health and Wellness'),
    ('GreenHarvest Growers', 'Healthy Cooking and Nutrition Class', 'Educational'),
    ('UnityServe Volunteers', 'Community Food Drive', 'Community Service'),
    ('UnityServe Volunteers', 'Senior Wellness Check-In', 'Health and Wellness')
) AS sample(organization_name, project_title, category_name)
JOIN organization
    ON organization.name = sample.organization_name
JOIN project
    ON project.organization_id = organization.organization_id
   AND project.title = sample.project_title
JOIN category
    ON category.name = sample.category_name
WHERE NOT EXISTS (
    SELECT 1
    FROM project_category existing
    WHERE existing.project_id = project.project_id
      AND existing.category_id = category.category_id
);

COMMIT;