# Three-Tier Todo App — Full DevOps Project

A production-grade, containerized three-tier web application built to showcase end-to-end DevOps engineering. Features a React frontend, an Express + Bun TypeScript backend, and a MongoDB database — deployed through two complete infrastructure paths: Docker Compose (for local/staging) and Kubernetes on k3s (for production), both driven by a Jenkins CI/CD pipeline with webhook-triggered builds.

-----

## Architecture Overview

```
Developer pushes to GitHub
         │
         ▼ (webhook)
┌─────────────────────────────────────────┐
│            Jenkins EC2 Instance         │
│  ┌──────────────────────────────────┐   │
│  │       Declarative Pipeline       │   │
│  │  Detect → Build → Test → Push    │   │
│  │         → Deploy to k3s          │   │
│  └──────────────────────────────────┘   │
└────────────────────┬────────────────────┘
                     │ kubectl (kubeconfig secret)
                     ▼
┌─────────────────────────────────────────┐
│         k3s EC2 Instance (t3.small)     │
│         Elastic IP: stable public IP    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │       Traefik Ingress           │    │
│  │  /  → frontend  /api → backend  │    │
│  └──────┬──────────────┬───────────┘    │
│         │              │                │
│  ┌──────▼──────┐ ┌─────▼──────┐        │
│  │  Frontend   │ │  Backend   │        │
│  │ Deployment  │ │ Deployment │        │
│  │  2 replicas │ │  2 replicas│        │
│  └─────────────┘ └─────┬──────┘        │
│                         │              │
│                  ┌──────▼──────┐       │
│                  │  MongoDB    │       │
│                  │ StatefulSet │       │
│                  │  + PVC      │       │
│                  └─────────────┘       │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │   Sealed Secrets Controller      │  │
│  │   (Bitnami) — decrypts secrets   │  │
│  │   committed safely to GitHub     │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

-----

## Tech Stack

|Layer             |Technology                                           |
|------------------|-----------------------------------------------------|
|Frontend          |React 18, Vite, Tailwind CSS                         |
|Backend           |Express.js, Bun, TypeScript                          |
|Database          |MongoDB, Mongoose ODM                                |
|Containerization  |Docker, Docker Compose                               |
|Container Registry|Docker Hub                                           |
|CI/CD             |Jenkins (declarative pipeline, multibranch)          |
|Kubernetes        |k3s on EC2 (t3.small)                                |
|Ingress           |Traefik (k3s built-in)                               |
|Secret Management |Bitnami Sealed Secrets                               |
|Storage           |k3s local-path StorageClass (PVC per StatefulSet pod)|
|Webhook Trigger   |Multibranch Scan Webhook Trigger plugin              |
|Image Tagging     |Dynamic — Jenkins `BUILD_NUMBER`                     |

-----

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile               # Multi-stage: Vite build → nginx:alpine
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── index.ts             # Express server entry point
│   │   ├── config/db.ts         # MongoDB connection (constructs URI from parts)
│   │   ├── models/todo.model.ts
│   │   ├── controllers/todo.controller.ts
│   │   └── routes/todo.routes.ts
│   ├── tests/
│   │   └── todo.controller.test.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── k8s/                         # All Kubernetes manifests
│   ├── mongodb-configmap.yml    # MONGO_HOST, MONGO_DB
│   ├── mongodb-sealed-secret.yml  # Encrypted credentials (safe to commit)
│   ├── mongodb-statefulset.yml  # StatefulSet + headless service + volumeClaimTemplate
│   ├── backend-deployment.yml   # Deployment + ClusterIP service
│   ├── frontend-deployment.yml  # Deployment + ClusterIP service
│   ├── mongo-express-deployment.yml  # Deployment + NodePort :30001
│   ├── ingress.yml              # Traefik ingress rules
│   └── k3s-config.yaml          # GITIGNORED — local kubectl access only
│
├── docker-compose.yml           # Local/staging full stack
├── Jenkinsfile                  # Declarative CI/CD pipeline
├── pub-cert.pem                 # Sealed Secrets public key (safe to commit)
└── README.md
```

-----

## API Endpoints

|Method|Endpoint    |Description                          |
|------|------------|-------------------------------------|
|`GET` |`/api/todos`|Fetch all todos, sorted by newest    |
|`POST`|`/api/todos`|Create a new todo `{ title: string }`|
|`GET` |`/health`   |Health check                         |

-----

## Environment Variables

### Backend (injected via Kubernetes ConfigMap + Sealed Secret)

|Variable        |Source         |Description                 |
|----------------|---------------|----------------------------|
|`MONGO_HOST`    |ConfigMap      |MongoDB headless service DNS|
|`MONGO_DB`      |ConfigMap      |Database name               |
|`MONGO_USERNAME`|Sealed Secret  |MongoDB root username       |
|`MONGO_PASSWORD`|Sealed Secret  |MongoDB root password       |
|`PORT`          |Deployment YAML|Server port (3100)          |
|`FRONTEND_URL`  |Deployment YAML|CORS allowed origin         |

The backend constructs the MongoDB URI internally:

```typescript
const uri = `mongodb://${username}:${password}@${host}:27017/${db}?authSource=admin`;
```

### Frontend

|Variable      |Set at                           |Description         |
|--------------|---------------------------------|--------------------|
|`VITE_API_URL`|Docker build time (`--build-arg`)|Backend API base URL|

`VITE_API_URL` is baked into the JavaScript bundle at build time by Vite. It must be passed as a `--build-arg` during `docker build` — setting it in the Deployment YAML has no effect on a compiled frontend.

-----

## Running Locally

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docker.com) and Docker Compose

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
# Create .env file first (see .env.example)
docker compose up --build
```

Open <http://localhost:3000>.

-----

## CI/CD Pipeline

The Jenkinsfile defines a declarative multibranch pipeline. A GitHub webhook triggers a build automatically on every push.

### Pipeline Stages

```
1. Detect changes    → sets CODE_CHANGES env var
2. Build images      → docker build with VITE_API_URL build-arg
3. Test              → bun test (Vitest unit tests)
4. Push to DockerHub → tagged with BUILD_NUMBER
5. Deploy to k3s     → kubectl apply + kubectl set image
6. Rollout status    → blocks until deployment is healthy
```

### Branching Strategy

|Branch|Behavior                                 |
|------|-----------------------------------------|
|`main`|Full pipeline — build, test, push, deploy|
|`dev` |Build and test only — no deploy          |

### Image Tagging

Images are tagged with the Jenkins `BUILD_NUMBER` for full traceability:

```
rasyar/todo-backend:42
rasyar/todo-frontend:42
```

Each build produces a new immutable tag. The deploy stage runs:

```bash
kubectl set image deployment/backend-app backend-app=rasyar/todo-backend:${BUILD_NUMBER}
kubectl set image deployment/frontend-app frontend-app=rasyar/todo-frontend:${BUILD_NUMBER}
```

-----

## Kubernetes Setup

### Objects per Service

**MongoDB:**

- `StatefulSet` — stable pod identity for replica set primary tracking
- Headless `Service` — enables DNS-based pod addressing (`mongodb-statefulset-0.mongodb-headless-service.default.svc.cluster.local`)
- `PersistentVolumeClaim` via `volumeClaimTemplate` — one PVC per pod, provisioned by `local-path` StorageClass

**Backend:**

- `Deployment` — 2 replicas, rolling update strategy
- `ClusterIP Service` — internal access only
- Liveness probe (TCP on :3100) + Readiness probe (HTTP GET /health)

**Frontend:**

- `Deployment` — 2 replicas, nginx serving compiled React bundle
- `ClusterIP Service` — internal access only
- Readiness probe (HTTP GET / on :80)

**Mongo Express:**

- `Deployment` — 1 replica
- `NodePort Service` — accessible at `<EC2-IP>:30001` for admin use only

**Ingress:**

- Traefik `Ingress` resource routing `/` to frontend and `/api` to backend

### Secret Management (Sealed Secrets)

Credentials are never stored in plaintext in the repository. The workflow:

1. Write `mongodb-secret.yml` locally (gitignored)
1. Seal it with the cluster’s public key using `kubeseal`
1. Commit `mongodb-sealed-secret.yml` — encrypted, safe to push
1. The Sealed Secrets controller running in `kube-system` decrypts it at apply time into a standard Kubernetes `Secret`

To seal a new secret:

```bash
kubeseal --format yaml \
  --cert pub-cert.pem \
  --kubeconfig k8s/k3s-config.yaml \
  < mongodb-secret.yml \
  > k8s/mongodb-sealed-secret.yml
```

### Connecting kubectl Locally

```bash
# Copy kubeconfig from k3s server
scp -i your-key.pem ec2-user@<k3s-ip>:/etc/rancher/k3s/k3s.yaml ./k8s/k3s-config.yaml

# Replace 127.0.0.1 with the Elastic IP
# Set KUBECONFIG
export KUBECONFIG=~/path/to/k3s-config.yaml

kubectl get nodes
```

Note: the k3s TLS certificate must include the public IP as a SAN. Configure this in `/etc/rancher/k3s/config.yaml` on the server before first use:

```yaml
tls-san:
  - <elastic-ip>
  - 127.0.0.1
  - <private-ip>
```

-----

## Infrastructure Notes

Two EC2 instances are used:

**Jenkins EC2:**

- Jenkins runs as a Docker container (`jenkins/jenkins:lts`)
- Docker socket mounted so the pipeline can run `docker build` and `docker push`
- `kubectl` installed inside the Jenkins container
- k3s kubeconfig stored as a Jenkins Secret File credential

**k3s EC2 (t3.small):**

- k3s installed directly — lightweight single-node Kubernetes
- Elastic IP assigned for stable webhook and kubectl access
- Sealed Secrets controller, Traefik ingress, and local-path provisioner pre-installed
- Port 6443 open for kubectl API access
- Port 80/443 open for ingress traffic

-----

## License

MIT