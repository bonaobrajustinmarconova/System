// ═══════════════════════════════════════════════════════
//  NESTQC CHAT WIDGET — chat.js
//  Include after editprofile.js on all user pages
// ═══════════════════════════════════════════════════════

(function () {
  'use strict';

  let chatOpen      = false;
  let pollInterval  = null;
  let lastMsgID     = 0;
  let currentUserID = null;
  let notifTimer    = null;

  // ── INJECT FLOATING PANEL HTML ──
  function injectChatHTML() {
    const html = `
      <!-- NOTIFICATION TOAST -->
      <div class="chat-notif-toast" id="chatNotifToast" onclick="ChatWidget.open()">
        <div class="chat-notif-icon">💬</div>
        <div class="chat-notif-text">
          <strong>Support Chat</strong>
          Admin replied to your message.
        </div>
      </div>

      <!-- FLOATING FAB (mobile fallback / pages without header icons) -->
      <button class="chat-fab" id="chatFab" onclick="ChatWidget.toggle()" title="Support Chat">
        <span>💬</span>
        <div class="chat-fab-badge" id="chatFabBadge"></div>
      </button>

      <!-- CHAT PANEL -->
      <div class="chat-panel" id="chatPanel">
        <div class="chat-panel-header">
          <div class="chat-header-avatar">🏘</div>
          <div class="chat-header-info">
            <div class="chat-header-title">Support Chat</div>
            <div class="chat-header-sub">we're here to help</div>
          </div>
          <button class="chat-close-btn" onclick="ChatWidget.close()">✕</button>
        </div>
        <div class="chat-messages" id="chatMessages">
          <div class="chat-empty">
            <div class="chat-empty-icon">💬</div>
            <p>Send a message to get started.<br>We'll reply as soon as possible.</p>
          </div>
        </div>
        <div class="chat-input-area">
          <textarea class="chat-input" id="chatInput" placeholder="Type a message…" rows="1"
            onkeydown="ChatWidget.handleKey(event)" oninput="ChatWidget.autoResize(this)"></textarea>
          <button class="chat-send-btn" id="chatSendBtn" onclick="ChatWidget.send()" title="Send">
            ➤
          </button>
        </div>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
  }

  // ── INIT ──
  async function init(userID) {
    currentUserID = userID;
    injectChatHTML();

    // Show the FAB (always visible)
    const fab = document.getElementById('chatFab');
    if (fab) fab.style.display = 'flex';

    // Check for unread on load
    await checkUnread();

    // Poll every 15s
    pollInterval = setInterval(async () => {
      if (!chatOpen) await checkUnread();
      else await loadMessages(false);
    }, 15000);
  }

  // ── TOGGLE ──
  function toggle() { chatOpen ? close() : open(); }

  async function open() {
    chatOpen = true;
    document.getElementById('chatPanel').classList.add('open');
    hideNotifToast();
    clearBadge();
    await loadMessages(true);
    setTimeout(() => { const inp = document.getElementById('chatInput'); if (inp) inp.focus(); }, 300);
  }

  function close() {
    chatOpen = false;
    document.getElementById('chatPanel').classList.remove('open');
  }

  // ── LOAD MESSAGES ──
  async function loadMessages(showLoading) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (showLoading && container.querySelector('.chat-empty')) {
      container.innerHTML = `<div class="chat-msg"><div class="chat-msg-avatar">🏘</div><div class="chat-msg-body"><div class="chat-loading"><span></span><span></span><span></span></div></div></div>`;
    }

    try {
      const res  = await fetch('get_messages.php');
      const data = await res.json();
      if (!data.success) return;

      const msgs = data.messages;
      if (!msgs.length) {
        container.innerHTML = `<div class="chat-empty"><div class="chat-empty-icon">💬</div><p>Send a message to get started.<br>We'll reply as soon as possible.</p></div>`;
        return;
      }

      const latestID = Math.max(...msgs.map(m => m.messageID));
      const isNew    = latestID > lastMsgID;
      lastMsgID      = latestID;

      container.innerHTML = msgs.map(m => buildBubble(m, data.userID)).join('');
      if (isNew || showLoading) scrollToBottom();
    } catch (err) { console.error('Chat load failed:', err); }
  }

 function buildBubble(m, myID) {
    const isMine = parseInt(m.senderID) === parseInt(myID);   // type-safe: user msg = right, admin msg = left
    const time   = formatTime(m.created_at);
    return `
      <div class="chat-msg ${isMine ? 'mine' : ''}">
        <div class="chat-msg-avatar">🏘</div>
        <div class="chat-msg-body">
          <div class="chat-msg-bubble">${escapeHTML(m.content)}</div>
          <div class="chat-msg-time">${time}</div>
        </div>
      </div>`;
}

  // ── SEND ──
  async function send() {
    const input   = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const content = input.value.trim();
    if (!content) return;

    input.value = '';
    autoResize(input);
    sendBtn.disabled = true;

    const container = document.getElementById('chatMessages');
    const emptyEl   = container.querySelector('.chat-empty');
    if (emptyEl) emptyEl.remove();

    const tempID = 'temp_' + Date.now();
    container.insertAdjacentHTML('beforeend', `
      <div class="chat-msg mine" id="${tempID}">
        <div class="chat-msg-body">
          <div class="chat-msg-bubble">${escapeHTML(content)}</div>
          <div class="chat-msg-time">Sending…</div>
        </div>
      </div>`);
    scrollToBottom();

    try {
      const res  = await fetch('send_message.php', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        const tempEl = document.getElementById(tempID);
        if (tempEl) {
          tempEl.querySelector('.chat-msg-time').textContent = formatTime(data.created_at);
          tempEl.removeAttribute('id');
          lastMsgID = data.messageID;
        }
      } else {
        document.getElementById(tempID)?.remove();
      }
    } catch {
      document.getElementById(tempID)?.remove();
    }
    sendBtn.disabled = false;
    input.focus();
  }

  // ── CHECK UNREAD (badge + toast) ──
  async function checkUnread() {
    try {
      const res  = await fetch('get_notifications.php');
      const data = await res.json();
      if (data.success && data.count > 0) {
        showBadge(data.count);
        if (!chatOpen) showNotifToast();
      } else {
        clearBadge();
      }
    } catch {}
  }

  function showBadge(count) {
    const label = count > 9 ? '9+' : String(count);
    const fabBadge = document.getElementById('chatFabBadge');
    if (fabBadge) { fabBadge.textContent = label; fabBadge.classList.add('show'); }
  }

  function clearBadge() {
    const fabBadge = document.getElementById('chatFabBadge');
    if (fabBadge) { fabBadge.classList.remove('show'); fabBadge.textContent = ''; }
  }

  function showNotifToast() {
    const toast = document.getElementById('chatNotifToast');
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => hideNotifToast(), 6000);
  }

  function hideNotifToast() {
    const toast = document.getElementById('chatNotifToast');
    if (toast) toast.classList.remove('show');
  }

  // ── HELPERS ──
  function scrollToBottom() {
    const c = document.getElementById('chatMessages');
    if (c) c.scrollTop = c.scrollHeight;
  }
  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }
  function formatTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/\n/g,'<br>');
  }

  window.ChatWidget = { init, toggle, open, close, send, handleKey, autoResize };
})();