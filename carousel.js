document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.event-carousel-track');
  const slides = carousel.querySelectorAll('.event-carousel-slide');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');

  if (!track || slides.length === 0) return;

  let current = 0;
  let autoplayTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `รูปที่ ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('button');

  function updatePosition() {
    const offset = current * carousel.clientWidth;
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    updatePosition();
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  prevBtn?.addEventListener('click', () => {
    prev();
    startAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    next();
    startAutoplay();
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) next();
    else prev();
    startAutoplay();
  }, { passive: true });

  window.addEventListener('resize', updatePosition);
  updatePosition();
  startAutoplay();
});
