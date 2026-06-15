package com.cinema.vncinema.service;

import com.cinema.vncinema.config.MomoConfig;
import com.cinema.vncinema.dto.request.MomoIpnRequest;
import com.cinema.vncinema.dto.response.MomoPaymentVerificationResponse;
import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.repository.TicketRepository;
import com.cinema.vncinema.service.impl.MomoPaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MomoPaymentServiceTest {

    @Mock
    private MomoConfig momoConfig;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketService ticketService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private MomoPaymentServiceImpl momoPaymentService;

    @BeforeEach
    public void setUp() {
        // Swap restTemplate field with the mock instance using ReflectionTestUtils
        ReflectionTestUtils.setField(momoPaymentService, "restTemplate", restTemplate);
    }

    private String calculateExpectedSignature(String data, String key) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void testCreatePayment_Success() {
        String bookingCode = "TIC-123456";
        String payUrl = "https://test-payment.momo.vn/v2/gateway/redirect?token=abc";

        Showtime showtime = Showtime.builder()
                .basePrice(BigDecimal.valueOf(50000))
                .movie(Movie.builder().title("Movie 1").build())
                .build();

        Ticket ticket = Ticket.builder()
                .bookingCode(bookingCode)
                .price(BigDecimal.valueOf(50000))
                .status("PENDING")
                .showtime(showtime)
                .build();

        when(ticketRepository.findByBookingCode(bookingCode)).thenReturn(List.of(ticket));
        when(momoConfig.getAccessKey()).thenReturn("testAccessKey");
        when(momoConfig.getSecretKey()).thenReturn("testSecretKey");
        when(momoConfig.getPartnerCode()).thenReturn("MOMO");
        when(momoConfig.getIpnUrl()).thenReturn("http://localhost:8080/ipn");
        when(momoConfig.getRedirectUrl()).thenReturn("http://localhost:5173/redirect");
        when(momoConfig.getApiUrl()).thenReturn("https://test-payment.momo.vn");

        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("resultCode", 0);
        mockResponse.put("payUrl", payUrl);

        when(restTemplate.postForObject(anyString(), any(), eq(Map.class))).thenReturn(mockResponse);

        String result = momoPaymentService.createPayment(bookingCode);

        assertNotNull(result);
        assertEquals(payUrl, result);
    }

    @Test
    public void testCreatePayment_Failure_ThrowsAppException() {
        String bookingCode = "TIC-123456";

        Showtime showtime = Showtime.builder()
                .basePrice(BigDecimal.valueOf(50000))
                .movie(Movie.builder().title("Movie 1").build())
                .build();

        Ticket ticket = Ticket.builder()
                .bookingCode(bookingCode)
                .price(BigDecimal.valueOf(50000))
                .status("PENDING")
                .showtime(showtime)
                .build();

        when(ticketRepository.findByBookingCode(bookingCode)).thenReturn(List.of(ticket));
        when(momoConfig.getAccessKey()).thenReturn("testAccessKey");
        when(momoConfig.getSecretKey()).thenReturn("testSecretKey");
        when(momoConfig.getPartnerCode()).thenReturn("MOMO");
        when(momoConfig.getIpnUrl()).thenReturn("http://localhost:8080/ipn");
        when(momoConfig.getRedirectUrl()).thenReturn("http://localhost:5173/redirect");
        when(momoConfig.getApiUrl()).thenReturn("https://test-payment.momo.vn");

        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("resultCode", 99);
        mockResponse.put("message", "Internal Server Error");

        when(restTemplate.postForObject(anyString(), any(), eq(Map.class))).thenReturn(mockResponse);

        AppException ex = assertThrows(AppException.class, () -> {
            momoPaymentService.createPayment(bookingCode);
        });

        assertEquals(ErrorCode.MOMO_PAYMENT_CREATION_FAILED, ex.getErrorCode());
    }

    @Test
    public void testVerifyPayment_AlreadyBooked() {
        String bookingCode = "TIC-123456";

        Cinema cinema = Cinema.builder().name("Cinema 1").build();
        ScreenRoom room = ScreenRoom.builder().cinema(cinema).name("Room A").build();
        Showtime showtime = Showtime.builder()
                .movie(Movie.builder().title("Movie 1").build())
                .screenRoom(room)
                .startTime(LocalDateTime.now())
                .build();

        Seat seat = Seat.builder().rowName("A").seatNumber(1).build();

        Ticket ticket = Ticket.builder()
                .bookingCode(bookingCode)
                .price(BigDecimal.valueOf(50000))
                .status("BOOKED")
                .showtime(showtime)
                .seat(seat)
                .paymentMethod("MOMO")
                .build();

        when(ticketRepository.findByBookingCode(bookingCode)).thenReturn(List.of(ticket));

        MomoPaymentVerificationResponse response = momoPaymentService.verifyPayment(bookingCode);

        assertNotNull(response);
        assertEquals("BOOKED", response.status());
        assertEquals("Movie 1", response.movieTitle());
        assertEquals("Cinema 1", response.cinemaName());
        assertEquals("Room A", response.screenRoomName());
        assertEquals(List.of("A1"), response.seats());
        verifyNoInteractions(restTemplate);
    }

    @Test
    public void testVerifyPayment_Pending_QueriesMoMo_Success() {
        String bookingCode = "TIC-123456";

        Cinema cinema = Cinema.builder().name("Cinema 1").build();
        ScreenRoom room = ScreenRoom.builder().cinema(cinema).name("Room A").build();
        Showtime showtime = Showtime.builder()
                .movie(Movie.builder().title("Movie 1").build())
                .screenRoom(room)
                .startTime(LocalDateTime.now())
                .build();

        Seat seat = Seat.builder().rowName("A").seatNumber(1).build();

        Ticket pendingTicket = Ticket.builder()
                .bookingCode(bookingCode)
                .price(BigDecimal.valueOf(50000))
                .status("PENDING")
                .showtime(showtime)
                .seat(seat)
                .paymentMethod("MOMO")
                .build();

        Ticket bookedTicket = Ticket.builder()
                .bookingCode(bookingCode)
                .price(BigDecimal.valueOf(50000))
                .status("BOOKED")
                .showtime(showtime)
                .seat(seat)
                .paymentMethod("MOMO")
                .build();

        when(ticketRepository.findByBookingCode(bookingCode))
                .thenReturn(List.of(pendingTicket)) // First call in verifyPayment
                .thenReturn(List.of(bookedTicket)); // Second call after confirmPayment

        when(momoConfig.getAccessKey()).thenReturn("testAccessKey");
        when(momoConfig.getSecretKey()).thenReturn("testSecretKey");
        when(momoConfig.getPartnerCode()).thenReturn("MOMO");
        when(momoConfig.getApiUrl()).thenReturn("https://test-payment.momo.vn");

        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("resultCode", 0);
        mockResponse.put("message", "Success");

        when(restTemplate.postForObject(anyString(), any(), eq(Map.class))).thenReturn(mockResponse);

        MomoPaymentVerificationResponse response = momoPaymentService.verifyPayment(bookingCode);

        assertNotNull(response);
        assertEquals("BOOKED", response.status());
        verify(ticketService, times(1)).confirmPayment(bookingCode);
    }

    @Test
    public void testProcessIpn_Success() {
        String secretKey = "testSecretKey";
        String accessKey = "testAccessKey";

        when(momoConfig.getAccessKey()).thenReturn(accessKey);
        when(momoConfig.getSecretKey()).thenReturn(secretKey);

        String rawSignature = "accessKey=" + accessKey +
                "&amount=50000" +
                "&extraData=" +
                "&message=Success" +
                "&orderId=TIC-123456" +
                "&orderInfo=PaymentInfo" +
                "&orderType=momo_wallet" +
                "&partnerCode=MOMO" +
                "&payType=qr" +
                "&requestId=req-111" +
                "&responseTime=1618210355431" +
                "&resultCode=0" +
                "&transId=999999";

        String signature = calculateExpectedSignature(rawSignature, secretKey);

        MomoIpnRequest request = new MomoIpnRequest(
                "MOMO",
                "TIC-123456",
                "req-111",
                50000L,
                "PaymentInfo",
                "momo_wallet",
                999999L,
                0,
                "Success",
                "qr",
                1618210355431L,
                "",
                signature
        );

        momoPaymentService.processIpn(request);

        verify(ticketService, times(1)).confirmPayment("TIC-123456");
        verify(ticketService, never()).cancelBooking(anyString());
    }

    @Test
    public void testProcessIpn_InvalidSignature_ThrowsAppException() {
        when(momoConfig.getAccessKey()).thenReturn("testAccessKey");
        when(momoConfig.getSecretKey()).thenReturn("testSecretKey");

        MomoIpnRequest request = new MomoIpnRequest(
                "MOMO",
                "TIC-123456",
                "req-111",
                50000L,
                "PaymentInfo",
                "momo_wallet",
                999999L,
                0,
                "Success",
                "qr",
                1618210355431L,
                "",
                "wrongSignature"
        );

        AppException ex = assertThrows(AppException.class, () -> {
            momoPaymentService.processIpn(request);
        });

        assertEquals(ErrorCode.MOMO_PAYMENT_SIGNATURE_INVALID, ex.getErrorCode());
        verifyNoInteractions(ticketService);
    }
}
