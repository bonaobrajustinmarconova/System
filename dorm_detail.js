// ═══════════════════════════════════════════════════════
//  GLOBAL STATE
// ═══════════════════════════════════════════════════════
let CURRENT_USER_ID = null;
let DORM            = null;
let activeDormId    = null;
let userPickedRating = 0;
let carouselIndex   = 0;
let isLiked         = false;

// ═══════════════════════════════════════════════════════
//  INIT — runs on page load (no Google Maps needed here)
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Check session
  try {
    const res  = await fetch('session.php');
    const data = await res.json();

    if (data.loggedIn) {
      // Logged-in user setup
      CURRENT_USER_ID = data.user.userID;
      window.CURRENT_USER_ID = CURRENT_USER_ID;

      const nameEl   = document.getElementById('menuName');
      const avatarEl = document.getElementById('menuAvatar');
      if (nameEl) nameEl.textContent = `${data.user.fname} ${data.user.lname}`;
      if (avatarEl) {
        if (data.user.pfp && data.user.pfp !== 'uploads/pfp/default.jpg' && data.user.pfp !== '') {
          avatarEl.style.backgroundImage    = `url(${data.user.pfp}?t=${Date.now()})`;
          avatarEl.style.backgroundSize     = 'cover';
          avatarEl.style.backgroundPosition = 'center';
          avatarEl.style.color              = 'transparent';
          avatarEl.textContent              = '';
        } else {
          avatarEl.textContent = data.user.fname[0];
        }
      }
      if (window.ChatWidget) ChatWidget.init(CURRENT_USER_ID);

    } else {
      // Guest mode — hide restricted elements, show header buttons
      const menuBtn = document.querySelector('.menu-btn');
      if (menuBtn) menuBtn.style.display = 'none';
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) saveBtn.style.display = 'none';
      const writeReviewBtn = document.getElementById('writeReviewBtn');
      if (writeReviewBtn) writeReviewBtn.style.display = 'none';
      document.getElementById('guest-header-btns').style.display = 'flex';
    }

  } catch (err) {
    console.error('Session failed:', err);
    // Don't return — still load the dorm for guests
  }

  // 2. Runs for BOTH guests and logged-in users
  const params = new URLSearchParams(window.location.search);
  activeDormId = parseInt(params.get('dormID'));
  if (!activeDormId) {
    document.getElementById('dormTitle').textContent = 'Dorm not found.';
    return;
  }

  // 3. Fetch dorm data
  await loadDorm(activeDormId);
});

// ═══════════════════════════════════════════════════════
//  FETCH & RENDER DORM
// ═══════════════════════════════════════════════════════
async function loadDorm(dormID) {
  try {
    const res  = await fetch(`get_dorm.php?dormID=${dormID}`);
    const data = await res.json();

    if (!data.success) {
      document.getElementById('dormTitle').textContent = 'Dorm not found.';
      return;
    }

    DORM     = data.dorm;
    isLiked  = data.isLiked;

    renderDorm(data);
  } catch (err) {
    console.error('Failed to load dorm:', err);
    document.getElementById('dormTitle').textContent = 'Failed to load dorm.';
  }
}

function renderDorm(data) {
  const d = data.dorm;

  // ── Header & title ──────────────────────────────────
  const headerName = document.getElementById('headerDormName');
  if (headerName) headerName.textContent = d.dname;

  document.getElementById('dormTitle').textContent   = d.dname;
  document.getElementById('dormAddress').textContent = d.address || 'Quezon City';
  document.getElementById('dormPrice').innerHTML     = d.price
    ? '₱' + parseFloat(d.price).toLocaleString() + '<small>/mo</small>'
    : '—';

  // ── Rating ──────────────────────────────────────────
  const rating = parseFloat(d.average_rating) || 0;
  renderStars('dormStars', rating);
  const ratingText = document.getElementById('dormRatingText');
  if (ratingText) ratingText.textContent = rating > 0 ? rating.toFixed(1) : 'No ratings yet';


  // ── Carousel ────────────────────────────────────────
  const pics = [d.dorm_pic1, d.dorm_pic2, d.dorm_pic3].filter(p => p && p !== 'uploads/dorm_pics/default.jpg' && p !== '');
  buildCarousel(pics.length ? pics : [d.dormPics]);

  // ── About / description ─────────────────────────────
  const aboutEl = document.getElementById('aboutText');
  if (aboutEl) aboutEl.textContent = d.description || 'No description available.';

  // ── Amenities ───────────────────────────────────────
  const grid = document.getElementById('amenitiesGrid');
  if (grid) {
    if (data.amenities && data.amenities.length) {
      grid.innerHTML = data.amenities.map(a => `
        <div class="amenity-tag">${amenityIcon(a)} ${a}</div>
      `).join('');
    } else {
      grid.innerHTML = `<div style="color:var(--text-soft);font-size:0.82rem">No amenities listed.</div>`;
    }
  }

// ── Contact info ────────────────────────────────────
  const website  = document.getElementById('contactWebsiteVal');
  const phone    = document.getElementById('contactPhoneVal');
  const email    = document.getElementById('contactEmailVal');
  const facebook = document.getElementById('contactFacebookVal');
  const wLink    = document.getElementById('contactWebsite');
  const pLink    = document.getElementById('contactPhone');
  const eLink    = document.getElementById('contactEmail');
  const fLink    = document.getElementById('contactFacebook');

if (website && wLink) {
    const url = d.owner_name && d.owner_name.startsWith('http') ? d.owner_name : null;
    website.textContent = url ? new URL(url).hostname : '—';
    if (CURRENT_USER_ID) {
      wLink.href = url || '#';
    } else {
      wLink.removeAttribute('href');
      wLink.removeAttribute('target');
      wLink.style.cursor = 'pointer';
      wLink.onclick = (e) => { e.preventDefault(); console.log('clicked'); showToast('Please log in to use contact links.', '#e07070'); };
    }
    if (!url) wLink.style.opacity = '0.4';
  }
  if (phone && pLink) {
    phone.textContent = d.contact_phone || '—';
    if (CURRENT_USER_ID) {
      pLink.href = d.contact_phone ? `tel:${d.contact_phone}` : '#';
    } else {
      pLink.removeAttribute('href');
      pLink.style.cursor = 'pointer';
      pLink.onclick = (e) => { e.preventDefault(); showToast('Please log in to use contact links.', '#e07070'); };
    }
    if (!d.contact_phone) pLink.style.opacity = '0.4';
  }
  if (email && eLink) {
    email.textContent = d.contact_email || '—';
    if (CURRENT_USER_ID) {
      eLink.href = d.contact_email ? `mailto:${d.contact_email}` : '#';
    } else {
      eLink.removeAttribute('href');
      eLink.style.cursor = 'pointer';
      eLink.onclick = (e) => { e.preventDefault(); showToast('Please log in to use contact links.', '#e07070'); };
    }
    if (!d.contact_email) eLink.style.opacity = '0.4';
  }
  if (facebook && fLink) {
    if (CURRENT_USER_ID) {
      fLink.href = d.contact_facebook || '#';
    } else {
      fLink.removeAttribute('href');
      fLink.removeAttribute('target');
      fLink.style.cursor = 'pointer';
      fLink.onclick = (e) => { e.preventDefault(); showToast('Please log in to use contact links.', '#e07070'); };
    }
    if (!d.contact_facebook) { fLink.style.opacity = '0.4'; facebook.textContent = '—'; }
  }

  // ── Map link ────────────────────────────────────────
  const mapBtn = document.getElementById('viewMapBtn');
  if (mapBtn) {
    if (d.latitude && d.longitude) {
      mapBtn.href = `dormfinder.html?dormID=${d.dormID}`;
      mapBtn.style.opacity = '';
      mapBtn.style.pointerEvents = '';
    } else {
      mapBtn.href = '#';
      mapBtn.style.opacity = '0.4';
      mapBtn.style.pointerEvents = 'none';
    }
  }

  // ── Like button ──────────────────────────────────────
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.textContent = isLiked ? '♥ Liked' : '♡ Like Dorm';
    saveBtn.classList.toggle('saved', isLiked);
  }

  // ── Update liked badge count ─────────────────────────
  updateLikedBadge();

  // ── Reviews ─────────────────────────────────────────
  renderReviews(data.reviews);
}

// ═══════════════════════════════════════════════════════
//  CAROUSEL
// ═══════════════════════════════════════════════════════
function buildCarousel(pics) {
  const inner = document.getElementById('carouselInner');
  const dots  = document.getElementById('carouselDots');
  if (!inner) return;

  inner.innerHTML = pics.map(p =>
    `<div class="carousel-slide" style="background:url('${p}') center/cover no-repeat"></div>`
  ).join('');

  if (dots) {
    dots.innerHTML = pics.map((_, i) =>
      `<div class="dot ${i === 0 ? 'active' : ''}"></div>`
    ).join('');
  }

  carouselIndex = 0;
}

function slideCarousel(dir) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots   = document.querySelectorAll('#carouselDots .dot');
  if (!slides.length) return;
  carouselIndex = (carouselIndex + dir + slides.length) % slides.length;
  document.getElementById('carouselInner').style.transform = `translateX(-${carouselIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

// ═══════════════════════════════════════════════════════
//  STARS
// ═══════════════════════════════════════════════════════
function renderStars(containerId, rating) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = [1,2,3,4,5].map(i =>
    `<span class="star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`
  ).join('');
}

// ═══════════════════════════════════════════════════════
//  AMENITY ICONS
// ═══════════════════════════════════════════════════════
function amenityIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('wi-fi') || n.includes('wifi'))      return '📶';
  if (n.includes('ac') || n.includes('air'))          return '❄️';
  if (n.includes('cctv') || n.includes('security') || n.includes('biometric')) return '🔒';
  if (n.includes('laundry'))                          return '🧺';
  if (n.includes('parking'))                          return '🅿️';
  if (n.includes('gym'))                              return '🏋️';
  if (n.includes('dining') || n.includes('kitchen'))  return '🍽️';
  if (n.includes('study'))                            return '📚';
  if (n.includes('water') || n.includes('electric'))  return '💡';
  if (n.includes('bathroom'))                         return '🚿';
  if (n.includes('transport'))                        return '🚌';
  if (n.includes('basketball'))                       return '🏀';
  if (n.includes('cable') || n.includes('tv'))        return '📺';
  if (n.includes('locker'))                           return '🔑';
  if (n.includes('24') || n.includes('curfew'))       return '🕐';
  if (n.includes('common'))                           return '🛋️';
  if (n.includes('housekeeping'))                     return '🧹';
  return '✅';
}

// ═══════════════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════════════
function renderReviews(reviews) {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  if (!reviews || !reviews.length) {
    grid.innerHTML = `<div class="no-reviews"><div class="nr-icon">💬</div><p>No reviews yet.<br>Be the first!</p></div>`;
    return;
  }

  grid.innerHTML = reviews.slice(0, 6).map((r, i) => `
    <div class="review-card" style="animation-delay:${i*0.07}s">
      <div class="review-top">
        <div class="reviewer">
          ${r.pfp && r.pfp !== 'uploads/pfp/default.jpg' && r.pfp !== ''
            ? `<div class="reviewer-avatar" style="background-image:url(${r.pfp});background-size:cover;background-position:center;"></div>`
            : `<div class="reviewer-avatar" style="background:#2a8a8a">${r.fname ? r.fname[0] : 'U'}</div>`
          }
          <div><div class="reviewer-name">${r.fname || 'Anonymous'}</div></div>
        </div>
        ${r.ratings ? `<div class="review-stars">${[1,2,3,4,5].map(j =>
          `<span class="star ${j <= r.ratings ? '' : 'empty'}">★</span>`).join('')}</div>` : ''}
      </div>
      <div class="review-text">${r.comment || ''}</div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════
//  LIKE TOGGLE
// ═══════════════════════════════════════════════════════
async function toggleSave() {
  if (!CURRENT_USER_ID) { showToast('Please log in to like dorms.', '#e07070'); return; }
  const btn = document.getElementById('saveBtn');

  // Optimistic update
  isLiked = !isLiked;
  btn.textContent = isLiked ? '♥ Liked' : '♡ Like Dorm';
  btn.classList.toggle('saved', isLiked);
  updateLikedBadge();

  try {
    const res  = await fetch('toggle_like.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ userID: CURRENT_USER_ID, dormID: activeDormId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error();
    showToast(isLiked ? 'Added to liked dorms!' : 'Removed from liked dorms.', isLiked ? 'var(--teal-light)' : '#e07070');
  } catch {
    // Revert on failure
    isLiked = !isLiked;
    btn.textContent = isLiked ? '♥ Liked' : '♡ Like Dorm';
    btn.classList.toggle('saved', isLiked);
    updateLikedBadge();
    showToast('Failed to update liked dorms.', '#e07070');
  }
}

// ═══════════════════════════════════════════════════════
//  LIKED BADGE — fetches count from server and updates UI
// ═══════════════════════════════════════════════════════
async function updateLikedBadge() {
  if (!CURRENT_USER_ID) return;
  try {
    const res  = await fetch(`get_liked_dorms.php?userID=${CURRENT_USER_ID}`);
    const data = await res.json();
    if (data.success) {
      const badge = document.getElementById('likedBadge');
      if (badge) badge.textContent = data.dorms.length;
    }
  } catch (err) {
    console.error('Failed to update liked badge:', err);
  }
}

// ═══════════════════════════════════════════════════════
//  VACANCY MODAL
// ═══════════════════════════════════════════════════════
let selectedVacancy = null;

function openVacancyModal() {
  document.getElementById('vacancyModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  selectedVacancy = DORM ? DORM.vacancy_status : null;
  updateVacancyOptUI();
}

function closeVacancyModal() {
  document.getElementById('vacancyModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleVacancyOverlayClick(e) {
  if (e.target === document.getElementById('vacancyModalOverlay')) closeVacancyModal();
}

function selectVacancy(val) {
  selectedVacancy = val;
  updateVacancyOptUI();
}

function updateVacancyOptUI() {
  document.querySelectorAll('.vacancy-opt').forEach(btn => btn.classList.remove('selected'));
  if (selectedVacancy === 'available') document.getElementById('optAvailable')?.classList.add('selected');
  if (selectedVacancy === 'full')      document.getElementById('optFull')?.classList.add('selected');
}

async function saveVacancy() {
  if (!selectedVacancy) { showToast('Please select a status.', '#e07070'); return; }
  const alertEl = document.getElementById('vacancyAlert');
  const saveBtn = document.getElementById('saveVacancyBtn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

  try {
    const res  = await fetch('update_vacancy.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ dormID: activeDormId, status: selectedVacancy }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed');

    // Update UI without full reload
    DORM.vacancy_status = selectedVacancy;
    const dot   = document.getElementById('vacancyDot');
    const label = document.getElementById('vacancyLabel');
    const badge = document.getElementById('vacancyBadge');
    if (dot)   dot.className   = `vacancy-dot ${selectedVacancy}`;
    if (label) label.textContent = selectedVacancy === 'available' ? 'Has Available Rooms' : 'Dorm is Full';
    if (badge) badge.className = `vacancy-badge ${selectedVacancy}`;
    const updated = document.getElementById('vacancyUpdated');
    if (updated) updated.textContent = 'Updated just now';

    showToast('Vacancy status updated!', 'var(--teal-light)');
    closeVacancyModal();
  } catch (err) {
    if (alertEl) { alertEl.textContent = err.message; alertEl.style.display = 'block'; }
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Status'; }
  }
}

// ═══════════════════════════════════════════════════════
//  REVIEW MODAL
// ═══════════════════════════════════════════════════════
function openReviewModal() {
  document.getElementById('reviewModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  userPickedRating = 0;
  document.querySelectorAll('.pick-star').forEach(s => s.classList.remove('active'));
  const commentEl = document.getElementById('reviewComment');
  if (commentEl) commentEl.value = '';
}

function closeReviewModal() {
  document.getElementById('reviewModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleReviewOverlayClick(e) {
  if (e.target === document.getElementById('reviewModalOverlay')) closeReviewModal();
}

function pickStar(val) {
  userPickedRating = val;
  document.querySelectorAll('.pick-star').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}

let existingReviewID = null;

async function openReviewModalWithCheck() {
  // Check if user already has a review for this dorm
  try {
    const res  = await fetch(`get_reviews.php?dormID=${activeDormId}`);
    const data = await res.json();
    if (data.success) {
      const mine = data.reviews.find(r => String(r.userID) === String(CURRENT_USER_ID));
      if (mine) {
        existingReviewID = mine.reviewID;
        userPickedRating = mine.ratings || 0;
        document.getElementById('reviewModalTitle').textContent = 'Update Your Review';
        document.getElementById('saveReviewBtn').textContent    = 'Update Review';
        document.getElementById('reviewComment').value          = mine.comment || '';
        document.querySelectorAll('.pick-star').forEach((s, i) => {
          s.classList.toggle('active', i < userPickedRating);
        });
      } else {
        existingReviewID = null;
        userPickedRating = 0;
        document.getElementById('reviewModalTitle').textContent = 'Write a Review';
        document.getElementById('saveReviewBtn').textContent    = 'Post Review';
        document.getElementById('reviewComment').value          = '';
        document.querySelectorAll('.pick-star').forEach(s => s.classList.remove('active'));
      }
    }
  } catch (err) {
    console.error('Could not check existing review:', err);
    existingReviewID = null;
  }
  document.getElementById('reviewModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  const alertEl = document.getElementById('reviewAlert');
  if (alertEl) { alertEl.textContent = ''; alertEl.style.display = 'none'; }
}

async function saveReview() {
  const comment = document.getElementById('reviewComment')?.value.trim() || '';
  if (!userPickedRating)  { showToast('Please select a star rating.', '#e07070'); return; }
  if (comment.length < 5) { showToast('Please write at least 5 characters.', '#e07070'); return; }

  const alertEl  = document.getElementById('reviewAlert');
  const saveBtn  = document.getElementById('saveReviewBtn');
  const isUpdate = !!existingReviewID;

  if (alertEl) { alertEl.textContent = ''; alertEl.style.display = 'none'; }
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = isUpdate ? 'Updating…' : 'Posting…'; }

  try {
    const payload = {
      dormID  : activeDormId,
      userID  : CURRENT_USER_ID,
      ratings : userPickedRating,
      comment,
      ...(isUpdate && { reviewID: existingReviewID, _method: 'update' }),
    };

    const res  = await fetch('submit_review.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });

    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('Server error. Please try again.'); }

    if (!data.success) throw new Error(data.message || (isUpdate ? 'Failed to update review' : 'Failed to post review'));
    if (data.reviewID) existingReviewID = data.reviewID;

    showToast(isUpdate ? 'Review updated!' : 'Review posted! Thank you.', 'var(--teal-light)');
    closeReviewModal();
    await loadDorm(activeDormId);
  } catch (err) {
    if (alertEl) { alertEl.textContent = err.message; alertEl.style.display = 'block'; }
    showToast(err.message, '#e07070');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = isUpdate ? 'Update Review' : 'Post Review'; }
  }
}

// ═══════════════════════════════════════════════════════
//  SIDE PANEL
// ═══════════════════════════════════════════════════════
function openPanel() {
  document.getElementById('sidePanel').classList.add('open');
  document.getElementById('overlay').classList.add('active');
}

function closePanel() {
  closeLikedPanel();
  document.getElementById('sidePanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

async function openLikedPanel(e) {
  if (e) e.preventDefault();
  document.getElementById('likedPanel').classList.add('open');

  const list = document.getElementById('dormList');
  if (!list) return;
  list.innerHTML = `<div style="color:var(--text-soft);padding:20px;text-align:center">Loading…</div>`;

  try {
    const res  = await fetch(`get_liked_dorms.php?userID=${CURRENT_USER_ID}`);
    const data = await res.json();

    if (!data.success || !data.dorms.length) {
      list.innerHTML = `<div style="color:var(--text-soft);padding:20px;text-align:center">No liked dorms yet.</div>`;
      return;
    }

    list.innerHTML = data.dorms.map(d => `
      <div class="liked-dorm-card" onclick="window.location='dorm_detail.html?dormID=${d.dormID}'">
        <div class="liked-card-top">
          <div class="liked-dorm-name">${d.dname}</div>
          <button class="unlike-btn" onclick="event.stopPropagation(); unlikeDorm(${d.dormID}, this)">♥</button>
        </div>
        <div class="liked-dorm-location">📍 ${d.address || 'Quezon City'}</div>
        <div class="liked-dorm-price">₱${parseFloat(d.price).toLocaleString()}/mo</div>
      </div>
    `).join('');

    // Update badge
    const badge = document.getElementById('likedBadge');
    if (badge) badge.textContent = data.dorms.length;
  } catch (err) {
    list.innerHTML = `<div style="color:#e07070;padding:20px;text-align:center">Failed to load liked dorms.</div>`;
    console.error('Liked panel fetch error:', err);
  }
}

function closeLikedPanel() {
  document.getElementById('likedPanel').classList.remove('open');
}

// ═══════════════════════════════════════════════════════
//  UNLIKE DORM
// ═══════════════════════════════════════════════════════
async function unlikeDorm(dormID, btn) {
  const card = btn.closest('.liked-dorm-card');
  card.style.opacity = '0';
  card.style.transform = 'translateX(30px)';
  card.style.transition = 'all 0.25s';
  try {
    await fetch('toggle_like.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: CURRENT_USER_ID, dormID })
    });
  } catch(e) {}
  setTimeout(() => { card.remove(); openLikedPanel(null); }, 260);
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg, color) {
  const t   = document.getElementById('toast');
  const msg_ = document.getElementById('toast-msg');
  if (!t || !msg_) return;
  msg_.textContent = msg;
  if (color) t.style.color = color;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════════════════
async function logout() {
  await fetch('logout.php');
  window.location.href = 'login.html';
}