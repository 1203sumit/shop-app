-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS flashbites_ledger;
USE flashbites_ledger;

-- 2. Create the Customer Orders Log Table
CREATE TABLE IF NOT EXISTS customer_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    delivery_address TEXT NOT NULL,
    order_value DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLACED'
) AUTO_INCREMENT = 101;

-- 3. Create the Financial Banking Ledger Table
CREATE TABLE IF NOT EXISTS bank_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES customer_orders(order_id) ON DELETE CASCADE
);