(() => {
  const partUrls = Array.from(
    { length: 14 },
    (_, index) => `asset-data/asset-${String(index).padStart(2, '0')}.txt`,
  );

  async function loadAssets() {
    const parts = await Promise.all(
      partUrls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Не удалось загрузить ${url}`);
        return response.text();
      }),
    );

    const data = JSON.parse(parts.join(''));
    const urls = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        `data:${value.mime};base64,${value.data}`,
      ]),
    );

    document.querySelectorAll('[data-asset]').forEach((element) => {
      const url = urls[element.dataset.asset];
      if (url && element instanceof HTMLImageElement) element.src = url;
    });

    document.querySelectorAll('[data-bg-asset]').forEach((element) => {
      const url = urls[element.dataset.bgAsset];
      if (url) element.style.backgroundImage = `url("${url}")`;
    });
  }

  loadAssets().catch((error) => console.error('Ошибка загрузки фотографий:', error));

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
      if (objectField) objectField.value = link.dataset.object || 'Мурманск';
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
})();
