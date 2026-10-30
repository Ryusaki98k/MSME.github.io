(function () {
  'use strict';

  const content = document.getElementById('admin-content');
  const toast = document.getElementById('admin-toast');
  let currentUser = null;
  let currentSection = 'dashboard';

  // Wait for Supabase client to be ready
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabaseReady && window.supabase) { resolve(); return; }
      const handler = (e) => { resolve(); };
      window.addEventListener('supabase-ready', handler, { once: true });
      // Fallback timeout
      setTimeout(() => {
        if (window.supabase) resolve();
        else reject(new Error('Supabase load timeout'));
      }, 5000);
    });
  }

  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className = 'admin-toast ' + (type || 'success');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  async function isAdmin(email) {
    if (!email) return false;
    const { data, error } = await supabase.from('admins').select('email').eq('email', email).single();
    return !error && data;
  }

  // ===== Layout =====
  function renderLayout() {
    content.innerHTML = `
      <div class="admin-layout">
        <div class="admin-sidebar">
          <a data-section="dashboard" class="${currentSection === 'dashboard' ? 'active' : ''}"><i class="fa-solid fa-chart-line"></i> แดชบอร์ด</a>
          <a data-section="news" class="${currentSection === 'news' ? 'active' : ''}"><i class="fa-solid fa-newspaper"></i> จัดการข่าว</a>
          <a data-section="page-content" class="${currentSection === 'page-content' ? 'active' : ''}"><i class="fa-solid fa-pen-to-square"></i> แก้ไขหน้าเว็บ</a>
          <a data-section="albums" class="${currentSection === 'albums' ? 'active' : ''}"><i class="fa-solid fa-images"></i> จัดการอัลบั้ม</a>
          <a data-section="settings" class="${currentSection === 'settings' ? 'active' : ''}"><i class="fa-solid fa-gear"></i> ตั้งค่า</a>
          <a id="logout-link" style="margin-top:auto;"><i class="fa-solid fa-right-from-bracket"></i> ออกจากระบบ</a>
        </div>
        <div class="admin-main" id="admin-main">
          <p class="detail-loading">กำลังโหลด...</p>
        </div>
      </div>
    `;

    content.querySelectorAll('.admin-sidebar a[data-section]').forEach((a) => {
      a.addEventListener('click', () => {
        currentSection = a.dataset.section;
        renderLayout();
        loadSection(currentSection);
      });
    });

    document.getElementById('logout-link').addEventListener('click', async () => {
      await supabase.auth.signOut();
      currentUser = null;
      renderLogin();
    });

    loadSection(currentSection);
  }

  async function loadSection(section) {
    const main = document.getElementById('admin-main');
    switch (section) {
      case 'dashboard': await renderDashboard(main); break;
      case 'news': await renderNewsList(main); break;
      case 'page-content': await renderPageContent(main); break;
      case 'albums': await renderAlbums(main); break;
      case 'settings': await renderSettings(main); break;
    }
  }

  // ===== Login =====
  function renderLogin() {
    content.innerHTML = `
      <div class="detail-header">
        <span class="tag">แอดมิน</span>
        <h1>เข้าสู่ระบบแอดมิน</h1>
      </div>
      <div class="detail-body" style="text-align:center;padding:48px 28px;">
        <p style="margin-bottom:24px;color:var(--text-muted);">เข้าสู่ระบบด้วยบัญชี Google ที่ได้รับอนุญาต</p>
        <button id="google-login-btn" class="btn-detail" style="display:inline-flex;align-items:center;gap:8px;">
          <i class="fa-brands fa-google"></i> เข้าสู่ระบบด้วย Google
        </button>
        <p id="login-error" style="color:#c0392b;margin-top:16px;display:none;"></p>
      </div>
    `;
    document.getElementById('google-login-btn').addEventListener('click', async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) {
        const el = document.getElementById('login-error');
        el.textContent = error.message;
        el.style.display = 'block';
      }
    });
  }

  // ===== Dashboard =====
  async function renderDashboard(main) {
    const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: pubCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published');
    const { count: draftCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft');
    const { count: albumCount } = await supabase.from('albums').select('*', { count: 'exact', head: true });

    main.innerHTML = `
      <h2><i class="fa-solid fa-chart-line"></i> แดชบอร์ด</h2>
      <p style="color:var(--text-muted);margin-bottom:20px;">ยินดีต้อนรับ ${escapeHtml(currentUser.email)}</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px;">
        <div class="admin-card" style="text-align:center;">
          <h3>โพสต์ทั้งหมด</h3>
          <p style="font-size:32px;font-weight:700;color:var(--purple);">${postCount || 0}</p>
        </div>
        <div class="admin-card" style="text-align:center;">
          <h3>เผยแพร่แล้ว</h3>
          <p style="font-size:32px;font-weight:700;color:var(--green);">${pubCount || 0}</p>
        </div>
        <div class="admin-card" style="text-align:center;">
          <h3>ร่าง</h3>
          <p style="font-size:32px;font-weight:700;color:#856404;">${draftCount || 0}</p>
        </div>
        <div class="admin-card" style="text-align:center;">
          <h3>อัลบั้ม</h3>
          <p style="font-size:32px;font-weight:700;color:var(--purple);">${albumCount || 0}</p>
        </div>
      </div>
      <div class="admin-card">
        <h3>โพสต์ล่าสุด</h3>
        <div id="recent-posts">กำลังโหลด...</div>
      </div>
    `;

    const { data: recent } = await supabase.from('posts').select('title,category,status,post_date').order('created_at', { ascending: false }).limit(5);
    const el = document.getElementById('recent-posts');
    if (recent && recent.length > 0) {
      el.innerHTML = recent.map((p) => `
        <div style="padding:8px 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>${escapeHtml(p.title)}</strong>
            <span style="font-size:12px;color:var(--text-muted);margin-left:8px;">${escapeHtml(p.category)}</span>
          </div>
          <span class="status-badge status-${p.status}">${p.status === 'published' ? 'เผยแพร่' : 'ร่าง'}</span>
        </div>
      `).join('');
    } else {
      el.innerHTML = '<p style="color:var(--text-muted);">ยังไม่มีโพสต์</p>';
    }
  }

  // ===== News List =====
  async function renderNewsList(main) {
    const { data: posts, error } = await supabase.from('posts').select('*').order('post_date', { ascending: false });
    if (error) { main.innerHTML = `<p>เกิดข้อผิดพลาด: ${error.message}</p>`; return; }

    const rows = (posts || []).map((p) => `
      <tr>
        <td>${escapeHtml(p.title)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${formatDateThai(p.post_date)}${p.post_date_end ? ' – ' + formatDateThai(p.post_date_end) : ''}</td>
        <td><span class="status-badge status-${p.status}">${p.status === 'published' ? 'เผยแพร่' : 'ร่าง'}</span></td>
        <td>${p.is_pinned ? '📌' : ''}</td>
        <td>
          <button class="btn-sm" onclick="window._editPost('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-sm" onclick="window._togglePost('${p.id}','${p.status}')">${p.status === 'published' ? 'ซ่อน' : 'เผยแพร่'}</button>
          <button class="btn-sm" onclick="window._deletePost('${p.id}')" style="color:#e74c3c;"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    main.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h2><i class="fa-solid fa-newspaper"></i> จัดการข่าว</h2>
        <button class="btn-admin btn-admin-primary" onclick="window._newPost()"><i class="fa-solid fa-plus"></i> สร้างโพสต์ใหม่</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>หัวข้อ</th><th>หมวด</th><th>วันที่</th><th>สถานะ</th><th>ปักหมุด</th><th>จัดการ</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:24px;">ยังไม่มีโพสต์</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  // Global handlers for news
  window._newPost = () => renderPostForm(null);
  window._editPost = async (id) => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    if (data) renderPostForm(data);
  };
  window._togglePost = async (id, status) => {
    const newStatus = status === 'published' ? 'draft' : 'published';
    await supabase.from('posts').update({ status: newStatus }).eq('id', id);
    showToast('อัปเดตสถานะแล้ว', 'success');
    loadSection('news');
  };
  window._deletePost = async (id) => {
    if (!confirm('ต้องการลบโพสต์นี้หรือไม่?')) return;
    await supabase.from('posts').delete().eq('id', id);
    showToast('ลบโพสต์แล้ว', 'success');
    loadSection('news');
  };

  function renderPostForm(post) {
    const isEdit = !!post;
    const p = post || {};
    const main = document.getElementById('admin-main');

    main.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2>${isEdit ? 'แก้ไขโพสต์' : 'สร้างโพสต์ใหม่'}</h2>
        <button class="btn-admin btn-admin-secondary" onclick="window._backToNews()"><i class="fa-solid fa-arrow-left"></i> กลับ</button>
      </div>
      <div class="admin-card">
        <form id="post-form">
          <div class="admin-form-group">
            <label>หัวข้อ</label>
            <input type="text" id="f-title" value="${escapeAttr(p.title || '')}" required>
          </div>
          <div class="admin-form-group">
            <label>หมวดหมู่</label>
            <select id="f-category">
              <option value="ข่าวประชาสัมพันธ์" ${p.category === 'ข่าวประชาสัมพันธ์' ? 'selected' : ''}>ข่าวประชาสัมพันธ์</option>
              <option value="ประชุม" ${p.category === 'ประชุม' ? 'selected' : ''}>ประชุม</option>
              <option value="กิจกรรม" ${p.category === 'กิจกรรม' ? 'selected' : ''}>กิจกรรม</option>
              <option value="โครงการ" ${p.category === 'โครงการ' ? 'selected' : ''}>โครงการ</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="admin-form-group">
              <label>วันที่ของข่าว</label>
              <input type="date" id="f-post-date" value="${p.post_date ? p.post_date.split('T')[0] : new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="admin-form-group">
              <label>วันสุดท้าย (ถ้ามี)</label>
              <input type="date" id="f-post-date-end" value="${p.post_date_end ? p.post_date_end.split('T')[0] : ''}">
            </div>
          </div>
          <div class="admin-form-group">
            <label>Slug (URL id)</label>
            <input type="text" id="f-slug" value="${escapeAttr(p.slug || '')}" placeholder="เช่น news-example">
          </div>
          <div class="admin-form-group">
            <label>สรุปสั้น</label>
            <textarea id="f-summary" rows="2">${escapeHtml(p.summary || '')}</textarea>
          </div>
          <div class="admin-form-group">
            <label>เนื้อหา (HTML)</label>
            <textarea id="f-content" rows="10">${escapeHtml(p.content || '')}</textarea>
          </div>
          <div class="admin-form-group">
            <label>รูปปก (URL)</label>
            <input type="text" id="f-cover-image" value="${escapeAttr(p.cover_image || '')}" placeholder="https://...">
          </div>
          <div class="admin-form-group">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="checkbox" id="f-is-pinned" ${p.is_pinned ? 'checked' : ''}> ปักหมุดข่าวนี้
            </label>
          </div>
          <div class="admin-form-group">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="checkbox" id="f-schedule" ${p.publish_at ? 'checked' : ''}> ตั้งเวลาเผยแพร่
            </label>
            <input type="datetime-local" id="f-publish-at" value="${p.publish_at ? p.publish_at.slice(0, 16) : ''}" style="margin-top:8px;">
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;">
            <button type="submit" name="action" value="draft" class="btn-admin btn-admin-secondary">บันทึกร่าง</button>
            <button type="submit" name="action" value="published" class="btn-admin btn-admin-primary">เผยแพร่</button>
          </div>
        </form>
      </div>
    `;

    window._backToNews = () => loadSection('news');

    document.getElementById('post-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = e.submitter?.value || 'draft';
      const slugInput = document.getElementById('f-slug').value.trim();
      const slug = slugInput || generateSlug(document.getElementById('f-title').value);

      const postData = {
        slug: slug,
        title: document.getElementById('f-title').value.trim(),
        summary: document.getElementById('f-summary').value.trim(),
        content: document.getElementById('f-content').value.trim(),
        category: document.getElementById('f-category').value,
        cover_image: document.getElementById('f-cover-image').value || null,
        post_date: document.getElementById('f-post-date').value,
        post_date_end: document.getElementById('f-post-date-end').value || null,
        is_pinned: document.getElementById('f-is-pinned').checked,
        status: action,
        publish_at: document.getElementById('f-schedule').checked ? document.getElementById('f-publish-at').value || null : null,
      };

      let result;
      if (isEdit) {
        result = await supabase.from('posts').update(postData).eq('id', post.id);
      } else {
        result = await supabase.from('posts').insert(postData);
      }

      if (result.error) {
        showToast('เกิดข้อผิดพลาด: ' + result.error.message, 'error');
      } else {
        showToast(isEdit ? 'แก้ไขโพสต์แล้ว' : 'สร้างโพสต์แล้ว', 'success');
        loadSection('news');
      }
    });
  }

  // ===== Page Content Editor =====
  async function renderPageContent(main) {
    // Fetch existing page content
    const { data: sections } = await supabase.from('page_content').select('*').order('sort_order');

    const defaultSections = [
      { key: 'hero_title', label: 'หัวข้อ Hero', value: 'สมาพันธ์ MSME ไทย', type: 'text' },
      { key: 'hero_subtitle', label: 'คำอธิบาย Hero', value: 'สมาพันธ์ MSME ไทย จังหวัดนครสวรรค์ มุ่งพัฒนาและส่งเสริมศักยภาพผู้ประกอบการ', type: 'textarea' },
      { key: 'hero_image', label: 'รูป Hero', value: 'assets/2.jpeg', type: 'image' },
      { key: 'vision', label: 'วิสัยทัศน์', value: 'เป็นองค์กรกลางที่ ส่งเสริมและพัฒนา ผู้ประกอบการ MSME ในจังหวัดนครสวรรค์', type: 'textarea' },
      { key: 'contact_phone', label: 'เบอร์โทร', value: '061-635-8915', type: 'text' },
      { key: 'contact_email', label: 'อีเมล', value: 'info@msme-nakhonsawan.or.th', type: 'text' },
      { key: 'contact_address', label: 'ที่อยู่', value: '11/1 หมู่ 7 ตำบลย่านมัทรีค อำเภอพยุหะคีรี จังหวัดนครสวรรค์ 60130', type: 'textarea' },
    ];

    const sectionMap = {};
    (sections || []).forEach((s) => { sectionMap[s.key] = s.value; });

    const editorHtml = defaultSections.map((s) => {
      const val = sectionMap[s.key] || s.value;
      if (s.type === 'textarea') {
        return `<div class="section-editor">
          <h4>${s.label}</h4>
          <textarea id="pc-${s.key}" rows="3" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;font-family:var(--font);">${escapeHtml(val)}</textarea>
        </div>`;
      } else if (s.type === 'image') {
        return `<div class="section-editor">
          <h4>${s.label}</h4>
          <input type="text" id="pc-${s.key}" value="${escapeAttr(val)}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;font-family:var(--font);">
          ${val ? `<img src="${escapeAttr(val)}" style="max-height:100px;margin-top:8px;border-radius:6px;" alt="preview">` : ''}
        </div>`;
      } else {
        return `<div class="section-editor">
          <h4>${s.label}</h4>
          <input type="text" id="pc-${s.key}" value="${escapeAttr(val)}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;font-family:var(--font);">
        </div>`;
      }
    }).join('');

    main.innerHTML = `
      <h2><i class="fa-solid fa-pen-to-square"></i> แก้ไขหน้าเว็บ</h2>
      <p style="color:var(--text-muted);margin-bottom:16px;">แก้ไขข้อความและรูปภาพบนหน้าแรก</p>
      <div class="admin-card">
        ${editorHtml}
        <button class="btn-admin btn-admin-primary" id="save-page-content" style="margin-top:12px;"><i class="fa-solid fa-save"></i> บันทึก</button>
      </div>
    `;

    document.getElementById('save-page-content').addEventListener('click', async () => {
      for (const s of defaultSections) {
        const el = document.getElementById('pc-' + s.key);
        if (!el) continue;
        const value = el.value;
        // Upsert
        const { data: existing } = await supabase.from('page_content').select('id').eq('key', s.key).single();
        if (existing) {
          await supabase.from('page_content').update({ value: value, updated_at: new Date().toISOString() }).eq('key', s.key);
        } else {
          await supabase.from('page_content').insert({ key: s.key, label: s.label, value: value, type: s.type, sort_order: defaultSections.indexOf(s) });
        }
      }
      showToast('บันทึกหน้าเว็บแล้ว', 'success');
    });
  }

  // ===== Albums =====
  async function renderAlbums(main) {
    const { data: albums } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
    const rows = (albums || []).map((a) => `
      <tr>
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.description || '')}</td>
        <td>${a.cover_image ? '<img src="' + a.cover_image + '" style="height:40px;border-radius:4px;">' : '-'}</td>
        <td>
          <button class="btn-sm" onclick="window._editAlbum('${a.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-sm" onclick="window._deleteAlbum('${a.id}')" style="color:#e74c3c;"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    main.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h2><i class="fa-solid fa-images"></i> จัดการอัลบั้ม</h2>
        <button class="btn-admin btn-admin-primary" onclick="window._newAlbum()"><i class="fa-solid fa-plus"></i> สร้างอัลบั้มใหม่</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>ชื่ออัลบั้ม</th><th>คำอธิบาย</th><th>รูปปก</th><th>จัดการ</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:24px;">ยังไม่มีอัลบั้ม</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  window._newAlbum = async () => {
    const title = prompt('ชื่ออัลบั้ม:');
    if (!title) return;
    const desc = prompt('คำอธิบาย (ไม่บังคับ):') || '';
    const cover = prompt('URL รูปปก (ไม่บังคับ):') || null;
    await supabase.from('albums').insert({ title, description: desc, cover_image: cover });
    showToast('สร้างอัลบั้มแล้ว', 'success');
    loadSection('albums');
  };

  window._editAlbum = async (id) => {
    const { data } = await supabase.from('albums').select('*').eq('id', id).single();
    if (!data) return;
    const title = prompt('ชื่ออัลบั้ม:', data.title);
    if (title === null) return;
    const desc = prompt('คำอธิบาย:', data.description || '');
    if (desc === null) return;
    const cover = prompt('URL รูปปก:', data.cover_image || '');
    if (cover === null) return;
    await supabase.from('albums').update({ title, description: desc, cover_image: cover || null }).eq('id', id);
    showToast('แก้ไขอัลบั้มแล้ว', 'success');
    loadSection('albums');
  };

  window._deleteAlbum = async (id) => {
    if (!confirm('ต้องการลบอัลบั้มนี้หรือไม่? (รูปในอัลบั้มจะถูกลบทั้งหมด)')) return;
    await supabase.from('albums').delete().eq('id', id);
    showToast('ลบอัลบั้มแล้ว', 'success');
    loadSection('albums');
  };

  // ===== Settings =====
  async function renderSettings(main) {
    main.innerHTML = `
      <h2><i class="fa-solid fa-gear"></i> ตั้งค่า</h2>
      <div class="admin-card">
        <h3>ข้อมูลบัญชี</h3>
        <p><strong>อีเมล:</strong> ${escapeHtml(currentUser.email)}</p>
        <p><strong>User ID:</strong> ${escapeHtml(currentUser.id)}</p>
      </div>
      <div class="admin-card">
        <h3>จัดการแอดมิน</h3>
        <p style="color:var(--text-muted);margin-bottom:12px;">เพิ่มอีเมลแอดมินใหม่ (ต้องเพิ่มใน Supabase หรือใช้ SQL)</p>
        <div id="admin-list">กำลังโหลด...</div>
      </div>
    `;

    const { data: admins } = await supabase.from('admins').select('*');
    const el = document.getElementById('admin-list');
    if (admins && admins.length > 0) {
      el.innerHTML = admins.map((a) => `
        <div style="padding:8px 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;">
          <span>${escapeHtml(a.email)} ${a.name ? '(' + escapeHtml(a.name) + ')' : ''}</span>
        </div>
      `).join('');
    } else {
      el.innerHTML = '<p style="color:var(--text-muted);">ไม่พบแอดมิน</p>';
    }
  }

  // ===== Helpers =====
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function formatDateThai(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }
  function generateSlug(title) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 7);
    return `news-${date}-${rand}`;
  }

    // ===== Init =====
  async function init() {
    try {
      await loadSupabase();

      currentUser = { email: 'admin@local', id: 'local-admin' };
      renderLayout();
    } catch (err) {
      console.error('Init error:', err);
      content.innerHTML = '<div class="detail-body"><p class="detail-loading">เกิดข้อผิดพลาดในการโหลด</p></div>';
    }
  }

  init();
})();