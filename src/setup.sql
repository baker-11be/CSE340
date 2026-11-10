-- ============================================================
-- src/setup.sql
-- Safe to run repeatedly. Run top to bottom as one script.
-- ============================================================

-- ------------------------------------------------------------
-- 0. DROP (children first, parents last)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS project_categories;
DROP TABLE IF EXISTS service_projects;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS organizations;

-- ------------------------------------------------------------
-- 1. CREATE parents (no foreign keys)
-- ------------------------------------------------------------
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL UNIQUE,
    description     TEXT         NOT NULL,
    contact_email   VARCHAR(255) NOT NULL,
    logo_filename   VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 2. CREATE children (reference parents)
-- ------------------------------------------------------------
CREATE TABLE service_projects (
    project_id      SERIAL PRIMARY KEY,
    organization_id INT          NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT         NOT NULL,
    location        VARCHAR(255) NOT NULL,
    project_date    DATE         NOT NULL,
    CONSTRAINT fk_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(organization_id)
        ON DELETE CASCADE
);

CREATE TABLE project_categories (
    project_id  INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id)  REFERENCES service_projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)      ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 3. INSERT organizations (parent of service_projects)
-- ------------------------------------------------------------
INSERT INTO organizations (name, description, contact_email, logo_filename) VALUES
('BrightFuture Builders',
 'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
 'info@brightfuturebuilders.org', 'brightfuture-logo.svg'),
('GreenHarvest Growers',
 'An urban farming collective promoting food sustainability and education in local neighborhoods.',
 'contact@greenharvest.org', 'greenharvest-logo.svg'),
('UnityServe Volunteers',
 'A volunteer coordination group supporting local charities and service initiatives.',
 'hello@unityserve.org', 'unityserve-logo.svg')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------
-- 4. INSERT categories (parent of project_categories)
-- ------------------------------------------------------------
INSERT INTO categories (name) VALUES
('Community Service'),
('Education'),
('Healthcare'),
('Environmental'),
('Food Assistance')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------
-- 5. INSERT service_projects (needs organizations above)
--    Insert order defines project_id 1..15
-- ------------------------------------------------------------
INSERT INTO service_projects (organization_id, title, description, location, project_date) VALUES
-- BrightFuture Builders (org 1)
(1, 'Community Center Renovation',
    'Help renovate a shared community space with sustainable materials and accessible facilities.',
    'Downtown', '2027-01-16'),                                              -- project_id 1
(1, 'Neighborhood Accessibility Improvements',
    'Improve sidewalks, ramps, and gathering spaces so neighbors of all abilities can participate.',
    'West Side', '2027-02-06'),                                             -- project_id 2
(1, 'Youth Building Skills Workshop',
    'Help young people learn practical construction, repair, and teamwork skills.',
    'Downtown', '2027-02-20'),                                              -- project_id 3
(1, 'Community Tool Library Launch',
    'Prepare donated tools and organize a free lending library for neighborhood improvement projects.',
    'North End', '2027-03-06'),                                             -- project_id 4
(1, 'Greenway Cleanup and Repair',
    'Remove litter and make small repairs along a well-used neighborhood walking path.',
    'River District', '2027-03-20'),                                        -- project_id 5
-- GreenHarvest Growers (org 2)
(2, 'Urban Garden Workshop',
    'Teach neighbors how to grow vegetables using sustainable gardening practices.',
    'East Side', '2027-01-23'),                                             -- project_id 6
(2, 'Community Seedling Distribution',
    'Prepare and distribute vegetable seedlings to households and community gardens.',
    'East Side', '2027-02-13'),                                             -- project_id 7
(2, 'School Garden Mentoring',
    'Work with students to plant and care for a productive school garden.',
    'Central School', '2027-02-27'),                                        -- project_id 8
(2, 'Neighborhood Harvest Day',
    'Harvest fresh produce and share it with local food programs and community members.',
    'East Side', '2027-03-13'),                                             -- project_id 9
(2, 'Healthy Cooking and Nutrition Class',
    'Prepare simple meals and share practical nutrition tips using seasonal produce.',
    'Community Kitchen', '2027-03-27'),                                     -- project_id 10
-- UnityServe Volunteers (org 3)
(3, 'Community Food Drive',
    'Collect, sort, and pack shelf-stable groceries for households experiencing food insecurity.',
    'Citywide', '2027-01-30'),                                              -- project_id 11
(3, 'Park Cleanup Day',
    'Pick up litter, refresh garden beds, and make the neighborhood park welcoming for everyone.',
    'Maple Park', '2027-02-13'),                                            -- project_id 12
(3, 'Senior Wellness Check-In',
    'Visit older neighbors and connect them with helpful community resources.',
    'North End', '2027-02-27'),                                             -- project_id 13
(3, 'Family Resource Fair',
    'Help local families find community services, health resources, and volunteer opportunities.',
    'Civic Center', '2027-03-13'),                                          -- project_id 14
(3, 'After-School Tutoring Circle',
    'Support students with homework and reading in a welcoming after-school program.',
    'Riverside Library', '2027-03-27');                                     -- project_id 15

-- ------------------------------------------------------------
-- 6. INSERT project_categories LAST (both parents now exist)
--    Mappings chosen to be semantically sensible.
-- ------------------------------------------------------------
INSERT INTO project_categories (project_id, category_id) VALUES
(1,  1),  -- Community Center Renovation       -> Community Service
(2,  1),  -- Neighborhood Accessibility        -> Community Service
(3,  2),  -- Youth Building Skills Workshop    -> Education
(4,  1),  -- Community Tool Library Launch     -> Community Service
(5,  4),  -- Greenway Cleanup and Repair       -> Environmental
(6,  4),  -- Urban Garden Workshop             -> Environmental
(7,  5),  -- Community Seedling Distribution   -> Food Assistance
(8,  2),  -- School Garden Mentoring           -> Education
(9,  5),  -- Neighborhood Harvest Day          -> Food Assistance
(10, 3),  -- Healthy Cooking and Nutrition     -> Healthcare
(11, 5),  -- Community Food Drive              -> Food Assistance
(12, 4),  -- Park Cleanup Day                  -> Environmental
(13, 3),  -- Senior Wellness Check-In          -> Healthcare
(14, 1),  -- Family Resource Fair              -> Community Service
(15, 2);  -- After-School Tutoring Circle      -> Education

-- ------------------------------------------------------------
-- 7. VERIFICATION (optional; inspect the output)
-- ------------------------------------------------------------
SELECT 'organizations'      AS table_name, COUNT(*) FROM organizations
UNION ALL
SELECT 'categories',                         COUNT(*) FROM categories
UNION ALL
SELECT 'service_projects',                   COUNT(*) FROM service_projects
UNION ALL
SELECT 'project_categories',                 COUNT(*) FROM project_categories;

SELECT * FROM project_categories;