const API = '../backend/api.php';

async function loadBookings(){
  const res = await fetch(`${API}?action=admin_list_bookings`);
  const data = await res.json();
  const container = document.getElementById('admin-bookings');
  if(!data.success){ container.innerText = 'Failed to load'; return }
  if(data.bookings.length===0){ container.innerText = 'No bookings yet'; return }
  const table = document.createElement('table');
  table.style.width='100%';
  table.innerHTML = `<thead><tr><th>ID</th><th>Customer</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Created</th></tr></thead>`;
  const tbody = document.createElement('tbody');
  data.bookings.forEach(b=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${b.id}</td><td>${escapeHtml(b.customer_name)} (${escapeHtml(b.customer_email)})</td><td>${escapeHtml(b.room_name)}</td><td>${b.check_in}</td><td>${b.check_out}</td><td>${b.guests}</td><td>$${b.total_price}</td><td>${b.created_at}</td>`;
    tbody.appendChild(tr);
  })
  table.appendChild(tbody);
  container.innerHTML=''; container.appendChild(table);
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]) }

window.addEventListener('DOMContentLoaded', loadBookings);
