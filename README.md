<br># 🎬 CineVN — Hệ Thống Đặt Vé Xem Phim Trực Tuyến

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20ECR-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)

**Nền tảng đặt vé xem phim hiện đại với chọn ghế real-time, thanh toán MoMo, và quản trị toàn diện.**

[Tính Năng](#-tính-năng-chính) · [Kiến Trúc](#-kiến-trúc-hệ-thống) · [Cài Đặt](#-cài-đặt-và-chạy-dự-án) · [API Docs](#-api-endpoints) · [Triển Khai](#-triển-khai-cicd)

</div>

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Cài Đặt và Chạy Dự Án](#-cài-đặt-và-chạy-dự-án)
- [Biến Môi Trường](#-biến-môi-trường)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Triển Khai CI/CD](#-triển-khai-cicd)
- [Đóng Góp](#-đóng-góp)
- [Giấy Phép](#-giấy-phép)

---

## 🎯 Giới Thiệu

**CineVN** là hệ thống đặt vé xem phim trực tuyến full-stack, được xây dựng với kiến trúc hiện đại, tập trung vào:

- 🪑 **Chọn ghế real-time** qua WebSocket — ghế được cập nhật tức thì trên tất cả trình duyệt
- 🔒 **Chống đặt trùng vé (Double-booking)** bằng cơ chế khóa ghế tạm thời với Redis TTL + Pessimistic Locking
- 💳 **Tích hợp thanh toán MoMo** với cơ chế IPN callback tự động
- 📧 **Gửi vé điện tử QR Code** qua email sau khi thanh toán thành công
- 🎬 **Nhập phim tự động từ TMDB** (The Movie Database)

---

## ✨ Tính Năng Chính

### 👤 Dành Cho Khách Hàng
| Tính năng | Trạng thái |
|---|---|
| Đăng nhập / Đăng ký với OTP xác minh email | ✅ |
| Quản lý tài khoản cá nhân | ✅ |
| Xem danh sách phim đang chiếu & sắp chiếu | ✅ |
| Xem chi tiết phim (trailer, diễn viên, thể loại) | ✅ |
| Chọn suất chiếu & đặt ghế real-time (WebSocket) | ✅ |
| Thanh toán trực tuyến qua MoMo | ✅ |
| Nhận vé điện tử QR Code qua email | ✅ |
| Lịch sử mua vé & E-Ticket | 🔄 |
| Đánh giá & bình luận phim | 📋 |

### 🛡️ Dành Cho Quản Trị Viên
| Tính năng | Trạng thái |
|---|---|
| Quản lý rạp & phòng chiếu (CRUD) | ✅ |
| Quản lý phim (CRUD + nhập từ TMDB) | ✅ |
| Cấu hình sơ đồ ghế (hàng, cột, loại ghế) | ✅ |
| Quản lý lịch chiếu | ✅ |
| Cấu hình giá vé tự động (loại phòng, định dạng, khung giờ) | ✅ |
| Quản lý khuyến mãi & mã giảm giá | 📋 |
| Báo cáo thống kê doanh thu | 📋 |

> **Chú thích:** ✅ Hoàn thành · 🔄 Đang phát triển · 📋 Dự kiến

---

## 🏗 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│   React 19 + Vite + Tailwind CSS v4 + Framer Motion         │
│   WebSocket (STOMP) ◄──────────────────────────┐            │
└──────────────┬─────────────────────────────────┼────────────┘
               │ REST API (HTTP)                 │ WS
               ▼                                 │
┌──────────────────────────────────────────────────────────────┐
│                     SPRING BOOT 4.0.6                        │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Controller│ │  Service   │ │Repository│ │  Security    │  │
│  │  Layer   │►│   Layer    │►│  Layer   │ │  (JWT Auth)  │  │
│  └──────────┘ └────────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐  │
│  │WebSocket │ │  Scheduler │ │ MapStruct│ │ MoMo Gateway │  │
│  │  (STOMP) │ │  (Cron)    │ │ (Mapper) │ │  (Payment)   │  │
│  └──────────┘ └────────────┘ └──────────┘ └──────────────┘  │
└──────────┬───────────────────────────┬───────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│   PostgreSQL 16     │    │     Redis 7.2         │
│   ─────────────     │    │     ──────────        │
│   • Users           │    │     • Seat Locking    │
│   • Movies          │    │     • OTP Storage     │
│   • Cinemas         │    │     • Refresh Tokens  │
│   • Showtimes       │    │     • Session Cache   │
│   • Tickets         │    │                       │
│   • Pricing         │    │                       │
└─────────────────────┘    └──────────────────────┘
```

---

## 🛠 Công Nghệ Sử Dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Java** | 17 | Ngôn ngữ chính |
| **Spring Boot** | 4.0.6 | Framework backend |
| **Spring Security** | — | Xác thực & phân quyền JWT |
| **Spring Data JPA** | — | ORM & truy vấn database |
| **Spring WebSocket** | — | Real-time seat updates (STOMP) |
| **Spring Mail** | — | Gửi email vé QR (Brevo SMTP) |
| **PostgreSQL** | 16 | Database chính (ACID) |
| **Redis** | 7.2 | Khóa ghế, OTP, Token, Cache |
| **Flyway** | — | Database migration & versioning |
| **MapStruct** | 1.6.3 | Entity ↔ DTO mapping (compile-time) |
| **Lombok** | — | Giảm boilerplate code |
| **JJWT** | 0.12.6 | JWT token generation & validation |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **React** | 19 | UI library |
| **Vite** | 8.x | Build tool & dev server |
| **Tailwind CSS** | 4.3 | Styling framework |
| **Framer Motion** | 12.x | Animations & transitions |
| **React Router** | 7.x | Client-side routing |
| **STOMP.js** | 7.3 | WebSocket client |
| **Lucide React** | — | Icon library |

### DevOps & Infrastructure
| Công nghệ | Mục đích |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **AWS ECR** | Container image registry |
| **AWS EC2** | Production server hosting |
| **Nginx** | Frontend static file serving |

---

## 📁 Cấu Trúc Dự Án

```
cinevn/
├── 📂 src/main/java/com/cinema/cinevn/
│   ├── 📂 config/          # Cấu hình (Security, Redis, WebSocket, CORS)
│   ├── 📂 controller/
│   │   ├── 📂 auth/        # API xác thực (Login, Register, OTP, Refresh)
│   │   ├── 📂 admin/       # API quản trị (Cinema, Movie, Showtime, Pricing)
│   │   └── 📂 public_/     # API công khai (Movie, Showtime, Ticket, Payment)
│   ├── 📂 dto/
│   │   ├── 📂 request/     # Java Records cho request payload
│   │   └── 📂 response/    # Java Records cho response payload
│   ├── 📂 entity/          # JPA Entities (User, Movie, Cinema, Ticket, Seat...)
│   ├── 📂 exception/       # Xử lý lỗi tập trung (GlobalExceptionHandler)
│   ├── 📂 mapper/          # MapStruct mapper interfaces
│   ├── 📂 repository/      # Spring Data JPA repositories
│   ├── 📂 scheduler/       # Job tự động (hủy vé hết hạn, cập nhật trạng thái phim)
│   ├── 📂 security/        # JWT Filter, UserDetails, Auth config
│   ├── 📂 service/         # Business logic layer
│   ├── 📂 utils/           # Hàm tiện ích
│   └── 📂 websocket/       # WebSocket handlers (STOMP seat updates)
│
├── 📂 src/main/resources/
│   ├── 📄 application.yaml         # Cấu hình ứng dụng
│   └── 📂 db/migration/            # Flyway SQL migration scripts (V1-V10)
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/  # Reusable UI components
│   │   ├── 📂 pages/       # Page-level components
│   │   ├── 📂 context/     # React Context (Auth, State)
│   │   ├── 📂 hooks/       # Custom React hooks
│   │   ├── 📂 services/    # API service layer
│   │   ├── 📂 routes/      # Route configuration
│   │   └── 📂 utils/       # Helper functions
│   ├── 📄 package.json
│   ├── 📄 Dockerfile
│   └── 📄 nginx.conf
│
├── 📄 pom.xml                       # Maven dependencies
├── 📄 Dockerfile                    # Backend Docker image
├── 📄 docker-compose.yml            # Development environment
├── 📄 docker-compose.prod.yml       # Production environment
└── 📂 .github/workflows/deploy.yml  # CI/CD pipeline
```

---

## 🚀 Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống

- **Java** 17+
- **Node.js** 18+
- **Docker** & **Docker Compose**
- **Maven** 3.9+ (hoặc sử dụng Maven Wrapper `mvnw` đi kèm)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/annt1303/CineVN.git
cd CineVN
```

### 2️⃣ Khởi Động Infrastructure (PostgreSQL + Redis)

```bash
docker-compose up -d
```

Lệnh này sẽ khởi động:
- **PostgreSQL 16** tại `localhost:5432`
- **Redis 7.2** tại `localhost:6379`

### 3️⃣ Cấu Hình Biến Môi Trường

Tạo file `.env` tại thư mục gốc dự án:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinevn
DB_USER=cinevn_user
DB_PASSWORD=cinevn_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=cinevn_redis_password

# JWT
JWT_SECRET=your-secret-key-at-least-256-bits-long
JWT_ACCESS_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# TMDB API
TMDB_API_TOKEN=your-tmdb-api-token

# Mail (Brevo SMTP)
MAIL_USERNAME=your-brevo-email
BREVO_SMTP_KEY=your-brevo-smtp-key
MAIL_FROM=noreply@cinevn.com

# MoMo Payment (Test Environment)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_API_URL=https://test-payment.momo.vn
MOMO_REDIRECT_URL=http://localhost:5173/payment-confirm/momo
MOMO_IPN_URL=http://localhost:8080/api/public/payment/momo/ipn
```

### 4️⃣ Chạy Backend (Spring Boot)

```bash
# Sử dụng Maven Wrapper
./mvnw spring-boot:run

# Hoặc build và chạy JAR
./mvnw clean package -DskipTests
java -jar target/cinevn-0.0.1-SNAPSHOT.jar
```

Backend sẽ chạy tại: `http://localhost:8080`

### 5️⃣ Chạy Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🔑 Biến Môi Trường

| Biến | Bắt buộc | Mô tả | Giá trị mặc định |
|---|---|---|---|
| `DB_HOST` | ✅ | Host của PostgreSQL | `localhost` |
| `DB_PORT` | ❌ | Port của PostgreSQL | `5432` |
| `DB_NAME` | ❌ | Tên database | `cinevn` |
| `DB_USER` | ❌ | Username database | `cinevn_user` |
| `DB_PASSWORD` | ❌ | Password database | `cinevn_password` |
| `REDIS_HOST` | ❌ | Host của Redis | `localhost` |
| `REDIS_PORT` | ❌ | Port của Redis | `6379` |
| `REDIS_PASSWORD` | ❌ | Password Redis | `cinevn_redis_password` |
| `JWT_SECRET` | ✅ | Secret key cho JWT (≥256 bit) | — |
| `TMDB_API_TOKEN` | ✅ | API token từ TMDB | — |
| `MAIL_USERNAME` | ✅ | Email Brevo SMTP | — |
| `BREVO_SMTP_KEY` | ✅ | SMTP key từ Brevo | — |
| `MAIL_FROM` | ✅ | Địa chỉ email gửi | — |
| `MOMO_PARTNER_CODE` | ❌ | Mã đối tác MoMo | `MOMO` |
| `MOMO_ACCESS_KEY` | ❌ | Access key MoMo | *(test key)* |
| `MOMO_SECRET_KEY` | ❌ | Secret key MoMo | *(test key)* |
| `MOMO_API_URL` | ❌ | URL API MoMo | `https://test-payment.momo.vn` |

---

## 📡 API Endpoints

### 🔓 Authentication (`/api/auth`)
| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập |
| `POST` | `/api/auth/register` | Đăng ký tài khoản |
| `POST` | `/api/auth/send-otp` | Gửi mã OTP xác minh email |
| `POST` | `/api/auth/verify-otp` | Xác nhận mã OTP |
| `POST` | `/api/auth/refresh` | Làm mới Access Token |
| `POST` | `/api/auth/logout` | Đăng xuất |

### 🎬 Public APIs (`/api/public`)
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/public/movies` | Danh sách phim |
| `GET` | `/api/public/movies/{id}` | Chi tiết phim |
| `GET` | `/api/public/showtimes` | Lịch chiếu |
| `POST` | `/api/public/seats/hold` | Giữ ghế (WebSocket) |
| `POST` | `/api/public/tickets` | Tạo vé & thanh toán |
| `POST` | `/api/public/payment/momo/ipn` | MoMo IPN callback |

### 🛡️ Admin APIs (`/api/admin`) — *Yêu cầu role ADMIN*
| Method | Endpoint | Mô tả |
|---|---|---|
| `CRUD` | `/api/admin/cinemas` | Quản lý rạp |
| `CRUD` | `/api/admin/screen-rooms` | Quản lý phòng chiếu |
| `CRUD` | `/api/admin/movies` | Quản lý phim |
| `CRUD` | `/api/admin/showtimes` | Quản lý lịch chiếu |
| `CRUD` | `/api/admin/pricing` | Cấu hình giá vé |
| `GET` | `/api/admin/genres` | Danh sách thể loại |

### 👤 User APIs (`/api/user`) — *Yêu cầu xác thực*
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/user/profile` | Xem thông tin cá nhân |
| `PUT` | `/api/user/profile` | Cập nhật thông tin |
| `PUT` | `/api/user/change-password` | Đổi mật khẩu |

---

## 🗃 Database Schema

Hệ thống sử dụng **Flyway** để quản lý database migrations (V1 → V10):

```
Users ──┐
        ├──► Tickets ──► Showtimes ──► ScreenRooms ──► Cinemas
Seats ──┘                    │
                             ▼
                          Movies ◄──► Genres
                             │
                             ▼
                    BasePriceConfig
                    SeatTypePrice
```

**Các entity chính:**

| Entity | Mô tả |
|---|---|
| `User` | Thông tin người dùng (email, password, role) |
| `Movie` | Thông tin phim (title, poster, trailer, duration, cast) |
| `Genre` | Thể loại phim |
| `Cinema` | Rạp chiếu phim |
| `ScreenRoom` | Phòng chiếu (thuộc Cinema, có loại phòng) |
| `Seat` | Ghế ngồi (thuộc ScreenRoom, có loại ghế) |
| `Showtime` | Suất chiếu (phim + phòng + thời gian) |
| `BasePriceConfig` | Cấu hình giá gốc (theo loại phòng, định dạng, khung giờ) |
| `SeatTypePrice` | Phụ thu theo loại ghế |
| `Ticket` | Vé đã đặt (user + showtime + seat + trạng thái thanh toán) |

---

## 🚢 Triển Khai CI/CD

Dự án sử dụng **GitHub Actions** để tự động build & deploy lên **AWS EC2**:

```
Push to main
     │
     ▼
┌─────────────────────────┐
│  Build & Push to ECR    │
│  ───────────────────    │
│  • Build Backend image  │
│  • Build Frontend image │
│  • Push to AWS ECR      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Deploy to EC2          │
│  ───────────────────    │
│  • SSH into EC2         │
│  • Pull latest images   │
│  • docker-compose up    │
└─────────────────────────┘
```

### Secrets Cần Cấu Hình Trên GitHub

| Secret | Mô tả |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_ACCOUNT_ID` | AWS Account ID |
| `EC2_HOST` | Public IP/Domain của EC2 |
| `EC2_SSH_KEY` | SSH private key để kết nối EC2 |
| `DB_*`, `REDIS_*`, `JWT_*` | Các biến môi trường production |
| `TMDB_*`, `MAIL_*`, `MOMO_*` | API keys cho các dịch vụ bên thứ ba |

---

## 🔧 Các Lệnh Hữu Ích

```bash
# === DEVELOPMENT ===
docker-compose up -d                  # Khởi động PostgreSQL + Redis
./mvnw spring-boot:run                # Chạy backend
cd frontend && npm run dev            # Chạy frontend

# === BUILD ===
./mvnw clean package -DskipTests      # Build backend JAR
cd frontend && npm run build          # Build frontend production

# === DOCKER (Production) ===
docker-compose -f docker-compose.prod.yml up -d    # Chạy toàn bộ hệ thống

# === DATABASE ===
./mvnw flyway:info                    # Xem trạng thái migration
./mvnw flyway:migrate                 # Chạy migration thủ công
```

---

## 🤝 Đóng Góp

Đóng góp luôn được chào đón! Hãy làm theo các bước sau:

1. **Fork** repository
2. Tạo **branch** mới (`git checkout -b feature/tinh-nang-moi`)
3. **Commit** thay đổi (`git commit -m 'Thêm tính năng XYZ'`)
4. **Push** lên branch (`git push origin feature/tinh-nang-moi`)
5. Tạo **Pull Request**

---

## 📄 Giấy Phép

Dự án được phát triển cho mục đích học tập và nghiên cứu.

---

<div align="center">

**Được xây dựng với ❤️ bằng Java Spring Boot & React.js**

</div>
