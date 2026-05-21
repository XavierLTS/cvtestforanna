/* ═══════════════════════════════════════════════
   RUIKE WU — Screen Producing Portfolio
   Interactions · vanilla JS, no dependencies
   ═══════════════════════════════════════════════ */
(() => {
  'use strict';

  const doc = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ═══ PRELOADER ═══ */
  const loader = $('#loader');
  const countEl = $('#count');
  const barEl = $('#bar');
  const words = $$('#loaderWord span');

  function startSite() {
    doc.classList.remove('is-loading');
    runMaskLines(document);
    revealNow();
    if (manifesto) buildHighlight(manifesto, 'ink');
    if (profileBig) buildHighlight(profileBig, 'dark');
    onScroll();
  }

  function preload() {
    if (/[?&](nopreload|fast)/.test(location.search)) {
      if (countEl) countEl.textContent = 100;
      if (barEl) barEl.style.width = '100%';
      loader.classList.add('is-done');
      startSite();
      setTimeout(() => loader.remove(), 1100);
      return;
    }
    let n = 0, wi = 0;
    const dur = reduced ? 200 : 1700;
    const t0 = performance.now();

    if (!reduced && words.length) {
      loader._cycle = setInterval(() => {
        wi = (wi + 1) % words.length;
        words.forEach(w => { w.style.transform = `translateY(${-100 * wi}%)`; });
      }, 420);
    }

    function tick(now) {
      const p = clamp((now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      n = Math.round(eased * 100);
      if (countEl) countEl.textContent = n;
      if (barEl) barEl.style.width = (eased * 100) + '%';
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        clearInterval(loader._cycle);
        loader.classList.add('is-done');
        startSite();
        setTimeout(() => loader.remove(), 1500);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ═══ CUSTOM CURSOR ═══ */
  function initCursor() {
    if (!fine) return;
    const cur = $('.cursor');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    let x = innerWidth / 2, y = innerHeight / 2;
    let rx = x, ry = y, vis = false;

    addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      if (!vis) { cur.classList.remove('is-hidden'); vis = true; }
    }, { passive: true });
    addEventListener('mouseleave', () => cur.classList.add('is-hidden'));
    addEventListener('mousedown', () => cur.classList.add('is-down'));
    addEventListener('mouseup', () => cur.classList.remove('is-down'));

    (function loop() {
      rx = lerp(rx, x, 0.2);
      ry = lerp(ry, y, 0.2);
      cur.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();

    const hov = 'a,button,[data-cursor],[data-magnetic],input';
    document.addEventListener('mouseover', e => {
      const t = e.target.closest(hov);
      if (!t) return;
      const mode = t.getAttribute('data-cursor');
      if (mode === 'copy') {
        cur.classList.add('is-label'); label.textContent = 'Copy';
      } else if (mode === 'expand') {
        cur.classList.add('is-label');
        label.textContent = t.classList.contains('is-open') ? 'Close' : 'Open';
      } else {
        cur.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hov)) {
        cur.classList.remove('is-hover', 'is-label');
      }
    });
  }

  /* ═══ MAGNETIC ═══ */
  function initMagnetic() {
    if (!fine) return;
    $$('[data-magnetic]').forEach(el => {
      const str = 0.32;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * str}px,${my * str}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
        el.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1)';
        setTimeout(() => el.style.transition = '', 550);
      });
    });
  }

  /* ═══ TILT ═══ */
  function initTilt() {
    if (!fine || reduced) return;
    $$('[data-tilt]').forEach(el => {
      const max = 7;
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
        setTimeout(() => el.style.transition = '', 600);
      });
    });
  }

  /* ═══ MASK LINE REVEAL ═══ */
  function runMaskLines(scope) {
    // hero double-mline
    $$('.hero__name .mline .mline', scope).forEach(el => {
      const d = (+el.dataset.delay || 0) * 130;
      setTimeout(() => el.classList.add('run'), 350 + d);
    });
    // hero gallery frames wipe in
    $$('.hero__shot', scope).forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 620 + i * 150);
    });
  }
  function runTitle(title) {
    $$('.mline > span', title).forEach((sp, i) => {
      setTimeout(() => sp.classList.add('run'), i * 120);
    });
  }

  /* ═══ REVEAL ON SCROLL ═══ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.classList.contains('reveal')) {
        const sibs = [...el.parentElement.children].filter(c =>
          c.classList.contains('reveal'));
        const idx = sibs.indexOf(el);
        el.style.transitionDelay = (idx >= 0 ? idx * 80 : 0) + 'ms';
        el.classList.add('in');
      }
      if (el.classList.contains('time__item')) el.classList.add('in');
      revealObs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  const titleObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { runTitle(en.target); titleObs.unobserve(en.target); }
    });
  }, { threshold: 0.4 });

  function revealNow() {
    $$('.reveal, .time__item').forEach(el => revealObs.observe(el));
    $$('.sec__title, .contact__cta').forEach(el => titleObs.observe(el));
  }

  /* ═══ STAT COUNTERS ═══ */
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const plain = el.hasAttribute('data-plain');
      const dur = 1500, t0 = performance.now();
      function step(now) {
        const p = clamp((now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        const val = Math.round(e * target);
        el.textContent = (plain ? val : val.toLocaleString('en-US')) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      statObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => statObs.observe(el));

  /* ═══ SCROLL-DRIVEN WORD HIGHLIGHT ═══ */
  const manifesto = $('[data-highlight]');
  const profileBig = $('[data-highlight-dark]');
  const highlights = [];

  function buildHighlight(el, mode) {
    const text = el.textContent.trim();
    el.textContent = '';
    const frag = document.createDocumentFragment();
    text.split(/\s+/).forEach(word => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      frag.appendChild(span);
      frag.appendChild(document.createTextNode(' '));
      if (/audience|reach|resonant|watching|legible/i.test(word) ||
          /producing|screen|cultures|creative/i.test(word) && mode === 'dark') {
        span.dataset.gold = '1';
      }
    });
    el.appendChild(frag);
    highlights.push({ el, words: $$('.w', el) });
  }

  function updateHighlights() {
    highlights.forEach(h => {
      const r = h.el.getBoundingClientRect();
      const start = innerHeight * 0.85;
      const end = innerHeight * 0.3;
      const prog = clamp((start - r.top) / (start - end + r.height));
      const lit = Math.round(prog * h.words.length);
      h.words.forEach((w, i) => {
        if (i < lit) {
          w.classList.add('lit');
          if (w.dataset.gold) w.classList.add('gold');
        } else {
          w.classList.remove('lit', 'gold');
        }
      });
    });
  }

  /* ═══ PARALLAX ═══ */
  const parallax = $$('[data-parallax]');
  function updateParallax() {
    if (reduced) return;
    const vh = innerHeight;
    parallax.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const speed = +el.dataset.speed || 0.1;
      const mid = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-mid * speed).toFixed(1)}px,0)`;
    });
  }

  /* ═══ PINNED CINEMA SEQUENCE ═══ */
  const pin = $('[data-pin]');
  function updatePin() {
    if (!pin) return;
    const r = pin.getBoundingClientRect();
    const total = pin.offsetHeight - innerHeight;
    const prog = clamp(-r.top / total);
    const media = $('[data-pin-media]', pin);
    const img = $('img', media);
    const copies = $$('[data-pin-copy]', pin);
    const count = $('[data-pin-count]', pin);

    // image grows from card to fullscreen
    const grow = clamp(prog / 0.62);
    const eg = grow < 0.5 ? 2 * grow * grow : 1 - Math.pow(-2 * grow + 2, 2) / 2;
    const wMin = innerWidth <= 1080 ? (innerWidth <= 720 ? 82 : 64) : 42;
    const hMin = innerWidth <= 1080 ? (innerWidth <= 720 ? 38 : 42) : 54;
    media.style.width  = lerp(wMin, 100, eg) + 'vw';
    media.style.height = lerp(hMin, 100, eg) + 'vh';
    media.style.borderRadius = lerp(24, 0, eg) + 'px';
    if (img) img.style.transform = `scale(${lerp(1.15, 1, eg)})`;

    // copy fades in over second half
    const copyP = clamp((prog - 0.42) / 0.4);
    copies.forEach((c, i) => {
      const local = clamp(copyP * 3.4 - i * 0.4);
      c.style.opacity = local;
      c.style.transform = `translateY(${(1 - local) * 28}px)`;
    });
    if (count) count.textContent = String(Math.round(prog * 99)).padStart(2, '0');
  }

  /* ═══ HORIZONTAL FILM STRIP ═══ */
  const strip = $('[data-strip]');
  const stripTrack = $('[data-strip-track]');
  function updateStrip() {
    if (!strip || !stripTrack) return;
    const r = strip.getBoundingClientRect();
    const total = strip.offsetHeight - innerHeight;
    const prog = clamp(-r.top / total);
    const dist = stripTrack.scrollWidth - innerWidth;
    stripTrack.style.transform = `translate3d(${-prog * dist}px,0,0)`;
  }

  /* ═══ EXPERIENCE ACCORDION ═══ */
  function initExp() {
    $$('.exp__item').forEach(item => {
      const bar = $('.exp__bar', item);
      bar.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        $$('.exp__item').forEach(i => i.classList.remove('is-open'));
        if (!open) item.classList.add('is-open');
      });
    });
  }

  /* ═══ HEADER STATE + ACTIVE NAV ═══ */
  const head = $('#head');
  const navLinks = $$('.head__nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href')));
  let lastY = 0;
  function updateHeader() {
    const y = scrollY;
    head.classList.toggle('is-stuck', y > 40);
    if (y > 600 && y > lastY + 4) head.classList.add('is-hidden');
    else if (y < lastY - 4) head.classList.remove('is-hidden');
    lastY = y;

    let active = -1;
    sections.forEach((s, i) => {
      if (s && s.getBoundingClientRect().top <= innerHeight * 0.4) active = i;
    });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === active));
  }

  /* ═══ SCROLL PROGRESS ═══ */
  const progBar = $('#progressBar');
  function updateProgress() {
    const max = doc.scrollHeight - innerHeight;
    progBar.style.transform = `scaleX(${clamp(scrollY / max)})`;
  }

  /* ═══ MARQUEE VELOCITY ═══ */
  const marquee = $('[data-marquee]');
  let velTimer;
  function bumpMarquee() {
    if (!marquee) return;
    marquee.classList.add('is-fast');
    clearTimeout(velTimer);
    velTimer = setTimeout(() => marquee.classList.remove('is-fast'), 180);
  }

  /* ═══ COPY EMAIL ═══ */
  function initCopy() {
    const mail = $('#copyMail');
    if (!mail) return;
    const state = $('#copyState');
    mail.addEventListener('mousemove', e => {
      const r = mail.getBoundingClientRect();
      mail.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      mail.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    mail.addEventListener('click', async () => {
      const addr = mail.dataset.mail;
      try {
        await navigator.clipboard.writeText(addr);
        state.textContent = '✳ Copied to clipboard';
      } catch {
        state.textContent = addr;
      }
      state.classList.add('is-copied');
      setTimeout(() => {
        state.textContent = 'Click to copy';
        state.classList.remove('is-copied');
      }, 2400);
    });
  }

  /* ═══ CLOCK ═══ */
  function initClock() {
    const els = [$('#clock'), $('#clock2')].filter(Boolean);
    function tick() {
      const t = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Europe/London'
      });
      els.forEach(e => e.textContent = t);
    }
    tick();
    setInterval(tick, 1000);
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ═══ SMOOTH ANCHORS ═══ */
  function initAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const t = $(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* ═══ MASTER SCROLL LOOP ═══ */
  let ticking = false;
  function onScroll() {
    bumpMarquee();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeader();
      updateProgress();
      updateParallax();
      updatePin();
      updateStrip();
      updateHighlights();
      ticking = false;
    });
  }

  /* ═══ INIT ═══ */
  function init() {
    initCursor();
    initMagnetic();
    initTilt();
    initExp();
    initCopy();
    initClock();
    initAnchors();
    const my = location.search.match(/[?&]y=(\d+)/);
    if (my) addEventListener('load', () =>
      setTimeout(() => scrollTo({ top: +my[1], behavior: 'instant' }), 250));
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => {
      updateParallax(); updatePin(); updateStrip();
    }, { passive: true });
    preload();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
