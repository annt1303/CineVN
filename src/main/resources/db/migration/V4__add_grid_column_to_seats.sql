-- V4__add_grid_column_to_seats.sql

ALTER TABLE seats ADD COLUMN grid_column INTEGER;

-- Backfill existing data: copy seat_number to grid_column
UPDATE seats SET grid_column = seat_number;
