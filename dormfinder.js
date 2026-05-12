// ═══════════════════════════════════════════════════════
//  SIDE PANEL (Menu)
// ═══════════════════════════════════════════════════════
function openPanel() {
  document.getElementById('sidePanel').classList.add('open');
  document.getElementById('overlay').classList.add('active');
  loadLikedFromDB();
}
 
function closePanel() {
  closeLikedPanel();
  document.getElementById('sidePanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}
 
function openLikedPanel(e) {
  if (e) e.preventDefault();
  document.getElementById('likedPanel').classList.add('open');
  renderLikedDormsPanel();
}
 
function closeLikedPanel() {
  document.getElementById('likedPanel').classList.remove('open');
}
 
function renderLikedDormsPanel() {
  const list  = document.getElementById('dormList');
  const badge = document.getElementById('likedBadge');
  const liked = DORMS.filter(d => likedDorms.has(d.dormID));
  if (badge) badge.textContent = liked.length;
  if (!liked.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🏠</div><p>No liked dorms yet.<br>Tap 🤍 on any dorm to save it here.</p></div>`;
    return;
  }
  list.innerHTML = liked.map((d, i) => `
    <div class="liked-dorm-card" style="animation-delay:${i*60}ms" onclick="selectDorm(${d.dormID}); closePanel();">
      <div class="liked-card-top">
        <div class="liked-dorm-name">${d.dname}</div>
        <button class="unlike-btn" onclick="event.stopPropagation(); unlikeFromPanel(${d.dormID})" title="Remove">♥</button>
      </div>
      <div class="liked-dorm-location">📍 ${d.address || 'Quezon City'}</div>
      <div class="liked-dorm-price">₱${d.price.toLocaleString()}/mo</div>
      <div class="liked-dorm-tags"><span class="liked-dorm-tag">⭐ ${d.average_rating}</span></div>
    </div>
  `).join('');
}
 
function unlikeFromPanel(dormID) {
  likedDorms.delete(dormID);
  if (activeDormId === dormID) {
    const btn = document.getElementById('fav-btn');
    if (btn) { btn.textContent = '🤍'; btn.classList.remove('liked'); }
  }
  // Also remove from DB
  if (CURRENT_USER_ID) {
    fetch('toggle_like.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: CURRENT_USER_ID, dormID }),
    });
  }
  renderLikedDormsPanel();
  updateLikedBadge();
  showToast('Removed from saved dorms.');
}
 
function updateLikedBadge() {
  const badge = document.getElementById('likedBadge');
  if (badge) badge.textContent = likedDorms.size;
}
 
async function loadLikedFromDB() {
  if (!CURRENT_USER_ID) return;
  try {
    const res  = await fetch(`get_liked_dorms.php?userID=${CURRENT_USER_ID}`);
    const data = await res.json();
    if (data.success) {
      likedDorms.clear();
      data.dorms.forEach(d => likedDorms.add(parseInt(d.dormID)));
      updateLikedBadge();
      const favBtn = document.getElementById('fav-btn');
      if (favBtn && activeDormId) {
        if (likedDorms.has(activeDormId)) { favBtn.textContent = '❤️'; favBtn.classList.add('liked'); }
        else { favBtn.textContent = '🤍'; favBtn.classList.remove('liked'); }
        
        // Hide fav button for guests
        favBtn.style.display = CURRENT_USER_ID ? '' : 'none';

        const reviewBtn = document.querySelector('.write-review-btn[onclick="openReviewModal()"]');
        if (reviewBtn) reviewBtn.style.display = CURRENT_USER_ID ? '' : 'none';
      }
    }
  } catch (err) { console.error('Failed to load liked dorms:', err); }
}
 
// ═══════════════════════════════════════════════════════
//  GLOBAL STATE
// ═══════════════════════════════════════════════════════
let CURRENT_USER_ID = null;
let DORMS        = [];
let activeDormId = null;
let userRating   = 0;
let sortMode     = 'distance';
let userLat      = null;
let userLng      = null;
let map          = null;
let markers      = {};
let directionsRenderer = null;
const likedDorms = new Set();
 
// ═══════════════════════════════════════════════════════
//  INIT — fires when Google Maps JS SDK is ready
// ═══════════════════════════════════════════════════════
window.initMap = async function () {
  // Get session first
  try {
    const res  = await fetch('session.php');
    const data = await res.json();
    if (data.loggedIn) {
      CURRENT_USER_ID = data.user.userID;
      window.CURRENT_USER_ID = CURRENT_USER_ID;
      if (window.ChatWidget) ChatWidget.init(CURRENT_USER_ID);
      const nameEl   = document.getElementById('menuName');
      const avatarEl = document.getElementById('menuAvatar');
      if (nameEl)   nameEl.textContent   = `${data.user.fname} ${data.user.lname}`;
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
    } else {
  // Guest: hide menu button, fav button (rendered later), write review button
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.style.display = 'none';
  document.getElementById('guest-header-btns').style.display = 'flex';
  // CURRENT_USER_ID stays null — toggleFav() already handles this gracefully
  // (it already shows a toast: 'Please log in to save dorms.')
    }
  } catch (err) { console.error('Session failed:', err); }
 
  map = new google.maps.Map(document.getElementById('google-map'), {
    center: { lat: 14.6760, lng: 121.0437 },
    zoom: 13,
    disableDefaultUI: true,
    styles: DARK_MAP_STYLES,
  });
 
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#2ab4a0',
      strokeWeight: 5,
      strokeOpacity: 0.8,
    },
  });
 
await fetchDorms();
  if (CURRENT_USER_ID) {
    detectLocation();
    await loadLikedFromDB();
  }
};
 
// ═══════════════════════════════════════════════════════
//  FETCH DORMS FROM PHP
// ═══════════════════════════════════════════════════════
async function fetchDorms() {
  try {
    const res  = await fetch('get_all_dorms.php');
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    DORMS = data.dorms;
    renderNearbyList();
    placeDormMarkers();
    // Check if a specific dormID was passed in the URL
    const params = new URLSearchParams(window.location.search);
    const urlDormID = parseInt(params.get('dormID'));
    if (urlDormID && DORMS.find(d => d.dormID === urlDormID)) {
      selectDorm(urlDormID);
      setTimeout(() => {
        const detailPanel = document.getElementById('detail-panel');
        if (detailPanel) detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 600);
    } else if (DORMS.length > 0) {
      selectDorm(DORMS[0].dormID);
    }
  } catch (err) {
    console.error('Failed to fetch dorms:', err);
    showToast('Could not load dorms from server.', '#e07070');
  }
}
 
// ═══════════════════════════════════════════════════════
//  PLACE MARKERS ON MAP
// ═══════════════════════════════════════════════════════
function placeDormMarkers() {
  DORMS.forEach(d => {
    const marker = new google.maps.Marker({
      position : { lat: d.latitude, lng: d.longitude },
      map,
      title    : d.dname,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#2ab4a0',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });
    marker.addListener('click', () => selectDorm(d.dormID));
    markers[d.dormID] = marker;
  });
}
 
// ═══════════════════════════════════════════════════════
//  LOCATION DETECTION
// ═══════════════════════════════════════════════════════
function detectLocation() {
  if (!CURRENT_USER_ID) return;
  document.getElementById('loc-coords').textContent = 'Detecting via GPS...';
  document.getElementById('loc-coords').textContent = 'Detecting via GPS...';
  if (!navigator.geolocation) { handleLocationError(); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      document.getElementById('loc-name').textContent   = 'Current Location';
      document.getElementById('loc-coords').textContent = userLat.toFixed(4) + ', ' + userLng.toFixed(4);
      new google.maps.Marker({
        position: { lat: userLat, lng: userLng },
        map,
        title: 'You are here',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#e05050',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 10,
      });
      map.setCenter({ lat: userLat, lng: userLng });
      calculateDistances();
      runDijkstraAndRank();
      if (activeDormId) drawRoute(activeDormId);
    },
    () => handleLocationError()
  );
}
 
function handleLocationError() {
  document.getElementById('loc-name').textContent   = 'Location unavailable';
  document.getElementById('loc-coords').textContent = 'Please enable location access';
  showToast('Please turn on your location to see routes and distances.', '#e07070');
}
 
// ═══════════════════════════════════════════════════════
//  CALCULATE DISTANCES (Haversine)
// ═══════════════════════════════════════════════════════
function calculateDistances() {
  if (userLat === null) return;
  DORMS.forEach(d => {
    const dist  = getDistanceKm(userLat, userLng, d.latitude, d.longitude);
    d.distance  = dist;
    d.distLabel = dist < 1 ? Math.round(dist * 1000) + 'm' : dist.toFixed(1) + 'km';
  });
  renderNearbyList();
}
 
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R  = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
 
// ═══════════════════════════════════════════════════════
//  DIJKSTRA'S ALGORITHM — Distance Optimization
// ═══════════════════════════════════════════════════════

function buildGraph() {
  // Nodes: user location (id: 0) + each dorm (id: dormID)
  const graph = {};

  // Node 0 = user
  graph[0] = {};
  DORMS.forEach(d => {
    // Edge: user → dorm
    const dist = getDistanceKm(userLat, userLng, d.latitude, d.longitude);
    graph[0][d.dormID] = dist;

    // Edge: dorm → dorm (so Dijkstra can traverse through dorms)
    if (!graph[d.dormID]) graph[d.dormID] = {};
    graph[d.dormID][0] = dist; // back edge to user

    DORMS.forEach(other => {
      if (other.dormID === d.dormID) return;
      const interDist = getDistanceKm(d.latitude, d.longitude, other.latitude, other.longitude);
      graph[d.dormID][other.dormID] = interDist;
    });
  });

  return graph;
}

function dijkstra(graph, startNode) {
  const distances = {};
  const visited   = new Set();
  const previous  = {};

  // Initialize all distances to Infinity
  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    previous[node]  = null;
  });
  distances[startNode] = 0;

  while (true) {
    // Pick unvisited node with smallest distance
    let current = null;
    let smallest = Infinity;
    Object.keys(distances).forEach(node => {
      if (!visited.has(node) && distances[node] < smallest) {
        smallest = distances[node];
        current  = node;
      }
    });

    if (current === null) break;
    visited.add(current);

    // Update neighbors
    const neighbors = graph[current];
    if (!neighbors) continue;
    Object.keys(neighbors).forEach(neighbor => {
      if (visited.has(neighbor)) return;
      const newDist = distances[current] + neighbors[neighbor];
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor]  = current;
      }
    });
  }

  return { distances, previous };
}

function runDijkstraAndRank() {
  if (userLat === null || userLng === null) return;

  const graph  = buildGraph();
  const result = dijkstra(graph, '0');

  // Assign Dijkstra distance to each dorm
  DORMS.forEach(d => {
    const optimalDist = result.distances[String(d.dormID)];
    d.dijkstraDistance = optimalDist !== undefined ? optimalDist : d.distance || Infinity;
  });

  // Find nearest dorm
  const nearest = DORMS.reduce((best, d) =>
    d.dijkstraDistance < best.dijkstraDistance ? d : best, DORMS[0]);

  // Highlight nearest dorm marker in gold
  Object.entries(markers).forEach(([id, marker]) => {
    const isNearest = parseInt(id) === nearest.dormID;
    marker.setIcon({
      path         : google.maps.SymbolPath.CIRCLE,
      scale        : isNearest ? 14 : 10,
      fillColor    : isNearest ? '#c9a84c' : '#2ab4a0',
      fillOpacity  : 1,
      strokeColor  : '#ffffff',
      strokeWeight : 2,
    });
  });

  // Show toast indicating nearest dorm
  showToast(`Nearest dorm: ${nearest.dname} (${nearest.distLabel || nearest.dijkstraDistance.toFixed(2) + 'km'})`, 'var(--teal-light)');

  // Re-rank the nearby list by Dijkstra distance
  renderNearbyListDijkstra();
}

function renderNearbyListDijkstra() {
  const sorted = [...DORMS].sort((a, b) => a.dijkstraDistance - b.dijkstraDistance);
  const list   = document.getElementById('nearby-list');
  if (!list) return;

  list.innerHTML = sorted.map((d, i) => `
    <div class="nearby-item ${d.dormID === activeDormId ? 'active' : ''}"
         onclick="selectDorm(${d.dormID})"
         style="animation-delay:${i * 0.06}s">
      <div class="ni-dot" style="background:${i === 0 ? '#c9a84c' : '#2ab4a0'};
           box-shadow:0 0 8px ${i === 0 ? '#c9a84c55' : '#2ab4a055'}"></div>
      <div class="ni-info">
        <div class="ni-name">${d.dname} ${i === 0 ? '<span style="color:#c9a84c;font-size:11px;">★ Nearest</span>' : ''}</div>
        <div class="ni-meta">
          <span class="ni-dist">📍 ${d.distLabel || d.dijkstraDistance.toFixed(2) + 'km'}</span>
          <span>·</span>
          <span>⭐ ${d.average_rating}</span>
        </div>
      </div>
      <div class="ni-price">₱${d.price.toLocaleString()}</div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════
//  DRAW ROUTE
// ═══════════════════════════════════════════════════════
function drawRoute(dormID) {
  if (userLat === null) {
    showToast('Please enable your location to see the route.', '#e07070');
    return;
  }
  const dorm = DORMS.find(d => d.dormID === dormID);
  if (!dorm) return;
  const directionsService = new google.maps.DirectionsService();
  directionsService.route(
    {
      origin     : { lat: userLat, lng: userLng },
      destination: { lat: dorm.latitude, lng: dorm.longitude },
      travelMode : google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        const leg = result.routes[0].legs[0];
        const statusEl = document.getElementById('map-status-text');
        if (statusEl) statusEl.innerHTML =
          `Route to <strong style="color:var(--gold)">${dorm.dname}</strong> · ${leg.distance.text} · ${leg.duration.text}`;
      } else {
        showToast('Could not get directions. Try again.', '#e07070');
      }
    }
  );
}
 
// ═══════════════════════════════════════════════════════
//  MAUT — Multi-Attribute Utility Theory Scoring
//  Weights: rating 40%, price 35%, distance 25%
// ═══════════════════════════════════════════════════════
function computeMAUTScores(dorms) {
  if (!dorms || dorms.length === 0) return [];

  const weights = { rating: 0.40, price: 0.35, distance: 0.25 };

  const ratings   = dorms.map(d => parseFloat(d.average_rating) || 0);
  const prices    = dorms.map(d => d.price || 0);
  const distances = dorms.map(d => d.distance ?? d.dijkstraDistance ?? Infinity);

  const minRating = Math.min(...ratings),   maxRating = Math.max(...ratings);
  const minPrice  = Math.min(...prices),    maxPrice  = Math.max(...prices);
  const minDist   = Math.min(...distances), maxDist   = Math.max(...distances);

  function norm(val, min, max, higherIsBetter = true) {
    if (max === min) return 1;
    const n = (val - min) / (max - min);
    return higherIsBetter ? n : 1 - n;
  }

  return dorms.map((d, i) => {
    const rScore = norm(ratings[i],   minRating, maxRating, true);
    const pScore = norm(prices[i],    minPrice,  maxPrice,  false);
    const dScore = norm(distances[i], minDist,   maxDist,   false);
    const mautScore = (rScore * weights.rating) + (pScore * weights.price) + (dScore * weights.distance);
    return { ...d, mautScore };
  });
}
// ═══════════════════════════════════════════════════════
//  NEARBY LIST
// ═══════════════════════════════════════════════════════
function sortNearby(mode, btn) {
  sortMode = mode;
  document.querySelectorAll('.sort-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');

  if (sortMode === 'maut') {
    const scored = computeMAUTScores([...DORMS]);
    DORMS.forEach(d => {
      const match = scored.find(s => s.dormID === d.dormID);
      if (match) d.mautScore = match.mautScore;
    });
    renderNearbyListMAUT();
  } else if (sortMode === 'distance' && userLat !== null) {
    renderNearbyListDijkstra();
  } else {
    renderNearbyList();
  }
}

function renderNearbyListMAUT() {
  const sorted = [...DORMS].sort((a, b) => (b.mautScore || 0) - (a.mautScore || 0));
  const list   = document.getElementById('nearby-list');
  if (!list) return;

  list.innerHTML = sorted.map((d, i) => `
    <div class="nearby-item ${d.dormID === activeDormId ? 'active' : ''}"
         onclick="selectDorm(${d.dormID})"
         style="animation-delay:${i * 0.06}s">
      <div class="ni-dot" style="background:${i === 0 ? '#c9a84c' : '#2ab4a0'};
           box-shadow:0 0 8px ${i === 0 ? '#c9a84c55' : '#2ab4a055'}"></div>
      <div class="ni-info">
        <div class="ni-name">${d.dname} ${i === 0 ? '<span style="color:#c9a84c;font-size:11px;">⭐ Best Match</span>' : ''}</div>
        <div class="ni-meta">
          <span class="ni-dist">📍 ${d.distLabel || '—'}</span>
          <span>·</span>
          <span>⭐ ${d.average_rating}</span>
        </div>
      </div>
      <div class="ni-price">₱${d.price.toLocaleString()}</div>
    </div>
  `).join('');
}
 
function renderNearbyList() {
  const sorted = [...DORMS].sort((a, b) => {
    if (sortMode === 'distance') return (a.distance||0) - (b.distance||0);
    if (sortMode === 'price')    return a.price - b.price;
    if (sortMode === 'rating')   return b.average_rating - a.average_rating;
  });
  const list = document.getElementById('nearby-list');
  if (list) {
    list.innerHTML = sorted.map((d, i) => `
      <div class="nearby-item ${d.dormID === activeDormId ? 'active' : ''}" onclick="selectDorm(${d.dormID})" style="animation-delay:${i*0.06}s">
        <div class="ni-dot" style="background:#2ab4a0;box-shadow:0 0 8px #2ab4a055"></div>
        <div class="ni-info">
          <div class="ni-name">${d.dname}</div>
          <div class="ni-meta">
            <span class="ni-dist">📍 ${d.distLabel || '—'}</span>
            <span>·</span>
            <span>⭐ ${d.average_rating}</span>
          </div>
        </div>
        <div class="ni-price">₱${d.price.toLocaleString()}</div>
      </div>
    `).join('');
  }
  const count = DORMS.length;
  const nearbyCount = document.getElementById('nearby-count');
  const sfCount     = document.getElementById('sf-count');
  const mapCount    = document.getElementById('map-dorm-count');
  if (nearbyCount) nearbyCount.textContent = count + ' dorms';
  if (sfCount)     sfCount.textContent     = count;
  if (mapCount)    mapCount.textContent    = count;
}
 
// ═══════════════════════════════════════════════════════
//  SELECT DORM
// ═══════════════════════════════════════════════════════
function selectDorm(dormID) {
  dormID = parseInt(dormID);
  activeDormId = dormID;
  const d = DORMS.find(x => x.dormID === dormID);
  if (!d) return;
 
  if (map) map.panTo({ lat: d.latitude, lng: d.longitude });
 
  Object.entries(markers).forEach(([id, marker]) => {
    marker.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      scale: parseInt(id) === dormID ? 13 : 10,
      fillColor: parseInt(id) === dormID ? '#c9a84c' : '#2ab4a0',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    });
  });
 
  drawRoute(dormID);
 
  document.getElementById('dorm-name').textContent   = d.dname;
  document.getElementById('dorm-price').innerHTML    = '₱' + d.price.toLocaleString() + '<small>/mo</small>';
  document.getElementById('dorm-loc').textContent    = d.address || 'Quezon City';
  document.getElementById('dorm-score').textContent  = d.average_rating;
  document.getElementById('dorm-rcount').textContent = '';
  document.getElementById('modal-dorm-name').textContent = d.dname;
  const imgEl = document.getElementById('dorm-img-bg');
  const pic = d.dorm_pic1 || d.dormPics || null;
  if (pic && pic !== 'uploads/dorm_pics/default.jpg') {
    imgEl.style.background = `url('${pic}') center/cover no-repeat`;
    imgEl.textContent = '';
  } else {
    imgEl.style.background = 'linear-gradient(160deg, #2ab4a022, #0d2030)';
    imgEl.textContent = '🏠';
  }
 
  renderStars('dorm-stars', d.average_rating);
  document.getElementById('dorm-tags').innerHTML = '';

  const favBtn = document.getElementById('fav-btn');
  if (likedDorms.has(dormID)) { favBtn.textContent = '❤️'; favBtn.classList.add('liked'); }
  else { favBtn.textContent = '🤍'; favBtn.classList.remove('liked'); }

  // Hide fav and review buttons for guests
  favBtn.style.display = CURRENT_USER_ID ? '' : 'none';
  const reviewBtn = document.querySelector('.write-review-btn[onclick="openReviewModal()"]');
  if (reviewBtn) reviewBtn.style.display = CURRENT_USER_ID ? '' : 'none';

  loadReviews(dormID);
  renderNearbyList();
}
 
// ═══════════════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════════════
async function loadReviews(dormID) {
  try {
    const res  = await fetch(`get_reviews.php?dormID=${dormID}`);
    const data = await res.json();
    if (data.success) {
      renderReviewsList('reviews-list', data.reviews.slice(0, 3));
      document.getElementById('dorm-rcount').textContent = `(${data.reviews.length} reviews)`;
    }
  } catch (err) { console.error('Reviews fetch failed:', err); }
}
 
function renderStars(containerId, rating) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = [1,2,3,4,5].map(i =>
    `<span class="star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`).join('');
}
 
function renderReviewsList(containerId, reviews) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!reviews || !reviews.length) {
    el.innerHTML = `<div class="no-reviews"><div class="nr-icon">💬</div><p>No reviews yet.<br>Be the first!</p></div>`;
    return;
  }
  el.innerHTML = reviews.map((r, i) => `
    <div class="review-card" onclick="openReviewModal()" style="animation-delay:${i*0.07}s">
      <div class="review-top">
        <div class="reviewer">
          ${r.pfp && r.pfp !== 'uploads/pfp/default.jpg' && r.pfp !== '' ? `<div class="reviewer-avatar" style="background-image:url(${r.pfp});background-size:cover;background-position:center;"></div>` : `<div class="reviewer-avatar" style="background:#2a8a8a">${r.fname ? r.fname[0] : 'U'}</div>`}
          <div><div class="reviewer-name">${r.fname || 'Anonymous'}</div></div>
        </div>
        <div class="review-stars">${[1,2,3,4,5].map(j =>
          `<span class="star ${j<=r.ratings?'':'empty'}">★</span>`).join('')}</div>
      </div>
      <div class="review-text">${r.comment}</div>
    </div>
  `).join('');
}
 
// ═══════════════════════════════════════════════════════
//  REVIEW MODAL
// ═══════════════════════════════════════════════════════
let existingReviewID = null; // tracks if current user already reviewed this dorm

async function openReviewModal() {
  document.getElementById('review-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  await loadExistingUserReview();
  loadModalReviews('newest');
}

async function loadExistingUserReview() {
  existingReviewID = null;
  // Reset form
  document.getElementById('wr-text').value = '';
  userRating = 0;
  document.querySelectorAll('.wr-star-pick').forEach(s => s.classList.remove('lit'));
  document.getElementById('wr-rating-text').textContent = 'Tap to rate';
  document.getElementById('wr-char').textContent = '0 / 400';
  const submitBtn = document.querySelector('.wr-submit');
  const wrLabel   = document.querySelector('.wr-label');

  if (!CURRENT_USER_ID || !activeDormId) return;
  try {
    const res  = await fetch(`get_reviews.php?dormID=${activeDormId}`);
    const data = await res.json();
    if (!data.success) return;
    const myReview = data.reviews.find(r => parseInt(r.userID) === parseInt(CURRENT_USER_ID));
    if (myReview) {
      existingReviewID = myReview.reviewID;
      document.getElementById('wr-text').value = myReview.comment;
      updateChar();
      setRating(myReview.ratings);
      if (submitBtn) submitBtn.textContent = 'Update Review';
      if (wrLabel)   wrLabel.textContent   = 'Update Your Review';
    } else {
      if (submitBtn) submitBtn.textContent = 'Post Review';
      if (wrLabel)   wrLabel.textContent   = 'Write a Review';
    }
  } catch (err) { console.error('Failed to check existing review:', err); }
}
 
function closeReviewModal() {
  document.getElementById('review-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
 
function handleOverlayClick(e) {
  if (e.target === document.getElementById('review-modal-overlay')) closeReviewModal();
}
 
async function loadModalReviews(sort) {
  try {
    const res  = await fetch(`get_reviews.php?dormID=${activeDormId}`);
    const data = await res.json();
    if (!data.success) return;
    let reviews = [...data.reviews];
    if (sort === 'highest') reviews.sort((a,b) => b.ratings - a.ratings);
    if (sort === 'lowest')  reviews.sort((a,b) => a.ratings - b.ratings);
    const totalEl = document.getElementById('modal-review-count');
    if (totalEl) totalEl.textContent = `${reviews.length} review${reviews.length!==1?'s':''}`;
    const container = document.getElementById('modal-reviews-list');
    container.querySelectorAll('.review-card').forEach(c => c.remove());
    if (!reviews.length) {
      const empty = document.createElement('div');
      empty.className = 'no-reviews';
      empty.innerHTML = `<div class="nr-icon">💬</div><p>No reviews yet.</p>`;
      container.appendChild(empty);
      return;
    }
    reviews.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.style.cssText = `animation-delay:${i*0.06}s;cursor:default`;
      card.innerHTML = `
        <div class="review-top">
          <div class="reviewer">
            ${r.pfp && r.pfp !== 'uploads/pfp/default.jpg' && r.pfp !== '' ? `<div class="reviewer-avatar" style="background-image:url(${r.pfp});background-size:cover;background-position:center;"></div>` : `<div class="reviewer-avatar" style="background:#2a8a8a">${r.fname ? r.fname[0] : 'U'}</div>`}
            <div><div class="reviewer-name">${r.fname || 'Anonymous'}</div></div>
          </div>
          <div class="review-stars">${[1,2,3,4,5].map(j =>
            `<span class="star ${j<=r.ratings?'':'empty'}">★</span>`).join('')}</div>
        </div>
        <div class="review-text">${r.comment}</div>
      `;
      container.appendChild(card);
    });
  } catch (err) { console.error('Modal reviews failed:', err); }
}
 
function sortReviews(mode, btn) {
  document.querySelectorAll('.modal-sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadModalReviews(mode);
}
 
// ═══════════════════════════════════════════════════════
//  STAR RATING PICKER
// ═══════════════════════════════════════════════════════
const ratingLabels = ['','Terrible','Poor','OK','Good','Excellent'];
 
function setRating(val) {
  userRating = val;
  document.querySelectorAll('.wr-star-pick').forEach(s => {
    s.classList.toggle('lit', parseInt(s.dataset.v) <= val);
  });
  document.getElementById('wr-rating-text').textContent = ratingLabels[val];
}
 
document.querySelectorAll('.wr-star-pick').forEach(s => {
  s.addEventListener('mouseenter', () => {
    const v = parseInt(s.dataset.v);
    document.querySelectorAll('.wr-star-pick').forEach(x => {
      x.style.color = parseInt(x.dataset.v) <= v ? 'var(--gold)' : '';
    });
  });
  s.addEventListener('mouseleave', () => {
    document.querySelectorAll('.wr-star-pick').forEach(x => {
      x.style.color = '';
      x.classList.toggle('lit', parseInt(x.dataset.v) <= userRating);
    });
  });
});
 
function updateChar() {
  const t = document.getElementById('wr-text').value;
  document.getElementById('wr-char').textContent = t.length + ' / 400';
}
 
// ═══════════════════════════════════════════════════════
//  SUBMIT REVIEW
// ═══════════════════════════════════════════════════════
async function submitReview() {
  const text = document.getElementById('wr-text').value.trim();
  if (!userRating)      { showToast('Please select a star rating.', '#e07070'); return; }
  if (text.length < 10) { showToast('Review must be at least 10 characters.', '#e07070'); return; }
  const isUpdate = !!existingReviewID;
  try {
    const res  = await fetch('submit_review.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        dormID  : activeDormId,
        userID  : CURRENT_USER_ID,
        ratings : userRating,
        comment : text,
        ...(isUpdate && { reviewID: existingReviewID, _method: 'update' }),
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    // Update existingReviewID in case the server returns it on first post
    if (data.reviewID) existingReviewID = data.reviewID;
    // Flip button to "Update Review" for the rest of this session
    const submitBtn = document.querySelector('.wr-submit');
    const wrLabel   = document.querySelector('.wr-label');
    if (submitBtn) submitBtn.textContent = 'Update Review';
    if (wrLabel)   wrLabel.textContent   = 'Update Your Review';
    loadModalReviews('newest');
    loadReviews(activeDormId);
    showToast(isUpdate ? 'Review updated!' : 'Review posted! Thank you.', 'var(--teal-light)');
  } catch (err) {
    showToast('Failed to ' + (isUpdate ? 'update' : 'post') + ' review.', '#e07070');
  }
}
 
// ═══════════════════════════════════════════════════════
//  FAV BUTTON
// ═══════════════════════════════════════════════════════
async function toggleFav() {
  if (!CURRENT_USER_ID) { showToast('Please log in to save dorms.', '#e07070'); return; }
  const btn = document.getElementById('fav-btn');
  const isLiked = likedDorms.has(activeDormId);
 
  // Optimistic update
  if (isLiked) {
    likedDorms.delete(activeDormId);
    btn.textContent = '🤍'; btn.classList.remove('liked');
  } else {
    likedDorms.add(activeDormId);
    btn.textContent = '❤️'; btn.classList.add('liked');
  }
  updateLikedBadge();
 
  try {
    const res  = await fetch('toggle_like.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ userID: CURRENT_USER_ID, dormID: activeDormId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error();
  } catch {
    // Revert on failure
    if (isLiked) { likedDorms.add(activeDormId); btn.textContent = '❤️'; btn.classList.add('liked'); }
    else { likedDorms.delete(activeDormId); btn.textContent = '🤍'; btn.classList.remove('liked'); }
    updateLikedBadge();
    showToast('Failed to save dorm.', '#e07070');
  }
}
 
// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg, color) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  if (color) t.style.color = color;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function viewDormDetails() {
  if (activeDormId) window.location.href = `dorm_detail.html?dormID=${activeDormId}`;
}

// ═══════════════════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════════════════
async function logout() {
  await fetch('logout.php');
  window.location.href = 'login.html';
}
 
// ═══════════════════════════════════════════════════════
//  DARK MAP STYLES
// ═══════════════════════════════════════════════════════
const DARK_MAP_STYLES = [
  { elementType: 'geometry',           stylers: [{ color: '#0d1f30' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#8a9ab0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1f30' }] },
  { featureType: 'road',               elementType: 'geometry',        stylers: [{ color: '#1a3048' }] },
  { featureType: 'road',               elementType: 'geometry.stroke', stylers: [{ color: '#0f2030' }] },
  { featureType: 'road.highway',       elementType: 'geometry',        stylers: [{ color: '#2a4060' }] },
  { featureType: 'water',              elementType: 'geometry',        stylers: [{ color: '#0a1828' }] },
  { featureType: 'poi',                stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',            stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',     elementType: 'geometry',        stylers: [{ color: '#1a3048' }] },
];