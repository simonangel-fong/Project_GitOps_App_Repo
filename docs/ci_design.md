# CI Pipeline Design

## Group 1: PR Validation (feature/* → main)

Triggered on pull request and push to feature branches. Purpose: validate changes before merge.

```txt
Pipeline ci-backend-check
trigger:
    pull_request
        from: feature/* → main
        paths: backend/
    push
        feature/*
        paths: backend/
jobs:
    lint (needs: -)
        checkout code
        mvn checkstyle:check

    dependency-scan (needs: lint)
        checkout code
        mvn dependency-check:check          # OWASP Dependency Check, fail on HIGH/CRITICAL

    unit-test (needs: dependency-scan)
        checkout code
        mvn test                            # includes jacoco coverage threshold check

    maven-build (needs: unit-test)
        mvn package -DskipTests

    image-build (needs: maven-build)        # build only, no push
        docker login registry               # credentials from CI secrets
        docker build -t registry/backend:pr-<pr-number> ./backend

    image-scan (needs: image-build)
        trivy image registry/backend:pr-<pr-number>
        fail if HIGH/CRITICAL vulnerabilities found

    notify (on: failure, always)
        notify Slack/email
        message: pipeline, job, branch, commit <sha>, link to run


Pipeline ci-frontend-check
trigger:
    pull_request
        from: feature/* → main
        paths: frontend/
    push
        feature/*
        paths: frontend/
jobs:
    lint (needs: -)
        checkout code
        npm ci
        npm run lint                        # ESLint

    dependency-scan (needs: lint)
        npm audit --audit-level=high        # fail on HIGH/CRITICAL

    unit-test (needs: dependency-scan)
        npm test                            # Vitest with coverage threshold

    npm-build (needs: unit-test)
        npm run build

    image-build (needs: npm-build)          # build only, no push
        docker login registry               # credentials from CI secrets
        docker build -t registry/frontend:pr-<pr-number> ./frontend

    image-scan (needs: image-build)
        trivy image registry/frontend:pr-<pr-number>
        fail if HIGH/CRITICAL vulnerabilities found

    notify (on: failure, always)
        notify Slack/email
        message: pipeline, job, branch, commit <sha>, link to run
```

## Group 2: Release (push to main)

Triggered on push to main (i.e., PR merged). Purpose: build, smoke test, push images, and promote to config repo.

```txt
Pipeline ci-build
trigger:
    push
        branch: main
        paths: backend/, frontend/

jobs:
    detect-changes                          # outputs: backend_changed, frontend_changed
        checkout code
        git diff --name-only HEAD~1 HEAD -- backend/  → backend_changed
        git diff --name-only HEAD~1 HEAD -- frontend/ → frontend_changed

    backend-build (needs: detect-changes)
        checkout code
        mvn test                            # includes jacoco coverage threshold check
        mvn package -DskipTests
        docker login registry               # credentials from CI secrets
        docker build -t registry/backend:<git-sha> ./backend
        trivy image registry/backend:<git-sha>
        fail if HIGH/CRITICAL vulnerabilities found

    frontend-build (needs: detect-changes)
        checkout code
        npm ci
        npm test                            # Vitest with coverage threshold
        npm run build
        docker login registry               # credentials from CI secrets
        docker build -t registry/frontend:<git-sha> ./frontend
        trivy image registry/frontend:<git-sha>
        fail if HIGH/CRITICAL vulnerabilities found

    smoke-test (needs: backend-build, frontend-build)
        docker login registry
        APP_VERSION=<git-sha> docker compose up --wait   # waits for health checks
        run smoke tests (e.g. curl /health, HTTP assertions)
        docker compose down                              # always runs, even on failure

    backend-push (needs: smoke-test)
        if: backend_changed == true
        docker login registry
        docker push registry/backend:<git-sha>
        docker tag  registry/backend:<git-sha> registry/backend:latest
        docker push registry/backend:latest

    frontend-push (needs: smoke-test)
        if: frontend_changed == true
        docker login registry
        docker push registry/frontend:<git-sha>
        docker tag  registry/frontend:<git-sha> registry/frontend:latest
        docker push registry/frontend:latest

    config-repo-pr (needs: backend-push, frontend-push)
        git clone config-repo (using deploy token / SSH key)
        git checkout -b release/<git-sha>
        yq update backend image tag  (if backend_changed)
        yq update frontend image tag (if frontend_changed)
        git commit -m "release: update image tags to <git-sha>"
        git push origin release/<git-sha>
        gh pr create --title "release: <git-sha>" --base main

    notify (on: failure, always)
        notify Slack/email
        message: pipeline, job, branch, commit <sha>, link to run

    notify (on: success of config-repo-pr)
        notify Slack/email
        message: release <git-sha> ready for review — link to config repo PR
```
