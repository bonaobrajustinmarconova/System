function togglePassword() {
      const input = document.getElementById('password');
      const btn   = document.querySelector('.toggle-pw');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    }

    // ── REMEMBER ME: pre-fill on load ──
    document.addEventListener('DOMContentLoaded', () => {
      const saved = localStorage.getItem('nestqc_remember');
      if (saved) {
        const { username } = JSON.parse(saved);
        document.getElementById('username').value = username;
        document.getElementById('remember').checked = true;
      }
    });

    async function handleLogin() {
      const username  = document.getElementById('username').value.trim();
      const password  = document.getElementById('password').value.trim();
      const remember  = document.getElementById('remember').checked;
      const btn       = document.getElementById('loginBtn');
      const errorMsg  = document.getElementById('errorMsg');
      const errorTxt  = document.getElementById('errorText');

      errorMsg.classList.remove('show');
      document.getElementById('username').classList.remove('error');
      document.getElementById('password').classList.remove('error');

      if (!username || !password) {
        errorTxt.textContent = 'Please fill in all fields.';
        errorMsg.classList.add('show');
        if (!username) document.getElementById('username').classList.add('error');
        if (!password) document.getElementById('password').classList.add('error');
        return;
      }

      btn.textContent = 'Signing in…';
      btn.classList.add('loading');

      try {
        const res  = await fetch('login.php', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (data.success) {
          // Handle remember me
          if (remember) {
            localStorage.setItem('nestqc_remember', JSON.stringify({ username }));
          } else {
            localStorage.removeItem('nestqc_remember');
          }
          btn.textContent = '✓ Welcome back!';
          setTimeout(() => {
            if (data.user.role === 'admin') {
              window.location.href = 'admin_dashboard.html';
            } else {
              window.location.href = 'homepage.html';
            }
          }, 800);
        } else {
          errorTxt.textContent = data.message || 'Invalid username or password.';
          errorMsg.classList.add('show');
          document.getElementById('username').classList.add('error');
          document.getElementById('password').classList.add('error');
          btn.textContent = 'Sign In';
          btn.classList.remove('loading');
        }
      } catch (err) {
        errorTxt.textContent = 'Server error. Please try again.';
        errorMsg.classList.add('show');
        btn.textContent = 'Sign In';
        btn.classList.remove('loading');
      }
    }

    // Allow Enter key to submit
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !document.getElementById('forgotOverlay').classList.contains('open')) handleLogin();
    });

    // ── FORGOT PASSWORD MODAL ──
    function openForgotModal() {
      document.getElementById('forgotOverlay').classList.add('open');
      document.getElementById('forgotAlert').className = 'forgot-alert';
      document.getElementById('forgotUsername').value  = document.getElementById('username').value;
      document.getElementById('forgotNewPw').value     = '';
      document.getElementById('forgotConfirmPw').value = '';
      document.getElementById('forgotBtn').textContent = 'Reset Password';
      document.getElementById('forgotBtn').classList.remove('loading');

      document.getElementById('forgotPwStrength').classList.remove('show');
        [1,2,3,4,5].forEach(n => {
          const bar = document.getElementById('fbar' + n);
          const dot = document.getElementById('fdot' + n);
          const leg = document.getElementById('fleg' + n);
          if (bar) bar.classList.remove('met');
          if (dot) dot.classList.remove('met');
          if (leg) leg.classList.remove('met');
      });
    }

    function closeForgotModal() {
      document.getElementById('forgotOverlay').classList.remove('open');
    }

    function handleForgotOverlayClick(e) {
      if (e.target === document.getElementById('forgotOverlay')) closeForgotModal();
    }

      function toggleForgotPw(id, btn) {
        const input = document.getElementById(id);
        if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; }
        else { input.type = 'password'; btn.textContent = 'Show'; }
      }

        function checkForgotStrength() {
      const pw   = document.getElementById('forgotNewPw').value;
      const user = document.getElementById('forgotUsername').value.trim().toLowerCase();

      const checks = [
        pw.length >= 8,
        /[A-Z]/.test(pw),
        /[a-z]/.test(pw),
        /[0-9]/.test(pw),
        /[^a-zA-Z0-9]/.test(pw),
      ];

      checks.forEach((met, i) => {
        const n = i + 1;
        const bar = document.getElementById('fbar' + n);
        const dot = document.getElementById('fdot' + n);
        const leg = document.getElementById('fleg' + n);
        if (bar) bar.classList.toggle('met', met);
        if (dot) dot.classList.toggle('met', met);
        if (leg) leg.classList.toggle('met', met);
      });

      const wrap = document.getElementById('forgotPwStrength');
      if (wrap && pw.length > 0) wrap.classList.add('show');
    }

    function showForgotHint() {
      document.getElementById('forgotPwStrength').classList.add('show');
    }

    function hideForgotHint() {
      const pw = document.getElementById('forgotNewPw').value;
      if (pw.length === 0) document.getElementById('forgotPwStrength').classList.remove('show');
    }

    async function handleForgotPassword() {
      const username  = document.getElementById('forgotUsername').value.trim();
      const newPw     = document.getElementById('forgotNewPw').value;
      const confirmPw = document.getElementById('forgotConfirmPw').value;
      const btn       = document.getElementById('forgotBtn');
      const alert     = document.getElementById('forgotAlert');
      const alertText = document.getElementById('forgotAlertText');

      alert.className = 'forgot-alert';

      if (!username || !newPw || !confirmPw) {
        alertText.textContent = 'Please fill in all fields.';
        alert.className = 'forgot-alert error'; return;
      }
      if (newPw.length < 8) {
        alertText.textContent = 'Password must be at least 8 characters.';
        alert.className = 'forgot-alert error'; return;
      }
      if (!/[A-Z]/.test(newPw)) {
        alertText.textContent = 'Password must contain at least one uppercase letter.';
        alert.className = 'forgot-alert error'; return;
      }
      if (!/[a-z]/.test(newPw)) {
        alertText.textContent = 'Password must contain at least one lowercase letter.';
        alert.className = 'forgot-alert error'; return;
      }
      if (!/[0-9]/.test(newPw)) {
        alertText.textContent = 'Password must contain at least one number.';
        alert.className = 'forgot-alert error'; return;
      }
      if (!/[^a-zA-Z0-9]/.test(newPw)) {
        alertText.textContent = 'Password must contain at least one special character.';
        alert.className = 'forgot-alert error'; return;
      }
      if (newPw.toLowerCase() === username.toLowerCase()) {
        alertText.textContent = 'Password cannot be the same as your username.';
        alert.className = 'forgot-alert error'; return;
      }
      const oldPwVal = document.getElementById('forgotOldPw') ? document.getElementById('forgotOldPw').value : null;
      if (oldPwVal && newPw === oldPwVal) {
        alertText.textContent = 'New password cannot be the same as your current password.';
        alert.className = 'forgot-alert error'; return;
      }
      if (newPw !== confirmPw) {
        alertText.textContent = 'Passwords do not match.';
        alert.className = 'forgot-alert error'; return;
      }

      btn.textContent = 'Resetting…';
      btn.classList.add('loading');

      try {
        const res  = await fetch('reset_password.php', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ username, new_password: newPw }),
        });
        const data = await res.json();
        if (data.success) {
          alertText.textContent = 'Password reset! You can now sign in.';
          alert.className = 'forgot-alert success';
          document.getElementById('username').value = username;
          setTimeout(() => closeForgotModal(), 2000);
        } else {
          alertText.textContent = data.message || 'Reset failed. Check your username.';
          alert.className = 'forgot-alert error';
        }
      } catch {
        alertText.textContent = 'Server error. Please try again.';
        alert.className = 'forgot-alert error';
      }

      btn.textContent = 'Reset Password';
      btn.classList.remove('loading');
    }