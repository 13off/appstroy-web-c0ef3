(() => {
  const finalStyles = document.createElement('link');
  finalStyles.rel = 'stylesheet';
  finalStyles.href = 'final.css';
  document.head.appendChild(finalStyles);

  const assets = window.__SKBS_ASSETS__ || {};
  document.querySelectorAll('[data-asset]').forEach((element) => {
    const url = assets[element.dataset.asset];
    if (url && element instanceof HTMLImageElement) element.src = url;
  });
  document.querySelectorAll('[data-bg-asset]').forEach((element) => {
    const url = assets[element.dataset.bgAsset];
    if (url) element.style.backgroundImage = `url("${url}")`;
  });

  const vacancies = [...document.querySelectorAll('.vacancy')];
  vacancies.forEach((vacancy) => {
    const trigger = vacancy.querySelector('.vacancy-trigger');
    const panel = vacancy.querySelector('.vacancy-panel');
    trigger?.addEventListener('click', () => {
      const opening = !vacancy.classList.contains('open');
      vacancies.forEach((item) => {
        item.classList.remove('open');
        item.querySelector('.vacancy-trigger')?.setAttribute('aria-expanded', 'false');
        const itemPanel = item.querySelector('.vacancy-panel');
        if (itemPanel) itemPanel.hidden = true;
      });
      if (opening) {
        vacancy.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        if (panel) panel.hidden = false;
      }
    });
  });

  const dialog = document.querySelector('.lightbox');
  const dialogImage = dialog?.querySelector('img');
  const counter = dialog?.querySelector('.lightbox-count');
  document.querySelector('[data-gallery-index="0"]')?.addEventListener('click', () => {
    if (!dialog || !dialogImage || !assets.room) return;
    dialogImage.src = assets.room;
    dialogImage.alt = 'Комната в гостинице';
    if (counter) counter.textContent = 'Проживание';
    dialog.showModal();
  });
  dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  const toast = document.querySelector('.toast');
  const showToast = (text) => {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 4200);
  };

  document.querySelector('#application-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = [
      'Заявка с сайта СКБС',
      `Объект: ${document.querySelector('#object-field')?.value || 'Мурманск'}`,
      `ФИО: ${document.querySelector('#full-name')?.value || ''}`,
      `Телефон: ${document.querySelector('#phone')?.value || ''}`,
      `Город: ${document.querySelector('#city')?.value || ''}`,
      `Опыт: ${document.querySelector('#experience')?.value || ''}`,
      `Комментарий: ${document.querySelector('#comment')?.value || '—'}`
    ].join('\n');
    try {
      await navigator.clipboard.writeText(message);
      showToast('Анкета скопирована. Вставьте её сообщением в открывшемся боте.');
    } catch {
      showToast('Открою Telegram-бот. Сообщите ему данные из анкеты.');
    }
    window.setTimeout(() => window.open('https://t.me/skbs_work_bot?start=site', '_blank', 'noopener'), 350);
  });
})();
