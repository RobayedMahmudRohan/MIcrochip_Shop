CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE product_reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_product_reviews_product_created (product_id, created_at),
    KEY fk_product_reviews_user (user_id),
    CONSTRAINT fk_product_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_product_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE pickup_points (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_pickup_points (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    pickup_point_id BIGINT UNSIGNED NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_pickup_user FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_user_pickup_point FOREIGN KEY (pickup_point_id) REFERENCES pickup_points (id) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE (user_id, pickup_point_id)
);

CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    guest_email VARCHAR(255) NULL,
    pickup_point_id BIGINT UNSIGNED NOT NULL,
    status ENUM(
        'pending',
        'confirmed',
        'processing',
        'ready_for_pickup',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_orders_pickup_point FOREIGN KEY (pickup_point_id) REFERENCES pickup_points (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM(
        'cash_on_pickup',
        'card',
        'mobile_banking'
    ) NOT NULL,
    status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',
    transaction_reference VARCHAR(255) NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE wishlists (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE (user_id, product_id)
);

CREATE TABLE custom_builds (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    guest_email VARCHAR(255) NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10, 2) NULL,
    status ENUM(
        'submitted',
        'reviewing',
        'quoted',
        'approved',
        'in_progress',
        'completed',
        'rejected',
        'cancelled'
    ) NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_custom_build_user FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE custom_build_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    custom_build_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT fk_custom_build_items_build FOREIGN KEY (custom_build_id) REFERENCES custom_builds (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_custom_build_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE sessions (
    id CHAR(64) COLLATE utf8mb4_general_ci NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sessions_user_expires (user_id, expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- ============================================================
-- CI / E2E TEST DATA
-- ============================================================

INSERT INTO
    categories (id, name, description)
VALUES (
        1,
        'E2E Test Category',
        'Category used for automated E2E tests'
    );

INSERT INTO
    products (
        id,
        category_id,
        name,
        serial_number,
        description,
        price,
        cost_price,
        stock_quantity
    )
VALUES (
        1,
        1,
        'E2E Test Product',
        'E2E-TEST-001',
        'Product used for automated E2E tests',
        1000.00,
        500.00,
        10
    );