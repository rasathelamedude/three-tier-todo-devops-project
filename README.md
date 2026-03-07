# Three-Tier Todo App with CI/CD Pipeline

A production-grade, containerized three-tier web application built to showcase end-to-end DevOps practices. Features a React frontend, an Express + Bun TypeScript backend, and a MongoDB database — all orchestrated with Docker Compose and deployed through a Jenkins CI/CD pipeline with automated testing and security scanning.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Jenkins Pipeline                 │
│  Test → Build Images → Trivy Scan → Docker Compose  │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │      Docker Compose     │
          └──┬──────────┬───────────┘
             │          │           │
     ┌───────▼──┐ ┌─────▼────┐ ┌───▼──────┐
     │  React   │ │ Express  │ │ MongoDB  │
     │ Frontend │ │ Backend  │ │ Database │
     │  :3000   │ │  :5000   │ │  :27017  │
     └──────────┘ └──────────┘ └──────────┘
```

- **Frontend** — React SPA served via Vite, styled with Tailwind CSS
- **Backend** — Express.js running on Bun for native TypeScript support
- **Database** — MongoDB pulled directly from Docker Hub (no custom image)

---

## Tech Stack

| Layer             | Technology                                  |
| ----------------- | ------------------------------------------- |
| Frontend          | React 18, Vite, Tailwind CSS                |
| Backend           | Express.js, Bun, TypeScript                 |
| Database          | MongoDB, Mongoose ODM                       |
| Containerization  | Docker, Docker Compose                      |
| CI/CD             | Jenkins, Jenkinsfile (declarative pipeline) |
| Security Scanning | Trivy                                       |
| Testing           | Vitest (unit tests)                         |

---

## Project Structure

```
.
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Tailwind directives + global styles
│   ├── index.html
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                    # Express + Bun API
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── config/
│   │   │   └── db.ts           # MongoDB connection
│   │   ├── models/
│   │   │   └── todo.model.ts   # Mongoose schema
│   │   ├── controllers/
│   │   │   └── todo.controller.ts  # GET + POST handlers
│   │   └── routes/
│   │       └── todo.routes.ts  # Route definitions
│   ├── tests/
│   │   └── todo.controller.test.ts  # Unit tests
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml          # Orchestrates all three services
├── Jenkinsfile                 # Declarative CI/CD pipeline
└── README.md
```

---

## API Endpoints

| Method | Endpoint     | Description                           |
| ------ | ------------ | ------------------------------------- |
| `GET`  | `/api/todos` | Fetch all todos, sorted by newest     |
| `POST` | `/api/todos` | Create a new todo `{ title: string }` |
| `GET`  | `/health`    | Health check                          |

**GET `/api/todos` response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "title": "Learn Jenkins",
      "completed": false,
      "createdAt": "..."
    }
  ]
}
```

**POST `/api/todos` body:**

```json
{ "title": "Deploy to production" }
```

---

## Environment Variables

### Backend

| Variable       | Default                            | Description               |
| -------------- | ---------------------------------- | ------------------------- |
| `MONGO_URI`    | `mongodb://localhost:27017/tododb` | MongoDB connection string |
| `PORT`         | `5000`                             | Server port               |
| `FRONTEND_URL` | `http://localhost:3000`            | Allowed CORS origin       |

### Frontend

| Variable       | Default             | Description          |
| -------------- | ------------------- | -------------------- |
| `VITE_API_URL` | _(uses Vite proxy)_ | Backend API base URL |

---

## Running Locally

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docker.com) & Docker Compose
- [Node.js](https://nodejs.org) >= 18 (for frontend)

### Without Docker

```bash
# Terminal 1 — Backend
cd backend
bun install
bun run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev

# MongoDB must be running locally on port 27017
```

### With Docker Compose

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000).

---

## CI/CD Pipeline

The Jenkinsfile defines a declarative pipeline with the following stages:

```
1. Checkout      → Pull source from GitHub
2. Test          → Run bun test in /backend
3. Build         → docker build for frontend and backend images
4. Scan          → trivy image scan on both built images
5. Deploy        → docker compose up -d
6. Notify        → Pipeline result notification
```

### Branching Strategy

| Branch      | Behavior                                    |
| ----------- | ------------------------------------------- |
| `dev`       | Tests → Build → Scan (no deploy)            |
| `main`      | Full pipeline: Test → Build → Deploy → Scan |

---

## License

MIT
