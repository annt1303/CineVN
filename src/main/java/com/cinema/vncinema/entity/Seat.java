package com.cinema.vncinema.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_room_id", nullable = false)
    private ScreenRoom screenRoom;

    @Column(name = "row_name", nullable = false, length = 10)
    private String rowName;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @Column(name = "grid_column")
    private Integer gridColumn;

    @Column(name = "seat_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SeatType seatType = SeatType.NORMAL;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
