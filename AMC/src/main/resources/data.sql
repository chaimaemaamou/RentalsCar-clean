-- =============================================================
-- AMC SEED DATA - ACHIR MAAMOU CAR
-- Contact: achirmaamoucar@gmail.com
-- Phones: 0668952313 (WhatsApp), 0600365574
-- =============================================================

-- ============= USERS (admin only) =============
-- BCrypt hash corresponds to the password: password
INSERT INTO users (id, email, password, first_name, last_name, role, is_deleted) VALUES
    (1, 'chaimae.maamou@amc.local', '$2a$12$nuUAbA7P.EHThrEV/N5cguViYndSjU./xu3/ZAAKL/Fp4Nnh6DqoO', 'Chaimae', 'Maamou', 'MANAGER', false)
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    COALESCE((SELECT MAX(id) FROM users), 0)
);

-- ============= CARS (Real Fleet) =============
INSERT INTO cars (id, brand, model, seats, transmission, fuel_type, daily_fee, inventory, is_deleted) VALUES
    (1, 'Dacia',   'Logan',    5, 'MANUAL', 'GASOLINE', 230.00, 2, false),
    (2, 'Dacia',   'Sandero',  5, 'MANUAL', 'GASOLINE', 230.00, 2, false),
    (3, 'Renault', 'Clio 5',   5, 'MANUAL', 'GASOLINE', 280.00, 3, false)
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('cars', 'id'),
    COALESCE((SELECT MAX(id) FROM cars), 0)
);

-- ============= CAR IMAGES =============
INSERT INTO car_images (id, car_id, image_url, is_primary) VALUES
    (1, 1, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80', true),
    (2, 1, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80', false),
    (3, 2, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1600&q=80', true),
    (4, 2, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80', false),
    (5, 3, 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=80', true),
    (6, 3, 'https://images.unsplash.com/photo-1471478331149-c72bef4903cd?auto=format&fit=crop&w=1600&q=80', false)
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('car_images', 'id'),
    COALESCE((SELECT MAX(id) FROM car_images), 0)
);

-- =============================================================
-- END OF SEED DATA
-- =============================================================
