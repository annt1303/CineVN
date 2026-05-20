-- V9__create_showtime_and_pricing_tables.sql

CREATE TABLE seat_type_prices (
    id BIGSERIAL PRIMARY KEY,
    seat_type VARCHAR(50) NOT NULL UNIQUE,
    surcharge NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE base_price_configs (
    id BIGSERIAL PRIMARY KEY,
    room_type VARCHAR(50) NOT NULL,
    movie_format VARCHAR(50) NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_base_price_config UNIQUE (room_type, movie_format, is_weekend, time_slot)
);

CREATE TABLE showtimes (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    screen_room_id BIGINT NOT NULL REFERENCES screen_rooms(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    movie_format VARCHAR(50) NOT NULL DEFAULT 'FORMAT_2D',
    base_price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    showtime_id BIGINT NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
    seat_id BIGINT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, BOOKED, CANCELLED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_showtime_seat UNIQUE (showtime_id, seat_id)
);

-- Seed Seat Type Prices
INSERT INTO seat_type_prices (seat_type, surcharge) VALUES 
('NORMAL', 0.00),
('VIP', 20000.00),
('COUPLE', 50000.00);

-- Seed Base Price Configs
-- STANDARD room configurations
INSERT INTO base_price_configs (room_type, movie_format, is_weekend, time_slot, base_price) VALUES
('STANDARD', 'FORMAT_2D', false, 'DAYTIME', 60000.00),
('STANDARD', 'FORMAT_2D', false, 'EVENING', 80000.00),
('STANDARD', 'FORMAT_2D', true, 'DAYTIME', 85000.00),
('STANDARD', 'FORMAT_2D', true, 'EVENING', 95000.00),

('STANDARD', 'FORMAT_3D', false, 'DAYTIME', 80000.00),
('STANDARD', 'FORMAT_3D', false, 'EVENING', 100000.00),
('STANDARD', 'FORMAT_3D', true, 'DAYTIME', 110000.00),
('STANDARD', 'FORMAT_3D', true, 'EVENING', 120000.00),

-- IMAX room configurations
('IMAX', 'FORMAT_IMAX', false, 'DAYTIME', 120000.00),
('IMAX', 'FORMAT_IMAX', false, 'EVENING', 150000.00),
('IMAX', 'FORMAT_IMAX', true, 'DAYTIME', 160000.00),
('IMAX', 'FORMAT_IMAX', true, 'EVENING', 180000.00),

-- GOLD_CLASS configurations
('GOLD_CLASS', 'FORMAT_2D', false, 'DAYTIME', 200000.00),
('GOLD_CLASS', 'FORMAT_2D', false, 'EVENING', 220000.00),
('GOLD_CLASS', 'FORMAT_2D', true, 'DAYTIME', 250000.00),
('GOLD_CLASS', 'FORMAT_2D', true, 'EVENING', 300000.00),

-- DELUXE configurations
('DELUXE', 'FORMAT_2D', false, 'DAYTIME', 90000.00),
('DELUXE', 'FORMAT_2D', false, 'EVENING', 110000.00),
('DELUXE', 'FORMAT_2D', true, 'DAYTIME', 120000.00),
('DELUXE', 'FORMAT_2D', true, 'EVENING', 140000.00);
