-- V3__seed_cinema_data.sql

-- Seed Cinemas
INSERT INTO cinemas (id, name, address, description, created_at, updated_at) VALUES
(1, 'CineVN Nguyễn Du', '116 Nguyễn Du, Phường Bến Thành, Quận 1, TP.HCM', 'Cụm rạp trung tâm thành phố với chất lượng phòng chiếu hàng đầu, phòng chiếu IMAX hiện đại.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'CineVN Thủ Đức', '216 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM', 'Cụm rạp hiện đại phục vụ các bạn sinh viên và cư dân Thủ Đức với không gian ẩm thực đa dạng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Adjust sequence to avoid primary key conflict on manual inserts
SELECT setval('cinemas_id_seq', 2);

-- Seed Screen Rooms
INSERT INTO screen_rooms (id, name, cinema_id, total_seats, is_active, created_at, updated_at) VALUES
(1, 'Phòng chiếu 1 (IMAX)', 1, 80, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Phòng chiếu 2 (2D/3D)', 1, 80, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Phòng chiếu 3 (Gold Class)', 1, 40, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Phòng chiếu 1 (2D)', 2, 80, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Phòng chiếu 2 (2D)', 2, 80, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Phòng chiếu 3 (3D)', 2, 80, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Phòng chiếu 4 (L''amour)', 2, 30, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Adjust sequence to avoid primary key conflict on manual inserts
SELECT setval('screen_rooms_id_seq', 7);

-- Seed Seats using PL/pgSQL
DO $$
DECLARE
    r_id INT;
    row_char CHAR(1);
    row_idx INT;
    col_idx INT;
    s_type VARCHAR(50);
BEGIN
    -- Rooms 1, 2, 4, 5, 6: 8 rows (A-H), 10 columns (1-10) = 80 seats each
    FOREACH r_id IN ARRAY ARRAY[1, 2, 4, 5, 6] LOOP
        FOR row_idx IN 0..7 LOOP
            row_char := chr(65 + row_idx); -- A, B, C, D, E, F, G, H
            FOR col_idx IN 1..10 LOOP
                -- Rows E and F are VIP, others are NORMAL
                IF row_char IN ('E', 'F') THEN
                    s_type := 'VIP';
                ELSE
                    s_type := 'NORMAL';
                END IF;
                
                INSERT INTO seats (screen_room_id, row_name, seat_number, seat_type, is_active, created_at, updated_at)
                VALUES (r_id, row_char, col_idx, s_type, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            END LOOP;
        END LOOP;
    END LOOP;

    -- Room 3 (Gold Class): 5 rows (A-E), 8 columns (1-8) = 40 seats
    FOR row_idx IN 0..4 LOOP
        row_char := chr(65 + row_idx);
        FOR col_idx IN 1..8 LOOP
            -- Row E is VIP, others are NORMAL
            IF row_char = 'E' THEN
                s_type := 'VIP';
            ELSE
                s_type := 'NORMAL';
            END IF;
            
            INSERT INTO seats (screen_room_id, row_name, seat_number, seat_type, is_active, created_at, updated_at)
            VALUES (3, row_char, col_idx, s_type, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END LOOP;
    END LOOP;

    -- Room 7 (L'amour - Couple room): 3 rows (A-C), 10 columns (1-10) = 30 seats, all are COUPLE seats
    FOR row_idx IN 0..2 LOOP
        row_char := chr(65 + row_idx);
        FOR col_idx IN 1..10 LOOP
            INSERT INTO seats (screen_room_id, row_name, seat_number, seat_type, is_active, created_at, updated_at)
            VALUES (7, row_char, col_idx, 'COUPLE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END LOOP;
    END LOOP;
END $$;
