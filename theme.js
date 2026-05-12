/* ═══════════════════════════════════════════════════════
   NestQC — Theme Toggle (Dark ↔ Light)
   - Logged-in users: preference saved to DB via save_theme.php
   - Guests: preference saved to localStorage
   - Persists across all pages and accounts
   ═══════════════════════════════════════════════════════ */

(function () {
  const STORAGE_KEY = 'nestqc_theme';

  /* Apply theme to <body> immediately */
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }

  /* Step 1: Apply localStorage theme instantly to avoid flash,
     then verify/override with DB preference once session loads */
  const localTheme = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(localTheme);

  /* Step 2: After DOM is ready, check session and load correct theme */
  document.addEventListener('DOMContentLoaded', function () {

    fetch('session.php')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.loggedIn && data.user.theme) {
          /* Logged in — use their DB preference */
          applyTheme(data.user.theme);
          /* Also sync localStorage so there's no flash on next page */
          localStorage.setItem(STORAGE_KEY, data.user.theme);
        } else {
          /* Guest — use localStorage preference */
          applyTheme(localTheme);
        }
      })
      .catch(function () {
        /* session.php unreachable — fall back to localStorage */
        applyTheme(localTheme);
      });

    /* Wire up toggle buttons */
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  });

  /* Toggle and save */
  function toggleTheme() {
    const isLight = document.body.classList.toggle('light');
    const theme   = isLight ? 'light' : 'dark';

    /* Always update localStorage for instant apply on next page */
    localStorage.setItem(STORAGE_KEY, theme);

    /* If logged in, also save to DB */
    fetch('session.php')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.loggedIn) {
          fetch('save_theme.php', {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({ theme: theme }),
          });
        }
      })
      .catch(function () {
        /* Guest or offline — localStorage already saved above */
      });
  }

  /* Expose globally so onclick="toggleTheme()" also works */
  window.toggleTheme = toggleTheme;

})();