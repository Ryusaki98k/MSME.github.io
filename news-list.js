(function () {
  const list = document.getElementById('news-list');
  const toggle = document.getElementById('news-view-all');
  if (!list || !toggle) return;

  const label = toggle.querySelector('.view-all-label');
  const icon = toggle.querySelector('i');

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const expanded = list.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    if (label) {
      label.textContent = expanded ? 'แสดงน้อยลง' : 'ดูทั้งหมด';
    }
    if (icon) {
      icon.classList.toggle('fa-arrow-right', !expanded);
      icon.classList.toggle('fa-arrow-up', expanded);
    }
  });
})();
