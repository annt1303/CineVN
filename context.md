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
- [x] **Xác thực người dùng (Authentication)**: Đăng nhập/Đăng ký (Email/Password) sử dụng JWT. Luồng đăng ký bằng OTP, lưu Refresh Token ở HttpOnly Cookie.
- [x] **Quản lý tài khoản cá nhân (Profile)**: Cập nhật thông tin cá nhân, đổi mật khẩu.
- [ ] **Lịch sử mua vé (Purchase History & E-Ticket)**: Quản lý danh sách các vé đã mua, xem trạng thái vé (chưa dùng, đã dùng, đã hủy). Tích hợp hiển thị Mã QR (QR Code) để quét.
- [x] **Real-time Seat Booking**: Tích hợp WebSocket (qua Spring Boot STOMP) để khi một người đang giữ ghế, những người khác đang xem sơ đồ phòng chiếu sẽ thấy ghế đó chuyển sang màu xám.
- [ ] **Tích hợp thanh toán**: Kết nối cổng thanh toán nội địa (VNPay, MoMo, ZaloPay) hoặc quốc tế (Stripe/PayPal).
- [ ] **Đánh giá & Bình luận**: Cho phép user chấm điểm phim sau khi xem.

### 3.2. Dành cho Backend (Spring Boot)
- [ ] **RESTful APIs**: Cung cấp API chuẩn cho Frontend gọi dữ liệu.
- [x] **Spring Security**: Bảo mật API bằng JWT, phân quyền chi tiết (Role: ADMIN, USER).
- [ ] **Concurrency / Transaction Management**: Xử lý logic đặt vé an toàn, ngăn chặn triệt để tình trạng *Double-booking* (đặt trùng vé).
- [ ] **Email/SMS Service**: Tự động gửi email xác nhận chứa mã QR vé xem phim sau khi thanh toán thành công.
- [ ] **Job Scheduler**: Các tác vụ chạy ngầm như tự động hủy các vé giữ chỗ quá hạn 10 phút mà chưa thanh toán, tự động cập nhật trạng thái phim (Sắp chiếu -> Đang chiếu).

### 3.3. Dành cho Quản trị viên (Admin Dashboard - Mảng UI mới)
*Hệ thống cần một trang quản trị riêng để quản lý:*
- [x] **Quản lý Rạp & Phòng chiếu**: Thêm/sửa/xóa rạp, tạo sơ đồ ghế (cấu hình số hàng, số cột, loại ghế).
- [x] **Quản lý Phim**: Cập nhật thông tin phim, poster, trailer, thể loại. Hỗ trợ nhập tự động từ TMDB (The Movie Database) và tự thêm mới, cập nhật, xóa phim thủ công (Full CRUD).
- [x] **Quản lý Lịch chiếu**: Lên lịch chiếu cho từng phim tại từng phòng chiếu vào các khung giờ khác nhau. Thiết kế entity và thực hiện tính giá vé tự động dựa trên `BasePriceConfig` (phụ thuộc loại phòng, định dạng 2D/3D, khung giờ, ngày trong tuần) kết hợp phụ thu theo `SeatType`, áp dụng cơ chế snapshot đóng băng giá gốc tại suất chiếu theo thiết kế chi tiết tại [showtime_pricing_design.md](showtime_pricing_design.md).
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
- **Quy chuẩn thông điệp (Response Messages)**:
  * Mọi thông điệp thành công/thất bại trả về bắt buộc phải được viết bằng **tiếng Anh** để chuẩn hóa API.
  * Nghiêm cấm viết trực tiếp chuỗi ký tự (hardcode string literals) trong các REST Controllers. Tất cả thông điệp phải được khai báo tập trung trong các **tập tin hằng số riêng biệt** (ví dụ: [AuthMessages.java](file:///d:/Projects/vncinema/src/main/java/com/cinema/vncinema/constant/AuthMessages.java)) thuộc gói `com.cinema.vncinema.constant` để tiện quản lý và quốc tế hóa sau này.
  * Đối với các Endpoint không yêu cầu dữ liệu phản hồi (chỉ cần báo thành công), hãy trả về kiểu `ApiResponse<Void>` và sử dụng phương thức nạp chồng `ApiResponse.success(String message)` để loại bỏ hoàn toàn trường `result` khỏi chuỗi JSON đầu ra.
- **Ví dụ Controller:**
```java
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @GetMapping("/{id}")
    public ApiResponse<MovieResponse> getMovie(@PathVariable Long id) {
        MovieResponse movie = movieService.getMovieById(id);
        return ApiResponse.success(MovieMessages.GET_MOVIE_SUCCESS, movie);
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

### 6.4. Quy chuẩn Phát triển và Bảo mật Xác thực (Authentication & Security Standards)
Mọi chức năng liên quan tới đăng nhập, quản lý phiên làm việc và bảo vệ tài nguyên bắt buộc phải tuân theo các quy định nghiêm ngặt:
1. **Quản lý Token (Double Token System)**:
   * **Access Token**: Được lưu ở bộ nhớ tạm (In-memory) của ứng dụng client. Có thời hạn ngắn (mặc định 1 giờ), chứa email và role của người dùng.
   * **Refresh Token**: Được lưu trữ dưới dạng Cookie HttpOnly có thuộc tính `SameSite=Lax`, `Secure=false` (ở dev) và `Path="/"`. Có thời hạn dài (mặc định 7 ngày).
2. **Cơ chế xoay vòng Refresh Token (Rotation - RTR)**:
   * Mỗi khi client gọi `/api/auth/refresh` bằng cookie Refresh Token hợp lệ, server bắt buộc phải hủy token cũ, phát hành đồng thời cả Access Token mới và **Refresh Token mới** trả lại cookie client.
   * Danh sách Refresh Token kích hoạt được lưu trữ ở **Redis** dạng `refresh_token:<email>` với thời gian sống (TTL) 7 ngày. Khi đăng xuất, token này sẽ bị xóa khỏi Redis ngay lập tức.
3. **Quy trình Đăng ký an toàn bằng OTP**:
   * Client bắt buộc phải đi qua 3 bước: Nhập email -> Gửi OTP (lưu Redis 5 phút TTL) -> Xác nhận OTP.
   * Khi OTP trùng khớp, server tạo một vé trạng thái xác minh thành công trên Redis dưới dạng `otp:verified:<email> = true` với thời gian tồn tại là 10 phút.
   * Bước cuối cùng (Submit Form tạo mật khẩu và lưu database), Backend bắt buộc phải kiểm tra vé verify này trong Redis. Nếu không tìm thấy, từ chối đăng ký với mã lỗi `1011 EMAIL_NOT_VERIFIED`. Sau khi đăng ký thành công, xóa ngay vé này khỏi Redis.
4. **Cơ chế CORS và Credentials Sharing**:
   * Mọi cấu hình CORS của Spring Boot bắt buộc phải cấu hình `allowCredentials(true)` và chỉ định chính xác nguồn gốc (Allowed Origin) như `http://localhost:5173`. Nghiêm cấm sử dụng wildcard `*` vì trình duyệt sẽ từ chối truyền tải cookies bảo mật HttpOnly.

### 6.5. Quy chuẩn sử dụng Java Record cho DTO (Data Transfer Objects)
Để tăng tính bất biến (immutability), tính rõ ràng và giảm thiểu code boilerplate từ Lombok, toàn bộ các lớp DTO (bao gồm cả **Request DTO** và **Response DTO**) bắt buộc phải sử dụng kiểu **Java Record** (tính năng tiêu chuẩn từ Java 16+):
- **Tính bất biến (Immutability)**: DTO sinh ra chỉ để vận chuyển dữ liệu, do đó các trường dữ liệu phải là `final`. Việc sử dụng `record` giúp đảm bảo tính bất biến này một cách tự nhiên.
- **Loại bỏ Boilerplate**: Không cần khai báo thủ công hoặc dùng Lombok annotations như `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`. Các phương thức truy cập dữ liệu (accessor), `equals()`, `hashCode()`, và `toString()` được Java tự động tạo ra.
- **Tích hợp Validation**: Các annotations ràng buộc dữ liệu (`@NotBlank`, `@Email`, `@Size`...) được khai báo trực tiếp trên các tham số của record.
- **Sử dụng Lombok @Builder**: Vẫn khuyến khích sử dụng `@Builder` của Lombok trên định nghĩa record để hỗ trợ tạo dữ liệu fluent-style trong phần Service.
- **Ví dụ minh họa**:
  ```java
  package com.cinema.vncinema.dto.request;

  import jakarta.validation.constraints.Email;
  import jakarta.validation.constraints.NotBlank;
  import lombok.Builder;

  @Builder
  public record LoginRequest(
      @NotBlank(message = "Email is required")
      @Email(message = "Invalid email format")
      String email,

      @NotBlank(message = "Password is required")
      String password
  ) {}
  ```
- **Lưu ý khi sử dụng**: Phương thức truy cập dữ liệu của record sẽ có tên trùng với tên trường (ví dụ: `request.email()` thay vì `request.getEmail()`). Hãy cập nhật các Controller và Service tương ứng.

### 6.6. Quy chuẩn Ánh xạ Thực thể với DTO sử dụng MapStruct (Automap)
Để chuyển đổi dữ liệu qua lại giữa **Database Entity** và **DTO (Java Record)** một cách tối ưu và đồng nhất, hệ thống bắt buộc sử dụng thư viện **MapStruct** cho toàn bộ các trường hợp ánh xạ.

#### 1. Nguyên tắc hoạt động & Ưu điểm:
- **Compile-time Code Generation**: MapStruct tạo mã nguồn ánh xạ Java thuần túy (Plain Java code) ngay khi ứng dụng được biên dịch (build-time).
- **Hiệu năng vượt trội**: Hoàn toàn không sử dụng cơ chế phản chiếu (Java Reflection) chậm chạp ở runtime như ModelMapper. Hiệu năng ánh xạ của MapStruct tương đương với việc viết code `getter/setter` thủ công nhưng loại bỏ hoàn toàn code boilerplate dư thừa.
- **Phát hiện lỗi sớm**: Mọi lỗi ánh xạ sai kiểu dữ liệu, sai tên trường hoặc thiếu ánh xạ sẽ được báo ngay tại thời điểm biên dịch ứng dụng thay vì gây lỗi âm thầm ở runtime.

#### 2. Các thực thể (Entities) và DTOs đơn giản có thể sử dụng Automap:
Đối với các cặp Entity và DTO có cấu trúc đơn giản (các trường tương ứng trùng tên và kiểu dữ liệu), ta chỉ cần khai báo interface Mapper và để MapStruct tự động sinh code:
- **User** ⇄ **UserResponse**: Ánh xạ thông tin người dùng cơ bản (họ tên, email, vai trò), tự động bỏ qua các trường nhạy cảm như `password` trước khi gửi về client.
- **Movie** ⇄ **MovieResponse / MovieRequest**: Ánh xạ các trường thông tin phim cơ bản (`title`, `description`, `duration`, `releaseDate`...).
- **Cinema** ⇄ **CinemaResponse**: Ánh xạ thông tin rạp chiếu (`name`, `address`...).
- **Seat** ⇄ **SeatResponse**: Ánh xạ sơ đồ ghế (`row`, `number`, `type`, `status`...).
- **Promotion** ⇄ **PromotionResponse**: Ánh xạ các thông tin chương trình khuyến mãi và mã ưu đãi.

#### 3. Ví dụ minh họa (Entity sang Java Record DTO):
Khai báo Interface Mapper trong package `com.cinema.vncinema.mapper` với annotation `@Mapper(componentModel = "spring")` để Spring quản lý Mapper này như một Spring Bean (cho phép `@Autowired` hoặc Constructor Injection trong Service):

```java
package com.cinema.vncinema.mapper;

import com.cinema.vncinema.entity.Movie;
import com.cinema.vncinema.dto.response.MovieResponse;
import com.cinema.vncinema.dto.request.MovieCreateRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MovieMapper {

    // 1. Ánh xạ từ Entity sang Java Record DTO
    MovieResponse toMovieResponse(Movie movie);

    // 2. Ánh xạ từ Request DTO sang Entity để lưu Database
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Movie toMovie(MovieCreateRequest request);
}
```

*Lưu ý:* MapStruct hỗ trợ hoàn hảo cho **Java Record**. Nó sẽ tự động biên dịch và ánh xạ sang constructor của Record mà bạn không cần cấu hình thêm gì.

---

## 7. Quy chuẩn Phát triển Frontend (Frontend Design Standards)
Để đảm bảo mã nguồn frontend sạch sẽ, dễ bảo trì và dễ mở rộng, quy trình phát triển giao diện React bắt buộc phải tuân thủ các quy tắc sau:

### 7.1. Phân tách Component (Component Modularization)
* **Tuyệt đối không viết trang kiểu nguyên khối (Monolithic Pages)**: Mọi trang (page) lớn chứa nhiều phần nội dung (như trang chủ `Home`, trang chi tiết `MovieDetail`) không được phép gộp tất cả code JSX, state và timer vào chung một file duy nhất.
* **Gom nhóm theo nghiệp vụ (Domain-based folders)**: Khi tách một phần giao diện ra component con bổ trợ cho trang chính, hãy đặt chúng vào thư mục gom nhóm tương ứng trong `src/components/` (ví dụ: `src/components/home/`, `src/components/movie/`).

### 7.2. Phân chia trách nhiệm rõ ràng (Separation of Concerns)
1. **Trang chính (Page Component)**:
   * Đóng vai trò là **Bộ điều phối (Orchestrator / Assembly Container)**.
   * Chỉ quản lý: Routing params, các State dùng chung toàn cục (ví dụ: bước đặt vé hiện tại, danh sách ghế đã chọn, thông tin phim đã tải) và điều hướng trang (`useNavigate`).
   * Lắp ghép các component con thành giao diện hoàn chỉnh bằng cách truyền dữ liệu và các hàm callback điều khiển xuống dưới qua Props.
2. **Component con (Sub-components)**:
   * Chịu trách nhiệm hiển thị một phần giao diện cụ thể (ví dụ: `HeroSection`, `ShowtimeStep`, `SeatStep`).
   * Tự cô lập và quản lý các State nội bộ cục bộ (ví dụ: slider index hiện tại, timer tự động chuyển slide).
   * Đóng gói toàn bộ các hiệu ứng chuyển động chuyên sâu (`Framer Motion`, CSS transitions).

### 7.3. Sẵn sàng tích hợp API (API Readiness)
* Các component con hiển thị dữ liệu hoặc danh sách (như Slider phim, Lưới phim đang chiếu, Lịch chiếu) bắt buộc phải nhận dữ liệu động thông qua **Props** thay vì hardcode trực tiếp việc import dữ liệu giả (mock data).
* Cách thiết kế này đảm bảo khi kết nối ứng dụng với Spring Boot API, chúng ta chỉ cần cập nhật API call ở trang chính (Page level) và truyền dữ liệu xuống, hoàn toàn không cần chỉnh sửa hay đụng vào code hiển thị của các component con.

### 7.4. Quy chuẩn Thiết kế Responsive (Responsive Design Standards)
* **Hỗ trợ đa thiết bị (Multi-device Support)**: Tất cả giao diện người dùng (bao gồm cả User Frontend và Admin Dashboard) bắt buộc phải thiết kế responsive, tương thích mượt mà trên tất cả các kích thước màn hình phổ biến:
  * **Mobile (Điện thoại)**: `< 768px` (ưu tiên giao diện một cột, menu điều hướng dạng hamburger, thu gọn các thành phần không cần thiết và tối ưu hóa nút bấm lớn để dễ tương tác bằng ngón tay).
  * **Tablet (Máy tính bảng)**: `768px` đến `1024px` (giao diện điều chỉnh linh hoạt từ 2-3 cột, các thành phần lưới/danh sách hiển thị vừa vặn).
  * **Desktop (Máy tính để bàn)**: `> 1024px` (giao diện đầy đủ tính năng, hiển thị tối đa thông tin, khoảng cách thoáng đãng và có hiệu ứng chuyển động mượt mà).
* **Sử dụng CSS/Tailwind Breakpoints**: Tận dụng triệt để các breakpoint chuẩn của Tailwind CSS (`sm:`, `md:`, `lg:`, `xl:`) để linh hoạt thay đổi bố cục, căn chỉnh khoảng cách (`padding`/`margin`), kích thước chữ và hiển thị/ẩn các phần tử cho phù hợp với từng kích thước viewport.
* **Kiểm thử Responsive**: Trước khi hoàn thành tính năng, nhà phát triển bắt buộc phải tự kiểm thử giao diện bằng công cụ mô phỏng thiết bị trên Chrome DevTools. Đặc biệt chú ý đến luồng đặt vé, sơ đồ chọn ghế, hiển thị vé QR, thanh toán, và các bảng dữ liệu quản trị (data tables) trên giao diện mobile để đảm bảo không bị tràn hay vỡ giao diện.

