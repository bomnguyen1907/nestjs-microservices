============================================
SEMINAR SUBMISSION — TOPIC No01
NestJS Microservices with gRPC & Docker
============================================

Submission: Week 8

CONTENTS:
- 01-Slides/    : Bài thuyết trình PPTX
- 02-Code/      : Source code đầy đủ
- 03-Manual/    : Hướng dẫn cài đặt và chạy (README.md)
- 04-Demo-Video/: Video demo end-to-end (3 phút)

QUICK START:
1. Đọc 03-Manual/README.md trước
2. Mở terminal trong 02-Code/nestjs-microservices/
3. Chạy: docker-compose up --build
4. Đợi tới khi cả 5 service start xong
5. Mở http://localhost:3000 hoặc test bằng Postman

REQUIREMENT CHECKLIST:
[x] Microservices (3 services, mỗi cái deploy độc lập)
[x] Each service own database (Postgres + MongoDB)
[x] .proto file (2 files: product.proto, order.proto)
[x] Unary RPC (GetProduct, CheckStock, CreateOrder)
[x] Streaming RPC (ListProducts, ListOrdersByUser)
[x] Dockerfile per service (3 files)
[x] docker-compose for whole system
[x] Services communicate via Docker network

BONUS ACHIEVEMENTS:
[x] API Gateway pattern
[x] JWT Authentication

============================================