// ═══════════════════════════════════════════════════════
//  NESTQC ADMIN CHAT – admin_chat.js (final working)
// ═══════════════════════════════════════════════════════

let currentUserID = null;
let ADMIN_USER_ID = null;

// ── Toast ──
function showToast(msg, err = false) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast ${err ? 'error' : ''} show`;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Logout ──
async function logout() {
    await fetch('logout.php');
    window.location.href = 'login.html';
}

// ── Load user list ──
async function loadUsers() {
    const pane = document.getElementById('userPane');
    if (!pane) return;
    try {
        const res = await fetch('admin_get_messages.php');
        const data = await res.json();
        if (!data.success || !data.users.length) {
            pane.innerHTML = '<p style="padding:20px;color:var(--text-soft);">No conversations yet.</p>';
            return;
        }
        pane.innerHTML = data.users.map(u => `
            <div class="user-card ${u.userID === currentUserID ? 'active' : ''}"
                 onclick="selectUser(${u.userID})" data-uid="${u.userID}">
                <div class="user-card-name">${u.fname} ${u.lname}</div>
                <div class="user-card-email">${u.uname}</div>
                <div class="user-card-phone">📞 ${u.phone || '—'}</div>
                <div class="user-card-last">${u.last_content || '—'}</div>
            </div>
        `).join('');
    } catch (err) {
        pane.innerHTML = '<p style="padding:20px;color:#e07070;">Failed to load users.</p>';
    }
}

// ── Select user and load conversation ──
async function selectUser(uid) {
    currentUserID = uid;
    document.querySelectorAll('.user-card').forEach(el => el.classList.remove('active'));
    document.querySelector(`.user-card[data-uid="${uid}"]`)?.classList.add('active');

    const replyArea = document.getElementById('replyArea');
    if (replyArea) replyArea.style.display = 'flex';

    try {
        const res = await fetch(`admin_get_messages.php?userID=${uid}`);
        const data = await res.json();
        if (!data.success) return;

        const userInfo = await fetchUserInfo(uid);
        const convHeader = document.getElementById('convHeader');
        if (convHeader) convHeader.style.display = 'block';
        const convName = document.getElementById('convName');
        if (convName) convName.textContent = userInfo.fullname || 'User';
        const convEmail = document.getElementById('convEmail');
        if (convEmail) {
            convEmail.textContent = userInfo.uname || '';
            convEmail.href = `mailto:${userInfo.uname || ''}`;
        }
        const convPhone = document.getElementById('convPhone');
        if (convPhone) convPhone.textContent = `📞 ${userInfo.phone || '—'}`;

        renderMessages(data.messages);
    } catch (err) {
        showToast('Failed to load conversation.', true);
    }
}

async function fetchUserInfo(uid) {
    const card = document.querySelector(`.user-card[data-uid="${uid}"]`);
    if (card) {
        const nameEl = card.querySelector('.user-card-name');
        const emailEl = card.querySelector('.user-card-email');
        return {
            fullname: nameEl ? nameEl.textContent : 'User',
            uname: emailEl ? emailEl.textContent : '',
            phone: '—'
        };
    }
    try {
        const res = await fetch('admin_get_messages.php');
        const data = await res.json();
        const u = data.users?.find(u => u.userID == uid);
        return { fullname: (u?.fname + ' ' + u?.lname) || 'User', uname: u?.uname || '', phone: u?.phone || '—' };
    } catch (e) {
        return { fullname: 'User', uname: '', phone: '—' };
    }
}

// ── Render messages – admin messages go RIGHT ──
function renderMessages(msgs) {
    const area = document.getElementById('msgList');
    if (!area) return;
    if (!msgs || !msgs.length) {
        area.innerHTML = '<p style="color:var(--text-soft);text-align:center;padding-top:40px;">No messages yet.</p>';
        return;
    }

    // Debug – you can remove this after confirming it works
    console.log('Admin ID:', ADMIN_USER_ID);
    console.log('Message senderIDs:', msgs.map(m => m.senderID));

    area.innerHTML = msgs.map(m => {
        const isMine = (m.senderID === ADMIN_USER_ID);
        const bubbleClass = isMine ? 'admin' : 'user';
        return `
            <div class="msg-bubble ${bubbleClass}">
                <div>${m.content}</div>
                <div class="msg-time">${new Date(m.created_at).toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
        `;
    }).join('');
    area.scrollTop = area.scrollHeight;
}

// ── Send reply ──
async function sendReply() {
    const input = document.getElementById('replyInput');
    if (!input) return;
    const content = input.value.trim();
    if (!content || !currentUserID) return;

    try {
        const res = await fetch('admin_send_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverID: currentUserID, content })
        });
        const data = await res.json();
        if (data.success) {
            input.value = '';
            await selectUser(currentUserID);
        } else {
            showToast(data.message || 'Failed to send.', true);
        }
    } catch (err) {
        showToast('Network error: ' + err.message, true);
    }
}

// ── INIT ──
(async function init() {
    try {
        const sessionRes = await fetch('session.php');
        const sessionData = await sessionRes.json();
        if (!sessionData.loggedIn || sessionData.user.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }
        ADMIN_USER_ID = parseInt(sessionData.user.userID, 10);
        console.log('Admin logged in as userID:', ADMIN_USER_ID);
    } catch (e) {
        window.location.href = 'login.html';
        return;
    }

    const replyInput = document.getElementById('replyInput');
    if (replyInput) {
        replyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendReply();
            }
        });
    }
    const sendBtn = document.getElementById('sendReplyBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendReply);
    }

    await loadUsers();
})();

setInterval(() => {
    if (currentUserID) selectUser(currentUserID);
}, 15000);