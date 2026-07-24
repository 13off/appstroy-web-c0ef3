(() => {
  const revealItems = document.querySelectorAll('.reveal');
  const vacancySelect = document.querySelector('#vacancy-select');
  const objectInput = document.querySelector('#object-input');
  const applicationSection = document.querySelector('#application');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('.vacancy-card').forEach((card) => {
    const button = card.querySelector('.card-action');
    button?.addEventListener('click', () => {
      const vacancy = card.dataset.vacancy || '';
      const object = card.dataset.object || '';

      if (vacancySelect) vacancySelect.value = vacancy;
      if (objectInput) objectInput.value = object;

      applicationSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => document.querySelector('[name="full_name"]')?.focus({ preventScroll: true }), 650);
    });
  });

  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item[open]').forEach((other) => {
        if (other !== item) other.removeAttribute('open');
      });
    });
  });

  const year = document.querySelector('#current-year');
  if (year) year.textContent = new Date().getFullYear();
})();
