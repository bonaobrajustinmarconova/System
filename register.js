function togglePw(id, btn) {
  const input = document.getElementById(id);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; }
  else { input.type = 'password'; btn.textContent = 'Show'; }
}

function checkStrength() {
  const pw = document.getElementById('password').value;

  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[a-z]/.test(pw),
    /[0-9]/.test(pw),
    /[^a-zA-Z0-9]/.test(pw),
  ];

  checks.forEach((met, i) => {
    const n = i + 1;
    const bar = document.getElementById('bar' + n);
    const dot = document.getElementById('dot' + n);
    const leg = document.getElementById('leg' + n);
    if (bar) bar.classList.toggle('met', met);
    if (dot) dot.classList.toggle('met', met);
    if (leg) leg.classList.toggle('met', met);
  });

  // Keep popup visible while typing
  const wrap = document.getElementById('pwStrength');
  if (wrap && pw.length > 0) wrap.classList.add('show');
}

function showPwHint() {
  const wrap = document.getElementById('pwStrength');
  if (wrap) wrap.classList.add('show');
}

function hidePwHint() {
  // Only hide if password is empty (don't hide mid-typing)
  const pw = document.getElementById('password').value;
  const wrap = document.getElementById('pwStrength');
  if (wrap && pw.length === 0) wrap.classList.remove('show');
}

function showAlert(msg, type = 'error') {
  const el = document.getElementById('alertMsg');
  document.getElementById('alertText').textContent = msg;
  el.className = `alert ${type} show`;
}
function hideAlert() {
  document.getElementById('alertMsg').classList.remove('show');
}

async function handleSignup() {
  hideAlert();
  const fname    = document.getElementById('fname').value.trim();
  const lname    = document.getElementById('lname').value.trim();
  const mname    = document.getElementById('mname').value.trim();
  const uname    = document.getElementById('uname').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm').value;
  const btn      = document.getElementById('signupBtn');

  if (!fname || !lname || !uname || !password) {
    showAlert('Please fill in all required fields.'); return;
  }
  if (uname.length < 3) {
    showAlert('Username must be at least 3 characters.'); return;
  }
  if (password.length < 8) {
    showAlert('Password must be at least 8 characters.'); return;
  }
  if (!/[A-Z]/.test(password)) {
    showAlert('Password must contain at least one uppercase letter.'); return;
  }
  if (!/[a-z]/.test(password)) {
    showAlert('Password must contain at least one lowercase letter.'); return;
  }
  if (!/[0-9]/.test(password)) {
    showAlert('Password must contain at least one number.'); return;
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    showAlert('Password must contain at least one special character (e.g. @, #, !).'); return;
  }
  if (password !== confirm) {
    showAlert('Passwords do not match.');
    document.getElementById('confirm').classList.add('error'); return;
  }

  btn.textContent = 'Creating account…';
  btn.classList.add('loading');

  try {
    const res  = await fetch('register.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ fname, mname, lname, uname, password }),
    });
    const data = await res.json();
    if (data.success) {
      showAlert('Account created! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'homepage.html', 1500);
    } else {
      showAlert(data.message || 'Registration failed. Try again.');
      btn.textContent = 'Create Account';
      btn.classList.remove('loading');
    }
  } catch (err) {
    showAlert('Server error. Please try again.');
    btn.textContent = 'Create Account';
    btn.classList.remove('loading');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSignup();
});

// ── LEGAL MODALS ──
const LEGAL_CONTENT = {
  tos: {
    title: 'Terms of Service',
    body: `
      <h3>1. Acceptance of Terms</h3>
      <p>By creating an account on NestQC, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>

      <h3>2. Use of the Platform</h3>
      <p>NestQC is a dorm-finding platform for students in Quezon City. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others.</p>

      <h3>3. Account Responsibility</h3>
      <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>

      <h3>4. User Content</h3>
      <p>By posting reviews or other content, you grant NestQC a non-exclusive license to display and use that content on the platform. You are solely responsible for the accuracy of your reviews.</p>

      <h3>5. Prohibited Activities</h3>
      <p>You may not post false or misleading information, harass other users, attempt to gain unauthorized access to any part of the platform, or use automated tools to scrape or collect data.</p>

      <h3>6. Termination</h3>
      <p>NestQC reserves the right to suspend or terminate accounts that violate these terms, without prior notice.</p>

      <h3>7. Limitation of Liability</h3>
      <p>NestQC is not responsible for the accuracy of dorm listings, which are provided by third parties. Always verify information directly with landlords before making any decisions.</p>

      <h3>8. Changes to Terms</h3>
      <p>We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

      <h3>9. Contact</h3>
      <p>For questions about these terms, contact us through the Support Chat available on the platform.</p>
    `
  },
  privacy: {
    title: 'Privacy Policy',
    body: `
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly, including your name, username, and profile photo. We also collect usage data such as dorms you view, save, or review.</p>

      <h3>2. How We Use Your Information</h3>
      <p>Your information is used to operate and improve NestQC, personalize your experience, display your profile and reviews, and communicate with you through support chat.</p>

      <h3>3. Profile Photos</h3>
      <p>Profile photos you upload are stored on our servers and displayed to other users alongside your reviews and profile. You may remove or change your photo at any time via Edit Profile.</p>

      <h3>4. Reviews & Public Content</h3>
      <p>Reviews you post are publicly visible to all users of NestQC, including your first name and profile photo. Please do not include personal contact information in reviews.</p>

      <h3>5. Data Sharing</h3>
      <p>We do not sell your personal information to third parties. We may share data with service providers who assist in operating the platform, under strict confidentiality agreements.</p>

      <h3>6. Cookies & Sessions</h3>
      <p>NestQC uses session cookies to keep you logged in. These cookies are essential for the platform to function and are deleted when you log out or close your browser session.</p>

      <h3>7. Data Security</h3>
      <p>Passwords are stored using secure hashing (bcrypt). We implement reasonable security measures to protect your data, but no system is completely secure.</p>

      <h3>8. Your Rights</h3>
      <p>You may update or delete your account information at any time. To request full account deletion, contact us via Support Chat.</p>

      <h3>9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy periodically. We encourage you to review it regularly. Continued use of NestQC after changes means you accept the updated policy.</p>

      <h3>10. Contact</h3>
      <p>For privacy-related concerns, reach out through the Support Chat on the platform.</p>
    `
  }
};

function openLegalModal(type) {
  const content = LEGAL_CONTENT[type];
  if (!content) return;
  document.getElementById('legalTitle').textContent = content.title;
  document.getElementById('legalBody').innerHTML = content.body;
  document.getElementById('legalOverlay').classList.add('open');
}

function closeLegalModal(e) {
  if (e.target === document.getElementById('legalOverlay')) {
    document.getElementById('legalOverlay').classList.remove('open');
  }
}