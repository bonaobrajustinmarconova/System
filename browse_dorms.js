let ALL_DORMS = [];
    let likedIDs  = new Set();
    let sortMode  = 'rating';
    let CURRENT_USER_ID = null;

    const gradients = ['grad-1','grad-2','grad-3','grad-4','grad-5'];
    const icons     = ['🏢','🏠','🏗️','🏨','🏘'];

    // ── INIT ──
    document.addEventListener('DOMContentLoaded', async () => {
      await loadSession();
      await fetchDorms();
    });

    async function loadSession() {
      try {
        const res  = await fetch('session.php');
        const data = await res.json();
        if (data.loggedIn) {
          CURRENT_USER_ID = data.user.userID;
          window.CURRENT_USER_ID = CURRENT_USER_ID;
          const nameEl   = document.getElementById('menuName');
          const avatarEl = document.getElementById('menuAvatar');
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
          await fetchLikedIDs();
          if (window.ChatWidget) ChatWidget.init(CURRENT_USER_ID);
        } else {
          // Guest mode
          const menuBtn = document.getElementById('menuBtn');
          if (menuBtn) menuBtn.style.display = 'none';
          document.getElementById('guest-header-btns').style.display = 'flex';
        }
      } catch (err) { console.error('Session failed:', err); }
    }

    async function fetchLikedIDs() {
      if (!CURRENT_USER_ID) return;
      try {
        const res  = await fetch(`get_liked_dorms.php?userID=${CURRENT_USER_ID}`);
        const data = await res.json();
        if (data.success) likedIDs = new Set(data.dorms.map(d => parseInt(d.dormID)));
      } catch (err) { console.error('Liked fetch failed:', err); }
    }

    async function fetchDorms() {
      try {
        const res  = await fetch('get_all_dorms.php');
        const data = await res.json();
        if (!data.success) throw new Error();
        ALL_DORMS = data.dorms;
        renderDorms(ALL_DORMS);
      } catch (err) {
        document.getElementById('dormGrid').innerHTML = `
          <div class="state-msg">
            <div class="icon">⚠</div>
            <p>Could not load dorms. Please try again.</p>
          </div>`;
      }
    }

    function renderDorms(dorms) {
      const grid = document.getElementById('dormGrid');
      document.getElementById('dorm-count').textContent = dorms.length;

      if (!dorms.length) {
        grid.innerHTML = `
          <div class="state-msg">
            <div class="icon">🔍</div>
            <p>No dorms match your search.<br>Try a different keyword.</p>
          </div>`;
        return;
      }

    grid.innerHTML = dorms.map((d, i) => {
      const pic = d.dorm_pic1 || d.dormPics || null;
      const validPic = pic && pic !== 'uploads/dorm_pics/default.jpg';
      const imgHtml = validPic
        ? `<div class="card-img-placeholder" style="background:url('${pic}') center/cover no-repeat;min-height:160px;"></div>`
        : `<div class="card-img-placeholder ${gradients[i % 5]}">${icons[i % 5]}</div>`;
      return `
        <div class="dorm-card ${likedIDs.has(d.dormID) ? '' : ''}"
             onclick="goToDetail(${d.dormID})"
             style="animation-delay:${i * 0.07}s">
          <div class="card-img-wrap">
            ${imgHtml}
            ${CURRENT_USER_ID ? `
              <button class="card-fav ${likedIDs.has(d.dormID) ? 'liked' : ''}"
                onclick="toggleLike(event, ${d.dormID})" title="Save dorm">
                ${likedIDs.has(d.dormID) ? '♥' : '♡'}
              </button>` : ''}
          </div>
          <div class="card-body">
            <div class="card-name">${d.dname}</div>
            <div class="card-location">📍 ${d.address || 'Quezon City'}</div>
            <div class="card-footer">
              <div class="card-stars">
                ${renderStars(d.average_rating)}
                <span>(${d.average_rating})</span>
              </div>
              <div class="card-price">₱${d.price.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    }

    function renderStars(rating) {
      return [1,2,3,4,5].map(i =>
        `<span style="color:${i <= Math.round(rating) ? 'var(--gold)' : 'rgba(201,168,76,0.25)'}">★</span>`
      ).join('');
    }

    // ── SEARCH ──
    function filterDorms() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const filtered = ALL_DORMS.filter(d =>
        d.dname.toLowerCase().includes(q) ||
        (d.address || '').toLowerCase().includes(q)
      );
      applySortAndRender(filtered);
    }

    // ── SORT ──
    function sortDorms(mode, btn) {
      sortMode = mode;
      document.querySelectorAll('.sort-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      filterDorms();
    }

    function applySortAndRender(dorms) {
      const sorted = [...dorms].sort((a, b) => {
        if (sortMode === 'rating')     return b.average_rating - a.average_rating;
        if (sortMode === 'price_asc')  return a.price - b.price;
        if (sortMode === 'price_desc') return b.price - a.price;
        if (sortMode === 'name')       return a.dname.localeCompare(b.dname);
        return 0;
      });
      renderDorms(sorted);
    }

    // ── TOGGLE LIKE ──
    async function toggleLike(event, dormID) {
      event.stopPropagation();
      if (!CURRENT_USER_ID) return;
      const fav = event.currentTarget;
      const isLiked = likedIDs.has(dormID);

      if (isLiked) {
        likedIDs.delete(dormID);
        fav.classList.remove('liked');
        fav.textContent = '♡';
      } else {
        likedIDs.add(dormID);
        fav.classList.add('liked');
        fav.textContent = '♥';
      }

      try {
        await fetch('toggle_like.php', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ userID: CURRENT_USER_ID, dormID }),
        });
      } catch (err) { console.error('Toggle like failed:', err); }
    }

    // ── GO TO DETAIL ──
    function goToDetail(dormID) {
      window.location.href = `dorm_detail.html?dormID=${dormID}`;
    }

    function openPanel() {
      document.getElementById('sidePanel').classList.add('open');
      document.getElementById('overlay').classList.add('active');
      loadLikedPanel();
    }
    function closePanel() {
      closeLikedPanel();
      document.getElementById('sidePanel').classList.remove('open');
      document.getElementById('overlay').classList.remove('active');
    }
    function openLikedPanel(e) {
      if (e) e.preventDefault();
      document.getElementById('likedPanel').classList.add('open');
      loadLikedPanel();
    }
    function closeLikedPanel() {
      document.getElementById('likedPanel').classList.remove('open');
    }
    async function loadLikedPanel() {
      if (!window.CURRENT_USER_ID) return;
      const list = document.getElementById('dormList');
      const badge = document.getElementById('likedBadge');
      try {
        const res  = await fetch(`get_liked_dorms.php?userID=${window.CURRENT_USER_ID}`);
        const data = await res.json();
        if (badge) badge.textContent = data.dorms ? data.dorms.length : 0;
        if (!data.success || !data.dorms.length) {
          list.innerHTML = `<div class="empty-state"><div class="empty-icon">🏠</div><p>No liked dorms yet.</p></div>`;
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
      } catch(err) { console.error(err); }
    }
    async function unlikeDorm(dormID, btn) {
      const card = btn.closest('.liked-dorm-card');
      card.style.opacity = '0'; card.style.transform = 'translateX(30px)'; card.style.transition = 'all 0.25s';
      try {
        await fetch('toggle_like.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ userID: window.CURRENT_USER_ID, dormID }) });
      } catch(e) {}
      setTimeout(() => { card.remove(); loadLikedPanel(); }, 260);
    }
    async function logout() {
      await fetch('logout.php');
      window.location.href = 'login.html';
    }