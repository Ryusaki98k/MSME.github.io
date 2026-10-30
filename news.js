(function () {
  'use strict';

  // DOM elements
  const grid = document.getElementById('news-grid');
  const countEl = document.getElementById('news-count');
  const filterEl = document.getElementById('news-filter');
  const paginationEl = document.getElementById('news-pagination');

  // State
  let currentPage = 1;
  const PAGE_SIZE = 12;
  let currentCategory = '';
  let totalCount = 0;

  // Static fallback data (works without Supabase)
  const STATIC_POSTS = [
    {
      id: 'news-mango-knowledge',
      slug: 'news-mango-knowledge',
      title: 'พัฒนาความรู้ด้านการปลูกและแปรรูปมะม่วงหิมพานต์',
      category: 'กิจกรรม',
      cover_image: 'img/nut processing/msmeimg (76).jpg',
      post_date: '2026-05-29',
      post_date_end: '2026-05-30',
      is_pinned: true,
      status: 'published',
      publish_at: null
    },
    {
      id: 'news-digital-seminar',
      slug: 'news-digital-seminar',
      title: 'การประชุมคณะกรรมการและคณะทำงานพัฒนาระบบบริการ ด้านการแพทย์แผนไทย สมุนไพรและการแพทย์ทางเลือก',
      category: 'ประชุม',
      cover_image: 'img/Thai medicine and herbal/msmeimg (61).jpg',
      post_date: '2026-05-20',
      post_date_end: null,
      is_pinned: false,
      status: 'published',
      publish_at: null
    },
    {
      id: 'news-member-2569',
      slug: 'news-member-2569',
      title: 'เปิดรับสมัครสมาชิกใหม่ ประจำปี 2569',
      category: 'ข่าวประชาสัมพันธ์',
      cover_image: 'assets/2.jpeg',
      post_date: '2026-05-15',
      post_date_end: null,
      is_pinned: false,
      status: 'published',
      publish_at: null
    },
    {
      id: 'news-mou',
      slug: 'news-mou',
      title: 'MOU ร่วมมือกับหน่วยงานภาครัฐและเอกชน',
      category: 'กิจกรรม',
      cover_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&h=450&fit=crop',
      post_date: '2026-05-10',
      post_date_end: null,
      is_pinned: false,
      status: 'published',
      publish_at: null
    },
    {
      id: 'news-new-entrepreneur',
      slug: 'news-new-entrepreneur',
      title: 'การพัฒนาพื้นที่แถบป่ากันชนผืนป่าตะวันตก',
      category: 'โครงการ',
      cover_image: 'img/buffer zone of the Western Forest/msmeimg (3)(1).jpg',
      post_date: '2026-05-05',
      post_date_end: null,
      is_pinned: false,
      status: 'published',
      publish_at: null
    },
    {
      id: 'promo-loan',
      slug: 'promo-loan',
      title: 'สินเชื่อ & ทุนธุรกิจ',
      category: 'บริการสมาชิก',
      cover_image: 'assets/2.jpeg',
      post_date: '2026-01-01',
      post_date_end: null,
      is_pinned: false,
      status: 'published',
      publish_at: null
    },
    {
      id: 'promo-training',
      slug: 'promo-training',
      title: 'อบรม & พัฒนาทักษะ',
      category: 'บริการสมาชิก',
      cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=450&fit=crop',
      post_date: '2026-01-01',
      post_date_end: null,
      is_pinned: false,
      status: 'published',
      publish_at: null
    }
  ];

  // Format date in Thai Buddhist calendar
  function formatDateThai(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }

  // Format date range
  function formatDateRange(postDate, postDateEnd) {
    const start = formatDateThai(postDate);
    if (!postDateEnd) return start;
    const end = formatDateThai(postDateEnd);
    if (start === end) return start;
    // Show range like "29–30 พ.ค. 2569"
    const startDate = new Date(postDate);
    const endDate = new Date(postDateEnd);
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth();
    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth();
    const year = startDate.getFullYear() + 543;
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    if (startMonth === endMonth) {
      return `${startDay}–${endDay} ${months[startMonth]} ${year}`;
    }
    return `${startDay} ${months[startMonth]} – ${endDay} ${months[endMonth]} ${year}`;
  }

  // Create a news card element
  function createNewsCard(post) {
    const card = document.createElement('a');
    card.href = `detail.html?id=${encodeURIComponent(post.slug)}`;
    card.className = 'news-item';

    const thumb = document.createElement('div');
    thumb.className = 'news-thumb';
    if (post.cover_image) {
      thumb.className += ' news-thumb-img';
      const img = document.createElement('img');
      img.src = post.cover_image;
      img.alt = post.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      // Default icon based on category
      const iconMap = {
        'ข่าวประชาสัมพันธ์': 'fa-newspaper',
        'ประชุม': 'fa-users',
        'กิจกรรม': 'fa-leaf',
        'โครงการ': 'fa-seedling',
      };
      const iconClass = iconMap[post.category] || 'fa-newspaper';
      thumb.className += ' purple';
      const icon = document.createElement('i');
      icon.className = `fa-solid ${iconClass}`;
      thumb.appendChild(icon);
    }

    const body = document.createElement('div');
    body.className = 'news-body';

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = post.category;

    const title = document.createElement('h3');
    title.textContent = post.title;

    const time = document.createElement('time');
    time.textContent = formatDateRange(post.post_date, post.post_date_end);

    body.appendChild(tag);
    body.appendChild(title);
    body.appendChild(time);

    card.appendChild(thumb);
    card.appendChild(body);

    return card;
  }

  // Load posts from Supabase, with static fallback
  async function loadPosts() {
    if (!grid) return;

    grid.innerHTML = '<p class="detail-loading">กำลังโหลดข่าวสาร...</p>';
    if (countEl) countEl.textContent = 'กำลังโหลด...';

    let posts = [];
    let total = 0;
    let useStatic = false;

    try {
      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .lte('publish_at', new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('post_date', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      if (currentCategory) {
        query = query.eq('category', currentCategory);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      posts = data || [];
      total = count || 0;
      if (!posts || posts.length === 0) useStatic = true;
    } catch (err) {
      console.error('Error loading posts from Supabase, using static fallback:', err);
      useStatic = true;
    }

    if (useStatic || (!posts || posts.length === 0)) {
      let filtered = STATIC_POSTS.filter((p) => p.status === 'published');
      if (currentCategory) {
        filtered = filtered.filter((p) => p.category === currentCategory);
      }
      filtered.sort((a, b) => {
        if (b.is_pinned === a.is_pinned) {
          return new Date(b.post_date) - new Date(a.post_date);
        }
        return b.is_pinned ? 1 : -1;
      });
      total = filtered.length;
      const start = (currentPage - 1) * PAGE_SIZE;
      posts = filtered.slice(start, start + PAGE_SIZE);
    }

    if (countEl) countEl.textContent = `ทั้งหมด ${total} รายการ`;

    grid.innerHTML = '';

    if (!posts || posts.length === 0) {
      grid.innerHTML = '<p class="detail-loading">ไม่พบข่าวสาร</p>';
      renderPagination(0);
      return;
    }

    posts.forEach((post) => {
      grid.appendChild(createNewsCard(post));
    });

    renderPagination(total);
  }

  // Render pagination
  function renderPagination(total) {
    if (!paginationEl) return;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    paginationEl.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    if (currentPage > 1) {
      const prev = document.createElement('button');
      prev.className = 'news-page-btn';
      prev.textContent = 'ก่อนหน้า';
      prev.addEventListener('click', () => {
        currentPage--;
        loadPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      paginationEl.appendChild(prev);
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'news-page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = i;
      btn.addEventListener('click', () => {
        currentPage = i;
        loadPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      paginationEl.appendChild(btn);
    }

    // Next button
    if (currentPage < totalPages) {
      const next = document.createElement('button');
      next.className = 'news-page-btn';
      next.textContent = 'ถัดไป';
      next.addEventListener('click', () => {
        currentPage++;
        loadPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      paginationEl.appendChild(next);
    }
  }

  // Filter click handler
  if (filterEl) {
    filterEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.news-filter-btn');
      if (!btn) return;
      filterEl.querySelectorAll('.news-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || '';
      currentPage = 1;
      loadPosts();
    });
  }

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabaseReady && window.supabase) { resolve(); return; }
      window.addEventListener('supabase-ready', () => resolve(), { once: true });
      setTimeout(() => { if (window.supabase) resolve(); else reject(); }, 5000);
    });
  }

  // Init
  async function init() {
    try {
      await loadPosts();
    } catch (err) {
      console.error('Initialization error:', err);
      if (grid) grid.innerHTML = '<p class="detail-loading">ไม่สามารถโหลดข่าวสารได้ กรุณาลองใหม่</p>';
    }
  }

  init();
})();