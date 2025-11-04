const API_BASE = "../backend/api.php";

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]) }

async function fetchHotels(){
  // Backward-compatible: call list_rooms and render if hotel-list exists
  const listEl = document.getElementById('hotel-list');
  if(!listEl) return; // nothing to do on this page

  const res = await fetch(`${API_BASE}?action=list_rooms`);
  const data = await res.json();
  if(!data.success){ listEl.innerText = 'Failed to load hotels'; return }
  listEl.innerHTML = '';
  data.rooms.forEach(h=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<h3>${escapeHtml(h.name)}</h3>
      <p>${escapeHtml(h.description||'')}</p>
      <p>Price/night: $${h.price_per_night}</p>
      <p><a href="booking.html?room_id=${h.id}"><button data-id="${h.id}" data-name="${escapeHtml(h.name)}">Book</button></a></p>`;
    listEl.appendChild(el);
  })
}

function startBooking(id,name){
  const bookingSection = document.getElementById('booking-section');
  if(!bookingSection) return;
  bookingSection.classList.remove('hidden');
  document.getElementById('booking-hotel-name').innerText = name;
  const hid = document.getElementById('hotel-id'); if(hid) hid.value = id;
}

function cancelBooking(){
  const bookingSection = document.getElementById('booking-section');
  if(!bookingSection) return;
  bookingSection.classList.add('hidden');
  const out = document.getElementById('booking-result'); if(out) out.innerText = '';
}

async function submitBooking(e){
  e.preventDefault();
  const hotelIdEl = document.getElementById('hotel-id');
  if(!hotelIdEl) return;
  const hotel_id = hotelIdEl.value;
  const name = (document.getElementById('guest-name')||{}).value || '';
  const email = (document.getElementById('guest-email')||{}).value || '';
  const check_in = (document.getElementById('check-in')||{}).value || '';
  const check_out = (document.getElementById('check-out')||{}).value || '';
  const guests = (document.getElementById('guests')||{}).value || 1;
  const payload = new URLSearchParams();
  payload.append('action','create_booking');
  payload.append('room_id', hotel_id);
  payload.append('name', name);
  payload.append('email', email);
  payload.append('check_in', check_in);
  payload.append('check_out', check_out);
  payload.append('guests', guests);

  const res = await fetch(API_BASE, {method:'POST', body:payload});
  const data = await res.json();
  const out = document.getElementById('booking-result');
  if(out){
    if(data.success){ out.innerText = 'Booking confirmed. Booking ID: '+data.booking_id; }
    else{ out.innerText = 'Booking failed: '+(data.error||'unknown'); }
  }
}

// init
window.addEventListener('DOMContentLoaded', ()=>{
  try{ fetchHotels(); }catch(e){}
  const bookingForm = document.getElementById('booking-form');
  if(bookingForm) bookingForm.addEventListener('submit', submitBooking);
  const cancelBtn = document.getElementById('cancel-booking');
  if(cancelBtn) cancelBtn.addEventListener('click', cancelBooking);
})