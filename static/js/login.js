// Minimal login.js: enhance form UX by disabling submit while posting
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('loginForm');
  const resp = document.getElementById('resp');
  if(!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const btn = form.querySelector('.primary');
    if(btn){
      btn.disabled = true;
      btn.textContent = 'Signing in...';
    }
    if(resp) resp.textContent = '';

    const data = new FormData(form);

    fetch(form.action || '/login', {
      method: 'POST',
      headers: {'X-Requested-With': 'XMLHttpRequest'},
      body: data
    }).then(async res => {
      const json = await res.json().catch(() => ({}));
        if(res.ok && json && json.success){
        // Render success box below the form
        renderSuccessBox(json.message || 'your login is done successful! stayEase');
        // short delay then redirect to home
        setTimeout(()=>{ window.location.href = '/home'; }, 1200);
      } else {
        const msg = (json && json.message) ? json.message : 'Login failed';
        renderError(msg);
        if(btn){ btn.disabled = false; btn.textContent = 'Login'; }
      }
    }).catch(err => {
      renderError('Network error, try again');
      if(btn){ btn.disabled = false; btn.textContent = 'Login'; }
    });
  });

  function renderSuccessBox(message){
    // remove existing boxes
    removeBoxes();
    const box = document.createElement('div');
    box.className = 'success-box';
    box.innerHTML = `<div class="icon">✓</div><div>${message}</div>`;
    form.parentNode.insertBefore(box, form.nextSibling);
    if(resp) resp.textContent = '';
  }

  function renderError(message){
    removeBoxes();
    if(resp) resp.textContent = message;
  }

  function removeBoxes(){
    const prev = document.querySelector('.success-box');
    if(prev) prev.remove();
    if(resp) resp.textContent = '';
  }
});
