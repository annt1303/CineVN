# CineVN - Movie Ticketing System Context

## 1. Tổng quan kiến trúc (Architecture Overview)
Dự án là một hệ thống đặt vé xem phim trực tuyến hiện đại, bao gồm hai phần chính:
- **Frontend**: Ứng dụng Single Page Application (SPA) xây dựng bằng **React.js** (hiện tại đang sử dụng Vite, Tailwind CSS v4, Framer Motion).
- **Backend**: Hệ thống RESTful API xây dựng bằng **Java Spring Boot**.
- **Infrastructure**: Toàn bộ hệ thống sẽ được đóng gói và triển khai tự động thông qua **Docker** và **Docker Compose**.

## 2. Công nghệ và Database (Tech Stack)
Với một hệ thống đặt vé xem phim, tính toàn vẹn của dữ liệu và trải nghiệm realtime là yếu tố sống còn. Chúng ta sẽ sử dụng cụm công nghệ sau:

### 2.1. Database chính: **PostgreSQL**
**Vai trò:** Lưu trữ toàn bộ dữ liệu cứng (User, Movie, Cinema, Ticket, Transaction).
**Lý do chọn:**
1. **Tính ACID mạnh mẽ**: Đảm bảo các giao dịch (transaction) mua vé và thanh toán diễn ra an toàn tuyệt đối.
2. **Kiểm soát đồng thời (Concurrency Control)**: Hỗ trợ rất tốt cơ chế *Row-level locking* (khóa cấp dòng) kết hợp với Spring Boot Data JPA (Pessimistic/Optimistic Locking) giúp ngăn chặn triệt để lỗi 2 người mua cùng 1 ghế.

### 2.2. In-memory Database: **Redis** (Bắt buộc)
**Vai trò:** Quản lý state tạm thời và tăng tốc độ đọc dữ liệu.
**Lý do chọn:**
1. **Khóa ghế tạm thời (Seat Locking)**: Khi người dùng chọn ghế và đợi thanh toán, ghế đó cần được "khóa" trong 5 phút. Nếu thanh toán thất bại, ghế tự động nhả ra. Cơ chế TTL (Time-to-live) của Redis là giải pháp sinh ra để làm việc này một cách tối ưu nhất.
2. **Bộ đệm (Caching)**: Giảm tải cho PostgreSQL bằng cách đưa các dữ liệu đọc nhiều (danh sách phim đang chiếu, danh sách rạp) lên RAM của Redis.

### 2.3. Các công nghệ bổ trợ
- **Flyway (Database Migration)**: Quản lý phiên bản Database (version control cho SQL). Đảm bảo cấu trúc bảng của PostgreSQL luôn đồng bộ và tự động chạy script tạo bảng khi deploy dự án mới.
- **WebSocket (Spring STOMP)**: Cập nhật sơ đồ ghế real-time. Ngay khi có người click giữ ghế, màn hình của những người khác phải lập tức chuyển ghế đó sang màu xám.
- **RabbitMQ / Kafka (Tùy chọn nâng cao)**: Hàng đợi Message Queue dùng để xử lý các tác vụ bất đồng bộ (gửi Email QR code sau khi mua vé) mà không làm chậm trải nghiệm của người dùng.
- **Cloudinary / MinIO**: Dịch vụ lưu trữ ảnh poster phim, avatar người dùng thay vì lưu trực tiếp vào database.

---

## 3. Các tính năng cần phát triển để hoàn thiện

*Ghi chú tiến độ:*
- [x] Tính năng đã hoàn thành.
- [ ] Tính năng chưa thực hiện (hoặc đang phát triển).

### 3.1. Dành cho Khách hàng (User Frontend - React.js)
- [ ] **Xác thực người dùng (Authentication)**: Đăng nhập/Đăng ký (Email/Password, Google/Facebook Login) sử dụng JWT.
- [ ] **Quản lý tài khoản cá nhân (Profile)**: Cập nhật thông tin cá nhân, đổi mật khẩu.
- [ ] **Lịch sử mua vé (Purchase History & E-Ticket)**: Quản lý danh sách các vé đã mua, xem trạng thái vé (chưa dùng, đã dùng, đã hủy). Tích hợp hiển thị Mã QR (QR Code) để quét.
- [ ] **Real-time Seat Booking**: Tích hợp WebSocket (qua Spring Boot STOMP) để khi một người đang giữ ghế, những người khác đang xem sơ đồ phòng chiếu sẽ thấy ghế đó chuyển sang màu xám.
- [ ] **Tích hợp thanh toán**: Kết nối cổng thanh toán nội địa (VNPay, MoMo, ZaloPay) hoặc quốc tế (Stripe/PayPal).
- [ ] **Đánh giá & Bình luận**: Cho phép user chấm điểm phim sau khi xem.

### 3.2. Dành cho Backend (Spring Boot)
- [ ] **RESTful APIs**: Cung cấp API chuẩn cho Frontend gọi dữ liệu.
- [ ] **Spring Security**: Bảo mật API bằng JWT, phân quyền chi tiết (Role: ADMIN, USER).
- [ ] **Concurrency / Transaction Management**: Xử lý logic đặt vé an toàn, ngăn chặn triệt để tình trạng *Double-booking* (đặt trùng vé).
- [ ] **Email/SMS Service**: Tự động gửi email xác nhận chứa mã QR vé xem phim sau khi thanh toán thành công.
- [ ] **Job Scheduler**: Các tác vụ chạy ngầm như tự động hủy các vé giữ chỗ quá hạn 10 phút mà chưa thanh toán, tự động cập nhật trạng thái phim (Sắp chiếu -> Đang chiếu).

### 3.3. Dành cho Quản trị viên (Admin Dashboard - Mảng UI mới)
*Hệ thống cần một trang quản trị riêng để quản lý:*
- [ ] **Quản lý Rạp & Phòng chiếu**: Thêm/sửa/xóa rạp, tạo sơ đồ ghế (cấu hình số hàng, số cột, loại ghế).
- [ ] **Quản lý Phim**: Cập nhật thông tin phim, poster, trailer, thể loại.
- [ ] **Quản lý Lịch chiếu**: Lên lịch chiếu cho từng phim tại từng phòng chiếu vào các khung giờ khác nhau.
- [ ] **Quản lý Khuyến mãi**: Tạo mã giảm giá (Coupon), quản lý chiến dịch marketing.
- [ ] **Báo cáo Thống kê**: Biểu đồ doanh thu theo phim, theo rạp, số lượng vé bán ra (Có thể dùng Chart.js/Recharts trên React).

---

## 4. Cấu trúc Docker (Docker Compose)
Hệ thống đã cấu hình file [docker-compose.yml](file:///d:/Projects/vncinema/docker-compose.yml) ở thư mục gốc:
- [x] `postgres-db`: Container PostgreSQL 16 (Đang chạy - Port `5432`).
- [x] `redis-cache`: Container Redis 7.2 (Đang chạy - Port `6379`).
- [ ] `spring-backend`: Container chạy Spring Boot (Đã định nghĩa cấu trúc mẫu trong `docker-compose.yml`).
- [ ] `react-frontend`: Container chạy Nginx serve ứng dụng React.js (Đã định nghĩa cấu trúc mẫu trong `docker-compose.yml`).


---

## 5. Cấu trúc thư mục (Package Structure)
Dự án được tổ chức theo kiến trúc hướng tính năng (Feature-driven) kết hợp phân lớp (Layered Architecture).

### 5.1. Backend (Spring Boot)
Thư mục gốc: `src/main/java/com/cinema/vncinema`
- `config/`: Cấu hình hệ thống (Security, Redis, WebSocket, OpenAPI, CORS)
- `controller/`: RESTful APIs (nhận request từ Frontend)
  - `auth/`: API Đăng nhập, đăng ký
  - `admin/`: API dành riêng cho trang quản trị
  - `public/`: API xem phim, lịch chiếu...
- `service/`: Chứa logic nghiệp vụ (Business logic)
  - `impl/`: Triển khai các interface của service
- `repository/`: Giao tiếp với Database (Spring Data JPA)
- `entity/`: Các Entity ánh xạ với bảng trong PostgreSQL (User, Movie, Ticket, Seat...)
- `dto/`: Data Transfer Objects (Request/Response data payload)
  - `request/`
  - `response/`
- `exception/`: Xử lý lỗi tập trung (GlobalExceptionHandler, Custom Exceptions)
- `security/`: Cấu hình JWT, Filters, UserDetails...
- `websocket/`: Xử lý realtime giữ ghế, nhả ghế qua STOMP
- `utils/`: Các hàm tiện ích (mã hóa mật khẩu, format dữ liệu)

### 5.2. Frontend (React.js)
Thư mục gốc: `frontend/src`
- `assets/`: Hình ảnh, icon, font chữ tĩnh
- `components/`: Các Component dùng chung
  - `ui/`: Component cơ bản (Button, Input, Modal, Badge...)
  - `layout/`: Bố cục trang (Navbar, Footer, Sidebar, AdminLayout)
  - `specific/`: Component nghiệp vụ (MovieCard, SeatMap, TicketQR...)
- `pages/`: Các trang chính của ứng dụng
  - `admin/`: Dashboard quản trị
  - `auth/`: Login, Register
  - `public/`: Home, MovieDetail, Booking, Checkout, Profile
- `services/`: Chứa các file gọi API tới Backend
- `hooks/`: Custom React Hooks
- `context/`: React Context API / Zustand (Quản lý State toàn cục)
- `routes/`: Cấu hình React Router (Public routes, Private routes, Admin routes)
- `utils/`: Các hàm tiện ích (formatters, cn.js...)

---

## 6. Quy chuẩn Phát triển Backend (Backend Design Standards)
Để đồng bộ kiến trúc hệ thống và đảm bảo khả năng mở rộng, toàn bộ code backend bắt buộc phải tuân thủ các chuẩn mực sau:

### 6.1. Quản lý Thực thể (Database Entities & BaseEntity)
Mọi JPA Entity đại diện cho bảng cơ sở dữ liệu bắt buộc phải kế thừa class [BaseEntity.java](file:///d:/Projects/vncinema/src/main/java/com/cinema/vncinema/entity/BaseEntity.java).
- Không tự định nghĩa lại các thuộc tính cơ bản như `id`, `createdAt`, và `updatedAt`.
- Thời gian tạo (`createdAt`) và cập nhật (`updatedAt`) sẽ được tự động tính toán qua các lifecycle hooks `@PrePersist` và `@PreUpdate`.
- **Ví dụ minh họa:**
```java
package com.cinema.vncinema.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "movies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Movie extends BaseEntity {
    private String title;
    private String description;
    private Integer duration;
}
```

### 6.2. Cấu trúc Phản hồi API Đồng nhất (ApiResponse)
Tất cả các REST Controller khi trả dữ liệu về phía Frontend bắt buộc phải đóng gói kết quả trong wrapper [ApiResponse.java](file:///d:/Projects/vncinema/src/main/java/com/cinema/vncinema/dto/response/ApiResponse.java).
- Mã code thành công mặc định là `1000`.
- Sử dụng các static helper methods `ApiResponse.success(...)` để trả kết quả thành công và `ApiResponse.error(...)` cho kết quả thất bại.
- **Ví dụ Controller:**
```java
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @GetMapping("/{id}")
    public ApiResponse<MovieResponse> getMovie(@PathVariable Long id) {
        MovieResponse movie = movieService.getMovieById(id);
        return ApiResponse.success("Lấy thông tin phim thành công", movie);
    }
}
```

### 6.3. Quản lý Ngoại lệ Tập trung (Global Exception Handling)
Hệ thống sử dụng cơ chế xử lý lỗi tập trung thông qua [GlobalExceptionHandler.java](file:///d:/Projects/vncinema/src/main/java/com/cinema/vncinema/exception/GlobalExceptionHandler.java):
1. **Ngoại lệ nghiệp vụ (Business Errors):** Sử dụng [AppException.java](file:///d:/Projects/vncinema/src/main/java/com/cinema/vncinema/exception/AppException.java) kết hợp với enum [ErrorCode.java](file:///d:/Projects/vncinema/src/main/java/com/cinema/vncinema/exception/ErrorCode.java). Khi xảy ra lỗi logic, chỉ cần ném ra `AppException`.
   ```java
   if (!userRepository.existsById(userId)) {
       throw new AppException(ErrorCode.USER_NOT_EXISTED);
   }
   ```
2. **Ngoại lệ Validation:** Các ràng buộc dữ liệu DTO (như `@NotBlank`, `@Size`, `@Min`, `@Max`) nếu thất bại sẽ được tự động bắt bởi handler và ánh xạ thành định dạng `ApiResponse` chuẩn. Có thể truyền tên enum của `ErrorCode` trực tiếp vào thuộc tính `message` của annotation validation để trả về mã code tùy chỉnh:
   ```java
   @Size(min = 8, message = "INVALID_PASSWORD")
   private String password;
   ```

