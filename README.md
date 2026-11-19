# Lootlane scaffold

A small Next.js frontend and Node.js server scaffold for a loot-box product concept. The frontend contains home, box catalog, an elemental ability spinner at `/open`, and a browser-persisted demo-credit inventory at `/account`. Box purchases, ability values, and selling are simulated locally; the spinner does not use the backend or real-money payments.

## Requirements

- Node.js 18.18 or newer
- npm

## Run the frontend

```powershell
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run the server

In a second terminal:

```powershell
cd server
npm run dev
```

The health endpoint is available at [http://localhost:4000/health](http://localhost:4000/health). Set `PORT` to use a different port.

## Deploy to Render

The Render Blueprint defines two Node.js web services so the Next.js site and the Node.js API keep their existing separate roots:

- `lootlane-web` builds from `client/` with `npm install && npm run build` and starts with `npm start`.
- `lootlane-api` builds from `server/` with `npm install && npm run build` and starts with `npm start`. Its `/health` endpoint is used for Render health checks.

To deploy, push the repository to GitHub's `main` branch, then in Render choose **New → Blueprint**, connect the repository, and apply the services listed in `render.yaml`. Both services auto-deploy on commits to `main`. Render supplies `PORT` to each service; no application secrets or additional environment variables are currently required. The frontend is not yet configured to call the API.
