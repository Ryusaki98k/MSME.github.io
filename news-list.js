(function () {
  'use strict';

  const list = document.getElementById('news-list');
  const toggle = document.getElementById('news-view-all');
  if (!list) return;

  const label = toggle ? toggle.querySelector('.view-all-label') : null;
  const icon = toggle ? toggle.querySelector('i') : null;

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

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabaseReady && window.supabase) { resolve(); return; }
      window.addEventListener('supabase-ready', () => resolve(), { once: true });
      setTimeout(() => { if (window.supabase) resolve(); else reject(); }, 5000);
    });
  }

  function formatDateRange(postDate, postDateEnd) {
    if (!postDate) return '';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d1 = new Date(postDate);
    const day1 = d1.getDate();
    const month1 = months[d1.getMonth()];
    const year1 = d1.getFullYear() + 543;
    if (!postDateEnd) return `${day1} ${month1} ${year1}`;
    const d2 = new Date(postDateEnd);
    const day2 = d2.getDate();
    const month2 = months[d2.getMonth()];
    if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
      return `${day1}–${day2} ${month1} ${year1}`;
    }
    return `${day1} ${month1} – ${day2} ${month2} ${year1}`;
  }

  async function loadNews() {
    let posts = [];
    let useStatic = false;

    try {
      await loadSupabase();
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .lte('publish_at', new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('post_date', { ascending: false })
        .limit(6);

      if (error) throw error;

      posts = data || [];
      if (!posts || posts.length === 0) useStatic = true;
    } catch (err) {
      console.error('Error loading news from Supabase, using static fallback:', err);
      useStatic = true;
    }

    if (useStatic || (!posts || posts.length === 0)) {
      posts = STATIC_POSTS.filter((p) => p.status === 'published')
        .sort((a, b) => {
          if (b.is_pinned === a.is_pinned) {
            return new Date(b.post_date) - new Date(a.post_date);
          }
          return b.is_pinned ? 1 : -1;
        })
        .slice(0, 6);
    }

    list.innerHTML = '';
    posts.forEach((post) => {
      const item = document.createElement('a');
      item.href = `detail.html?id=${encodeURIComponent(post.slug)}`;
      item.className = 'news-item';

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
        const iconMap = { 'ข่าวประชาสัมพันธ์': 'fa-newspaper', 'ประชุม': 'fa-users', 'กิจกรรม': 'fa-leaf', 'โครงการ': 'fa-seedling' };
        thumb.className += ' purple';
        const icon = document.createElement('i');
        icon.className = `fa-solid ${iconMap[post.category] || 'fa-newspaper'}`;
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
      item.appendChild(thumb);
      item.appendChild(body);
      list.appendChild(item);
    });
  }

  // Toggle expand/collapse
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = list.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      if (label) label.textContent = expanded ? 'แสดงน้อยลง' : 'ดูทั้งหมด';
      if (icon) {
        icon.classList.toggle('fa-arrow-right', !expanded);
        icon.classList.toggle('fa-arrow-up', expanded);
      }
    });
  }

  loadNews();
})();