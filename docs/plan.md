# GitOps Project Demo — Implementation Plan

- [GitOps Project Demo — Implementation Plan](#gitops-project-demo--implementation-plan)
  - [Overview](#overview)
  - [Repository Structure](#repository-structure)
  - [Backend — Spring Boot (Gradle)](#backend--spring-boot-gradle)
  - [Frontend — React (Vite)](#frontend--react-vite)
  - [Docker Compose](#docker-compose)
    - [Services](#services)
    - [Design decisions](#design-decisions)
  - [Implementation Order](#implementation-order)

## Overview

A demo project showcasing a React frontend backed by a Spring Boot REST API.
The frontend renders a colored page whose title and background color are driven entirely by backend configuration, making the app easy to version and deploy via GitOps practices.

---

## Repository Structure

```
Project_GitOps_App_Repo/
├── backend/                  # Spring Boot (Gradle)
├── frontend/                 # React (Vite)
├── docker-compose.yml        # Runs both services together
└── docs/
    └── plan.md
```

---

## Backend — Spring Boot (Gradle)

- plan:
  - docs/backend.md

## Frontend — React (Vite)

- plan:
  - docs/frontend.md

## Docker Compose

```
docker-compose.yml        # project root
```

### Services

| Service    | Port   | Image strategy                   |
| ---------- | ------ | -------------------------------- |
| `backend`  | `8080` | Built from `backend/Dockerfile`  |
| `frontend` | `5173` | Built from `frontend/Dockerfile` |

### Design decisions

- Both services defined in a single `docker-compose.yml` at the repo root.
- Backend env vars (`APP_VERSION`, `APP_BG_COLOR`) passed via `environment:` block — easy to override per deployment.
- Frontend `VITE_API_URL` set to `http://localhost:8080` for local compose runs.
- Backend container uses a multi-stage Dockerfile: build stage (Gradle + JDK) → runtime stage (JRE only) to keep the image small.
- Frontend container uses a multi-stage Dockerfile: build stage (Node) → runtime stage (Nginx) to serve static files.

---

## Implementation Order

1. **Backend**
   - Scaffold Gradle project
   - Implement `AppProperties`, `AppController`, `WebConfig`
   - Write `AppControllerTest`
   - Write `backend/Dockerfile`

2. **Frontend**
   - Scaffold Vite + React project
   - Implement `App.jsx` with fetch, loading, error, and success states
   - Write `frontend/Dockerfile`

3. **Docker Compose**
   - Write `docker-compose.yml` at repo root
   - Smoke-test: `docker compose up --build`

4. **Docs / README**
   - Update `README.md` with run instructions and env var reference
