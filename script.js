(() => {
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
  document.querySelectorAll('.gallery-item img').forEach((image) => {
    image.closest('button')?.addEventListener('click', () => {
      if (!dialog || !dialogImage) return;
      dialogImage.src = image.src;
      dialogImage.alt = image.alt;
      dialog.showModal();
    });
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

  document.querySelector('#application-form')?.addEventListener('submit', (event) => {
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

    navigator.clipboard?.writeText(message).catch(() => {});
    showToast('Открываю MAX с готовой анкетой. Выберите рабочий чат и отправьте сообщение.');

    const maxShareUrl = `https://max.ru/:share?text=${encodeURIComponent(message)}`;
    window.location.assign(maxShareUrl);
  });
})();
