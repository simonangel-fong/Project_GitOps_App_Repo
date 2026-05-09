# GitOps Project - Demo App

> A minimal full-stack application demonstrating GitOps practices with containerized services.
> The frontend displays the application version fetched from the backend, where the version is controlled via an environment variable — making it straightforward to verify different deployments end-to-end.

---

## Architecture

```
Browser → frontend (React / nginx :8000) → backend (Spring Boot :8080)
                                                  ↑
                                           APP_VERSION (env var)
```

| Service  | Stack               | Port |
| -------- | ------------------- | ---- |
| Frontend | React + Vite, nginx | 8000 |
| Backend  | Spring Boot (Java)  | 8080 |

---

## API

| Method | Endpoint   | Response                                                 |
| ------ | ---------- | -------------------------------------------------------- |
| GET    | `/health`  | `OK`                                                     |
| GET    | `/version` | `{"code": 200, "version": "0.1.0", "status": "success"}` |

The `version` field reflects the `APP_VERSION` environment variable (default: `0.1.0`).

---
