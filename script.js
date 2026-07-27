(() => {
  const vacancyTitles = {
    concrete: 'Бетонщик-арматурщик',
    general: 'Разнорабочий',
    foreman: 'Мастер-прораб',
    site_manager: 'Начальник участка'
  };
  const vacancies = [...document.querySelectorAll('.vacancy')];
  const vacancyKeyField = document.querySelector('#vacancy-key');
  const selectedVacancyTitle = document.querySelector('#selected-vacancy-title');

  const selectVacancy = (key, title = vacancyTitles[key]) => {
    if (!vacancyTitles[key] || !vacancyKeyField || !selectedVacancyTitle) return;
    vacancyKeyField.value = key;
    selectedVacancyTitle.textContent = title || vacancyTitles[key];
    vacancies.forEach((item) => item.classList.toggle('is-selected', item.dataset.vacancyKey === key));
  };

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

  document.querySelectorAll('.vacancy-apply').forEach((link) => {
    link.addEventListener('click', () => {
      const key = link.dataset.vacancyKey || '';
      selectVacancy(key, link.dataset.vacancyTitle);
    });
  });
  selectVacancy(vacancyKeyField?.value || 'concrete');

  const setPhotoScene = (scene) => {
    document.body.classList.remove('photo-object', 'photo-room', 'photo-corridor');
    document.body.classList.add(`photo-${scene || 'object'}`);
  };

  const sceneSections = [...document.querySelectorAll('[data-photo-scene]')];
  const updatePhotoScene = () => {
    const focusLine = window.innerHeight * 0.46;
    let active = sceneSections[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    sceneSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const center = Math.max(rect.top, Math.min(focusLine, rect.bottom));
      const distance = Math.abs(center - focusLine);
      if (rect.bottom > 0 && rect.top < window.innerHeight && distance < bestDistance) {
        active = section;
        bestDistance = distance;
      }
    });
    setPhotoScene(active?.dataset.photoScene || 'object');
  };

  let photoFrame = 0;
  const requestPhotoUpdate = () => {
    if (photoFrame) return;
    photoFrame = window.requestAnimationFrame(() => {
      photoFrame = 0;
      updatePhotoScene();
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        const offset = Math.min(window.scrollY * 0.12, 90);
        heroBg.style.transform = `scale(1.035) translate3d(0, ${offset}px, 0)`;
      }
    });
  };
  window.addEventListener('scroll', requestPhotoUpdate, { passive: true });
  window.addEventListener('resize', requestPhotoUpdate);
  updatePhotoScene();

  const dialog = document.querySelector('.lightbox');
  const dialogImage = dialog?.querySelector('img');
  document.querySelectorAll('.gallery-item').forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog || !dialogImage) return;
      const image = button.querySelector('img');
      const source = button.dataset.gallerySrc || image?.src || '';
      if (!source) return;
      dialogImage.src = source;
      dialogImage.alt = image?.alt || 'Фотография условий проживания';
      dialog.showModal();
    });
  });
  dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (text, duration = 5200) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), duration);
  };

  const endpoint = 'https://dxbrhsefgxcaxzmrbfrb.supabase.co/functions/v1/site-recruitment-application';
  const form = document.querySelector('#application-form');
  const submitButton = document.querySelector('#submit-application');
  let formStartedAt = Date.now();
  let submitting = false;

  const errorMessage = (code) => {
    switch (code) {
      case 'invalid_vacancy': return 'Выберите вакансию ещё раз.';
      case 'invalid_phone': return 'Проверьте номер телефона.';
      case 'invalid_full_name': return 'Укажите полное ФИО.';
      case 'invalid_city': return 'Укажите ваш город.';
      case 'consent_required': return 'Нужно согласие на обработку данных.';
      case 'invalid_form_timing': return 'Обновите страницу и заполните анкету ещё раз.';
      default: return 'Не удалось отправить заявку. Попробуйте ещё раз через минуту.';
    }
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    submitting = true;
    form.setAttribute('aria-busy', 'true');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем…';
    }

    const requestId = globalThis.crypto?.randomUUID?.()
      ?? `site-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload = {
      requestId,
      vacancyKey: vacancyKeyField?.value || '',
      fullName: document.querySelector('#full-name')?.value || '',
      phone: document.querySelector('#phone')?.value || '',
      city: document.querySelector('#city')?.value || '',
      experience: document.querySelector('#experience')?.value || '',
      comment: document.querySelector('#comment')?.value || '',
      consent: document.querySelector('#consent')?.checked === true,
      website: document.querySelector('#website')?.value || '',
      startedAt: formStartedAt,
      sourceUrl: window.location.href
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok !== true) {
        throw new Error(data.error || 'server_error');
      }

      const number = data.number ? ` №${data.number}` : '';
      const title = vacancyTitles[payload.vacancyKey] || 'вакансию';
      showToast(`Заявка${number} на вакансию «${title}» принята. Она уже появилась в AppСтрой.`, 8000);
      form.reset();
      selectVacancy('concrete');
      formStartedAt = Date.now();
    } catch (error) {
      showToast(errorMessage(error?.message));
    } finally {
      submitting = false;
      form.removeAttribute('aria-busy');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Отправить заявку';
      }
    }
  });
})();