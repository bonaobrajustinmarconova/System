// ═══════════════════════════════════════════════════════
//  EDIT PROFILE MODAL — shared across all pages
// ═══════════════════════════════════════════════════════

function openEditModal(e) {
  if (e) e.preventDefault();

  fetch('session.php')
    .then(r => r.json())
    .then(data => {
      if (!data.loggedIn) return;
      const u = data.user;
      const fi = document.getElementById('editFname');
      const mi = document.getElementById('editMname');
      const li = document.getElementById('editLname');
      const ui = document.getElementById('editUname');
      const av = document.getElementById('editAvatarPreview');
      if (fi) fi.value = u.fname || '';
      if (mi) mi.value = u.mname || '';
      if (li) li.value = u.lname || '';
      if (ui) ui.value = u.uname || '';

      // ── PROFILE PIC FIX: show actual image if available ──
      if (av) {
        // Remove any existing file input temporarily to check text node
        const fileInput = av.querySelector('input[type="file"]');
        if (u.pfp && u.pfp !== '' && u.pfp !== 'uploads/pfp/default.jpg') {
          av.style.backgroundImage = `url(${u.pfp}?t=${Date.now()})`;
          av.style.backgroundSize = 'cover';
          av.style.backgroundPosition = 'center';
          av.style.color = 'transparent';
          // Clear any letter initial
          Array.from(av.childNodes).forEach(n => {
            if (n.nodeType === 3) n.textContent = '';
          });
        } else {
          av.style.backgroundImage = '';
          av.style.color = '';
          const initial = u.fname ? u.fname[0].toUpperCase() : 'U';
          // Set or update the text node for the initial
          let textNode = Array.from(av.childNodes).find(n => n.nodeType === 3);
          if (textNode) textNode.textContent = initial;
          else av.insertBefore(document.createTextNode(initial), av.firstChild);
        }
      }
    });

  document.getElementById('editModalOverlay').classList.add('open');
  hideEditAlert('info');
  hideEditAlert('pw');
  switchEditTab('info', document.querySelector('.edit-tab'));
}

function closeEditModal() {
  document.getElementById('editModalOverlay').classList.remove('open');
  ['currentPw','newPw','confirmPw'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Reset strength bars
  for (let i = 1; i <= 5; i++) {
    const bar = document.getElementById('pwBar' + i);
    if (bar) bar.classList.remove('met');
  }
  ['length','upper','lower','number','special'].forEach(id => {
    const leg = document.getElementById('req-' + id);
    const dot = document.getElementById('dot-' + id);
    if (leg) leg.classList.remove('met');
    if (dot) dot.classList.remove('met');
  });
  // Hide the widget box
  const box = document.getElementById('editPwStrength');
  if (box) box.classList.remove('show');
}

function handleEditOverlayClick(e) {
  if (e.target === document.getElementById('editModalOverlay')) closeEditModal();
}

// ── TABS ──
function switchEditTab(tab, btn) {
  document.querySelectorAll('.edit-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.edit-tab-content').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const content = document.getElementById(`tab-${tab}`);
  if (content) content.classList.add('active');
}

// ── AVATAR PREVIEW ──
function previewAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const av = document.getElementById('editAvatarPreview');
    if (!av) return;
    av.style.backgroundImage = `url(${e.target.result})`;
    av.style.backgroundSize = 'cover';
    av.style.backgroundPosition = 'center';
    const textNode = Array.from(av.childNodes).find(n => n.nodeType === 3);
    if (textNode) textNode.textContent = '';
  };
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append('pfp', file);
  fetch('upload_pfp.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        showEditAlert('info', 'Profile photo updated!', true);
        // Also update the panel avatar if present
        const menuAvatar = document.getElementById('menuAvatar');
        if (menuAvatar && data.pfp) {
          menuAvatar.style.backgroundImage = `url(${data.pfp})`;
          menuAvatar.style.backgroundSize = 'cover';
          menuAvatar.style.backgroundPosition = 'center';
          menuAvatar.textContent = '';
        }
      } else {
        showEditAlert('info', data.message || 'Upload failed.');
      }
    })
    .catch(() => showEditAlert('info', 'Upload failed.'));
}

// ── PASSWORD TOGGLE ──
function togglePw(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; }
  else { input.type = 'password'; btn.textContent = 'Show'; }
}

// ── PASSWORD STRENGTH — register-style 5-bar widget ──
function checkPwStrength() {
  const pw = document.getElementById('newPw')?.value || '';

  const checks = [
    { id: 'length',  met: pw.length >= 8 },
    { id: 'upper',   met: /[A-Z]/.test(pw) },
    { id: 'lower',   met: /[a-z]/.test(pw) },
    { id: 'number',  met: /[0-9]/.test(pw) },
    { id: 'special', met: /[^a-zA-Z0-9]/.test(pw) },
  ];

  // Update 5 bars
  checks.forEach((c, i) => {
    const bar = document.getElementById('pwBar' + (i + 1));
    if (bar) bar.classList.toggle('met', c.met);
  });

  // Update dot + leg for each requirement
  checks.forEach(c => {
    const leg = document.getElementById('req-' + c.id);
    const dot = document.getElementById('dot-' + c.id);
    if (leg) leg.classList.toggle('met', c.met);
    if (dot) dot.classList.toggle('met', c.met);
  });

  // Show/hide the widget box
  const box = document.getElementById('editPwStrength');
  if (box) box.classList.toggle('show', pw.length > 0);
}

function showEditPwHint() {
  const pw  = document.getElementById('newPw')?.value || '';
  const box = document.getElementById('editPwStrength');
  if (box) box.classList.add('show');
}

function hideEditPwHint() {
  const pw  = document.getElementById('newPw')?.value || '';
  const box = document.getElementById('editPwStrength');
  if (box && pw.length === 0) box.classList.remove('show');
}




// ── ALERTS ──
function showEditAlert(type, msg, isSuccess = false) {
  const el   = document.getElementById(`${type}Alert`);
  const text = document.getElementById(`${type}AlertText`);
  if (!el || !text) return;
  text.textContent = msg;
  el.className = `edit-alert ${isSuccess ? 'success' : 'error'} show`;
}

function hideEditAlert(type) {
  const el = document.getElementById(`${type}Alert`);
  if (el) el.classList.remove('show');
}

// ── SAVE PROFILE INFO ──
async function saveProfileInfo() {
  hideEditAlert('info');
  const fname = document.getElementById('editFname')?.value.trim();
  const mname = document.getElementById('editMname')?.value.trim();
  const lname = document.getElementById('editLname')?.value.trim();
  const uname = document.getElementById('editUname')?.value.trim();
  const btn   = document.getElementById('saveInfoBtn');

  if (!fname || !lname || !uname) {
    showEditAlert('info', 'Please fill in all required fields.');
    return;
  }
  if (uname.length < 3) {
    showEditAlert('info', 'Username must be at least 3 characters.');
    return;
  }

  btn.textContent = 'Saving…';
  btn.classList.add('loading');

  try {
    const res  = await fetch('update_profile.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ action: 'update_info', fname, mname, lname, uname }),
    });
    const data = await res.json();
    if (data.success) {
      showEditAlert('info', 'Profile updated successfully!', true);
      const nameEl   = document.getElementById('menuName');
      const avatarEl = document.getElementById('menuAvatar');
      if (nameEl)   nameEl.textContent   = `${fname} ${lname}`;
      if (avatarEl && !avatarEl.style.backgroundImage) avatarEl.textContent = fname[0];
    } else {
      showEditAlert('info', data.message || 'Failed to update profile.');
    }
  } catch {
    showEditAlert('info', 'Server error. Please try again.');
  }

  btn.textContent = 'Save Changes';
  btn.classList.remove('loading');
}

// ── CHANGE PASSWORD (enhanced security) ──
async function savePassword() {
  hideEditAlert('pw');
  const currentPw = document.getElementById('currentPw')?.value;
  const newPw     = document.getElementById('newPw')?.value;
  const confirmPw = document.getElementById('confirmPw')?.value;
  const btn       = document.getElementById('savePwBtn');

  if (!currentPw || !newPw || !confirmPw) {
    showEditAlert('pw', 'Please fill in all password fields.');
    return;
  }
  // Enhanced requirements
  if (newPw.length < 8) {
    showEditAlert('pw', 'New password must be at least 8 characters.');
    return;
  }
  if (!/[A-Z]/.test(newPw)) {
    showEditAlert('pw', 'Password must contain at least one uppercase letter.');
    return;
  }
  if (!/[a-z]/.test(newPw)) {
    showEditAlert('pw', 'Password must contain at least one lowercase letter.');
    return;
  }
  if (!/[0-9]/.test(newPw)) {
    showEditAlert('pw', 'Password must contain at least one number.');
    return;
  }
  if (!/[^a-zA-Z0-9]/.test(newPw)) {
    showEditAlert('pw', 'Password must contain at least one special character (e.g. @, #, !).');
    return;
  }
  if (newPw === currentPw) {
    showEditAlert('pw', 'New password must be different from your current password.');
    return;
  }
  if (newPw !== confirmPw) {
    showEditAlert('pw', 'New passwords do not match.');
    return;
  }

  btn.textContent = 'Changing…';
  btn.classList.add('loading');

  try {
    const res  = await fetch('update_profile.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        action: 'change_password',
        current_password: currentPw,
        new_password: newPw,
        confirm_password: confirmPw,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showEditAlert('pw', 'Password changed successfully!', true);
      ['currentPw','newPw','confirmPw'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      for (let i = 1; i <= 5; i++) {
        const bar = document.getElementById('pwBar' + i);
        if (bar) bar.classList.remove('met');
      }
      ['length','upper','lower','number','special'].forEach(id => {
        const leg = document.getElementById('req-' + id);
        const dot = document.getElementById('dot-' + id);
        if (leg) leg.classList.remove('met');
        if (dot) dot.classList.remove('met');
      });
      const box = document.getElementById('editPwStrength');
      if (box) box.classList.remove('show');
    } else {
      showEditAlert('pw', data.message || 'Failed to change password.');
    }
  } catch {
    showEditAlert('pw', 'Server error. Please try again.');
  }

  btn.textContent = 'Change Password';
  btn.classList.remove('loading');
}