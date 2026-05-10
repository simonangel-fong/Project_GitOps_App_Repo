# CI Pipeline Design

[Back](../README.md)

## Overview

Three pipelines across two groups:

| Pipeline            | Trigger                                              | Purpose                                    |
| ------------------- | ---------------------------------------------------- | ------------------------------------------ |
| `pr-check-backend`  | push to `feature/*` or PR to `main` (backend paths)  | Validate backend before merge              |
| `pr-check-frontend` | push to `feature/*` or PR to `main` (frontend paths) | Validate frontend before merge             |
| `ci-pipeline-build` | push to `main` (backend or frontend paths)           | Build, test, scan, smoke test, push images |

---

## Group 1: PR Validation

### pr-check-backend

**Features**

- All jobs run in parallel — no sequential bottleneck
- Stale runs cancelled on new push (`cancel-in-progress: true`)
- Image built and scanned locally — never pushed to registry
- Slack notified on failure

**Jobs**

- `lint-check` — Checkstyle (Maven)
- `dependency-scan` — OWASP Dependency Check, fail on HIGH/CRITICAL
- `unit-test` — JUnit with JaCoCo coverage
- `image-build-scan` — Docker build + Trivy scan, fail on HIGH/CRITICAL (fixable only)
- `notify` — Slack on failure

**Workflow**

```txt
                      pull request (feature-* -> main; path: backend/)
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  lint-check  │  dependency-scan  │  unit-test  │  image-build-scan  │
└─────────────────────────────────────────────────────────────────────┘
                                   │ any failure
                                   ▼
                              notify (Slack)
```

---

### pr-check-frontend

**Features**

- All jobs run in parallel
- Stale runs cancelled on new push
- Image built and scanned locally — never pushed to registry
- Slack notified on failure

**Jobs**

- `lint-check` — ESLint
- `unit-test` — Vitest with coverage
- `image-build-scan` — Docker build + Trivy scan, fail on HIGH/CRITICAL (fixable only)
- `notify` — Slack on failure

**Workflow**

```txt
                pull request (feature-* -> main; path: frontbend/)
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  lint-check  │  unit-test  │  image-build-scan  │
└─────────────────────────────────────────────────┘
                        │ any failure
                        ▼
                     notify (Slack)
```

---

## Group 2: Release

### ci-pipeline-build

**Features**

- Detects which component changed — only pushes affected images
- 7 validation jobs run in parallel before smoke test
- Smoke test runs full stack locally via `docker compose` — no registry involved
- Images only pushed to DockerHub after smoke test passes
- Release blocked if any validation or smoke test fails
- Concurrent releases not cancelled — each release runs to completion
- Slack notified on both success and failure

**Jobs**

- `detect-changes` — outputs `backend_changed`, `frontend_changed` from `git diff`
- `backend-lint` — Checkstyle
- `backend-dependency-scan` — OWASP Dependency Check
- `backend-unit-test` — JUnit with JaCoCo coverage
- `backend-image-scan` — Docker build + Trivy scan
- `frontend-lint` — ESLint
- `frontend-unit-test` — Vitest with coverage
- `frontend-image-scan` — Docker build + Trivy scan
- `smoke-test` — `docker compose up --wait` → `curl` → `docker compose down`
- `backend-push` — build + push `backend:<sha>` and `backend:latest` (if backend changed)
- `frontend-push` — build + push `frontend:<sha>` and `frontend:latest` (if frontend changed)
- `notify` — Slack on success and failure

**Workflow**

```txt
                        merge
                          │
                          ▼
                     detect-changes
                          │
          ┌───────────────┼───────────────┐
          │               │               │
  ┌───────┴──────┐        │      ┌────────┴──────┐
  │   Backend    │        │      │    Frontend   │
  │  lint        │        │      │  lint         │
  │  dep-scan    │        │      │  unit-test    │
  │  unit-test   │        │      │  image-scan   │
  │  image-scan  │        │      └───────────────┘
  └───────┬──────┘        │               │
          └───────────────┼───────────────┘
                          │ all must pass
                          ▼
                      smoke-test
                    (local compose)
                          │
               ┌──────────┴──────────┐
               │                     │
          backend-push          frontend-push
         (if changed)           (if changed)
               │                     │
               └──────────┬──────────┘
                          │
                        notify
                  (success or failure)
```
