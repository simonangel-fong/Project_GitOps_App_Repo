# Project GitOps Demo — Frontend

**Goal:** Build a containerized React application that fetches and displays the application version from the backend REST API. This service is the frontend component of a GitOps deployment demo.

---

## Table of Contents

- [Project GitOps Demo — Frontend](#project-gitops-demo--frontend)
  - [Table of Contents](#table-of-contents)
  - [Module Overview](#module-overview)
  - [Requirements](#requirements)
    - [Functionalities](#functionalities)
    - [Out of Scope](#out-of-scope)
  - [UI Specification](#ui-specification)
  - [Project Structure](#project-structure)
  - [Specification](#specification)
  - [Development Steps](#development-steps)
    - [Step 1 — Scaffold the React Project](#step-1--scaffold-the-react-project)
    - [Step 2 — Implement the Page Layout](#step-2--implement-the-page-layout)
    - [Step 3 — Connect to the Backend](#step-3--connect-to-the-backend)
    - [Step 4 — Create the Docker Image](#step-4--create-the-docker-image)
    - [Step 5 — Run with Docker Compose](#step-5--run-with-docker-compose)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Test](#test)

---

## Module Overview

A minimal React single-page application with one page:

- Fetches the application version from `GET /version` on the backend
- Displays the version in a centered title: `GitOps Demo App - <version>`
- Green background, no other UI elements

This makes it easy to verify that different deployments serve different versions end-to-end, without changing any application code.

---

## Requirements

### Functionalities

1. On load, fetch the application version from the backend `GET /version` endpoint
2. Render the version in the page title: `GitOps Demo App - <version>`
3. Display a green background with the title centered on the page

### Out of Scope

This module is intentionally minimal for GitOps demonstration purposes. The following are excluded from this stage:

- User authentication
- Routing or multi-page layout
- State management libraries
- Backend integration beyond the version endpoint
- Production performance optimization

---

## UI Specification

| Element    | Value                               |
| ---------- | ----------------------------------- |
| Layout     | Single centered title, full-page    |
| Background | Green                               |
| Title      | `GitOps Demo App - <version>`       |
| Version    | Fetched from backend `GET /version` |
| Fallback   | Show `loading...` while fetching    |

---

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile
└── README.md
```

---

## Specification

| Item              | Value       |
| ----------------- | ----------- |
| Framework         | React       |
| Language          | JavaScript  |
| Build tool        | Vite        |
| Project directory | `frontend/` |
| Backend URL       | `/version`  |
| Default port      | `3000`      |
| Production server | nginx       |

---

## Development Steps

### Step 1 — Scaffold the React Project

Create the Vite + React project under `frontend/`.

```sh
npm create vite@latest frontend/app -- --template react
cd frontend/app
npm install
```

- [x] Project scaffolded under `frontend/`
- [x] Dev server starts successfully

---

### Step 2 — Implement the Page Layout

Edit `App.jsx` to render a full-page green background with a centered title.

Expected layout:

- Background: green (`#4caf50` or equivalent)
- Title: `GitOps Demo App - 0.1.0` (hardcoded for now)
- Title is centered horizontally and vertically

```sh
cd frontend/app/
npm run dev
```

- [x] Green background renders correctly
- [x] Title is centered on the page

---

### Step 3 — Connect to the Backend

Replace the hardcoded version with a `fetch` call to `GET /version` on page load.

```jsx
const [version, setVersion] = useState("loading...");

useEffect(() => {
  fetch("/version")
    .then((res) => res.json())
    .then((data) => setVersion(data.version));
}, []);
```

The title must update to `GitOps Demo App - <version>` once the response arrives.

```sh
npm run dev
```

- [x] Version is fetched from the backend on load
- [x] Title reflects the backend version value

---

### Step 4 — Create the Docker Image

Create a multi-stage `Dockerfile` at `frontend/Dockerfile`:

- **Stage 1 (builder):** Install dependencies and build static assets with Vite
- **Stage 2 (runtime):** Serve the built assets via nginx

**nginx proxy configuration** — forward `/version` requests to the backend so the frontend container does not need to know the backend's host at build time:

```nginx
server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    location /version {
        resolver 127.0.0.11 valid=5s;
        set $backend ${BACKEND_URL};
        proxy_pass $backend/version;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

**Verify locally** (requires the backend container to be running):

```sh
cd frontend
docker build -t gitops-frontend .

# Page displays: GitOps Demo App - 0.1.0
```

- [ ] Image builds successfully

---

### Step 5 — Run with Docker Compose

Wire the frontend and backend together using `docker-compose.yml` at the project root.

```sh
# default version
docker compose up -d --build
docker compose down

# custom version
APP_VERSION=1.2.3 docker compose up --build

```

- [x] Both services start via `docker compose up`
- [x] Page displays the version matching `APP_VERSION`
- [x] Container starts and serves the page on port `8000`
- [x] Page displays the version fetched from the backend

---

## Acceptance Criteria

| #   | Criterion                                                              | Status |
| --- | ---------------------------------------------------------------------- | ------ |
| 1   | React app scaffolded and dev server starts                             | Done   |
| 2   | Page renders green background with centered title                      | Done   |
| 3   | Version is fetched from `GET /version` and rendered in the title       | Done   |
| 4   | Docker image builds and container serves the page on port `3000`       | Done   |
| 5   | Full stack runs via `docker compose up` with correct version displayed | Done   |

---

## Test

```sh
cd frontend/app

npm run lint
npm test
npm run build
```
