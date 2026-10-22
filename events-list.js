(function () {
  const section = document.getElementById('events-section');
  const defaultView = section?.querySelector('.event-default-view');
  const folderView = document.getElementById('event-folder-cards');
  const toggle = document.getElementById('events-view-all');
  if (!section || !defaultView || !folderView || !toggle) return;

  const label = toggle.querySelector('.view-all-label');
  const icon = toggle.querySelector('i');

  function setExpanded(expanded) {
    section.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    defaultView.toggleAttribute('hidden', expanded);
    folderView.toggleAttribute('hidden', !expanded);
    if (label) {
      label.textContent = expanded ? 'แสดงน้อยลง' : 'ดูทั้งหมด';
    }
    if (icon) {
      icon.classList.toggle('fa-arrow-right', !expanded);
      icon.classList.toggle('fa-arrow-up', expanded);
    }
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    setExpanded(!section.classList.contains('is-expanded'));
  });

  if (window.location.hash === '#events-section') {
    setExpanded(true);
    section.scrollIntoView({ behavior: 'smooth' });
  }
})();
