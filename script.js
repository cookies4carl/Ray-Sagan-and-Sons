/* =============================================
   RAY SAGAN & SONS — JAVASCRIPT
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── FOOTER YEAR ──────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  // ── STICKY HEADER + BACK-TO-TOP ──────────────
  const header    = document.getElementById('site-header');
  const backToTop = document.getElementById('back-to-top');

  function handleScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ── HAMBURGER MENU ───────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mainNav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a nav link is clicked
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('open') &&
        !mainNav.contains(e.target) &&
        !hamburger.contains(e.target)) {
      hamburger.classList.remove('open');
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      hamburger.classList.remove('open');
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });


  // ── SMOOTH SCROLL ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerOffset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-height')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ── ACTIVE NAV HIGHLIGHTING ──────────────────
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const match = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', match);
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(s => sectionObserver.observe(s));


  // ── SCROLL REVEAL ────────────────────────────
  const revealEls = document.querySelectorAll(
    '.service-card, .about-grid, .contact-grid, .quote-form, .hero-stats .stat'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  // ── GALLERY: AUTO-SCROLL + LIGHTBOX ─────────────────────────
  const river     = document.querySelector('.gallery-river');
  const originals = river ? [...river.querySelectorAll('.gallery-item')] : [];

  let lightbox    = null;
  let lightboxImg = null;
  let currentIdx  = -1;

  if (river && originals.length) {

    // Clone items for seamless infinite loop
    originals.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.clone = 'true';
      river.appendChild(clone);
    });

    // Auto-scroll via RAF — uses a fractional accumulator so subpixel
    // increments don't get lost to scrollLeft's integer rounding
    let paused = false;
    let scrollPos = 0;
    const speed = 0.35; // px per frame (~21px/s)

    function startScrolling() {
      (function tick() {
        if (!paused) {
          const halfWidth = river.scrollWidth / 2;
          scrollPos += speed;
          if (halfWidth > 0 && scrollPos >= halfWidth) scrollPos -= halfWidth;
          river.scrollLeft = scrollPos;
        }
        requestAnimationFrame(tick);
      })();
    }

    // Wait until images have laid out (so scrollWidth is real) before starting
    if (document.readyState === 'complete') {
      startScrolling();
    } else {
      window.addEventListener('load', startScrolling, { once: true });
    }

    // Pause when hovering any image (original or clone), resume when leaving
    river.addEventListener('mouseover', e => {
      if (e.target.closest('.gallery-item')) paused = true;
    });
    river.addEventListener('mouseout', e => {
      if (!e.relatedTarget?.closest('.gallery-river')) paused = false;
    });
    river.addEventListener('mouseleave', () => { paused = false; });
    // Touch: pause while interacting, resume after 3s of inactivity
    river.addEventListener('touchstart', () => { paused = true;  }, { passive: true });
    river.addEventListener('touchend',   () => { setTimeout(() => { paused = false; }, 3000); }, { passive: true });

    // Lightbox builder
    function buildLightbox() {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Image viewer');

      lightboxImg = document.createElement('img');
      lightboxImg.className = 'lightbox-img';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'lightbox-close';
      closeBtn.setAttribute('aria-label', 'Close image viewer');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', closeLightbox);

      lightbox.appendChild(lightboxImg);
      lightbox.appendChild(closeBtn);
      lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
      document.body.appendChild(lightbox);
    }

    function openLightbox(index) {
      if (!lightbox) buildLightbox();
      const img = originals[index]?.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      currentIdx = index;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox-close').focus();
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    document.addEventListener('keydown', e => {
      if (!lightbox?.classList.contains('active')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowRight') openLightbox((currentIdx + 1) % originals.length);
      if (e.key === 'ArrowLeft')  openLightbox((currentIdx - 1 + originals.length) % originals.length);
    });

    // Event delegation handles both originals and clones (clones share data-index)
    river.addEventListener('click', e => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;
      const idx = parseInt(item.dataset.index, 10);
      if (!isNaN(idx)) openLightbox(idx);
    });

    originals.forEach((item, i) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `View photo ${i + 1}`);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });
  }


  // ── EQUAL-HEIGHT SERVICE CARDS ───────────────
  function equalizeServiceCards() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(c => c.style.height = '');
    if (window.innerWidth <= 600) return; // let mobile stack naturally
    const maxH = Math.max(...[...cards].map(c => c.offsetHeight));
    cards.forEach(c => c.style.height = maxH + 'px');
  }

  equalizeServiceCards();
  window.addEventListener('resize', equalizeServiceCards);


  // ── QUOTE FORM VALIDATION ────────────────────
  const form      = document.getElementById('quote-form');
  const submitBtn = document.getElementById('submit-btn');
  const success   = document.getElementById('form-success');

  if (!form) return;

  const rules = {
    name:    { required: true, label: 'Full name' },
    phone:   { required: true, label: 'Phone number', pattern: /[\d\s\-().+]{7,}/, patternMsg: 'Please enter a valid phone number' },
    email:   { required: false, label: 'Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMsg: 'Please enter a valid email address' },
    service: { required: true, label: 'Service' },
    message: { required: true, label: 'Project details', minLength: 10, minLengthMsg: 'Please provide at least a brief description' },
  };

  function validateField(name, value) {
    const rule = rules[name];
    if (!rule) return '';
    if (rule.required && !value.trim()) return `${rule.label} is required.`;
    if (value.trim() && rule.pattern && !rule.pattern.test(value)) return rule.patternMsg;
    if (value.trim() && rule.minLength && value.trim().length < rule.minLength) return rule.minLengthMsg;
    return '';
  }

  function showError(name, msg) {
    const input = form.querySelector(`[name="${name}"]`);
    const errEl = document.getElementById(`${name}-error`);
    if (!input || !errEl) return;
    input.classList.toggle('error', !!msg);
    errEl.textContent = msg;
  }

  // Live validation on blur
  Object.keys(rules).forEach(name => {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return;
    el.addEventListener('blur', () => {
      showError(name, validateField(name, el.value));
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        showError(name, validateField(name, el.value));
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    Object.keys(rules).forEach(name => {
      const el  = form.querySelector(`[name="${name}"]`);
      const msg = validateField(name, el ? el.value : '');
      showError(name, msg);
      if (msg) valid = false;
    });

    if (!valid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Set _replyto to submitter's email if provided
    const emailVal = form.querySelector('[name="email"]')?.value;
    if (emailVal) form.querySelector('[name="_replyto"]').value = emailVal;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(res => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      if (res.ok) {
        form.reset();
        success.classList.add('visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => success.classList.remove('visible'), 6000);
      } else {
        return res.json().then(data => {
          throw new Error(data?.errors?.map(e => e.message).join(', ') || 'Submission failed.');
        });
      }
    })
    .catch(err => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      alert(`Sorry, something went wrong: ${err.message}\n\nPlease email us directly at raysaganandsons@aol.com`);
    });
  });

});
