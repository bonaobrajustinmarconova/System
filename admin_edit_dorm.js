const params = new URLSearchParams(window.location.search);
const dormID = params.get('id');

const AMENITIES = ['Wi-Fi','CCTV','Study Room','Water & Electricity','AC','Parking','Basketball Court','Near Jeepney','Cable TV','Dining area','Laundry Service','Biometric Door Lock','Transport service','Common Area','Open 24/7 no curfew','Gym','own locker','own bathroom','Security','Free Housekeeping'];
let selectedAmenities = new Set();

// imageFiles[0..2]: File object = new upload, string = existing URL, null = empty/cleared
const imageFiles = [null, null, null];
// existingUrls[0..2]: original URLs from DB (so we can tell the server which to keep)
const existingUrls = [null, null, null];

// ── Toast ──
function showToast(msg, err = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${err ? 'error' : ''} show`;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

async function logout() {
    await fetch('logout.php');
    window.location.href = 'login.html';
}

// ── Load dorm data ──
async function loadDorm() {
    if (!dormID) { showToast('No dorm ID provided.', true); return; }
    try {
        // Try dedicated single-dorm endpoint first (returns full contact fields)
        // then fall back to get_all_dorms.php
        let d = null;
        try {
            // get_dorm.php uses ?dormID= and returns amenities as a separate array
            const singleRes = await fetch(`get_dorm.php?dormID=${dormID}`);
            if (singleRes.ok) {
                const singleData = await singleRes.json();
                if (singleData.success && singleData.dorm) {
                    d = singleData.dorm;
                    // amenities come back as a top-level array, not inside dorm
                    if (singleData.amenities) d.amenities = singleData.amenities;
                }
            }
        } catch (_) {}

        if (!d) {
            const res = await fetch('get_all_dorms.php');
            const data = await res.json();
            if (!data.success) throw new Error();
            d = data.dorms.find(x => x.dormID == dormID);
        }

        if (!d) { showToast('Dorm not found.', true); return; }

        // Debug: log contact fields so we can confirm the DB is returning them
        console.log('[EditDorm] Loaded contact fields →', {
            owner_name:       d.owner_name,
            contact_phone:    d.contact_phone,
            contact_email:    d.contact_email,
            contact_facebook: d.contact_facebook,
        });

        document.getElementById('dname').value    = d.dname || '';
        document.getElementById('address').value  = d.address || '';
        document.getElementById('price').value    = d.price || '';
        document.getElementById('lat').value      = d.latitude || '';
        document.getElementById('lng').value      = d.longitude || '';
        document.getElementById('website').value  = d.owner_name || '';
        document.getElementById('phone').value    = d.contact_phone || '';
        document.getElementById('email').value    = d.contact_email || '';
        document.getElementById('facebook').value = d.contact_facebook || '';
        document.getElementById('description').value = d.description || '';

        // Load existing images (dorm_pic1, dorm_pic2, dorm_pic3 or legacy dormPics)
        const pics = [d.dorm_pic1 || d.dormPics || null, d.dorm_pic2 || null, d.dorm_pic3 || null];
        pics.forEach((url, i) => {
            if (url && url !== 'uploads/dorm_pics/default.jpg') {
                existingUrls[i] = url;
                imageFiles[i] = url;      // mark as existing URL
                setSlotImage(i, url);
            }
        });

        // Amenities
        if (d.amenities) selectedAmenities = new Set(d.amenities);
        renderAmenities();
    } catch(e) {
        showToast('Failed to load dorm data.', true);
    }
}

// ── Image helpers ──
function setSlotImage(index, src) {
    const slot = document.getElementById(`slot${index}`);
    const existing = slot.querySelector('img');
    if (existing) existing.remove();
    const img = document.createElement('img');
    img.src = src;
    img.alt = `photo ${index + 1}`;
    slot.insertBefore(img, slot.firstChild);
    slot.classList.add('has-img');
}

function triggerUpload(index) {
    document.getElementById(`imgUpload${index}`).click();
}

function handleImageUpload(e, index) {
    const file = e.target.files[0];
    if (!file) return;
    imageFiles[index] = file;   // File object = new upload
    const reader = new FileReader();
    reader.onload = ev => setSlotImage(index, ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
}

function removeImage(e, index) {
    e.stopPropagation();
    imageFiles[index] = null;
    const slot = document.getElementById(`slot${index}`);
    const img = slot.querySelector('img');
    if (img) img.remove();
    slot.classList.remove('has-img');
}

// ── Amenities ──
function renderAmenities() {
    const grid = document.getElementById('amenitiesGrid');
    grid.innerHTML = AMENITIES.map(a => `
        <div class="amenity-tag ${selectedAmenities.has(a) ? 'active' : ''}" onclick="toggleAmenity('${a}', this)">
            ${a}
        </div>
    `).join('');
}

function toggleAmenity(name, el) {
    if (selectedAmenities.has(name)) {
        selectedAmenities.delete(name);
        el.classList.remove('active');
    } else {
        selectedAmenities.add(name);
        el.classList.add('active');
    }
}

// ── Save ──
async function saveDorm() {
    const btn = document.getElementById('saveBtn');
    btn.textContent = 'Saving…'; btn.disabled = true;

    const dname   = document.getElementById('dname').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!dname || !address) {
        showToast('Dorm name and address are required.', true);
        btn.textContent = 'Save Changes'; btn.disabled = false;
        return;
    }

    const fd = new FormData();
    fd.append('dormID',          dormID);
    fd.append('dname',           dname);
    fd.append('address',         address);
    fd.append('price',           parseFloat(document.getElementById('price').value) || 0);
    fd.append('latitude',        parseFloat(document.getElementById('lat').value) || 0);
    fd.append('longitude',       parseFloat(document.getElementById('lng').value) || 0);
    fd.append('owner_name',      document.getElementById('website').value.trim());
    fd.append('description',     document.getElementById('description').value.trim());
    fd.append('contact_phone',   document.getElementById('phone').value.trim());
    fd.append('contact_email',   document.getElementById('email').value.trim());
    fd.append('contact_facebook',document.getElementById('facebook').value.trim());
    fd.append('amenities',       JSON.stringify([...selectedAmenities]));

    // For each slot: attach File if new upload, or send existing URL string, or send empty string to clear
    imageFiles.forEach((val, i) => {
        if (val instanceof File) {
            fd.append(`image${i}`, val);
        } else if (typeof val === 'string') {
            fd.append(`image${i}_existing`, val);
        } else {
            fd.append(`image${i}_clear`, '1');
        }
    });

    try {
        const res = await fetch('admin_update_dorm.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            showToast('Dorm updated!');
            setTimeout(() => { window.location.href = 'admin_dorms.html'; }, 1200);
        } else {
            showToast(data.message || 'Update failed.', true);
        }
    } catch(e) {
        showToast('Network error.', true);
    }

    btn.textContent = 'Save Changes'; btn.disabled = false;
}

window.addEventListener('DOMContentLoaded', loadDorm);