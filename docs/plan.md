# GitOps Demo App — Implementation Plan

## Overview

A simple full-stack app that displays the version string retrieved from a backend REST API.
Demonstrates GitOps practices with containerized frontend and backend.

---

## Architecture

```
frontend (React)  -->  backend (Spring Boot / Gradle)
                           |
                       APP_VERSION (env var, default: 0.1.0)
```

---

## High-Level File Structure

```
/
├── backend/
│   ├── app/
│   │   └── src/
│   │       ├── main/java/backend/
│   │       └── test/java/backend/
│   ├── Dockerfile
│   └── build.gradle
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Module: Backend (Spring Boot + Gradle)

### Phase 1 — Scaffold Project

- Create Spring Boot project named `GitOpsDemoApp` under `backend/`
- Confirm app starts and health endpoint responds

## Step 1 — App (Spring Boot)

Goal: minimal app for pipeline validation

- create REST API:
  - `GET /version` → returns simple message

- enable health endpoint (Spring Actuator or simple endpoint)
- add 1–2 unit tests

Done when:

- `mvn test` passes locally
- app runs locally

---

### Phase 2 — REST API (hardcoded version)

- Implement `GET /api/` returning `{ "version": "0.1.0" }`
- Enable CORS for local frontend dev
- Manual smoke test (curl / Postman)

### Phase 3 — Version from Environment Variable

- Read `APP_VERSION` env var; fall back to `"0.1.0"` if unset
- Unit test: assert correct value when env var is set vs. absent

### Phase 4 — Dockerfile (multi-stage)

- Stage 1: build JAR with Gradle
- Stage 2: minimal JRE runtime image
- Verify image builds and container responds to `GET /api/version`

---

## Module: Frontend (React)

### Phase 1 — Scaffold Project

- Create React project named `gitOpsDemoApp` under `frontend/`
- Confirm dev server starts

### Phase 2 — Page Layout

- Single centered title: `GitOps Demo App - <version>`
- Green background, no other UI elements

### Phase 3 — Hardcoded Version

- Render title with version placeholder hardcoded (`0.1.0`)
- Confirm layout matches requirements

### Phase 4 — Connect to Backend

- Fetch version from `GET /api/version` on load; render in title
- Wire up `docker-compose.yml` so frontend and backend run together
- End-to-end smoke test: version displayed matches `APP_VERSION`

### Phase 5 — Dockerfile

- Build static assets; serve via lightweight HTTP server (e.g. nginx)
- Verify container serves the page and fetches version correctly

---

## Definition of Done (per phase)

| Check | Criterion                                               |
| ----- | ------------------------------------------------------- |
| Build | Project compiles / bundles without errors               |
| Run   | Container starts and responds as expected               |
| Test  | Unit / integration tests pass                           |
| Smoke | Manual end-to-end test confirms correct version display |
