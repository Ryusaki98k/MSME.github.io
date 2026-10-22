(function () {
  let currentIndex = 0;
  let gallery = [];

  const modal = document.createElement('div');
  modal.id = 'image-lightbox';
  modal.className = 'image-lightbox';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="image-lightbox-backdrop" data-close></div>
    <button type="button" class="image-lightbox-close" aria-label="ปิด" data-close>&times;</button>
    <button type="button" class="image-lightbox-nav image-lightbox-prev" aria-label="ภาพก่อนหน้า">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <figure class="image-lightbox-figure">
      <img class="image-lightbox-img" src="" alt="">
    </figure>
    <button type="button" class="image-lightbox-nav image-lightbox-next" aria-label="ภาพถัดไป">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
    <p class="image-lightbox-caption" aria-live="polite"></p>
  `;
  document.body.appendChild(modal);

  const imgEl = modal.querySelector('.image-lightbox-img');
  const captionEl = modal.querySelector('.image-lightbox-caption');
  const prevBtn = modal.querySelector('.image-lightbox-prev');
  const nextBtn = modal.querySelector('.image-lightbox-next');

  function collectGallery(clickedImg) {
    const root =
      clickedImg.closest('.detail-hero-img') ||
      clickedImg.closest('[data-carousel]') ||
      clickedImg.closest('.event-carousel') ||
      clickedImg.closest('.gallery-grid');

    if (!root) return [{ src: clickedImg.src, alt: clickedImg.alt }];

    return [...root.querySelectorAll('img')].map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
    }));
  }

  function showImage(index) {
    if (!gallery.length) return;
    currentIndex = (index + gallery.length) % gallery.length;
    const item = gallery[currentIndex];
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    captionEl.textContent =
      gallery.length > 1
        ? `${item.alt || 'ภาพ'} (${currentIndex + 1}/${gallery.length})`
        : item.alt || '';
    prevBtn.hidden = gallery.length < 2;
    nextBtn.hidden = gallery.length < 2;
  }

  function openLightbox(clickedImg) {
    gallery = collectGallery(clickedImg);
    const startIndex = gallery.findIndex((item) => item.src === (clickedImg.currentSrc || clickedImg.src));
    showImage(startIndex >= 0 ? startIndex : 0);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    imgEl.removeAttribute('src');
    gallery = [];
  }

  document.addEventListener('click', (e) => {
    const galleryBtn = e.target.closest('.gallery-item');
    if (galleryBtn) {
      const img = galleryBtn.querySelector('img');
      if (img) {
        e.preventDefault();
        openLightbox(img);
      }
      return;
    }

    const img = e.target.closest(
      '.detail-hero-img img, .event-carousel-slide img'
    );
    if (!img) return;
    e.preventDefault();
    openLightbox(img);
  });

  modal.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
})();
