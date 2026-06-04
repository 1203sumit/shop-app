# Merchant Dashboard & Auto-Ledger System

## Overview

Merchant Dashboard & Auto-Ledger System is a full-stack web application designed to help small business merchants manage customer orders and track financial transactions digitally. The platform provides a real-time operational dashboard, automated order processing, and an intelligent ledger management system that keeps financial records synchronized with order status updates.

## Key Features

* Real-time customer message simulation similar to WhatsApp order requests.
* One-click Auto-Fill functionality for customer details and order information.
* Order lifecycle management with status tracking:

  * Placed
  * Preparing
  * Out for Delivery
  * Delivered
  * Cancelled
* Automated banking ledger system for accurate financial tracking.
* Live shop balance updates based on order delivery and cancellation events.
* Secure backend integration using Flask and MySQL.
* Persistent database storage with transaction logging.

## Technology Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python (Flask)

### Database

* MySQL (XAMPP/phpMyAdmin)

## Auto-Ledger Engine

The application includes an automated financial ledger system that eliminates manual accounting errors.

* When an order status changes to **DELIVERED**, the order amount is automatically credited to the merchant's account.
* When a delivered order is later changed to **CANCELLED**, a refund transaction is automatically generated and the corresponding amount is debited from the account.
* All financial activities are recorded in the `bank_transactions` table, ensuring complete transaction traceability.

## Testing Strategy

### 1. API Integration Verification

* Verify successful GET, POST, and PUT requests between the frontend and Flask backend.
* Ensure no CORS issues or connection failures occur.
* Monitor requests using browser Developer Tools (F12).

### 2. Database Verification

* Confirm all dashboard actions are correctly stored in MySQL.
* Validate auto-increment behavior of `order_id`.
* Verify data persistence through phpMyAdmin.

### 3. Ledger Accuracy Validation

* Compare the displayed shop balance with the total transaction amount stored in the `bank_transactions` table.
* Ensure all credits and debits are reflected accurately after status updates.

## Test Cases

### Positive Test Cases

| ID    | Test Scenario              | Expected Result                                                              |
| ----- | -------------------------- | ---------------------------------------------------------------------------- |
| TC-01 | Click "Simulate New Msg"   | A new customer message appears instantly in the message stream.              |
| TC-02 | Click "Auto-Fill Form"     | Customer Name, Address, and Price fields are populated automatically.        |
| TC-03 | Submit a valid order form  | Order is added to the Kitchen Queue and form fields reset successfully.      |
| TC-04 | Click "Move Step"          | Order status progresses sequentially: PLACED → PREPARING → OUT_FOR_DELIVERY. |
| TC-05 | Mark an order as DELIVERED | Transaction is recorded, balance increases, and order status is locked.      |

### Negative Test Cases

| ID    | Test Scenario                            | Expected Result                                                         |
| ----- | ---------------------------------------- | ----------------------------------------------------------------------- |
| TC-06 | Submit form with blank Customer Name     | Submission is rejected and no database record is created.               |
| TC-07 | Submit form with blank Address           | Validation prevents record creation and displays an error.              |
| TC-08 | Click "Move Step" on a cancelled order   | Action is disabled and status remains CANCELLED.                        |
| TC-09 | Stop MySQL service and load application  | Application handles the failure gracefully and logs the database error. |
| TC-10 | Cancel an order that was never delivered | Status changes to CANCELLED but no refund transaction is generated.     |

## Project Objective

The primary goal of this project is to automate order management and financial bookkeeping for small businesses by integrating operational workflows with a real-time accounting ledger. This ensures accurate financial records, improved efficiency, and reduced manual effort.
