document.getElementById('loginForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const respEl = document.getElementById('resp');
  respEl.textContent = '';
  respEl.className = 'resp';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try{
    const res = await fetch('/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password})
    });

    const body = await res.json().catch(()=>({message:res.statusText}));
    if(res.ok){
      respEl.classList.add('success');
      const msg = body.message || 'Login successful';
      respEl.innerHTML = `<strong style="margin-right:8px">✔</strong>${msg}`;
      // Save user id for later frontend calls (demo)
      if(body.user_id) try{ localStorage.setItem('user_id', String(body.user_id)); }catch(e){}
      // Redirect to home page after short delay so user sees the green box
      setTimeout(()=>{ window.location.href = '/home' }, 900);
    } else {
      respEl.classList.add('error');
      const msg = body.message || 'Login failed';
      respEl.innerHTML = `<strong style="margin-right:8px">✖</strong>${msg}`;
    }
  }catch(err){
    respEl.classList.add('error');
    respEl.textContent = 'Network error: '+err.message;
  }
});
