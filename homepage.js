// ── CONFIG ──
let CURRENT_USER_ID = null;
let ALL_DORMS = [];
let likedDormIDs = new Set();
let homeSortMode = 'maut';

async function loadSession() {
  try {
    const res  = await fetch('session.php');
    const data = await res.json();
    if (data.loggedIn) {
      CURRENT_USER_ID = data.user.userID;
      const nameEl   = document.querySelector('.user-name');
      const avatarEl = document.querySelector('.user-avatar');
      if (nameEl) nameEl.textContent = `${data.user.fname} ${data.user.lname}`;
      if (avatarEl) {
        if (data.user.pfp && data.user.pfp !== 'uploads/pfp/default.jpg' && data.user.pfp !== '') {
          avatarEl.style.backgroundImage = `url(${data.user.pfp}?t=${Date.now()})`;
          avatarEl.style.backgroundSize = 'cover';
          avatarEl.style.backgroundPosition = 'center';
          avatarEl.style.color = 'transparent';
          avatarEl.textContent = '';
        } else {
          avatarEl.textContent = data.user.fname[0];
        }
      }

      // Hide Sign In / Sign Up, show menu button
      const signInBtn = document.querySelector('.nav-btn:not(.primary)');
      const signUpBtn = document.querySelector('.nav-btn.primary');
      if (signInBtn) signInBtn.style.display = 'none';
      if (signUpBtn) signUpBtn.style.display = 'none';

      await loadAllDorms();
      await loadLikedIDs();
      if (window.ChatWidget) ChatWidget.init(CURRENT_USER_ID);

    } else {
      // Guest mode — hide menu button, leave Sign In / Sign Up visible
      const menuBtn = document.getElementById('menuBtn');
      if (menuBtn) menuBtn.style.display = 'none';
      await loadAllDorms();
    }

  } catch (err) {
    console.error('Session check failed:', err);
  }
}

function openPanel() {
  document.getElementById('sidePanel').classList.add('open');
  document.getElementById('overlay').classList.add('active');
  loadLikedIDs();
  updateLikedBadge();
}
function closePanel() {
  closeLikedPanel();
  document.getElementById('sidePanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}
function openLikedPanel(e) {
  if (e) e.preventDefault();
  document.getElementById('likedPanel').classList.add('open');
  loadLikedDorms();
}
function closeLikedPanel() {
  document.getElementById('likedPanel').classList.remove('open');
}

async function loadAllDorms() {
  try {
    const res  = await fetch('get_all_dorms.php');
    const data = await res.json();
    if (!data.success) return;
    ALL_DORMS = data.dorms;
    applyHomeSort();
  } catch (err) { console.error('Failed to load dorms:', err); }
}

function homeSort(mode, btn) {
  homeSortMode = mode;
  document.querySelectorAll('.home-sort-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  applyHomeSort();
}

function applyHomeSort() {
  let sorted = [...ALL_DORMS];

  if (homeSortMode === 'maut') {
    sorted = computeMAUTScores(sorted);
  } else if (homeSortMode === 'rating') {
    sorted.sort((a, b) => b.average_rating - a.average_rating);
  } else if (homeSortMode === 'price_asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (homeSortMode === 'price_desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (homeSortMode === 'name') {
    sorted.sort((a, b) => a.dname.localeCompare(b.dname));
  }

  renderDorms(sorted.slice(0, 5));
}

// ═══════════════════════════════════════════════════════
//  MAUT — Multi-Attribute Utility Theory Scoring
// ═══════════════════════════════════════════════════════

function computeMAUTScores(dorms) {
  // Weights — must add up to 1.0
  const W_RATING   = 0.40;
  const W_PRICE    = 0.35;
  const W_DISTANCE = 0.25;

  // Get min/max for normalization
  const maxRating = Math.max(...dorms.map(d => parseFloat(d.average_rating) || 0));
  const minRating = Math.min(...dorms.map(d => parseFloat(d.average_rating) || 0));
  const maxPrice  = Math.max(...dorms.map(d => parseFloat(d.price) || 0));
  const minPrice  = Math.min(...dorms.map(d => parseFloat(d.price) || 0));
  const maxDist   = Math.max(...dorms.map(d => parseFloat(d.distance) || 0));
  const minDist   = Math.min(...dorms.map(d => parseFloat(d.distance) || 0));

  return dorms.map(d => {
    const rating = parseFloat(d.average_rating) || 0;
    const price  = parseFloat(d.price) || 0;
    const dist   = parseFloat(d.distance) || 0;

    // Normalize 0–1 (higher = better)
    const uRating = maxRating !== minRating
      ? (rating - minRating) / (maxRating - minRating)
      : 1;

    // Price: lower is better so we invert
    const uPrice = maxPrice !== minPrice
      ? (maxPrice - price) / (maxPrice - minPrice)
      : 1;

    // Distance: lower is better so we invert
    const uDist = maxDist !== minDist
      ? (maxDist - dist) / (maxDist - minDist)
      : 1;

    const mautScore = (W_RATING * uRating) + (W_PRICE * uPrice) + (W_DISTANCE * uDist);

    return { ...d, mautScore };
  }).sort((a, b) => b.mautScore - a.mautScore);
}

function renderDorms(dorms) {
  const grid = document.getElementById('dorm-grid');
  if (!grid) return;
  const gradients = ['dorm-img-1','dorm-img-2','dorm-img-3','dorm-img-1','dorm-img-2'];
  const icons     = ['🏢','🏠','🏗️','🏨','🏘'];
  grid.innerHTML = dorms.map((d, i) => {
    const pic = d.dorm_pic1 || d.dormPics || null;
    const validPic = pic && pic !== 'uploads/dorm_pics/default.jpg';
    const imgHtml = validPic
      ? `<div class="dorm-img-inner" style="background:url('${pic}') center/cover no-repeat;"></div>`
      : `<div class="dorm-img-inner ${gradients[i % 3]}"><div class="dorm-icon">${icons[i % 5]}</div><div class="dorm-img-label">Dorm Photo</div></div>`;
    return `
    <div class="dorm-card" data-dorm-id="${d.dormID}" onclick="goToDetail(event,${d.dormID})">
      <div class="card-img-wrap">
        ${imgHtml}
        ${CURRENT_USER_ID ? `<button class="card-fav ..." onclick="toggleLike(event, ${d.dormID})">...</button>` : ''}
      </div>
      <div class="card-body">
        <div class="card-name">${d.dname}</div>
        <div class="card-location">📍 ${d.address || 'Quezon City'}</div>
        <div class="card-rating">
          <div class="stars">${renderStars(d.average_rating)}<span>(${d.average_rating})</span></div>
          <div class="card-price">₱${parseFloat(d.price).toLocaleString()}/mo</div>
        </div>
      </div>
    </div>
  `}).join('');
  document.querySelectorAll('.dorm-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.animationDelay = `${i * 0.08}s`;
    observer.observe(el);
  });
  renderHearts();
}

function goToDetail(event, dormID) {
  if (event.target.closest('.card-fav')) return;
  window.location.href = `dorm_detail.html?dormID=${dormID}`;
}

function renderStars(rating) {
  return [1,2,3,4,5].map(i =>
    `<span style="color:${i <= Math.round(rating) ? 'var(--gold)' : 'rgba(201,168,76,0.25)'}">★</span>`
  ).join('');
}

async function loadLikedIDs() {
  if (!CURRENT_USER_ID) return;
  try {
    const res  = await fetch(`get_liked_dorms.php?userID=${CURRENT_USER_ID}`);
    const data = await res.json();
    if (data.success) {
      likedDormIDs = new Set(data.dorms.map(d => parseInt(d.dormID)));
      renderHearts();
      updateLikedBadge();
    }
  } catch (err) { console.error('Could not load liked IDs:', err); }
}

function renderHearts() {
  document.querySelectorAll('.dorm-card[data-dorm-id]').forEach(card => {
    const dormID = parseInt(card.dataset.dormId);
    const fav    = card.querySelector('.card-fav');
    if (!fav) return;
    if (likedDormIDs.has(dormID)) { fav.classList.add('liked'); fav.textContent = '♥'; }
    else { fav.classList.remove('liked'); fav.textContent = '♡'; }
  });
}

function updateLikedBadge() {
  const badge = document.getElementById('likedBadge');
  if (badge) badge.textContent = likedDormIDs.size;
}

async function toggleLike(event, dormID) {
  event.stopPropagation();
  if (!CURRENT_USER_ID) return;
  const fav = event.currentTarget;
  const isNowLiked = !likedDormIDs.has(dormID);
  if (isNowLiked) { likedDormIDs.add(dormID); fav.classList.add('liked'); fav.textContent = '♥'; }
  else { likedDormIDs.delete(dormID); fav.classList.remove('liked'); fav.textContent = '♡'; }
  updateLikedBadge();
  try {
    const res  = await fetch('toggle_like.php', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userID: CURRENT_USER_ID, dormID })
    });
    const data = await res.json();
    if (!data.success) throw new Error();
  } catch {
    if (isNowLiked) { likedDormIDs.delete(dormID); fav.classList.remove('liked'); fav.textContent = '♡'; }
    else { likedDormIDs.add(dormID); fav.classList.add('liked'); fav.textContent = '♥'; }
    updateLikedBadge();
  }
}

async function loadLikedDorms() {
  const list = document.getElementById('dormList');
  list.innerHTML = Array.from({length:3}, () => `<div class="skeleton-card"><div class="skeleton-line" style="width:70%"></div><div class="skeleton-line short"></div><div class="skeleton-line" style="width:40%"></div></div>`).join('');
  try {
    const res  = await fetch(`get_liked_dorms.php?userID=${CURRENT_USER_ID}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (data.dorms.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">🏠</div><p>No saved dorms yet.<br>Tap ♡ on any dorm to save it here.</p></div>`;
      return;
    }
    list.innerHTML = data.dorms.map((dorm, i) => `
      <div class="dorm-card" style="animation-delay:${i*60}ms" onclick="window.location='dorm_detail.html?dormID=${dorm.dormID}'">
        <div class="dorm-card-top">
          <div class="dorm-name">${dorm.dname}</div>
          <button class="unlike-btn" onclick="unlikeFromPanel(event,${dorm.dormID})" title="Remove">♥</button>
        </div>
        <div class="dorm-location">📍 ${dorm.address || 'Quezon City'}</div>
        <div class="dorm-price">₱${parseFloat(dorm.price).toLocaleString()}/mo</div>
        <div class="dorm-tags"><span class="dorm-tag">⭐ ${dorm.average_rating}</span></div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<div class="error-state"><p>Could not load saved dorms.</p><button class="retry-btn" onclick="loadLikedDorms()">Try Again</button></div>`;
    console.error(err);
  }
}

async function unlikeFromPanel(event, dormID) {
  event.stopPropagation();
  const card = event.currentTarget.closest('.dorm-card');
  card.style.transition = 'opacity 0.25s, transform 0.25s';
  card.style.opacity = '0'; card.style.transform = 'translateX(30px)';
  likedDormIDs.delete(dormID); updateLikedBadge(); renderHearts();
  try {
    await fetch('toggle_like.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userID: CURRENT_USER_ID, dormID }) });
  } catch {}
  setTimeout(() => {
    card.remove();
    if (!document.querySelectorAll('#dormList .dorm-card').length) {
      document.getElementById('dormList').innerHTML = `<div class="empty-state"><div class="empty-icon">🏠</div><p>No saved dorms yet.<br>Tap ♡ on any dorm to save it here.</p></div>`;
    }
  }, 260);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.animation = 'fadeUp 0.6s ease forwards'; e.target.style.opacity = '1'; }
  });
}, { threshold: 0.1 });

async function logout() {
  await fetch('logout.php');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => { loadSession(); });