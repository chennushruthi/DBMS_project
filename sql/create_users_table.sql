-- Create DBMS_project database and a simple users table
CREATE DATABASE IF NOT EXISTS DBMS_project;
USE DBMS_project;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);
