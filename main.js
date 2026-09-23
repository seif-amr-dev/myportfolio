(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     Loader
  --------------------------------------------------------- */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct = document.getElementById('loaderPct');

  function runLoader() {
    if (reduceMotion) {
      loader.classList.add('is-hidden');
      playHeroEntrance();
      return;
    }
    let pct = 0;
    const step = () => {
      pct += Math.random() * 18 + 8;
      if (pct >= 100) pct = 100;
      loaderFill.style.width = pct + '%';
      loaderPct.textContent = String(Math.round(pct)).padStart(2, '0');
      if (pct < 100) {
        setTimeout(step, 90);
      } else {
        setTimeout(() => {
          loader.classList.add('is-hidden');
          playHeroEntrance();
        }, 200);
      }
    };
    step();
  }

  /* ---------------------------------------------------------
     Hero entrance (single orchestrated moment)
  --------------------------------------------------------- */
  function playHeroEntrance() {
    const reveals = document.querySelectorAll('.hero [data-reveal]');
    if (!hasGSAP || reduceMotion) {
      reveals.forEach(el => el.classList.add('is-visible'));
      return;
    }
    gsap.to(reveals, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
    });
  }

  /* ---------------------------------------------------------
     Scroll-based reveals for the rest of the page
  --------------------------------------------------------- */
  function initScrollReveals() {
    const targets = document.querySelectorAll(
      '.section-head, .about__text, .about__stats li, .project, .skills__group, .timeline__list li, .achievement, .contact__inner > *'
    );
    targets.forEach(el => el.classList.add('reveal-up'));

    if (reduceMotion) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     Nav: scroll state, active link, progress line
  --------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById('siteNav');
    const progress = document.getElementById('progressLine');
    const navLinks = document.querySelectorAll('[data-nav]');
    const sections = Array.from(navLinks)
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 40);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = docHeight > 0 ? `${(y / docHeight) * 100}%` : '0%';

      let current = null;
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) current = sec;
      });
      navLinks.forEach(a => {
        const target = document.querySelector(a.getAttribute('href'));
        a.classList.toggle('is-active', target === current);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------
     Mobile menu
  --------------------------------------------------------- */
  function initMobileMenu() {
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;

    function close() {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function toggle() {
      const open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', toggle);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------------------------------------------------------
     Custom cursor
  --------------------------------------------------------- */
  function initCursor() {
    if (isTouch) return;
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    const interactive = document.querySelectorAll('a, button, .skills__group li, input, textarea');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
  }

  /* ---------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------- */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------------------------------------------------------
     Hero mouse-follow glow
  --------------------------------------------------------- */
  function initHeroGlow() {
    if (isTouch || reduceMotion) return;
    const hero = document.getElementById('hero');
    const glow = document.getElementById('heroGlow');
    if (!hero || !glow) return;
    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.transform = `translate(${x - 260}px, ${y - 260}px)`;
    });
  }

  /* ---------------------------------------------------------
     Skills note on hover/focus
  --------------------------------------------------------- */
  function initSkillsNote() {
    const note = document.getElementById('skillsNote');
    const items = document.querySelectorAll('.skills__group li');
    if (!note) return;
    items.forEach(li => {
      const show = () => { note.textContent = `${li.textContent} — ${li.dataset.note}`; };
      const hide = () => { note.textContent = 'Hover or focus a skill for context.'; };
      li.addEventListener('mouseenter', show);
      li.addEventListener('focus', show);
      li.addEventListener('mouseleave', hide);
      li.addEventListener('blur', hide);
    });
  }

  /* ---------------------------------------------------------
     Contact form (static — no backend wired up)
  --------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactStatus');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      status.textContent = 'Message ready — connect a backend or form service to send it.';
    });
  }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveals();
    initNav();
    initMobileMenu();
    initCursor();
    initMagnetic();
    initHeroGlow();
    initSkillsNote();
    initContactForm();
    runLoader();
  });
})();