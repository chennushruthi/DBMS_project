from flask import Flask, render_template, request, redirect, url_for, flash, session
from db_connect import get_connection
import mysql.connector
from mysql.connector import Error as MySQLError

app = Flask(__name__)
app.secret_key = 'dev-secret'  # Set via env var in production: os.environ['FLASK_SECRET']


def dict_cursor(conn):
    return conn.cursor(dictionary=True)


@app.route('/')
def index():
    # If logged in, go to home, otherwise show login
    if session.get('user'):
        return redirect(url_for('home'))
    return redirect(url_for('login'))


@app.route('/students')
def list_students():
    # Require login to view students
    if not session.get('user'):
        return redirect(url_for('login'))

    conn = get_connection()
    cur = dict_cursor(conn)
    try:
        try:
            cur.execute('SELECT * FROM students ORDER BY id DESC')
            rows = cur.fetchall()
        except Exception as pe:
            # If MySQL reports 'table doesn't exist' (error 1146) show an actionable message.
            errno = getattr(pe, 'errno', None) or getattr(pe, 'args', [None])[0]
            if errno == 1146 or (isinstance(errno, int) and errno == 1146):
                conn.rollback()
                rows = []
                flash("Database schema not found (missing table 'students'). Run the SQL schema to create required tables: see sql/dbms_project_schema.sql", 'error')
            else:
                # re-raise unexpected errors so the debugger can surface them during development
                raise
    finally:
        cur.close()
        conn.close()
    return render_template('list_students.html', students=rows)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Accept any email/password for development/testing as requested.
        username = request.form.get('username', '').strip() or 'Guest'
        password = request.form.get('password', '').strip()

        # Create session for the user unconditionally (dev mode)
        session['user'] = {'username': username}

        # Message to show in the success box before redirecting
        success_message = 'Your login is done successfully! StayEase'

        # Return JSON for AJAX requests, otherwise redirect after flashing
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
            return {'success': True, 'message': success_message}

        flash(success_message, 'success')
        return redirect(url_for('home'))

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Logged out.', 'success')
    return redirect(url_for('login'))


@app.route('/home')
def home():
    if not session.get('user'):
        return redirect(url_for('login'))
    return render_template('home.html', user=session.get('user'))


@app.route('/stay-types')
def stay_types():
    # Show stay-type recommendations for a given celebration/occasion
    if not session.get('user'):
        return redirect(url_for('login'))

    occasion = request.args.get('occasion', 'celebration')
    # canonical list of stay types to present
    stay_types_list = [
        'Single Room',
        'Double Bedroom',
        'Suite Room',
        'Resort Stay',
        'Villa / Cottage',
        'Work & Stay Room'
    ]
    return render_template('stay_types.html', occasion=occasion, stay_types=stay_types_list, user=session.get('user'), show_header=False)


@app.route('/results')
def results():
    # Simple placeholder results page for selection
    if not session.get('user'):
        return redirect(url_for('login'))

    stay_type = request.args.get('type', '')
    occasion = request.args.get('occasion', '')
    # In a full implementation we'd perform a search/query here. For now render a placeholder.
    return render_template('results.html', stay_type=stay_type, occasion=occasion, user=session.get('user'), show_header=False)


@app.route('/students/add', methods=['GET', 'POST'])
def add_student():
    if request.method == 'POST':
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip()
        year = request.form.get('enrollment_year') or None

        if not first_name or not last_name or not email:
            flash('First name, last name and email are required.', 'error')
            return redirect(url_for('add_student'))

        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                'INSERT INTO students (first_name, last_name, email, enrollment_year) VALUES (%s,%s,%s,%s)',
                (first_name, last_name, email, year)
            )
            conn.commit()
            flash('Student added.', 'success')
            return redirect(url_for('list_students'))
        except Exception as e:
            conn.rollback()
            flash(f'Error adding student: {e}', 'error')
            return redirect(url_for('add_student'))
        finally:
            cur.close()
            conn.close()

    return render_template('add_student.html')


@app.route('/students/<int:student_id>/edit', methods=['GET', 'POST'])
def edit_student(student_id):
    conn = get_connection()
    cur = dict_cursor(conn)
    if request.method == 'POST':
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip()
        year = request.form.get('enrollment_year') or None
        try:
            upd = conn.cursor()
            upd.execute(
                'UPDATE students SET first_name=%s,last_name=%s,email=%s,enrollment_year=%s WHERE id=%s',
                (first_name, last_name, email, year, student_id)
            )
            conn.commit()
            flash('Student updated.', 'success')
            return redirect(url_for('list_students'))
        except Exception as e:
            conn.rollback()
            flash(f'Error updating student: {e}', 'error')
            return redirect(url_for('edit_student', student_id=student_id))
        finally:
            upd.close()
            conn.close()

    try:
        cur.execute('SELECT * FROM students WHERE id=%s', (student_id,))
        student = cur.fetchone()
    finally:
        cur.close()
        conn.close()

    if not student:
        flash('Student not found', 'error')
        return redirect(url_for('list_students'))

    return render_template('add_student.html', student=student)


@app.route('/students/<int:student_id>/delete', methods=['POST'])
def delete_student(student_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM students WHERE id=%s', (student_id,))
        conn.commit()
        flash('Student deleted.', 'success')
    except Exception as e:
        conn.rollback()
        flash(f'Error deleting student: {e}', 'error')
    finally:
        cur.close()
        conn.close()
    return redirect(url_for('list_students'))


if __name__ == '__main__':
    # In dev: set FLASK_ENV=development and run python app.py
    app.run(host='0.0.0.0', port=5000, debug=True)
