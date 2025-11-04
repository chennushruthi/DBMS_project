<?php
// Simple DB connection helper. Update credentials below.

define('DB_HOST','127.0.0.1');
define('DB_USER','root');
define('DB_PASS','');
define('DB_NAME','hotel_db');

function get_db(){
    static $mysqli = null;
    if($mysqli === null){
        $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if($mysqli->connect_errno){
            http_response_code(500);
            echo json_encode(['success'=>false,'error'=>'DB connection failed']);
            exit;
        }
        $mysqli->set_charset('utf8mb4');
    }
    return $mysqli;
}
