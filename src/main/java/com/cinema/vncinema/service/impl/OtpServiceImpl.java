package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.service.OtpService;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${mail.from}")
    private String fromEmail;

    @Value("classpath:templates/otp-email.html")
    private Resource emailTemplateResource;

    private String emailTemplate;

    private static final String OTP_CODE_KEY_PREFIX = "otp:code:";
    private static final String OTP_VERIFIED_KEY_PREFIX = "otp:verified:";
    private static final long OTP_CODE_TTL_MINUTES = 5;
    private static final long OTP_VERIFIED_TTL_MINUTES = 10;

    @PostConstruct
    public void init() {
        try {
            this.emailTemplate = StreamUtils.copyToString(
                    emailTemplateResource.getInputStream(),
                    StandardCharsets.UTF_8
            );
            log.info("Successfully loaded OTP email template from resources.");
        } catch (IOException e) {
            log.error("Failed to load OTP email template from resources, using fallback plain text.", e);
            this.emailTemplate = "<p>Mã OTP của bạn là: %s</p>";
        }
    }

    @Override
    public void sendOtp(String email) {
        // Generate a 6-digit OTP code (e.g. 100000 to 999999)
        int code = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(code);

        String redisKey = OTP_CODE_KEY_PREFIX + email;
        redisTemplate.opsForValue().set(redisKey, otpCode, OTP_CODE_TTL_MINUTES, TimeUnit.MINUTES);

        // Print prominently to log and console for easy retrieval in development
        log.info("==================================================");
        log.info(" OTP FOR REGISTRATION: {} ", email);
        log.info(" OTP CODE: {} (Valid for 5 minutes) ", otpCode);
        log.info("==================================================");

        System.out.println("\n\n==================================================");
        System.out.println("   [VN-CINEMA REGISTRATION OTP]                   ");
        System.out.println("   Email: " + email);
        System.out.println("   OTP Code: " + otpCode);
        System.out.println("   (Valid for 5 minutes)                          ");
        System.out.println("==================================================\n\n");

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("[VNCinema] Mã OTP Xác Thực Tài Khoản");
            
            String htmlContent = emailTemplate.replace("{{OTP_CODE}}", otpCode);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("Successfully sent OTP email to {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", email, e);
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    @Override
    public boolean verifyOtp(String email, String otpCode) {
        String redisKey = OTP_CODE_KEY_PREFIX + email;
        String savedOtp = redisTemplate.opsForValue().get(redisKey);

        if (savedOtp == null || !savedOtp.equals(otpCode)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        redisTemplate.delete(redisKey);

        String verifiedKey = OTP_VERIFIED_KEY_PREFIX + email;
        redisTemplate.opsForValue().set(verifiedKey, "true", OTP_VERIFIED_TTL_MINUTES, TimeUnit.MINUTES);
        return true;
    }

    @Override
    public boolean isEmailVerified(String email) {
        String verifiedKey = OTP_VERIFIED_KEY_PREFIX + email;
        String isVerified = redisTemplate.opsForValue().get(verifiedKey);
        return "true".equals(isVerified);
    }

    @Override
    public void clearVerificationState(String email) {
        String verifiedKey = OTP_VERIFIED_KEY_PREFIX + email;
        redisTemplate.delete(verifiedKey);
    }
}
