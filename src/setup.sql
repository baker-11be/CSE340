BEGIN;

-- ========================================
-- Organizations
-- ========================================
CREATE TABLE IF NOT EXISTS organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Projects
-- ========================================
CREATE TABLE IF NOT EXISTS project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    project_date DATE NOT NULL,
    UNIQUE (organization_id, title)
);

-- ========================================
-- Categories
-- ========================================
CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- A project can have multiple categories, and a category can have multiple projects.
CREATE TABLE IF NOT EXISTS project_category (
    project_id INTEGER NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- ========================================
-- Sample organizations
-- ========================================
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

-- Correct the filenames from the earlier sample setup, which used .png assets.
UPDATE organization
SET logo_filename = CASE name
    WHEN 'BrightFuture Builders' THEN 'brightfuture-logo.svg'
    WHEN 'GreenHarvest Growers' THEN 'greenharvest-logo.svg'
    WHEN 'UnityServe Volunteers' THEN 'unityserve-logo.svg'
END
WHERE (name = 'BrightFuture Builders' AND logo_filename = 'brightfuture-logo.png')
   OR (name = 'GreenHarvest Growers' AND logo_filename = 'greenharvest-logo.png')
   OR (name = 'UnityServe Volunteers' AND logo_filename = 'unityserve-logo.png');

-- ========================================
-- Sample categories
-- ========================================
INSERT INTO category (name)
SELECT sample.name
FROM (VALUES
    ('Environmental'),
    ('Education & Youth'),
    ('Community Development'),
    ('Food Security'),
    ('Health & Wellness')
) AS sample(name)
WHERE NOT EXISTS (
    SELECT 1
    FROM category existing
    WHERE existing.name = sample.name
);

-- ========================================
-- Sample projects: five for each organization
-- ========================================
INSERT INTO project (organization_id, title, description, location, project_date)
SELECT organization.organization_id, sample.title, sample.description, sample.location, sample.project_date
FROM (VALUES
    ('BrightFuture Builders', 'Community Center Renovation', 'Help renovate a shared community space with sustainable materials and accessible facilities.', 'Downtown', DATE '2027-01-16'),
    ('BrightFuture Builders', 'Neighborhood Accessibility Improvements', 'Improve sidewalks, ramps, and gathering spaces so neighbors of all abilities can participate.', 'West Side', DATE '2027-02-06'),
    ('BrightFuture Builders', 'Youth Building Skills Workshop', 'Help young people learn practical construction, repair, and teamwork skills.', 'Downtown', DATE '2027-02-20'),
    ('BrightFuture Builders', 'Community Tool Library Launch', 'Prepare donated tools and organize a free lending library for neighborhood improvement projects.', 'North End', DATE '2027-03-06'),
    ('BrightFuture Builders', 'Greenway Cleanup and Repair', 'Remove litter and make small repairs along a well-used neighborhood walking path.', 'River District', DATE '2027-03-20'),
    ('GreenHarvest Growers', 'Urban Garden Workshop', 'Teach neighbors how to grow vegetables using sustainable gardening practices.', 'East Side', DATE '2027-01-23'),
    ('GreenHarvest Growers', 'Community Seedling Distribution', 'Prepare and distribute vegetable seedlings to households and community gardens.', 'East Side', DATE '2027-02-13'),
    ('GreenHarvest Growers', 'School Garden Mentoring', 'Work with students to plant and care for a productive school garden.', 'Central School', DATE '2027-02-27'),
    ('GreenHarvest Growers', 'Neighborhood Harvest Day', 'Harvest fresh produce and share it with local food programs and community members.', 'East Side', DATE '2027-03-13'),
    ('GreenHarvest Growers', 'Healthy Cooking and Nutrition Class', 'Prepare simple meals and share practical nutrition tips using seasonal produce.', 'Community Kitchen', DATE '2027-03-27'),
    ('UnityServe Volunteers', 'Community Food Drive', 'Collect, sort, and pack shelf-stable groceries for households experiencing food insecurity.', 'Citywide', DATE '2027-01-30'),
    ('UnityServe Volunteers', 'Park Cleanup Day', 'Pick up litter, refresh garden beds, and make the neighborhood park welcoming for everyone.', 'Maple Park', DATE '2027-02-13'),
    ('UnityServe Volunteers', 'Senior Wellness Check-In', 'Visit older neighbors and connect them with helpful community resources.', 'North End', DATE '2027-02-27'),
    ('UnityServe Volunteers', 'Family Resource Fair', 'Help local families find community services, health resources, and volunteer opportunities.', 'Civic Center', DATE '2027-03-13'),
    ('UnityServe Volunteers', 'After-School Tutoring Circle', 'Support students with homework and reading in a welcoming after-school program.', 'Riverside Library', DATE '2027-03-27')
) AS sample(organization_name, title, description, location, project_date)
JOIN organization
    ON organization.name = sample.organization_name
WHERE NOT EXISTS (
    SELECT 1
    FROM project existing
    WHERE existing.organization_id = organization.organization_id
      AND existing.title = sample.title
);

-- ========================================
-- Associate every sample project with one or more categories
-- ========================================
INSERT INTO project_category (project_id, category_id)
SELECT project.project_id, category.category_id
FROM (VALUES
    ('BrightFuture Builders', 'Community Center Renovation', 'Community Development'),
    ('BrightFuture Builders', 'Community Center Renovation', 'Environmental'),
    ('BrightFuture Builders', 'Neighborhood Accessibility Improvements', 'Community Development'),
    ('BrightFuture Builders', 'Neighborhood Accessibility Improvements', 'Health & Wellness'),
    ('BrightFuture Builders', 'Youth Building Skills Workshop', 'Education & Youth'),
    ('BrightFuture Builders', 'Youth Building Skills Workshop', 'Community Development'),
    ('BrightFuture Builders', 'Community Tool Library Launch', 'Community Development'),
    ('BrightFuture Builders', 'Community Tool Library Launch', 'Environmental'),
    ('BrightFuture Builders', 'Greenway Cleanup and Repair', 'Environmental'),
    ('BrightFuture Builders', 'Greenway Cleanup and Repair', 'Community Development'),
    ('GreenHarvest Growers', 'Urban Garden Workshop', 'Environmental'),
    ('GreenHarvest Growers', 'Urban Garden Workshop', 'Education & Youth'),
    ('GreenHarvest Growers', 'Urban Garden Workshop', 'Food Security'),
    ('GreenHarvest Growers', 'Community Seedling Distribution', 'Environmental'),
    ('GreenHarvest Growers', 'Community Seedling Distribution', 'Food Security'),
    ('GreenHarvest Growers', 'School Garden Mentoring', 'Education & Youth'),
    ('GreenHarvest Growers', 'School Garden Mentoring', 'Food Security'),
    ('GreenHarvest Growers', 'Neighborhood Harvest Day', 'Environmental'),
    ('GreenHarvest Growers', 'Neighborhood Harvest Day', 'Food Security'),
    ('GreenHarvest Growers', 'Neighborhood Harvest Day', 'Community Development'),
    ('GreenHarvest Growers', 'Healthy Cooking and Nutrition Class', 'Health & Wellness'),
    ('GreenHarvest Growers', 'Healthy Cooking and Nutrition Class', 'Food Security'),
    ('GreenHarvest Growers', 'Healthy Cooking and Nutrition Class', 'Education & Youth'),
    ('UnityServe Volunteers', 'Community Food Drive', 'Food Security'),
    ('UnityServe Volunteers', 'Community Food Drive', 'Community Development'),
    ('UnityServe Volunteers', 'Park Cleanup Day', 'Environmental'),
    ('UnityServe Volunteers', 'Park Cleanup Day', 'Community Development'),
    ('UnityServe Volunteers', 'Senior Wellness Check-In', 'Health & Wellness'),
    ('UnityServe Volunteers', 'Family Resource Fair', 'Community Development'),
    ('UnityServe Volunteers', 'Family Resource Fair', 'Health & Wellness'),
    ('UnityServe Volunteers', 'After-School Tutoring Circle', 'Education & Youth')
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
