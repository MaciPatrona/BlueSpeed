-- BlueSpeed Courier Service Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS bluespeed CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bluespeed;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(10) NOT NULL UNIQUE,
    sender_id INT NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_address TEXT NOT NULL,
    service_id INT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    dimensions VARCHAR(50) NOT NULL,
    status ENUM('pending', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
) ENGINE=InnoDB;

-- Tracking table
CREATE TABLE IF NOT EXISTS tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    status ENUM('pending', 'in_transit', 'delivered', 'cancelled') NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id)
) ENGINE=InnoDB;

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    delivery_time VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default services
INSERT INTO services (name, description, price, delivery_time) VALUES
('Standard Delivery', 'Regular delivery service within 3-5 business days', 10.00, '3-5 business days'),
('Express Delivery', 'Fast delivery service within 1-2 business days', 20.00, '1-2 business days'),
('Same Day Delivery', 'Delivery on the same day for local addresses', 30.00, 'Same day');

-- Create indexes
CREATE INDEX idx_tracking_number ON packages(tracking_number);
CREATE INDEX idx_package_status ON packages(status);
CREATE INDEX idx_tracking_package ON tracking(package_id);
CREATE INDEX idx_tracking_timestamp ON tracking(timestamp);

-- Create views
CREATE VIEW package_details AS
SELECT 
    p.*,
    s.name as service_name,
    s.price as service_price,
    s.delivery_time,
    u.username as sender_username,
    u.email as sender_email,
    u.phone as sender_phone
FROM packages p
JOIN services s ON p.service_id = s.id
JOIN users u ON p.sender_id = u.id;

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE get_package_status(IN tracking_num VARCHAR(10))
BEGIN
    SELECT 
        p.*,
        s.name as service_name,
        s.price as service_price,
        s.delivery_time,
        u.username as sender_username,
        u.email as sender_email,
        u.phone as sender_phone
    FROM packages p
    JOIN services s ON p.service_id = s.id
    JOIN users u ON p.sender_id = u.id
    WHERE p.tracking_number = tracking_num;
END //

CREATE PROCEDURE get_tracking_history(IN tracking_num VARCHAR(10))
BEGIN
    SELECT 
        t.*,
        p.tracking_number
    FROM tracking t
    JOIN packages p ON t.package_id = p.id
    WHERE p.tracking_number = tracking_num
    ORDER BY t.timestamp DESC;
END //

DELIMITER ;

-- Create triggers
DELIMITER //

CREATE TRIGGER before_package_insert
BEFORE INSERT ON packages
FOR EACH ROW
BEGIN
    IF NEW.tracking_number IS NULL THEN
        SET NEW.tracking_number = CONCAT(
            UPPER(SUBSTRING(MD5(RAND()), 1, 5)),
            LPAD(FLOOR(RAND() * 10000), 4, '0'),
            UPPER(SUBSTRING(MD5(RAND()), 1, 1))
        );
    END IF;
END //

CREATE TRIGGER after_package_status_update
AFTER UPDATE ON packages
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO tracking (package_id, status, location, description)
        VALUES (NEW.id, NEW.status, 'System Update', CONCAT('Status changed to ', NEW.status));
    END IF;
END //

DELIMITER ; 