# BakerSERVE

BakerSERVE helps people discover local volunteer projects and community organizations. The responsive site includes a photo-led home page, searchable organization listings, project filters, and service project categories.

## Run the application

Requires Node.js.

1. Install dependencies with `npm install`.
2. Set `DB_URL` in the ignored `.env` file to your PostgreSQL connection string and apply `src/setup.sql` to that database. The server loads `.env` automatically for local development.
3. Start the development server with `npm run dev`.
4. Open http://127.0.0.1:3000. The site also serves `/organizations`, `/projects`, and `/categories`.

Use `npm start` to run the server without Nodemon. The app uses `PORT` and `NODE_ENV` environment variables when provided.

Pages are rendered from EJS templates in `src/views/`, with shared header and footer partials in `src/views/partials/`. Styles and images are served from `public/`.

## Deploy to Render

The `render.yaml` Blueprint configures a Node.js web service with `npm ci` and `npm start`. In Render, create a new Blueprint from this GitHub repository and apply the `render.yaml` configuration. In the web service's environment settings, set `DB_URL` to the PostgreSQL database's internal connection URL (or external URL if the database is not on Render), then redeploy. Ensure the database has `src/setup.sql` applied. `DB_URL` is intentionally not stored in this repository; do not commit `.env` or other secrets. Render sets the service's `PORT`.