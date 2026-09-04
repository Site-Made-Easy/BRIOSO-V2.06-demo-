/* ==========================================================================
   BRIOSO — Roast & Layers | main.js
   ========================================================================== */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initHeaderScroll();
    initMobileMenu();
    initCursor();
    initMagnetic();
    initReveals();
    initMenuTabs();
    initContactForm();
    initActiveNav();
    initPageTransitions();
    initCounters();
  });

  /* ---------------- Loader ---------------- */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    document.body.style.overflow = 'hidden';
    const delay = reduceMotion ? 200 : 2100;
    window.setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, delay);
  }

  /* ---------------- Header on scroll ---------------- */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    }));
  }

  /* ---------------- Custom cursor ---------------- */
  function initCursor() {
    if (isTouch) return;
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.append(cursor, dot);

    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    const darkZones = 'section.hero, .page-hero, .section--ink, .contact-card, .space-card, #loader';
    document.addEventListener('mouseover', (e) => {
      const hoverable = e.target.closest('a, button, .menu-tab, [data-magnetic]');
      cursor.classList.toggle('cursor--hover', !!hoverable);
      cursor.classList.toggle('cursor--dark', !!e.target.closest(darkZones));
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.btn').forEach(btn => {
      btn.setAttribute('data-magnetic', '');
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------------- Scroll reveals ---------------- */
  function initReveals() {
    const targets = document.querySelectorAll('.rise, .wipe, .slide-l, .slide-r');
    if (!targets.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('in'));
      return;
    }
    document.querySelectorAll('.stagger').forEach(group => {
      Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* ---------------- Animated counters ---------------- */
  function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = reduceMotion ? 0 : 1400;
        const start = performance.now();
        const step = (now) => {
          const p = dur === 0 ? 1 : Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach(el => io.observe(el));
  }

  /* ---------------- Menu tabs (menu.html) ---------------- */
  function initMenuTabs() {
    const tabs = document.querySelectorAll('.menu-tab');
    const items = document.querySelectorAll('.menu-item');
    if (!tabs.length || !items.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.category;
        let i = 0;
        items.forEach(item => {
          const match = cat === 'all' || item.dataset.category === cat;
          item.style.display = match ? 'grid' : 'none';
          if (match) {
            item.style.animation = 'none';
            void item.offsetWidth;
            item.style.animationDelay = (i * 40) + 'ms';
            item.style.animation = '';
            i++;
          }
        });
      });
    });
  }

  /* ---------------- Contact form (demo) ---------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      window.setTimeout(() => {
        btn.textContent = 'Message sent ✓';
        form.reset();
        window.setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 2400);
      }, 1000);
    });
  }

  /* ---------------- Active nav link ---------------- */
  function initActiveNav() {
    const current = (window.location.pathname.split('/').pop() || 'index.html');
    document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ---------------- Page transition curtain ---------------- */
  function initPageTransitions() {
    if (reduceMotion) return;
    const curtain = document.createElement('div');
    curtain.id = 'curtain';
    document.body.appendChild(curtain);
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || link.target === '_blank') return;
        e.preventDefault();
        curtain.classList.add('active');
        window.setTimeout(() => { window.location.href = link.href; }, 480);
      });
    });
  }
})();
