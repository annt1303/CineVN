# CineMax - Movie Ticketing System Context

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

## 4. Cấu trúc Docker dự kiến (Docker Compose)
Dự án sẽ có một file `docker-compose.yml` định nghĩa các container:
1. `postgres-db`: Container chứa CSDL PostgreSQL.
2. `redis-cache`: Container chứa Redis.
3. `spring-backend`: Container chạy file `.jar` của Spring Boot (kết nối với Postgres và Redis).
4. `react-frontend`: Container chạy Nginx để serve ứng dụng React.js đã được build.
