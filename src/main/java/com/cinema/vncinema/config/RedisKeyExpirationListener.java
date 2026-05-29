package com.cinema.vncinema.config;

import com.cinema.vncinema.dto.response.SeatStatusUpdateResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Listens for Redis key expiration events.
 * When a seat hold key (seat:hold:{showtimeId}:{seatId}) expires after TTL,
 * this listener broadcasts a WebSocket message so all connected clients
 * can update the seat status back to "available" in real-time.
 *
 * Requires Redis to be configured with: notify-keyspace-events Ex
 * (set via spring.data.redis.notify-keyspace-events in application.yaml)
 */
@Slf4j
@Component
public class RedisKeyExpirationListener extends KeyExpirationEventMessageListener {

    private static final String SEAT_HOLD_KEY_PREFIX = "seat:hold:";

    private final SimpMessagingTemplate messagingTemplate;

    public RedisKeyExpirationListener(RedisMessageListenerContainer listenerContainer,
                                      SimpMessagingTemplate messagingTemplate) {
        super(listenerContainer);
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Called when any Redis key expires.
     * Filters only seat hold keys and broadcasts seat release via WebSocket.
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = message.toString();

        if (!expiredKey.startsWith(SEAT_HOLD_KEY_PREFIX)) {
            return;
        }

        // Key format: seat:hold:{showtimeId}:{seatId}
        try {
            String suffix = expiredKey.substring(SEAT_HOLD_KEY_PREFIX.length());
            String[] parts = suffix.split(":");
            if (parts.length != 2) {
                log.warn("Unexpected seat hold key format on expiration: {}", expiredKey);
                return;
            }

            Long showtimeId = Long.parseLong(parts[0]);
            Long seatId = Long.parseLong(parts[1]);

            log.info("Seat hold expired — showtimeId={}, seatId={}", showtimeId, seatId);

            SeatStatusUpdateResponse payload = new SeatStatusUpdateResponse(
                    showtimeId,
                    List.of(seatId),
                    "available",
                    null  // no bookingToken since it was auto-released by TTL
            );

            messagingTemplate.convertAndSend(
                    "/topic/showtimes/" + showtimeId + "/seats",
                    payload
            );
        } catch (NumberFormatException e) {
            log.error("Failed to parse seat hold key on expiration: {}", expiredKey, e);
        }
    }
}
