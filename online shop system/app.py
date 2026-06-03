from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # Allows your index.html to talk to this Python server

# Connects to your XAMPP MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="flashbites_ledger"
    )

# 1. GET ALL ORDERS & SHOP BALANCE
@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Pull orders from your customer_orders table
        cursor.execute("SELECT * FROM customer_orders ORDER BY order_id DESC")
        orders = cursor.fetchall()
        
        # Calculate your balance from the bank_transactions table
        cursor.execute("SELECT COALESCE(SUM(amount), 0) AS current_balance FROM bank_transactions")
        balance_row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "orders": orders,
            "shopBalance": float(balance_row['current_balance'])
        })
    except Exception as e:
        return jsonify({"error": str(e), "orders": [], "shopBalance": 0.0})

# 2. CREATE A NEW ORDER
@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Inserts a new row using the values you typed or auto-filled
        query = "INSERT INTO customer_orders (customer_name, delivery_address, order_value, status) VALUES (%s, %s, %s, 'PLACED')"
        cursor.execute(query, (data['customer_name'], data['delivery_address'], data['order_value']))
        
        conn.commit()
        order_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        return jsonify({"success": True, "order_id": order_id})
    except Exception as e:
        return jsonify({"error": str(e)})

# 3. UPDATE STATUS & ADD/SUBTRACT MONEY
@app.route('/api/orders/status', methods=['PUT'])
def update_status():
    try:
        data = request.json
        order_id = int(data['order_id'])
        next_status = data['nextStatus']
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check what the order status is right now
        cursor.execute("SELECT status, order_value FROM customer_orders WHERE order_id = %s", (order_id,))
        current_order = cursor.fetchone()
        
        if current_order:
            # If changed to DELIVERED -> Add money to your bank table
            if next_status == 'DELIVERED' and current_order['status'] != 'DELIVERED':
                cursor.execute("INSERT INTO bank_transactions (order_id, amount, transaction_type) VALUES (%s, %s, 'EARNINGS')", (order_id, current_order['order_value']))
            
            # If CANCELLED after being delivered -> Subtract money (Refund)
            elif next_status == 'CANCELLED' and current_order['status'] == 'DELIVERED':
                refund_amt = -float(current_order['order_value'])
                cursor.execute("INSERT INTO bank_transactions (order_id, amount, transaction_type) VALUES (%s, %s, 'REFUND')", (order_id, refund_amt))
                
            # Update the main order status string
            cursor.execute("UPDATE customer_orders SET status = %s WHERE order_id = %s", (next_status, order_id))
            conn.commit()
            response = {"success": True}
        else:
            response = {"error": "Order not found"}
            
        cursor.close()
        conn.close()
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(port=5000, debug=True)