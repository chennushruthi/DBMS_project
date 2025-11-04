document.addEventListener('DOMContentLoaded', function () {
  const avatar = document.getElementById('headerAvatar') || document.querySelector('.header-right .avatar');
  const panel = document.getElementById('profilePanel');
  const backdrop = document.getElementById('profileBackdrop');

  function openPanel() {
    if (!panel) return;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (backdrop) { backdrop.classList.add('open'); backdrop.setAttribute('aria-hidden','false'); }
    // focus first interactive element
    const btn = panel.querySelector('.pp-btn');
    if (btn) btn.focus();
  }
  function closePanel() {
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden','true'); }
  }

  if (avatar && panel) {
    avatar.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      // determine open state from aria-hidden to be robust
      const isOpen = panel.getAttribute('aria-hidden') === 'false' || panel.classList.contains('open');
      if (isOpen) closePanel(); else openPanel();
    });
  }

  // clicking the backdrop closes the panel
  if (backdrop) {
    backdrop.addEventListener('click', function (ev) {
      ev.stopPropagation();
      closePanel();
    });
  }

  // prevent clicks inside the panel from closing it (stop propagation)
  if (panel) {
    panel.addEventListener('click', function (ev) {
      ev.stopPropagation();
    });
  }

  // Note: rely on the backdrop to capture outside clicks. Remove document-wide fallback
  // to avoid accidental triggers from other UI elements. The backdrop covers the
  // viewport when the panel is open and will close the panel when clicked.

  // close on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  // small interactions inside panel
  const ppButtons = document.querySelectorAll('.pp-btn[data-action]');
  const ppDetail = document.getElementById('ppDetail');
  ppButtons.forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      const action = b.getAttribute('data-action');
      if (!ppDetail) return;
      if (action === 'bookings') ppDetail.textContent = 'You have 2 upcoming bookings.';
      else if (action === 'payments') ppDetail.textContent = 'Last payment: ₹1,250 on 02 Oct.';
      else if (action === 'settings') ppDetail.textContent = 'Account settings — change email, password, preferences.';
      else ppDetail.textContent = '';
    });
  });

  // Edit location button (no-op placeholder)
  const editLocationBtn = document.getElementById('editLocationBtn');
  if (editLocationBtn) {
    editLocationBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const loc = document.getElementById('ppLocation');
      if (!loc) return;
      const newLoc = prompt('Edit location', loc.textContent || '');
      if (newLoc !== null) loc.textContent = newLoc;
    });
  }
});
