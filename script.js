(() => {
  const chunks = window.__SKBS_CHUNKS__ || {hero:[],room:[],hotel:[]};
  const heroUrl = chunks.hero.length ? `data:image/webp;base64,${chunks.hero.join('')}` : '';
  const roomUrl = chunks.room.length ? `data:image/webp;base64,${chunks.room.join('')}` : '';
  const hotelUrl = chunks.hotel.length ? `data:image/webp;base64,${chunks.hotel.join('')}` : '';

  const heroBg = document.querySelector('#hero-bg');
  if (heroBg && heroUrl) heroBg.style.backgroundImage = `url("${heroUrl}")`;
  const vacancyPhoto = document.querySelector('#vacancy-photo');
  if (vacancyPhoto && heroUrl) vacancyPhoto.src = heroUrl;
  const roomPhoto = document.querySelector('#room-photo');
  if (roomPhoto && roomUrl) roomPhoto.src = roomUrl;
  const hotelPhoto = document.querySelector('#hotel-photo');
  if (hotelPhoto && hotelUrl) hotelPhoto.src = hotelUrl;

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
  const openPhoto = (url, alt) => {
    if (!dialog || !dialogImage || !url) return;
    dialogImage.src = url;
    dialogImage.alt = alt;
    dialog.showModal();
  };
  document.querySelector('#room-button')?.addEventListener('click', () => openPhoto(roomUrl, 'Комната в гостинице'));
  document.querySelector('#hotel-button')?.addEventListener('click', () => openPhoto(hotelUrl, 'Коридор, душ, санузел и холодильники'));
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
