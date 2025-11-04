"""init_db.py
Run the SQL schema file to create the DBMS_project database and tables.
Usage (PowerShell):
    Set-Location -Path 'd:\DBMS_project'
    python .\scripts\init_db.py

It reads DB_HOST/DB_USER/DB_PASSWORD from environment if set, otherwise uses defaults in db_connect.py.
"""
import os
import mysql.connector
from mysql.connector import Error

SQL_FILE = os.path.join(os.path.dirname(__file__), '..', 'sql', 'dbms_project_schema.sql')

HOST = os.environ.get('DB_HOST', 'localhost')
USER = os.environ.get('DB_USER', 'root')
PASSWORD = os.environ.get('DB_PASSWORD', 'Shruthi_2006')

print('Using MySQL host=%s user=%s' % (HOST, USER))

with open(SQL_FILE, 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    # Connect without specifying database so CREATE DATABASE works
    conn = mysql.connector.connect(host=HOST, user=USER, password=PASSWORD)
    cur = conn.cursor()
    for result in cur.execute(sql, multi=True):
        # result is an iterator of MySQLCursor objects for each statement
        if result.with_rows:
            print('Fetched rows for:', result.statement)
    conn.commit()
    print('\n✅ Schema applied successfully. Database and tables are created (if not present).')
except Error as e:
    print('\n❌ Error while applying schema:', e)
finally:
    try:
        cur.close()
    except Exception:
        pass
    try:
        conn.close()
    except Exception:
        pass
