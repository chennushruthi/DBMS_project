<<<<<<< HEAD
# DBMS Project — Hotel Booking Prototype

This repository contains a minimal hotel booking DBMS prototype.

Stack
- Frontend: HTML, CSS, JavaScript (vanilla)
- Backend: PHP (mysqli)
- Database: MySQL

What I added
- `public/` — static frontend files (`index.html`, `styles.css`, `script.js`)
- `backend/` — PHP backend (`db.php`, `api.php`)
- `sql/schema.sql` — database schema + sample hotels

Quick setup
1. Create a MySQL database, e.g. `hotel_db`.
2. Import `sql/schema.sql` into the database.
3. Update DB credentials in `backend/db.php`.
4. Run PHP's built-in server from the `public` folder for local testing:

   ```powershell
   cd "d:\DBMS project\public"; php -S localhost:8000 -t .
   ```

5. Ensure the backend `api.php` is accessible via your PHP runtime (place `backend` in a server root or configure routing).

Notes
- Password handling uses PHP password hashing (see `backend/api.php`).
- This is a minimal foundation — you'll want to add validation, authentication tokens, and more robust error handling before production.

Next steps (suggested)
- Add login/session handling.
- Add hotel CRUD for admins.
- Add UI pages for user registration and bookings management.

Flask backend (Python)
----------------------

A minimal Flask app is included (`app.py`) that demonstrates basic CRUD against a `students` table in a `DBMS_project` MySQL database.

Quick steps to run the Flask app (PowerShell):

1. Create the database and tables by importing the SQL in `sql/dbms_project_schema.sql` (or run the statements in your MySQL client).

   Example using the mysql CLI (adjust username/password as needed):

   ```powershell
   mysql -u root -p < "d:\DBMS_project\sql\dbms_project_schema.sql"
   ```

2. Create and activate a Python virtual environment, then install dependencies:

   ```powershell
   python -m venv .venv; .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Configure DB credentials (optional). By default `db_connect.py` uses `root`/`Shruthi_2006` and database `DBMS_project`.
   You can set environment variables to override:

   - `DB_HOST` (default: localhost)
   - `DB_USER` (default: root)
   - `DB_PASSWORD` (default: Shruthi_2006)
   - `DB_NAME` (default: DBMS_project)

   Example (PowerShell):

   ```powershell
   $env:DB_PASSWORD = 'your_db_password'; $env:DB_NAME = 'DBMS_project'
   ```

4. Run the Flask app:

   ```powershell
   python app.py
   ```

5. Open http://127.0.0.1:5000/students to view the students UI.

Notes
- The `db_connect.get_connection()` function returns a new MySQL connection; callers must close it.
- This demo is intentionally minimal. For production: secure secrets, use migrations, add input validation, and enable proper error handling.

=======
# DBMS_project
>>>>>>> 2aaf82f5b02e39d4380261b9e581c89801ffd0fe
