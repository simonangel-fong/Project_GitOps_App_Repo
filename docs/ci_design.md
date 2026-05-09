# CI Pipeline Design

## Overview

This repository is the **source code repo**. A separate **config repo** holds GitOps deployment manifests. The CI pipeline gates code quality, builds and publishes Docker images, and opens a PR in the config repo to trigger deployment via ArgoCD/Flux.

---

## Architecture

```
Dev:     feature/* → PR → main         (daily work)
CI:      Pipeline 3 gates the PR       (automated)
CI:      Pipeline 1 smoke-checks main  (automated)
Lead:    reviews main, decides to release
Lead:    git tag v1.2.3 && git push origin v1.2.3
CI:      Pipeline 2 fires              (automated)
CI:      opens PR in config repo       (automated)
Lead:    reviews + merges config PR    (human gate before deploy)
ArgoCD:  detects merge → deploys       (automated)
```

---

## Branching & Release Flow

```
feature/* (daily dev work)
    ↓  open Pull Request → main
    ↓  Pipeline 3 triggers (CI gate)
    ↓  checks pass + reviewer approves
   main  ←─── protected, no direct push
    ↓  Pipeline 1 triggers (post-merge smoke check)
    ↓
Lead tags: git tag v1.2.3 && git push origin v1.2.3
    ↓  Pipeline 2 triggers (release)
    ↓
config-repo: PR opened with updated image tags
    ↓  Lead reviews + merges
    ↓
ArgoCD detects merge → deploys to production
```

---

## Pipeline Summary

| Pipeline       | Trigger             | Jobs                        | Purpose                              |
| -------------- | ------------------- | --------------------------- | ------------------------------------ |
| **Pipeline 3** | PR targeting `main` | `ci-backend`, `ci-frontend` | Gate: block bad code from merging    |
| **Pipeline 1** | Push to `main`      | `ci-backend`, `ci-frontend` | Smoke check post-merge               |
| **Pipeline 2** | Push `v*.*.*` tag   | `release`, `update-config`  | Build, publish image, open config PR |

> Pipeline 1 and Pipeline 3 share the same jobs and can live in a single workflow file with both triggers.

---

## Pipeline 1 & 3 — CI Jobs

### `ci-backend` (Spring Boot / Java 25)

| #   | Step          | Tool                           |
| --- | ------------- | ------------------------------ |
| 1   | Checkout      | `actions/checkout`             |
| 2   | Setup Java 25 | `actions/setup-java` (temurin) |
| 3   | Cache Maven   | `actions/cache` (`~/.m2`)      |
| 4   | Run tests     | `./mvnw test`                  |
| 5   | Build JAR     | `./mvnw package -DskipTests`   |

### `ci-frontend` (React / Vite / Node 22)

| #   | Step          | Tool                       |
| --- | ------------- | -------------------------- |
| 1   | Checkout      | `actions/checkout`         |
| 2   | Setup Node 22 | `actions/setup-node`       |
| 3   | Cache npm     | `actions/cache` (`~/.npm`) |
| 4   | Install deps  | `npm ci`                   |
| 5   | Lint          | `npm run lint` (ESLint)    |
| 6   | Unit tests    | `npm test` (Vitest)        |
| 7   | Build         | `npm run build`            |

---

## Pipeline 2 — Release Jobs

### `release`

| #   | Step                        | Tool / Notes                               |
| --- | --------------------------- | ------------------------------------------ |
| 1   | Checkout                    | `actions/checkout`                         |
| 2   | Extract version from tag    | `${GITHUB_REF_NAME#v}` → `VERSION` env var |
| 3   | Setup Java 25               | `actions/setup-java`                       |
| 4   | Run backend tests           | `./mvnw test`                              |
| 5   | Build backend JAR           | `./mvnw package -DskipTests`               |
| 6   | Setup Node 22               | `actions/setup-node`                       |
| 7   | Run frontend tests          | `npm test` (Vitest)                        |
| 8   | Build frontend              | `npm run build`                            |
| 9   | Docker login                | `docker/login-action`                      |
| 10  | Build & push backend image  | tags `:VERSION`, `:latest`                 |
| 11  | Build & push frontend image | tags `:VERSION`, `:latest`                 |

### `update-config` (depends on `release`)

| #   | Step                   | Tool / Notes                                   |
| --- | ---------------------- | ---------------------------------------------- |
| 12  | Checkout config repo   | `actions/checkout` + `CONFIG_REPO_PAT`         |
| 13  | Patch image tags       | `yq` — set backend + frontend tag to `VERSION` |
| 14  | Open PR in config repo | `peter-evans/create-pull-request`              |

### Job Dependency

```
release (test → build → push image)
    ↓
update-config (open PR in config repo)
```

---

## Branch & Tag Protection

### Branch Protection (`main`)

| Rule                              | Setting                               |
| --------------------------------- | ------------------------------------- |
| Require PR before merging         | ✅ enabled — no direct push to `main` |
| Require status checks to pass     | `ci-backend`, `ci-frontend`           |
| Require branches to be up to date | ✅ enabled                            |
| Require approvals                 | 1 reviewer minimum                    |
| Dismiss stale reviews on new push | ✅ enabled                            |

### Tag Protection (`v*.*.*`)

Restrict tag creation to **admins / tech lead only** via Settings → Rules → Tag protection.

This ensures the release decision is made by the lead, not individual developers.

---

## Who Does What

| Actor                 | Responsibility                                              |
| --------------------- | ----------------------------------------------------------- |
| **Developer**         | Push to `feature/*`, open PR to `main`                      |
| **Reviewer**          | Approve PR after CI passes                                  |
| **Tech Lead / Admin** | Push release tag `v1.2.3` when `main` is stable             |
| **Tech Lead / Admin** | Review and merge the config repo PR to trigger deploy       |
| **CI (automated)**    | All testing, building, image publishing, config PR creation |
| **ArgoCD / Flux**     | Detect config repo merge, deploy to production              |

---

## Secrets Required

| Secret              | Used in                         | Purpose                     |
| ------------------- | ------------------------------- | --------------------------- |
| `REGISTRY_USERNAME` | Pipeline 2                      | Docker registry login       |
| `REGISTRY_PASSWORD` | Pipeline 2                      | Docker registry login       |
| `CONFIG_REPO_PAT`   | Pipeline 2, `update-config` job | Write access to config repo |

---

## Versioning

- Format: **SemVer** — `v1.2.3` (tag), `1.2.3` (image tag, `APP_VERSION`)
- Tags are created **manually by the tech lead** after confirming `main` is stable
- Docker images are pushed with two tags: `:1.2.3` (immutable) and `:latest`
- The `v` prefix is stripped in CI: `v1.2.3` → `1.2.3` for use as `APP_VERSION`
