from flask import Flask, request, jsonify
import os, sys
from flask_cors import CORS
from flask import send_from_directory
# Ensure project root is on sys.path so we can import db_connect from the repo root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from db_connect import get_connection

app = Flask(__name__)
CORS(app, resources={r"/submit": {"origins": "*"}})

# Serve the frontend directory so the page and API share the same origin
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))


@app.route('/', methods=['GET'])
def serve_index():
    # Serve the login page as the root page to match the reference design
    return send_from_directory(FRONTEND_DIR, 'login.html')


@app.route('/<path:filename>', methods=['GET'])
def serve_static(filename):
    # Serve JS/CSS/static assets from the frontend folder
    return send_from_directory(FRONTEND_DIR, filename)


@app.route('/home', methods=['GET'])
def serve_home():
    return send_from_directory(FRONTEND_DIR, 'home.html')


@app.route('/submit', methods=['POST'])
def submit_data():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')

    if not name or not email:
        return jsonify({'message': 'name and email required'}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (name, email) VALUES (%s, %s)", (name, email))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error saving data: {e}'}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Data saved successfully!"})


@app.route('/login', methods=['GET', 'POST'])
def login():
    # GET: serve login page
    if request.method == 'GET':
        return send_from_directory(FRONTEND_DIR, 'login.html')

    # POST: accept JSON {email, password}
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email:
        return jsonify({'message':'email required'}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute('SELECT id, name, email FROM users WHERE email=%s LIMIT 1', (email,))
        row = cur.fetchone()
        if not row:
            return jsonify({'message':'Invalid credentials'}), 401
        # NOTE: demo - we don't validate password since users table has no password column
        return jsonify({'message':'Login successful', 'user_id': row[0]})
    finally:
        cur.close()
        conn.close()


@app.route('/api/user/<int:user_id>/bookings', methods=['GET'])
def user_bookings(user_id):
    """Return demo bookings for the user. In a full app this would query a bookings table."""
    # Demo/mock data - replace with real DB queries as needed
    demo = [
        {
            'booking_id': 1000 + user_id,
            'title': 'The Serenity Suites',
            'date': '2025-11-12',
            'status': 'Confirmed',
            'amount': 189.00
        },
        {
            'booking_id': 1001 + user_id,
            'title': "Innovator's Hub - Study Retreat",
            'date': '2025-12-03',
            'status': 'Pending',
            'amount': 120.00
        }
    ]
    return jsonify({'user_id': user_id, 'bookings': demo})


@app.route('/api/user/<int:user_id>/payments', methods=['GET'])
def user_payments(user_id):
    """Return demo payment history for the user."""
    demo = [
        {'payment_id': 5000 + user_id, 'date': '2025-09-01', 'method': 'Card', 'amount': 189.00, 'status': 'Paid'},
        {'payment_id': 5001 + user_id, 'date': '2025-08-15', 'method': 'Wallet', 'amount': 50.00, 'status': 'Refunded'}
    ]
    return jsonify({'user_id': user_id, 'payments': demo})


@app.route('/api/user/<int:user_id>/settings', methods=['GET'])
def user_settings(user_id):
    """Return account settings for the user; pull basic profile from users table."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Check whether `location` column exists in users table for this DB
        db_name = conn.database if hasattr(conn, 'database') and conn.database else None
        has_location = False
        if db_name:
            info_cur = conn.cursor()
            try:
                info_cur.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=%s AND TABLE_NAME='users' AND COLUMN_NAME='location'", (db_name,))
                cnt = info_cur.fetchone()[0]
                has_location = cnt > 0
            finally:
                info_cur.close()

        if has_location:
            cur.execute('SELECT id, name, email, location FROM users WHERE id=%s LIMIT 1', (user_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'message':'User not found'}), 404
            settings = {
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'location': row[3] or '',
                'notifications': True,
                'newsletter': False
            }
        else:
            # location column missing; return settings without location
            cur.execute('SELECT id, name, email FROM users WHERE id=%s LIMIT 1', (user_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'message':'User not found'}), 404
            settings = {
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'location': '',
                'notifications': True,
                'newsletter': False
            }
        return jsonify({'user_id': user_id, 'settings': settings})
    finally:
        cur.close()
        conn.close()


@app.route('/api/user/<int:user_id>/settings', methods=['PATCH'])
def update_user_settings(user_id):
    """Update user settings such as name, email, location. If `location` column is missing, add it.
    Accepts JSON: { name?, email?, location? }
    """
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    location = data.get('location')

    if not any([name, email, location]):
        return jsonify({'message':'no fields to update'}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        # ensure users row exists
        cur.execute('SELECT id FROM users WHERE id=%s LIMIT 1', (user_id,))
        if not cur.fetchone():
            return jsonify({'message':'User not found'}), 404

        # check for location column and add if needed
        if location is not None:
            # determine DB name
            db_name = conn.database if hasattr(conn, 'database') and conn.database else None
            has_location = False
            if db_name:
                info_cur = conn.cursor()
                try:
                    info_cur.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=%s AND TABLE_NAME='users' AND COLUMN_NAME='location'", (db_name,))
                    cnt = info_cur.fetchone()[0]
                    has_location = cnt > 0
                finally:
                    info_cur.close()
            if not has_location:
                # add a simple VARCHAR(255) location column
                try:
                    cur.execute("ALTER TABLE users ADD COLUMN location VARCHAR(255) DEFAULT ''")
                    conn.commit()
                except Exception:
                    conn.rollback()
                    # if alter fails, return an error
                    return jsonify({'message':'Failed to add location column on the server'}), 500

        # build update query
        fields = []
        params = []
        if name is not None:
            fields.append('name=%s'); params.append(name)
        if email is not None:
            fields.append('email=%s'); params.append(email)
        if location is not None:
            fields.append('location=%s'); params.append(location)

        if fields:
            sql = 'UPDATE users SET ' + ','.join(fields) + ' WHERE id=%s'
            params.append(user_id)
            cur.execute(sql, tuple(params))
            conn.commit()

        return jsonify({'message':'updated', 'user_id': user_id})
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error updating settings: {e}'}), 500
    finally:
        cur.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
