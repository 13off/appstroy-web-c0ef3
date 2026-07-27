(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const vacancyTitles = {
    concrete: 'Бетонщик-арматурщик',
    general: 'Разнорабочий',
    foreman: 'Мастер-прораб',
    site_manager: 'Начальник участка'
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

  const body = document.body;
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.page-progress i');
  const hero = document.querySelector('[data-hero]');
  const heroImage = hero?.querySelector('.hero-media img');
  const heroCopy = hero?.querySelector('.hero-copy');
  const objectStory = document.querySelector('.object-story');
  const objectImage = objectStory?.querySelector('.object-media img');

  const finishLoading = () => {
    body.classList.remove('is-loading');
    requestAnimationFrame(() => body.classList.add('is-ready'));
  };

  if (document.readyState === 'complete') finishLoading();
  else window.addEventListener('load', finishLoading, { once: true });
  window.setTimeout(finishLoading, 1500);

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      revealObserver.observe(item);
    });
  }

  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  let scrollFrame = 0;
  const updateScrollEffects = () => {
    scrollFrame = 0;
    const scrollY = window.scrollY;
    const viewport = Math.max(window.innerHeight, 1);
    const documentHeight = Math.max(document.documentElement.scrollHeight - viewport, 1);

    if (progress) progress.style.transform = `scaleX(${clamp(scrollY / documentHeight, 0, 1)})`;
    header?.classList.toggle('is-compact', scrollY > 26);

    if (!reduceMotion && hero) {
      const rect = hero.getBoundingClientRect();
      const localProgress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
      if (heroImage) {
        heroImage.style.transform = `scale(${1.08 + localProgress * 0.075}) translate3d(0, ${localProgress * 5.5}%, 0)`;
        heroImage.style.filter = `saturate(${0.78 - localProgress * 0.08}) contrast(1.07) brightness(${1 - localProgress * 0.16})`;
      }
      if (heroCopy) heroCopy.style.transform = `translate3d(0, ${localProgress * 44}px, 0)`;
    }

    if (!reduceMotion && objectStory && objectImage) {
      const rect = objectStory.getBoundingClientRect();
      const progressThrough = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      objectImage.style.transform = `scale(1.11) translate3d(0, ${(progressThrough - 0.5) * 8}%, 0)`;
    }

    let activeSection = null;
    let closest = Number.POSITIVE_INFINITY;
    navSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.top - viewport * 0.34);
      if (rect.bottom > viewport * 0.18 && rect.top < viewport * 0.78 && distance < closest) {
        closest = distance;
        activeSection = section;
      }
    });
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', Boolean(activeSection) && link.getAttribute('href') === `#${activeSection.id}`);
    });
  };

  const requestScrollEffects = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollEffects);
  };
  window.addEventListener('scroll', requestScrollEffects, { passive: true });
  window.addEventListener('resize', requestScrollEffects);
  updateScrollEffects();

  const vacancyKeyField = document.querySelector('#vacancy-key');
  const selectedVacancyTitle = document.querySelector('#selected-vacancy-title');
  const vacancies = [...document.querySelectorAll('.vacancy')];

  const selectVacancy = (key, title = vacancyTitles[key]) => {
    if (!vacancyTitles[key] || !vacancyKeyField || !selectedVacancyTitle) return;
    vacancyKeyField.value = key;
    selectedVacancyTitle.textContent = title || vacancyTitles[key];
    vacancies.forEach((item) => item.classList.toggle('is-selected', item.dataset.vacancyKey === key));
  };

  const openPanel = async (vacancy, panel, trigger) => {
    vacancy.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    if (reduceMotion || !panel.animate) return;
    const height = panel.scrollHeight;
    await panel.animate([
      { height: '0px', opacity: 0, transform: 'translateY(-12px)' },
      { height: `${height}px`, opacity: 1, transform: 'translateY(0)' }
    ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }).finished.catch(() => {});
    panel.style.height = 'auto';
  };

  const closePanel = async (vacancy, panel, trigger) => {
    vacancy.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    if (panel.hidden) return;
    if (reduceMotion || !panel.animate) {
      panel.hidden = true;
      return;
    }
    const height = panel.getBoundingClientRect().height;
    await panel.animate([
      { height: `${height}px`, opacity: 1, transform: 'translateY(0)' },
      { height: '0px', opacity: 0, transform: 'translateY(-10px)' }
    ], { duration: 360, easing: 'cubic-bezier(.4,0,.2,1)' }).finished.catch(() => {});
    panel.hidden = true;
    panel.style.height = '';
  };

  vacancies.forEach((vacancy) => {
    const trigger = vacancy.querySelector('.vacancy-trigger');
    const panel = vacancy.querySelector('.vacancy-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', async () => {
      const opening = !vacancy.classList.contains('open');
      const others = vacancies.filter((item) => item !== vacancy && item.classList.contains('open'));
      await Promise.all(others.map((item) => {
        const otherPanel = item.querySelector('.vacancy-panel');
        const otherTrigger = item.querySelector('.vacancy-trigger');
        return otherPanel && otherTrigger ? closePanel(item, otherPanel, otherTrigger) : Promise.resolve();
      }));

      selectVacancy(vacancy.dataset.vacancyKey || 'concrete');
      if (opening) await openPanel(vacancy, panel, trigger);
      else await closePanel(vacancy, panel, trigger);
    });
  });

  document.querySelectorAll('.vacancy-apply').forEach((link) => {
    link.addEventListener('click', () => {
      selectVacancy(link.dataset.vacancyKey || 'concrete', link.dataset.vacancyTitle);
    });
  });
  selectVacancy(vacancyKeyField?.value || 'concrete');

  const counters = [...document.querySelectorAll('[data-count]')];
  const animateCounter = (element) => {
    const target = Number(element.dataset.count || 0);
    if (!target || element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    if (reduceMotion) {
      element.textContent = String(target);
      return;
    }
    const start = performance.now();
    const duration = 1050;
    const tick = (now) => {
      const elapsed = clamp((now - start) / duration, 0, 1);
      element.textContent = String(Math.round(target * easeOutCubic(elapsed)));
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else counters.forEach(animateCounter);

  const dialog = document.querySelector('.lightbox');
  const dialogImage = dialog?.querySelector('img');
  document.querySelectorAll('.living-shot').forEach((button) => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      if (!dialog || !dialogImage || !image?.src) return;
      dialogImage.src = image.currentSrc || image.src;
      dialogImage.alt = image.alt || 'Фотография условий проживания';
      dialog.showModal();
    });
  });
  dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog?.open) dialog.close();
  });

  if (canHover && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });
  }

  const toast = document.querySelector('.toast');
  let toastTimer = 0;
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
  const submitLabel = submitButton?.querySelector('span');
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
    if (submitting || !form.reportValidity()) return;

    submitting = true;
    form.setAttribute('aria-busy', 'true');
    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Отправляем…';

    const requestId = globalThis.crypto?.randomUUID?.()
      ?? `site-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload = {
      requestId,
      vacancyKey: vacancyKeyField?.value || '',
      fullName: document.querySelector('#full-name')?.value.trim() || '',
      phone: document.querySelector('#phone')?.value.trim() || '',
      city: document.querySelector('#city')?.value.trim() || '',
      experience: document.querySelector('#experience')?.value || '',
      comment: document.querySelector('#comment')?.value.trim() || '',
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
      if (!response.ok || data.ok !== true) throw new Error(data.error || 'server_error');

      const number = data.number ? ` №${data.number}` : '';
      const title = vacancyTitles[payload.vacancyKey] || 'вакансию';
      showToast(`Заявка${number} на вакансию «${title}» принята. Мы свяжемся с вами по телефону.`, 8000);
      form.reset();
      selectVacancy('concrete');
      formStartedAt = Date.now();
    } catch (error) {
      showToast(errorMessage(error?.message));
    } finally {
      submitting = false;
      form.removeAttribute('aria-busy');
      if (submitButton) submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Отправить заявку';
    }
  });
})();
