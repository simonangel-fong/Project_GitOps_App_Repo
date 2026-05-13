# Project GitOps Demo — Backend

**Goal:** Build a containerized Spring Boot REST API that exposes application health and version endpoints, where the version is configurable via an environment variable. This service is the backend component of a GitOps deployment demo.

---

## Table of Contents

- [Project GitOps Demo — Backend](#project-gitops-demo--backend)
  - [Table of Contents](#table-of-contents)
  - [Module Overview](#module-overview)
  - [Requirements](#requirements)
    - [Functionalities](#functionalities)
    - [Out of Scope](#out-of-scope)
  - [API Endpoints](#api-endpoints)
  - [Project Structure](#project-structure)
  - [Specification](#specification)
  - [Development Steps](#development-steps)
    - [Step 1 — Scaffold the Spring Boot Project](#step-1--scaffold-the-spring-boot-project)
    - [Step 2 — Create the `/health` Endpoint](#step-2--create-the-health-endpoint)
    - [Step 3 — Create the `/version` Endpoint](#step-3--create-the-version-endpoint)
    - [Step 4 — Create the Docker Image](#step-4--create-the-docker-image)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Code Validation Check](#code-validation-check)

---

## Module Overview

A minimal Spring Boot REST API with two endpoints:

- `GET /health` — returns a liveness response
- `GET /version` — returns the application version as JSON

The version defaults to `0.1.0` and can be overridden at runtime via the `APP_VERSION` environment variable. This makes it straightforward to demonstrate different deployed versions without changing application code.

---

## Requirements

### Functionalities

1. Return health status via `GET /health`
2. Return the application version via `GET /version`, read from `APP_VERSION` (default: `0.1.0`)

### Out of Scope

This module is intentionally minimal for GitOps demonstration purposes. The following are excluded from this stage:

- Database integration
- Authentication and authorization
- CI/CD pipeline
- Kubernetes manifests, Helm charts, Argo CD configuration
- Monitoring, logging, and production security hardening

---

## API Endpoints

- GET `/health`

Returns a plain-text liveness response. `OK`

---

- GET `/version`

Returns the current application version as JSON.

**Default response:**

```json
{
  "code": 200,
  "version": "0.1.0",
  "status": "success"
}
```

**With `APP_VERSION=1.2.3`:**

```json
{
  "code": 200,
  "version": "1.2.3",
  "status": "success"
}
```

---

## Project Structure

```
backend/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/gitops/app/
│   │       │   ├── AppApplication.java
│   │       │   └── ApiController.java
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
├── Dockerfile
└── README.md
```

---

## Specification

| Item              | Value        |
| ----------------- | ------------ |
| Java              | 25           |
| Spring Boot       | 4.0.6        |
| Build tool        | Maven        |
| Project directory | `backend/`   |
| Group ID          | `com.gitops` |
| Artifact ID       | `app`        |
| Package type      | JAR          |
| Default port      | `8080`       |

---

## Development Steps

### Step 1 — Scaffold the Spring Boot Project

Create the Maven project under `backend/app/` using [Spring Initializr](https://start.spring.io/) or the CLI.

| Setting      | Value            |
| ------------ | ---------------- |
| Language     | Java             |
| Build tool   | Maven            |
| Group        | `com.gitops`     |
| Artifact     | `app`            |
| Package name | `com.gitops.app` |
| Packaging    | JAR              |
| Dependency   | Spring Web       |

- [x] Project scaffolded under `backend/app/`

---

### Step 2 — Create the `/health` Endpoint

Implement `GET /health` in `ApiController.java`. Expected response: `OK`

- [x] Endpoint created and returns `OK`

---

### Step 3 — Create the `/version` Endpoint

Implement `GET /version` in `ApiController.java`. Read the version from the `APP_VERSION` environment variable using Spring's `@Value` annotation.

```java
@Value("${APP_VERSION:0.1.0}")
private String appVersion;
```

Expected default response:

```json
{
  "code": 200,
  "version": "0.1.0",
  "status": "success"
}
```

```sh
cd backend/app && mvn test
```

- [x] Endpoint created and returns correct JSON
- [x] Version is read from `APP_VERSION`, defaulting to `0.1.0`

---

### Step 4 — Create the Docker Image

Create a multi-stage `Dockerfile` at `backend/Dockerfile`:

- **Stage 1 (builder):** Use Maven wrapper to build the JAR
- **Stage 2 (runtime):** Copy the JAR into a minimal JRE image

**Verify locally:**

```sh
cd backend
docker build -t simonangelfong/gitops-demo:backend-latest .
docker run -d --name gitops-demo-backend -e APP_VERSION=1.2.3 -p 8080:8080 simonangelfong/gitops-demo:backend-latest



curl http://localhost:8080/health
# OK

curl http://localhost:8080/version
# {"code":200,"version":"1.2.3","status":"success"}
```

- [x] Image builds successfully
- [x] Container starts and responds on port 8080
- [x] `/health` returns `OK`
- [x] `/version` returns correct JSON with the value of `APP_VERSION`

---

## Acceptance Criteria

| #   | Criterion                                                                             | Status |
| --- | ------------------------------------------------------------------------------------- | ------ |
| 1   | `GET /health` returns `OK`                                                            | Done   |
| 2   | `GET /version` returns `{"code":200,"version":"0.1.0","status":"success"}` by default | Done   |
| 3   | `GET /version` reflects a custom `APP_VERSION` at runtime                             | Done   |
| 4   | Application starts on port `8080`                                                     | Done   |
| 5   | Docker image builds and container runs successfully                                   | Done   |

---

## Code Validation Check

```sh
cd backend/app

# coding standards and style rules
mvn checkstyle:check
# Security Scanning
mvn dependency-check:check 
# unit test
mvn test
# image-scan
trivy image gitops-backend
```