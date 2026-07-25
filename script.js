(() => {
  const urls = window.__SKBS_ASSETS__ || {};

  document.querySelectorAll('[data-asset]').forEach((element) => {
    const url = urls[element.dataset.asset];
    if (url && element instanceof HTMLImageElement) element.src = url;
  });

  document.querySelectorAll('[data-bg-asset]').forEach((element) => {
    const url = urls[element.dataset.bgAsset];
    if (url) element.style.backgroundImage = `url("${url}")`;
  });

  const vacancies = document.querySelectorAll('.vacancy');
  vacancies.forEach((vacancy) => {
    const trigger = vacancy.querySelector('.vacancy-trigger');
    const panel = vacancy.querySelector('.vacancy-panel');
    trigger?.addEventListener('click', () => {
      const opening = !vacancy.classList.contains('open');
      vacancies.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.vacancy-trigger')?.setAttribute('aria-expanded', 'false');
        const otherPanel = other.querySelector('.vacancy-panel');
        if (otherPanel) otherPanel.hidden = true;
      });
      if (opening) {
        vacancy.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        if (panel) panel.hidden = false;
      }
    });
  });

  const objectField = document.querySelector('#object-field');
  document.querySelectorAll('.vacancy-apply').forEach((link) => {
    link.addEventListener('click', () => {
      if (objectField) objectField.value = link.dataset.object || 'Мурманск — кафедральный собор';
    });
  });

  const dialog = document.querySelector('.lightbox');
  const dialogImage = dialog?.querySelector('img');
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (!dialog || !dialogImage) return;
      const image = item.querySelector('img');
      dialogImage.src = image?.src || '';
      dialogImage.alt = image?.alt || '';
      dialog.showModal();
    });
  });
  dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const form = document.querySelector('form[name="job-application"]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Сайт уже работает на GitHub Pages. Приём заявок подключим к Telegram или базе отдельным шагом.');
  });
})();
