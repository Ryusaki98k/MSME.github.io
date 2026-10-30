(function () {
  'use strict';

  const container = document.getElementById('gallery-content');

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabaseReady && window.supabase) { resolve(); return; }
      window.addEventListener('supabase-ready', () => resolve(), { once: true });
      setTimeout(() => { if (window.supabase) resolve(); else reject(); }, 5000);
    });
  }

  async function renderGallery() {
    if (!container) return;

    const id = new URLSearchParams(window.location.search).get('id');

    // If no id, show album list
    if (!id) {
      container.innerHTML = '<p class="detail-loading">กำลังโหลดอัลบั้ม...</p>';
      try {
        const { data: albums, error } = await supabase
          .from('albums')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!albums || albums.length === 0) {
          container.innerHTML = '<p class="detail-loading">ไม่พบอัลบั้ม</p>';
          return;
        }

        const cardsHtml = albums.map((album) => `
          <a href="gallery.html?id=${encodeURIComponent(album.id)}" class="sme-card event-folder-card">
            <div class="event-folder-thumb">
              ${album.cover_image ? `<img src="${album.cover_image}" alt="${album.title}" loading="lazy">` : ''}
            </div>
            <h3>${escapeHtml(album.title)}</h3>
            <p>${escapeHtml(album.description || '')}</p>
            <span class="btn-green">ดูรูปทั้งหมด</span>
          </a>
        `).join('');

        container.innerHTML = `
          <header class="detail-header">
            <span class="tag">อัลบั้มรูปภาพ</span>
            <h1>อัลบั้มรูปภาพ</h1>
          </header>
          <div class="detail-body">
            <div class="sme-cards" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">${cardsHtml}</div>
          </div>
        `;
      } catch (err) {
        console.error('Error loading albums:', err);
        container.innerHTML = '<p class="detail-loading">ไม่สามารถโหลดอัลบั้มได้</p>';
      }
      return;
    }

    // Show specific album
    container.innerHTML = '<p class="detail-loading">กำลังโหลดรูปภาพ...</p>';
    try {
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();

      if (albumError || !album) {
        container.innerHTML = `
          <div class="detail-not-found">
            <h1>ไม่พบอัลบั้มรูปภาพ</h1>
            <p>ลิงก์อาจไม่ถูกต้องหรือถูกลบแล้ว</p>
            <a href="gallery.html" class="btn-detail">กลับ</a>
          </div>
        `;
        return;
      }

      document.title = `${album.title} — สมาพันธ์ MSME ไทย`;

      const { data: images, error: imgError } = await supabase
        .from('album_images')
        .select('*')
        .eq('album_id', id)
        .order('sort_order', { ascending: true });

      if (imgError) throw imgError;

      const imagesHtml = (images || []).map((img, i) => `
        <button type="button" class="gallery-item">
          <img src="${img.image_url}" alt="${escapeHtml(img.caption || album.title + ' — ภาพที่ ' + (i + 1))}" loading="lazy">
        </button>
      `).join('');

      container.innerHTML = `
        <header class="detail-header">
          <span class="tag">อัลบั้มรูปภาพ</span>
          <h1>${escapeHtml(album.title)}</h1>
          <p class="gallery-count">ทั้งหมด ${(images || []).length} ภาพ — คลิกเพื่อดูภาพเต็ม</p>
        </header>
        <div class="gallery-grid">${imagesHtml}</div>
        <div class="detail-actions">
          <a href="gallery.html" class="btn-detail btn-detail-outline"><i class="fa-solid fa-arrow-left"></i> กลับอัลบั้มทั้งหมด</a>
        </div>
      `;
    } catch (err) {
      console.error('Error loading album:', err);
      container.innerHTML = '<p class="detail-loading">ไม่สามารถโหลดอัลบั้มได้</p>';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function init() {
    try {
      await loadSupabase();
      await renderGallery();
    } catch (err) {
      console.error('Init error:', err);
      if (container) container.innerHTML = '<p class="detail-loading">ไม่สามารถโหลดได้</p>';
    }
  }

  init();
})();