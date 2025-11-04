const API = '../backend/api.php';

async function loadRooms(){
  const res = await fetch(`${API}?action=list_rooms`);
  const data = await res.json();
  const container = document.getElementById('room-list');
  if(!data.success){ container.innerText = 'Failed to load rooms'; return }
  container.innerHTML = '';
  data.rooms.forEach(r=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<h3>${escapeHtml(r.name)}</h3>
      <p>${escapeHtml(r.description||'')}</p>
      <p>Price/night: $${r.price_per_night}</p>
      <p><a href="booking.html?room_id=${r.id}"><button data-id="${r.id}">Select</button></a></p>`;
    container.appendChild(el);
  })
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]) }

window.addEventListener('DOMContentLoaded', loadRooms);
