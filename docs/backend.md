# GitOps Project Demo — Implementation Plan: backend

- [GitOps Project Demo — Implementation Plan: backend](#gitops-project-demo--implementation-plan-backend)
  - [Backend — Spring Boot (Gradle)](#backend--spring-boot-gradle)
    - [Tech Stack](#tech-stack)
    - [Directory Structure](#directory-structure)
    - [REST API](#rest-api)
    - [Environment Variables](#environment-variables)
    - [Configuration Design](#configuration-design)
    - [application.properties](#applicationproperties)

---

## Backend — Spring Boot (Gradle)

### Tech Stack

| Item       | Choice              |
| ---------- | ------------------- |
| Language   | Java 25             |
| Framework  | Spring Boot 3.x     |
| Build tool | Gradle (Kotlin DSL) |
| Packaging  | JAR                 |

### Directory Structure

```
backend/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/backend/
│   │   │   │   ├── App.java                 # Main application entry point
│   │   │   │   ├── controller/
│   │   │   │   │   └── AppController.java
│   │   │   │   └── config/
│   │   │   │       ├── AppProperties.java   # @ConfigurationProperties bean
│   │   │   │       └── WebConfig.java       # CORS configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       └── java/backend/
│   │           └── AppTest.java
│   └── build.gradle
├── gradle/
│   ├── libs.versions.toml
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradle.properties
├── gradlew
├── gradlew.bat
└── settings.gradle
```

### REST API

```
GET /api/info

Response 200 OK
Content-Type: application/json

{
  "version": "0.1.0",
  "bgColor": "white"
}
```

No request parameters. No authentication. Read-only.

### Environment Variables

| Variable          | Default                 | Validation                                                         |
| ----------------- | ----------------------- | ------------------------------------------------------------------ |
| `APP_VERSION`     | `0.1.0`                 | any non-blank string                                               |
| `APP_BG_COLOR`    | `white`                 | must be one of: `white`, `red`, `yellow`, `green`, `blue`, `black` |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | comma-separated origins for CORS                                   |

### Configuration Design

- `AppProperties` uses `@ConfigurationProperties(prefix = "app")` bound from env vars via Spring's relaxed binding (`APP_VERSION` → `app.version`).
- `@Validated` + `@Pattern` on `bgColor` rejects invalid values at startup — fail-fast.
- CORS is configured in `WebConfig` via `WebMvcConfigurer`, driven by `ALLOWED_ORIGINS`.
- No hardcoded values anywhere in application code.

### application.properties

```properties
app.version=${APP_VERSION:0.1.0}
app.bg-color=${APP_BG_COLOR:white}
allowed.origins=${ALLOWED_ORIGINS:http://localhost:5173}
```

---
