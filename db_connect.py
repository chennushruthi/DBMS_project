import os
import mysql.connector
from mysql.connector import Error


def get_connection():
    """Return a new MySQL connection.

    Reads configuration from environment variables if present, otherwise
    falls back to the values that were previously used in this project.
    Caller is responsible for closing the connection.
    """
    config = {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'user': os.environ.get('DB_USER', 'root'),
        'password': os.environ.get('DB_PASSWORD', 'Shruthi_2006'),
        'database': os.environ.get('DB_NAME', 'DBMS_project'),
        'auth_plugin': os.environ.get('DB_AUTH_PLUGIN', None)
    }

    # Remove None values because mysql.connector.connect doesn't like them
    config = {k: v for k, v in config.items() if v is not None}

    try:
        conn = mysql.connector.connect(**config)
        return conn
    except Error as err:
        # Surface a helpful error to callers
        raise


if __name__ == '__main__':
    # Quick local sanity check when run directly
    try:
        conn = get_connection()
        if conn.is_connected():
            print('✅ Connection Successful!')
            print('Connected to database:', conn.database)
            print('MySQL Server version:', conn.get_server_info())
    except Error as e:
        print('❌ Connection Error:', e)
    finally:
        try:
            if 'conn' in locals() and conn.is_connected():
                conn.close()
                print('🔒 MySQL connection closed.')
        except Exception:
            pass
