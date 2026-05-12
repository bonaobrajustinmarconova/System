// Toast helper
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

// ── Load Users ──
async function loadUsers() {
    const tbody = document.getElementById('userTbody');
    try {
        const res = await fetch('admin_users_list.php');
        const data = await res.json();
        if (!data.success || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-soft);text-align:center;">No users found.</td></tr>';
            return;
        }
        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>${u.fname} ${u.lname}</td>
                <td>${u.uname}</td>
                <td><span class="role-badge ${u.role}">${u.role}</span></td>
                <td>${u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                <td style="display:flex;gap:8px;align-items:center;">
                    <button class="btn btn-ghost" style="font-size:0.75rem;padding:5px 10px;"
                        onclick="changeRole(${u.userID}, '${u.role}')">
                        Make ${u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button class="btn-danger" style="font-size:0.75rem;padding:5px 12px;border-radius:8px;border:none;cursor:pointer;"
                        onclick="openTerminateModal(${u.userID}, '${u.fname} ${u.lname}')">
                        Terminate
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#e07070;text-align:center;">Failed to load users.</td></tr>';
    }
}

// ── Change Role ──
async function changeRole(userID, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;
    try {
        const res = await fetch('admin_update_role.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, role: newRole })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Role updated to ${newRole}!`);
            loadUsers();
        } else {
            showToast(data.message || 'Failed to update role.', true);
        }
    } catch (err) {
        showToast('Network error.', true);
    }
}

// ── Terminate Account ──
async function openTerminateModal(userID, fullName) {
    if (!confirm(`Terminate the account of "${fullName}"?\nThis action cannot be undone.`)) return;
    try {
        const res = await fetch('admin_terminate_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Account terminated successfully.');
            loadUsers();
        } else {
            showToast(data.message || 'Failed to terminate account.', true);
        }
    } catch (err) {
        showToast('Network error.', true);
    }
}

window.addEventListener('DOMContentLoaded', loadUsers);

// ── Add User ──
function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('open');
}

async function addUser() {
    const alertEl = document.getElementById('addUserAlert');
    alertEl.style.display = 'none';

    const fname = document.getElementById('newFname').value.trim();
    const lname = document.getElementById('newLname').value.trim();
    const uname = document.getElementById('newUname').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    if (!fname || !lname || !uname || !password) {
        alertEl.style.display = 'block';
        alertEl.textContent = 'All fields are required.';
        return;
    }

    try {
        const res = await fetch('admin_add_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fname, lname, uname, password, role })
        });
        const data = await res.json();
        if (data.success) {
            closeAddUserModal();
            showToast('User added successfully!');
            loadUsers();
        } else {
            alertEl.style.display = 'block';
            alertEl.textContent = data.message || 'Failed to add user.';
        }
    } catch (err) {
        alertEl.style.display = 'block';
        alertEl.textContent = 'Network error.';
    }
}