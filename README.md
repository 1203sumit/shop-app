# Merchant Dashboard & Auto-Ledger System

This is a full-stack web application designed for small business merchants to digitize their order management and financial tracking. The frontend features a live operational dashboard that simulates real-time customer messages (e.g., from WhatsApp), provides one-click data auto-fill, and tracks order fulfillment statuses.

The backend is built with **Python (Flask)** and communicates with a **MySQL database** to process data streams securely. The system features a built-in automated banking ledger engine: moving an order status to "DELIVERED" instantly credits the shop's live balance, while moving a delivered order to "CANCELLED" automatically triggers a debit refund log. This eliminates manual ledger errors by perfectly syncing order statuses with financial records.

---

### 🛠️ Testing Strategy & Execution Points

To ensure the application functions perfectly before production deployment, verify these three main operational pillars:

1. **API Integration Check:** Open the browser's developer console (F12) to ensure the frontend successfully sends `GET`, `POST`, and `PUT` web requests to the Flask server (`http://127.0.0.1:5000`) without CORS blocks or connection failures.
2. **Database Verification:** After performing any dashboard action, query the XAMPP phpMyAdmin tables to ensure data is writing permanently to disk and that `order_id` fields auto-increment correctly.
3. **Ledger Calculation Engine:** Cross-check that the frontend display balance matches the mathematical sum of the `amount` columns inside the `bank_transactions` table after multiple simulated state changes.

---

### 🧪 Test Cases (Positive & Negative)

#### Positive Test Cases (Happy Path)
These test cases check if the system behaves correctly when valid data is entered.

| ID |                   Test Scenario |                    Expected Result |

| **TC-01** | Click **"Simulate New Msg"** button. | A message bubble appears instantly in the stream with mock data. |
| **TC-02** | Click **"Auto-Fill Form"** on a message bubble. | Name, Address, and Price dropdown populate correctly with no manual typing. |
| **TC-03** | Submit a fully filled valid order form. | The order appears in the Kitchen Queue table, and fields reset cleanly. |
| **TC-04** | Click **"Move Step"** on a new order row. | The status badge updates sequentially (PLACED -> PREPARING -> OUT_FOR_DELIVERY). |
| **TC-05** | Advance an order status to **"DELIVERED"**. | The status locks, a row enters `bank_transactions`, and the Shop Bank Balance increases. |

#### Negative Test Cases (Error Handling)
These test cases check if the system safely blocks invalid actions without crashing.

| ID             | Test Scenario |                                                  Expected Result |

| **TC-06** | Submit the order form with the **Customer Name field blank**. | The UI blocks submission or backend returns an error; no row is added to SQL. |
| **TC-07** | Submit the order form with the **Address field blank**. | The database rejects the blank value, preventing empty records in the dashboard. |
| **TC-08** | Attempt to click **"Move Step"** on a cancelled order. | The action is disabled or ignored; status remains strictly `CANCELLED`. |
| **TC-09** | Shut down **MySQL in XAMPP** and try to load the page. | The app handles the drop gracefully; balance shows `0.00` and console catches the connection error. |
| **TC-10** | Cancel an order that was **never delivered** (e.g., while still `PREPARING`). | Status switches directly to `CANCELLED`, but **no** refund row is added to the bank table since no money was collected. |
