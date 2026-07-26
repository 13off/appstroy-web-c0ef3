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
      showToast(`Заявка${number} принята. Она уже появилась в AppСтрой. Скоро с вами свяжутся.`, 8000);
      form.reset();
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
