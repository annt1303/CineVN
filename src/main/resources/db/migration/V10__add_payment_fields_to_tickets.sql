-- V10__add_payment_fields_to_tickets.sql
-- Add booking reference code (groups multiple seats in one transaction) and payment method

ALTER TABLE tickets ADD COLUMN booking_code VARCHAR(50);
ALTER TABLE tickets ADD COLUMN payment_method VARCHAR(50);
