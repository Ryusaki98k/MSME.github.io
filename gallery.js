const GALLERY_ALBUMS = {
  'western-forest': {
    title: 'การพัฒนาพื้นที่แถบป่ากันชนผืนป่าตะวันตก',
    folder: 'img/buffer zone of the Western Forest',
    files: [
      'msmeimg (1)(1).jpg', 'msmeimg (1).jpg', 'msmeimg (10)(1).jpg', 'msmeimg (10).jpg',
      'msmeimg (11)(1).jpg', 'msmeimg (11).jpg', 'msmeimg (12)(1).jpg', 'msmeimg (12).jpg',
      'msmeimg (13)(1).jpg', 'msmeimg (13).jpg', 'msmeimg (14)(1).jpg', 'msmeimg (14).jpg',
      'msmeimg (2)(1).jpg', 'msmeimg (2).jpg', 'msmeimg (20).jpg', 'msmeimg (21).jpg',
      'msmeimg (22).jpg', 'msmeimg (3)(1).jpg', 'msmeimg (3).jpg', 'msmeimg (4)(1).jpg',
      'msmeimg (4).jpg', 'msmeimg (40).jpg', 'msmeimg (41).jpg', 'msmeimg (42).jpg',
      'msmeimg (43)(1).jpg', 'msmeimg (43).jpg', 'msmeimg (44)(1).jpg', 'msmeimg (44).jpg',
      'msmeimg (45)(1).jpg', 'msmeimg (45).jpg', 'msmeimg (46)(1).jpg', 'msmeimg (46).jpg',
      'msmeimg (47)(1).jpg', 'msmeimg (47).jpg', 'msmeimg (48)(1).jpg', 'msmeimg (48).jpg',
      'msmeimg (49)(1).jpg', 'msmeimg (49).jpg', 'msmeimg (5)(1).jpg', 'msmeimg (5).jpg',
      'msmeimg (50)(1).jpg', 'msmeimg (50).jpg', 'msmeimg (51)(1).jpg', 'msmeimg (51).jpg',
      'msmeimg (52)(1).jpg', 'msmeimg (52).jpg', 'msmeimg (53)(1).jpg', 'msmeimg (53).jpg',
      'msmeimg (54)(1).jpg', 'msmeimg (54).jpg', 'msmeimg (55).jpg', 'msmeimg (56).jpg',
      'msmeimg (57).jpg', 'msmeimg (6)(1).jpg', 'msmeimg (6).jpg', 'msmeimg (7)(1).jpg',
      'msmeimg (7).jpg', 'msmeimg (8)(1).jpg', 'msmeimg (8).jpg', 'msmeimg (9)(1).jpg',
      'msmeimg (9).jpg',
    ],
  },
  'nut-processing': {
    title: 'พัฒนาความรู้ด้านการปลูกและแปรรูปมะม่วงหิมพานต์',
    folder: 'img/nut processing',
    files: [
      'msmeimg (68).jpg', 'msmeimg (69).jpg', 'msmeimg (70).jpg', 'msmeimg (71).jpg',
      'msmeimg (72).jpg', 'msmeimg (73).jpg', 'msmeimg (74).jpg', 'msmeimg (75).jpg',
      'msmeimg (76).jpg', 'msmeimg (77).jpg', 'msmeimg (78).jpg',
    ],
  },
  'thai-medicine': {
    title: 'การแพทย์แผนไทย สมุนไพรและการแพทย์ทางเลือก',
    folder: 'img/Thai medicine and herbal',
    files: [
      'msmeimg (58).jpg', 'msmeimg (59).jpg', 'msmeimg (60).jpg', 'msmeimg (61).jpg',
      'msmeimg (62).jpg', 'msmeimg (63).jpg', 'msmeimg (64).jpg', 'msmeimg (65).jpg',
      'msmeimg (66).jpg', 'msmeimg (67).jpg',
    ],
  },
  'sme-events': {
    title: 'กิจกรรมและอีเวนต์สมาพันธ์ MSME',
    folder: 'img/Seminar for the Northern SME Federation Committee',
    files: [
      'msmeimg (18)(1).jpg', 'msmeimg (18).jpg', 'msmeimg (19)(1).jpg', 'msmeimg (19).jpg',
      'msmeimg (23).jpg', 'msmeimg (24).jpg', 'msmeimg (25).jpg', 'msmeimg (26)(1).jpg',
      'msmeimg (26).jpg', 'msmeimg (27)(1).jpg', 'msmeimg (27).jpg', 'msmeimg (28)(1).jpg',
      'msmeimg (28).jpg', 'msmeimg (29)(1).jpg', 'msmeimg (29).jpg', 'msmeimg (30)(1).jpg',
      'msmeimg (30).jpg', 'msmeimg (31)(1).jpg', 'msmeimg (31).jpg', 'msmeimg (32)(1).jpg',
      'msmeimg (32).jpg', 'msmeimg (33)(1).jpg', 'msmeimg (33).jpg', 'msmeimg (34)(1).jpg',
      'msmeimg (34).jpg', 'msmeimg (35)(1).jpg', 'msmeimg (35).jpg', 'msmeimg (36)(1).jpg',
      'msmeimg (36).jpg', 'msmeimg (37)(1).jpg', 'msmeimg (37).jpg', 'msmeimg (38)(1).jpg',
      'msmeimg (39).jpg', 'msmeimg (40)(1).jpg',
    ],
  },
};

function renderGallery() {
  const container = document.getElementById('gallery-content');
  const id = new URLSearchParams(window.location.search).get('id');
  const album = GALLERY_ALBUMS[id];

  if (!album) {
    document.title = 'ไม่พบอัลบั้ม — สมาพันธ์ MSME ไทย';
    container.innerHTML = `
      <div class="detail-not-found">
        <h1>ไม่พบอัลบั้มรูปภาพ</h1>
        <p>ลิงก์อาจไม่ถูกต้องหรือถูกลบแล้ว</p>
        <a href="index.html" class="btn-detail">กลับหน้าแรก</a>
      </div>
    `;
    return;
  }

  document.title = `${album.title} — สมาพันธ์ MSME ไทย`;

  const imagesHtml = album.files
    .map((file, i) => {
      const src = `${album.folder}/${file}`;
      const alt = `${album.title} — ภาพที่ ${i + 1}`;
      return `
        <button type="button" class="gallery-item">
          <img src="${src}" alt="${alt}" loading="lazy">
        </button>`;
    })
    .join('');

  container.innerHTML = `
    <header class="detail-header">
      <span class="tag">อัลบั้มรูปภาพ</span>
      <h1>${album.title}</h1>
      <p class="gallery-count">ทั้งหมด ${album.files.length} ภาพ — คลิกเพื่อดูภาพเต็ม</p>
    </header>
    <div class="gallery-grid">${imagesHtml}</div>
    <div class="detail-actions">
      <a href="index.html#events-section" class="btn-detail btn-detail-outline"><i class="fa-solid fa-arrow-left"></i> กลับหน้าแรก</a>
    </div>
  `;
}

renderGallery();
