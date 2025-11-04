<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$action = $_REQUEST['action'] ?? '';
$db = get_db();

// Actions for modules: list_rooms, get_room, create_booking, admin_list_bookings
if($action === 'list_rooms'){
    $stmt = $db->prepare('SELECT id, name, description, price_per_night FROM rooms ORDER BY id');
    $stmt->execute();
    $res = $stmt->get_result();
    $rooms = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['success'=>true,'rooms'=>$rooms]); exit;
}

if($action === 'get_room'){
    $id = intval($_GET['id'] ?? 0);
    if(!$id){ echo json_encode(['success'=>false,'error'=>'Missing id']); exit; }
    $stmt = $db->prepare('SELECT id, name, description, price_per_night FROM rooms WHERE id = ? LIMIT 1');
    $stmt->bind_param('i',$id); $stmt->execute();
    $room = $stmt->get_result()->fetch_assoc();
    if(!$room){ echo json_encode(['success'=>false,'error'=>'Room not found']); exit; }
    echo json_encode(['success'=>true,'room'=>$room]); exit;
}

if($action === 'create_booking' && $_SERVER['REQUEST_METHOD'] === 'POST'){
    $room_id = intval($_POST['room_id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $check_in = $_POST['check_in'] ?? '';
    $check_out = $_POST['check_out'] ?? '';
    $guests = intval($_POST['guests'] ?? 1);
    $payment_type = $_POST['payment_type'] ?? 'unknown';

    if(!$room_id || !$name || !$email || !$check_in || !$check_out){ echo json_encode(['success'=>false,'error'=>'Missing fields']); exit; }

    $stmt = $db->prepare('SELECT price_per_night FROM rooms WHERE id = ?');
    $stmt->bind_param('i',$room_id); $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    if(!$r){ echo json_encode(['success'=>false,'error'=>'Room not found']); exit; }
    $price = floatval($r['price_per_night']);

    $d1 = new DateTime($check_in);
    $d2 = new DateTime($check_out);
    $days = max(1, $d2->diff($d1)->days);
    $total = $price * $days * max(1,$guests);

    // Create or find customer
    $stmt = $db->prepare('SELECT id FROM customers WHERE email = ? LIMIT 1');
    $stmt->bind_param('s',$email); $stmt->execute();
    $res = $stmt->get_result(); $cust = $res->fetch_assoc();
    if($cust){ $customer_id = $cust['id']; }
    else{
        $stmt = $db->prepare('INSERT INTO customers (name,email) VALUES (?,?)');
        $stmt->bind_param('ss',$name,$email); $stmt->execute();
        $customer_id = $db->insert_id;
    }

    // Insert booking
    $stmt = $db->prepare('INSERT INTO bookings (customer_id, room_id, check_in, check_out, guests, total_price, created_at) VALUES (?,?,?,?,?,?,NOW())');
    $stmt->bind_param('iissid',$customer_id,$room_id,$check_in,$check_out,$guests,$total);
    $ok = $stmt->execute();
    if(!$ok){ echo json_encode(['success'=>false,'error'=>'Insert failed']); exit; }
    $booking_id = $db->insert_id;

    // Store payment record (simple)
    $stmt = $db->prepare('INSERT INTO payments (booking_id, amount, payment_type, created_at) VALUES (?,?,?,NOW())');
    $stmt->bind_param('ids',$booking_id,$total,$payment_type); $stmt->execute();

    echo json_encode(['success'=>true,'booking_id'=>$booking_id]); exit;
}

if($action === 'admin_list_bookings'){
    $q = "SELECT b.id,b.check_in,b.check_out,b.guests,b.total_price,b.created_at,c.name as customer_name,c.email as customer_email,r.name as room_name FROM bookings b JOIN customers c ON b.customer_id=c.id JOIN rooms r ON b.room_id=r.id ORDER BY b.id DESC";
    $res = $db->query($q);
    $rows = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['success'=>true,'bookings'=>$rows]); exit;
}

// Unknown action
http_response_code(400);
echo json_encode(['success'=>false,'error'=>'Unknown action']);

// Extended actions for modules: list_rooms, get_room, create_booking, admin_list_bookings
if($action === 'list_rooms'){
    $stmt = $db->prepare('SELECT id, name, description, price_per_night FROM rooms ORDER BY id');
    $stmt->execute();
    $res = $stmt->get_result();
    $rooms = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['success'=>true,'rooms'=>$rooms]); exit;
}

if($action === 'get_room'){
    $id = intval($_GET['id'] ?? 0);
    if(!$id){ echo json_encode(['success'=>false,'error'=>'Missing id']); exit; }
    $stmt = $db->prepare('SELECT id, name, description, price_per_night FROM rooms WHERE id = ? LIMIT 1');
    $stmt->bind_param('i',$id); $stmt->execute();
    $room = $stmt->get_result()->fetch_assoc();
    if(!$room){ echo json_encode(['success'=>false,'error'=>'Room not found']); exit; }
    echo json_encode(['success'=>true,'room'=>$room]); exit;
}

if($action === 'create_booking' && $_SERVER['REQUEST_METHOD'] === 'POST'){
    $room_id = intval($_POST['room_id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $check_in = $_POST['check_in'] ?? '';
    $check_out = $_POST['check_out'] ?? '';
    $guests = intval($_POST['guests'] ?? 1);
    $payment_type = $_POST['payment_type'] ?? 'unknown';

    if(!$room_id || !$name || !$email || !$check_in || !$check_out){ echo json_encode(['success'=>false,'error'=>'Missing fields']); exit; }

    $stmt = $db->prepare('SELECT price_per_night FROM rooms WHERE id = ?');
    $stmt->bind_param('i',$room_id); $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    if(!$r){ echo json_encode(['success'=>false,'error'=>'Room not found']); exit; }
    $price = floatval($r['price_per_night']);

    $d1 = new DateTime($check_in);
    $d2 = new DateTime($check_out);
    $days = max(1, $d2->diff($d1)->days);
    $total = $price * $days * max(1,$guests);

    // Create or find customer
    $stmt = $db->prepare('SELECT id FROM customers WHERE email = ? LIMIT 1');
    $stmt->bind_param('s',$email); $stmt->execute();
    $res = $stmt->get_result(); $cust = $res->fetch_assoc();
    if($cust){ $customer_id = $cust['id']; }
    else{
        $stmt = $db->prepare('INSERT INTO customers (name,email) VALUES (?,?)');
        $stmt->bind_param('ss',$name,$email); $stmt->execute();
        $customer_id = $db->insert_id;
    }

    // Insert booking
    $stmt = $db->prepare('INSERT INTO bookings (customer_id, room_id, check_in, check_out, guests, total_price, created_at) VALUES (?,?,?,?,?,?,NOW())');
    $stmt->bind_param('iissid',$customer_id,$room_id,$check_in,$check_out,$guests,$total);
    $ok = $stmt->execute();
    if(!$ok){ echo json_encode(['success'=>false,'error'=>'Insert failed']); exit; }
    $booking_id = $db->insert_id;

    // Store payment record (simple)
    $stmt = $db->prepare('INSERT INTO payments (booking_id, amount, payment_type, created_at) VALUES (?,?,?,NOW())');
    $stmt->bind_param('ids',$booking_id,$total,$payment_type); $stmt->execute();

    echo json_encode(['success'=>true,'booking_id'=>$booking_id]); exit;
}

if($action === 'admin_list_bookings'){
    $q = "SELECT b.id,b.check_in,b.check_out,b.guests,b.total_price,b.created_at,c.name as customer_name,c.email as customer_email,r.name as room_name FROM bookings b JOIN customers c ON b.customer_id=c.id JOIN rooms r ON b.room_id=r.id ORDER BY b.id DESC";
    $res = $db->query($q);
    $rows = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['success'=>true,'bookings'=>$rows]); exit;
}
