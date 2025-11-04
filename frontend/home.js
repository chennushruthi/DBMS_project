// Single DOMContentLoaded handler: panel toggles, profile actions, and header personalization
document.addEventListener('DOMContentLoaded', function(){
  const avatar = document.getElementById('profileAvatar') || document.querySelector('.avatar');
  const panel = document.getElementById('profilePanel');
  const logoutBtn = document.getElementById('logoutBtn');
  const detail = document.getElementById('ppDetail');
  const links = panel ? panel.querySelectorAll('.pp-btn[data-action]') : [];
  const brandSub = document.querySelector('.brand-sub');

  if(!panel) return;

  function closePanel(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }
  function openPanel(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); }

  // Toggle via avatar click
  avatar && avatar.addEventListener('click', function(e){ e.stopPropagation(); if(panel.classList.contains('open')) closePanel(); else openPanel(); });

  // Close when clicking outside
  document.addEventListener('click', function(e){ if(panel.classList.contains('open') && !panel.contains(e.target) && e.target !== avatar) closePanel(); });

  // ESC closes
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closePanel(); });

  logoutBtn && logoutBtn.addEventListener('click', function(){ localStorage.removeItem('user_id'); window.location.href = '/'; });

  function renderError(msg){ if(!detail) return; detail.innerHTML = `<div style="color:#ef4444">${msg}</div>`; }

  async function fetchAndRender(action){
    if(!detail) return;
    detail.innerHTML = '<div style="color:#475569">Loading…</div>';
    const userId = localStorage.getItem('user_id');
    if(!userId){ renderError('Not logged in — please sign in to view this data.'); return; }
    try{
      const res = await fetch(`/api/user/${userId}/${action}`);
      if(!res.ok){ const b = await res.json().catch(()=>({message:res.statusText})); renderError(b.message || 'Failed to load'); return; }
      const body = await res.json();
      if(action === 'bookings'){
        const items = body.bookings || [];
        if(!items.length) return detail.innerHTML = '<div>No bookings found.</div>';
        detail.innerHTML = items.map(it=>`
          <div style="padding:8px 6px;border-radius:8px;background:linear-gradient(90deg,rgba(74,168,155,0.03),transparent);margin-bottom:8px">
            <div style="font-weight:700;color:#0f172a">${it.title}</div>
            <div style="font-size:13px;color:#475569">${it.date} — ${it.status} — $${it.amount}</div>
          </div>
        `).join('');
        return;
      }
      if(action === 'payments'){
        const items = body.payments || [];
        if(!items.length) return detail.innerHTML = '<div>No payments found.</div>';
        detail.innerHTML = items.map(p=>`
          <div style="padding:8px 6px;border-radius:8px;background:#fff;margin-bottom:8px;border:1px solid rgba(0,0,0,0.04)">
            <div style="font-weight:600">${p.method} • ${p.date}</div>
            <div style="font-size:13px;color:#475569">${p.status} — $${p.amount}</div>
          </div>
        `).join('');
        return;
      }
      if(action === 'settings'){
        const s = body.settings || {};
        detail.innerHTML = `
          <div style="font-size:14px;color:#0f172a;font-weight:700">${s.name || ''}</div>
          <div style="font-size:13px;color:#475569">${s.email || ''}</div>
          <div style="margin-top:8px;font-size:13px">Notifications: <strong>${s.notifications ? 'On' : 'Off'}</strong></div>
          <div style="font-size:13px">Newsletter: <strong>${s.newsletter ? 'Subscribed' : 'Off'}</strong></div>
        `;
        return;
      }
      detail.innerHTML = '<div>Unsupported action</div>';
    }catch(err){ renderError('Network error: '+err.message); }
  }

  Array.from(links || []).forEach(a=>{ a.addEventListener('click', function(e){ e.preventDefault(); const action = a.getAttribute('data-action'); if(!action) return; if(!panel.classList.contains('open')) openPanel(); fetchAndRender(action); }); });

  // On load: if logged in, fetch user settings and populate header location & some profile fields
  (async function populateUserSettings(){
    const userId = localStorage.getItem('user_id');
    if(!userId) return;
    try{
      const res = await fetch(`/api/user/${userId}/settings`);
      if(!res.ok) return;
      const body = await res.json();
      const s = (body && body.settings) || {};
      if(s.location && brandSub) brandSub.textContent = s.location;
      // populate basic profile fields in panel if present
      const nameEl = document.querySelector('.pp-name');
      const emailEl = document.getElementById('ppEmail');
      const phoneEl = document.getElementById('ppPhone');
      const locEl = document.getElementById('ppLocation');
      if(nameEl && s.name) nameEl.textContent = s.name;
      if(emailEl && s.email) emailEl.textContent = s.email;
      if(locEl && typeof s.location !== 'undefined' && s.location !== null && s.location !== '') locEl.textContent = s.location;
      // phone not stored by default; if server supplies it, populate
      if(phoneEl && s.phone) phoneEl.textContent = s.phone;

      // wire edit/save/cancel UI for location
      const editBtn = document.getElementById('editLocationBtn');
      const editWrap = document.getElementById('editLocationWrap');
      const editInput = document.getElementById('editLocationInput');
      const saveBtn = document.getElementById('saveLocationBtn');
      const cancelBtn = document.getElementById('cancelLocationBtn');
      if(editBtn && editWrap && editInput && saveBtn && cancelBtn){
        editBtn.addEventListener('click', function(){
          editWrap.style.display = 'block';
          editInput.value = (locEl && locEl.textContent) ? locEl.textContent : '';
          editInput.focus();
        });
        cancelBtn.addEventListener('click', function(){ editWrap.style.display = 'none'; });
        saveBtn.addEventListener('click', async function(){
          const newLoc = editInput.value.trim();
          if(!newLoc) return;
          saveBtn.disabled = true; saveBtn.textContent = 'Saving...';
          try{
            const upd = await fetch(`/api/user/${userId}/settings`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({location:newLoc}) });
            if(upd.ok){
              if(locEl) locEl.textContent = newLoc;
              if(brandSub) brandSub.textContent = newLoc;
              editWrap.style.display = 'none';
            } else {
              const b = await upd.json().catch(()=>({message:upd.statusText}));
              alert('Failed to save: '+(b.message||'Unknown'));
            }
          }catch(err){ alert('Network error: '+err.message); }
          finally{ saveBtn.disabled = false; saveBtn.textContent = 'Save'; }
        });
      }
      // if you want email shown somewhere in the panel header, ensure an element exists; we render it when 'settings' action is clicked
    }catch(err){ /* ignore silently */ }
  })();

});
