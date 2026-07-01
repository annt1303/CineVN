package com.cinema.vncinema.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local Development Server"),
                        new Server()
                                .url("https://cinevn.online")
                                .description("Production Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Nhập JWT token vào ô bên dưới. Ví dụ: eyJhbGci...")
                        )
                );
    }

    private Info apiInfo() {
        return new Info()
                .title("VNCinema API")
                .description("""
                        REST API cho hệ thống đặt vé xem phim VNCinema.
                        
                        ## Xác thực (Authentication)
                        - Gọi `POST /api/auth/login` để nhận **Access Token**
                        - Bấm nút **Authorize 🔒** ở trên và nhập token
                        - Các request sau đó sẽ tự động gửi kèm header `Authorization: Bearer <token>`
                        
                        ## Phân quyền
                        - **Public**: Không cần token (movies, showtimes, ...)
                        - **User**: Cần đăng nhập (đặt vé, xem lịch sử, ...)
                        - **Admin**: Cần role ADMIN (quản lý phim, rạp, suất chiếu, ...)
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("VNCinema Team")
                        .url("https://cinevn.online")
                        .email("support@cinevn.online")
                )
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT")
                );
    }
}
