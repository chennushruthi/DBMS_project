const API = '../backend/api.php';

function getQueryParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

window.addEventListener('DOMContentLoaded', ()=>{
  const roomId = getQueryParam('room_id');
  if(roomId){ document.getElementById('room-id').value = roomId; fetchRoom(roomId); }
  document.getElementById('booking-form').addEventListener('submit', submitBooking);
})

async function fetchRoom(id){
  const res = await fetch(`${API}?action=get_room&id=${encodeURIComponent(id)}`);
  const data = await res.json();
  if(data.success){ document.getElementById('room-title').innerText = 'Booking — '+data.room.name }
}

async function submitBooking(e){
  e.preventDefault();
  const form = document.getElementById('booking-form');
  const payload = new FormData(form);
  payload.append('action','create_booking');
  const res = await fetch(API, {method:'POST', body:payload});
  const data = await res.json();
  const out = document.getElementById('result');
  if(data.success){ out.innerText = 'Booking successful. ID: '+data.booking_id; form.reset(); }
  else{ out.innerText = 'Booking failed: '+(data.error||'unknown'); }
}
