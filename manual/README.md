# NestJS Microservices Seminar Project

E-commerce backend built with NestJS, gRPC, and Docker — submitted for the "No01. NestJS microservices" seminar topic.

---

## 1. System Overview

A simplified e-commerce backend split into **three independently deployable microservices**:

- **API Gateway** — REST entry point for clients; performs JWT authentication and forwards requests to internal services over gRPC.
- **Product Service** — owns the product catalog (Postgres). Exposes gRPC methods for fetching, listing, and checking stock.
- **Order Service** — owns the order records (MongoDB). Calls the Product Service over gRPC to verify stock and fetch price when creating an order.

Services communicate over **gRPC** inside a private Docker network. Only the API Gateway is exposed to the host.

---

## 2. Architecture

```
                      ┌────────────────┐
        Client ─────► │  API Gateway   │   REST :3000, JWT auth
                      └────────┬───────┘
                               │ gRPC
                  ┌────────────┴────────────┐
                  ▼                         ▼
          ┌──────────────┐          ┌──────────────┐
          │ Product Svc  │ ◄─── gRPC ───┤ Order Svc │
          │   :50051     │          │   :50052     │
          └──────┬───────┘          └──────┬───────┘
                 │                         │
                 ▼                         ▼
            ┌──────────┐              ┌──────────┐
            │ Postgres │              │ MongoDB  │
            └──────────┘              └──────────┘
```

Highlights:
- Each service has its **own database** (decentralized data).
- The Order Service calls the Product Service over gRPC during order creation (service-to-service choreography, no shared DB).
- The API Gateway is the **only entry point** exposed on the host machine.

---

## 3. Technology Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript (Node.js 20) |
| Framework | NestJS 10 |
| Inter-service RPC | gRPC (`@grpc/grpc-js`, `@grpc/proto-loader`) |
| Databases | PostgreSQL 16 (Product), MongoDB 7 (Order) |
| ORM / ODM | TypeORM, Mongoose |
| Authentication | JWT (`@nestjs/jwt`, Passport) |
| Containerization | Docker, docker-compose |

---

## 4. gRPC Methods Implemented

### Product Service — `proto/product.proto`

| Method | Type | Description |
|--------|------|-------------|
| `GetProduct(id)` | **Unary** | Fetch a single product by id |
| `ListProducts()` | **Server Streaming** | Stream all products one by one |
| `CheckStock(product_id, quantity)` | **Unary** | Verify stock availability |

### Order Service — `proto/order.proto`

| Method | Type | Description |
|--------|------|-------------|
| `CreateOrder(user_id, product_id, quantity)` | **Unary** | Create order (calls Product Service for stock + price) |
| `ListOrdersByUser(user_id)` | **Server Streaming** | Stream all orders of a user |

---

## 5. Prerequisites

- **Docker Desktop** with docker-compose v2 (this is the only hard requirement)
- *(Optional)* Node.js 20+ — only if you want to run services outside Docker
- *(Optional)* Postman — for testing both REST and gRPC endpoints

Make sure these ports are free on your host: **3000, 5432, 27017**.

---

## 6. Quick Start (Docker — recommended)

From the project root:

```bash
docker-compose up --build
```

Wait until you see all of the following in the logs:

```
seminar-postgres        | database system is ready to accept connections
seminar-mongodb         | Waiting for connections
seminar-product-service | Product Service is running on gRPC port 50051
seminar-order-service   | Order Service is running on gRPC port 50052
seminar-api-gateway     | API Gateway is running on http://localhost:3000
```

To stop the system:

```bash
docker-compose down
```

To stop and wipe all database data:

```bash
docker-compose down -v
```

---

## 7. Running Locally (Without Docker)

Useful for development. Start the databases in Docker, then run each service with `npm`:

```bash
# 1. Start databases
docker run -d --name pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=products -p 5432:5432 postgres:16-alpine
docker run -d --name mongo -p 27017:27017 mongo:7

# 2. Install dependencies for each service
cd product-service && npm install && cd ..
cd order-service   && npm install && cd ..
cd api-gateway     && npm install && cd ..

# 3. In three separate terminals, start each service:
cd product-service && npm run start:dev
cd order-service   && npm run start:dev
cd api-gateway     && npm run start:dev
```

---

## 8. REST API Reference

Base URL: `http://localhost:3000`

### 8.1. Authentication

**Login**

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "user001", "username": "admin" }
}
```

Demo users (hardcoded for the seminar):

| Username | Password |
|----------|----------|
| admin    | 123456   |
| alice    | alice123 |

### 8.2. Products (public)

**List all products**

```http
GET /products
```

**Get product by id**

```http
GET /products/:id
```

### 8.3. Orders (JWT required)

Include the token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

**Create order**

```http
POST /orders
Content-Type: application/json

{
  "product_id": "<product-uuid>",
  "quantity": 2
}
```

**List my orders**

```http
GET /orders
```

Requests without a valid JWT receive `401 Unauthorized`.

---

## 9. Testing gRPC Services Directly

Each service can be tested independently using Postman's gRPC client.

| Service | Address | Proto file |
|---------|---------|------------|
| Product | `localhost:50051` | `proto/product.proto` |
| Order   | `localhost:50052` | `proto/order.proto`   |

> **Note:** In the default `docker-compose.yml`, the gRPC ports (50051, 50052) are **not** exposed to the host because real microservices should only communicate internally. To test gRPC directly from the host, add `ports: ["50051:50051"]` (and `["50052:50052"]`) under the corresponding service in `docker-compose.yml`, or run the services locally (see Section 7).

---

## 10. Project Structure

```
nestjs-microservices/
├── docker-compose.yml            ← orchestrates the entire system
├── README.md                     ← this file
├── proto/                        ← shared .proto definitions
│   ├── product.proto
│   └── order.proto
├── api-gateway/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nest-cli.json
│   ├── package.json
│   └── src/
│       ├── auth/                 (login, JWT strategy, guard)
│       ├── product/              (REST → gRPC client)
│       ├── order/                (REST → gRPC client)
│       ├── proto/                (proto copies)
│       ├── interfaces.ts
│       ├── app.module.ts
│       └── main.ts
├── product-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nest-cli.json
│   ├── package.json
│   └── src/
│       ├── proto/
│       ├── product.entity.ts
│       ├── product.controller.ts (gRPC handlers)
│       ├── seed.ts
│       ├── app.module.ts
│       └── main.ts
└── order-service/
    ├── Dockerfile
    ├── .dockerignore
    ├── nest-cli.json
    ├── package.json
    └── src/
        ├── proto/
        ├── order.schema.ts
        ├── order.controller.ts   (gRPC handlers)
        ├── product.interface.ts
        ├── app.module.ts
        └── main.ts
```

---

## 11. Environment Variables

These are configured automatically by `docker-compose.yml`. Listed here for reference if you run services manually.

| Variable | Used by | Default | Description |
|----------|---------|---------|-------------|
| `DB_HOST` | product-service | `localhost` | Postgres hostname |
| `MONGO_URI` | order-service | `mongodb://localhost:27017/orders` | MongoDB connection string |
| `PRODUCT_SERVICE_URL` | order-service, api-gateway | `localhost:50051` | Product gRPC endpoint |
| `ORDER_SERVICE_URL` | api-gateway | `localhost:50052` | Order gRPC endpoint |

Inside Docker, hostnames are overridden to use service names (`postgres`, `mongodb`, `product-service`, `order-service`).

---

## 12. End-to-End Test Walkthrough

After `docker-compose up --build` completes, run the following four requests in Postman to verify everything works.

**Step 1 — List products**

```http
GET http://localhost:3000/products
```

Expected: an array of 5 products (the seeded catalog).

**Step 2 — Login**

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{ "username": "admin", "password": "123456" }
```

Expected: JSON containing `access_token`. Copy this value.

**Step 3 — Verify JWT protection**

```http
POST http://localhost:3000/orders
Content-Type: application/json

{ "product_id": "<any product id>", "quantity": 1 }
```

Expected (no token): `401 Unauthorized`. This proves the JWT guard is active.

**Step 4 — Create order with token**

Same request, but with header `Authorization: Bearer <access_token>`.

Expected: a new order with `status: "confirmed"` and `total_price` equal to product price × quantity. Behind the scenes, this single request triggers:

1. API Gateway validates the JWT and forwards the call to Order Service (gRPC).
2. Order Service calls `CheckStock` on Product Service (gRPC).
3. Order Service calls `GetProduct` on Product Service (gRPC) to obtain price.
4. Order Service persists the order in MongoDB.
5. The created order propagates back through Gateway to the client.

---

## 13. Troubleshooting

**`Port already in use` (5432, 27017, or 3000)**
Another service on your machine is using that port. Stop it, or remap the host port in `docker-compose.yml`.

**`12 UNIMPLEMENTED` on a gRPC call**
The controller is not registered in the service's `app.module.ts`. Ensure `controllers: [YourController]` is present.

**`Cannot find module './proto/xxx.proto'` at runtime**
The `nest-cli.json` is missing the `assets` section that copies `.proto` files into `dist/` during build.

**`getaddrinfo ENOTFOUND product-service`**
The hostname `product-service` only resolves inside the Docker network. Services must run via docker-compose (not standalone) to reach each other by service name.

**Fields become `undefined` between services**
gRPC may auto-convert `snake_case` ↔ `camelCase`. To keep proto field names consistent, all gRPC server and client configurations include `loader: { keepCase: true }`.

**`docker-compose up --build` hangs at `npm install`**
Increase Docker Desktop memory in Settings → Resources (set to 4 GB or more).

**Postgres connection refused on first start**
Product Service may try to connect before Postgres finishes initializing. The `healthcheck` and `depends_on: condition: service_healthy` in `docker-compose.yml` handle this. If you still see it, simply restart the affected container: `docker restart seminar-product-service`.

---

## 14. Bonus Features Implemented

| Bonus | Status | Implementation |
|-------|--------|----------------|
| API Gateway | ✅ | NestJS HTTP server forwarding to gRPC services |
| Authentication | ✅ | JWT via `@nestjs/jwt` + Passport, guards on `/orders/*` |

---

## 15. References

- NestJS Microservices: https://docs.nestjs.com/microservices/basics
- NestJS gRPC transport: https://docs.nestjs.com/microservices/grpc
- gRPC official docs: https://grpc.io/docs/
- Protocol Buffers language guide: https://protobuf.dev/programming-guides/proto3/

---

## 16. Author

**[Your Full Name]**
Class: 
Student ID: 22302958
Submission: Week 8 — Seminar Topic **No01. NestJS Microservices**
