# CSE 340 Service Network

The CSE 340 Service Network helps people discover local volunteer projects and community organizations. The responsive site includes a photo-led home page, upcoming projects, partner organizations, and service project categories.

## Run the application

Requires Node.js.

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open http://127.0.0.1:3000. The site also serves `/organizations`, `/projects`, and `/categories`.

Use `npm start` to run the server without Nodemon. The app uses `PORT` and `NODE_ENV` environment variables when provided.

Pages are rendered from EJS templates in `src/views/`, with shared header and footer partials in `src/views/partials/`. Styles and images are served from `public/`.

## Deploy to Render

The `render.yaml` Blueprint configures a Node.js web service with `npm ci` and `npm start`. In Render, create a new Blueprint from this GitHub repository and apply the `render.yaml` configuration. Render will provide the public service URL and set its own `PORT`; do not commit `.env` or other secrets.