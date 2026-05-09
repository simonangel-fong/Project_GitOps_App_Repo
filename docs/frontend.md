# GitOps Project Demo — Implementation Plan: Frontend

- [GitOps Project Demo — Implementation Plan: Frontend](#gitops-project-demo--implementation-plan-frontend)
  - [Overview](#overview)
  - [Frontend — React (Vite)](#frontend--react-vite)
    - [Tech Stack](#tech-stack)
    - [Directory Structure](#directory-structure)
    - [Component Behaviour (`App.jsx`)](#component-behaviour-appjsx)
    - [Environment Variables](#environment-variables)

## Overview

A demo project showcasing a React frontend backed by a Spring Boot REST API.
The frontend renders a colored page whose title and background color are driven entirely by backend configuration, making the app easy to version and deploy via GitOps practices.

---

## Frontend — React (Vite)

### Tech Stack

| Item      | Choice              |
| --------- | ------------------- |
| Language  | JavaScript (ES2022) |
| Framework | React 18            |
| Bundler   | Vite                |
| HTTP      | Native `fetch` API  |
| Styling   | Plain CSS           |

### Directory Structure

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx            # Root component — fetches /api/info, renders page
│   └── App.css            # Minimal layout styles
├── .env                   # VITE_API_URL=http://localhost:8080
├── index.html
├── package.json
└── vite.config.js
```

### Component Behaviour (`App.jsx`)

1. On mount, call `GET $VITE_API_URL/api/info` using the native `fetch` API.
2. While loading: render a neutral loading indicator.
3. On error: render an error message with the failure reason.
4. On success:
   - Set `document.body` background color to `bgColor`.
   - Render page title: `GitOps Project Demo Page - {version} ({bgColor})`.

### Environment Variables

| Variable       | Default                 | Purpose                  |
| -------------- | ----------------------- | ------------------------ |
| `VITE_API_URL` | `http://localhost:8080` | Base URL for backend API |

---
