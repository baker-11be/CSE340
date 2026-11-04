# CSE340

## Run the Express application

Requires Node.js with support for `--env-file` (Node.js 20.6 or newer).

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open http://127.0.0.1:3000 to view the home page. The site also serves `/organizations` and `/projects`.

The local `.env` file sets `PORT=3000` and `NODE_ENV=development`; it is ignored by Git. Use `npm start` to run the server without Nodemon.

Pages are rendered from EJS templates in `src/views/`, with shared header and footer partials in `src/views/partials/`.

Place the supplied logo images in `public/images/` using these filenames: `cse340-service-network.png`, `brightfuture-logo.png`, `greenharvest-logo.png`, and `unityserve-logo.png`.