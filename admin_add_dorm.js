const AMENITIES_LIST = ['Wi-Fi','CCTV','Study Room','Water & Electricity','AC','Parking','Basketball Court','Near Jeepney','Cable TV','Dining area','Laundry Service','Biometric Door Lock','Transport service','Common Area','Open 24/7 no curfew','Gym','own locker','own bathroom','Security','Free Housekeeping'];
let selectedAmenities = new Set();

// imageFiles[0..2] hold File objects or null
const imageFiles = [null, null, null];

// ── Amenities ──
function renderAmenities() {
    const grid = document.getElementById('amenitiesGrid');
    grid.innerHTML = AMENITIES_LIST.map(a => `
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

// ── Image handling ──
function triggerUpload(index) {
    document.getElementById(`imgUpload${index}`).click();
}

function handleImageUpload(e, index) {
    const file = e.target.files[0];
    if (!file) return;
    imageFiles[index] = file;

    const reader = new FileReader();
    reader.onload = ev => {
        const slot = document.getElementById(`slot${index}`);
        // Remove any existing img tag
        const existing = slot.querySelector('img');
        if (existing) existing.remove();
        const img = document.createElement('img');
        img.src = ev.target.result;
        img.alt = `preview ${index + 1}`;
        slot.insertBefore(img, slot.firstChild);
        slot.classList.add('has-img');
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected if removed
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

// ── Toast ──
function showToast(msg, err = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${err ? 'error' : ''} show`;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Save ──
async function saveNewDorm() {
    const dname   = document.getElementById('dname').value.trim();
    const address = document.getElementById('address').value.trim();
    const price   = parseFloat(document.getElementById('price').value) || 0;
    const lat     = parseFloat(document.getElementById('lat').value) || 0;
    const lng     = parseFloat(document.getElementById('lng').value) || 0;
    const description = document.getElementById('description').value.trim();
    const website = document.getElementById('website').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const email   = document.getElementById('email').value.trim();
    const facebook = document.getElementById('facebook').value.trim();

    if (!dname || !address) {
        showToast('Dorm name and address are required.', true);
        return;
    }

    // Use FormData so we can attach image files
    const fd = new FormData();
    fd.append('dname', dname);
    fd.append('address', address);
    fd.append('price', price);
    fd.append('latitude', lat);
    fd.append('longitude', lng);
    fd.append('owner_name', website);   // maps to owner_name column (repurposed as website)
    fd.append('description', description);
    fd.append('contact_phone', phone);
    fd.append('contact_email', email);
    fd.append('contact_facebook', facebook);
    fd.append('amenities', JSON.stringify([...selectedAmenities]));

    imageFiles.forEach((file, i) => {
        if (file) fd.append(`image${i}`, file);
    });

    try {
        const res = await fetch('add_dorm.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            showToast('Dorm added successfully!');
            setTimeout(() => { window.location.href = 'admin_dorms.html'; }, 1200);
        } else {
            showToast(data.message || 'Failed to add dorm.', true);
        }
    } catch (err) {
        showToast('Network error.', true);
    }
}

async function logout() {
    await fetch('logout.php');
    window.location.href = 'login.html';
}

window.addEventListener('DOMContentLoaded', () => {
    renderAmenities();
});