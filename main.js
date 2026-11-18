(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  /* Smooth scroll */
  let lenis;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.querySelector(id);
    if (!el && id !== '#top') return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    const target = id === '#top' ? 0 : el;
    lenis ? lenis.scrollTo(target, { offset: -60 }) : (target === 0 ? scrollTo({ top: 0, behavior: 'smooth' }) : el.scrollIntoView({ behavior: 'smooth' }));
  }));

  /* Nav */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  document.querySelector('.nav__burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));

  /* Split statement into words */
  const st = document.querySelector('.reveal-words');
  st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');

  /* Minerals tabs */
  const MIN = [
    { t: 'Magnesium', img: 'crystals.jpg', b: 'Essential for muscle and nerve function, blood sugar control and blood pressure regulation. It also plays a role in bone health and energy production. An estimated 75% of Americans take in less than the recommended daily amount.' },
    { t: 'Bicarbonate', img: 'bubbles.jpg', b: 'Helps maintain a healthy pH balance and neutralizes lactic acid after exercise, so muscles recover faster and you feel lighter after every meal.' },
    { t: 'Calcium', img: 'aquifer.jpg', b: 'Strengthens bones and supports nerve function. In ROI it is dissolved naturally, collected over thousands of years as the water moves through layers of mineral rock.' },
    { t: 'Potassium', img: 'athlete.jpg', b: 'Regulates fluids, supports hydration and boosts energy. Together with magnesium it keeps muscles and the heart working smoothly.' }
  ];
  const mdT = document.querySelector('.md-title'), mdB = document.querySelector('.md-body'), mdI = document.querySelector('.mineral-detail__img img');
  document.querySelectorAll('.mineral').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.mineral').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const m = MIN[+btn.dataset.m];
    const swap = () => { mdT.textContent = m.t; mdB.textContent = m.b; mdI.src = 'assets/img/' + m.img; mdI.alt = m.t; };
    if (hasGsap && !reduce) {
      gsap.to([mdT, mdB, mdI], { opacity: 0, y: 10, duration: .25, onComplete: () => { swap(); gsap.to([mdT, mdB, mdI], { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out' }); } });
    } else swap();
  }));

  /* Shop */
  const price = document.querySelector('.price'), per = document.querySelector('.per'), shopImg = document.querySelector('.shop__img');
  document.querySelectorAll('.opts').forEach(group => group.querySelectorAll('.opt').forEach(o => o.addEventListener('click', () => {
    group.querySelectorAll('.opt').forEach(x => x.classList.remove('is-active'));
    o.classList.add('is-active');
    if (o.dataset.p) {
      price.textContent = '$' + Number(o.dataset.p).toLocaleString('en-US');
      per.textContent = '$' + (o.dataset.p / o.dataset.b) + ' per bottle';
      shopImg.classList.add('swap');
      setTimeout(() => { shopImg.src = 'assets/img/' + o.dataset.img; shopImg.onload = () => shopImg.classList.remove('swap'); }, 300);
    }
  })));
  let cart = 0;
  const toast = document.querySelector('.toast'), cc = document.querySelector('.cart-count');
  document.querySelector('.add').addEventListener('click', () => {
    cart++; cc.textContent = cart; cc.classList.add('on');
    toast.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('on'), 2200);
  });


  /* History scroll story (works with or without GSAP) */
  const chron = document.querySelector('.chron');
  if (chron) {
    const imgs = [...chron.querySelectorAll('.chron__img')];
    const items = [...chron.querySelectorAll('.chron__item')];
    const ticks = [...chron.querySelectorAll('.chron__tick')];
    const strips = [...chron.querySelectorAll('.dg__strip')];
    const fill = chron.querySelector('.chron__fill');
    const N = imgs.length; // intro + eras
    let cur = -1;
    const yearEl = chron.querySelector('.chron__year');
    let dw = [];
    const measure = () => {
      const probe = strips[0].children;
      const fs = parseFloat(getComputedStyle(yearEl).fontSize);
      dw = [...probe].map(s => { const r = document.createRange(); r.selectNodeContents(s); return r.getBoundingClientRect().width / fs; });
    };
    let lastYear = '1572';
    const setYear = y => {
      lastYear = String(y);
      lastYear.split('').forEach((d, k) => {
        strips[k].style.transform = `translateY(${-d}em)`;
        if (dw.length) strips[k].parentElement.style.width = (dw[d] - 0.035) + 'em';
      });
    };
    document.fonts.ready.then(() => { measure(); setYear(lastYear); });
    addEventListener('resize', () => { measure(); setYear(lastYear); });
    const show = i => {
      if (i === cur) return; cur = i;
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
      items.forEach((it, k) => it.classList.toggle('is-on', k === i - 1));
      ticks.forEach((t, k) => { t.classList.toggle('is-on', k === i - 1); t.classList.toggle('is-past', k < i); });
      chron.classList.toggle('past-intro', i > 0);
      if (i > 0) setYear(items[i - 1].dataset.year);
    };
    const update = () => {
      const r = chron.getBoundingClientRect();
      const total = chron.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      show(Math.min(N - 1, Math.floor(p * N * 0.999)));
      fill.style.transform = `scaleX(${Math.max(0, (p * N - 1) / (N - 1.001))})`;
    };
    setYear(1572);
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
    ticks.forEach(t => t.addEventListener('click', () => {
      const total = chron.offsetHeight - innerHeight;
      const y = chron.getBoundingClientRect().top + scrollY + total * ((+t.dataset.i + 0.5) / N);
      lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' });
    }));
    // preload era images once the section approaches
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { imgs.forEach(f => f.querySelector('img').loading = 'eager'); io.disconnect(); } }, { rootMargin: '150% 0px' });
    io.observe(chron);
  }

  /* Without GSAP: show everything */
  const loader = document.querySelector('.loader');
  if (!hasGsap || reduce) {
    loader.remove();
    document.querySelectorAll('.reveal-words .w').forEach(w => w.style.color = 'inherit');
    document.querySelectorAll('.bar__fill').forEach(b => b.style.transform = 'none');
    document.querySelectorAll('.ring').forEach(r => r.querySelector('.ring__fg').style.strokeDashoffset = 339.3 * (1 - r.dataset.pct / 100));
    document.querySelectorAll('.count').forEach(c => c.textContent = (+c.dataset.to).toFixed(+c.dataset.dec));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Loader + hero intro */
  const intro = gsap.timeline();
  intro.to('.loader img', { opacity: 1, y: 0, duration: .7, ease: 'power3.out' })
    .to('.loader img', { opacity: 0, scale: .9, duration: .45, ease: 'power2.in' }, '+=.25')
    .to('.loader', { autoAlpha: 0, duration: .6 }, '-=.15')
    .from('.hero__bg img', { scale: 1.12, duration: 2, ease: 'power3.out' }, '<')
    .from('.hero__title .line', { yPercent: 100, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, '<.1')
    .from('.hero__sub, .hero__cta', { y: 20, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out' }, '<.4')
    .from('.hero__bottle', { yPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out' }, '<-.3')
    .from('.nav', { y: -20, opacity: 0, duration: .8 }, '<.2');

  /* Hero scroll: bottle rises and scales, copy drifts up */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__bottle', { yPercent: -18, scale: 1.12, ease: 'none' }, 0)
    .to('.hero__copy', { yPercent: -30, opacity: 0, ease: 'none' }, 0)
    .to('.hero__bg img', { yPercent: 10, ease: 'none' }, 0);

  /* Statement word highlight */
  gsap.to('.reveal-words .w', {
    color: '#1B1A17', stagger: .1, ease: 'none',
    scrollTrigger: { trigger: '.statement', start: 'top 75%', end: 'bottom 55%', scrub: true }
  });

  /* Parallax images */
  gsap.utils.toArray('.parallax').forEach(img => gsap.fromTo(img, { yPercent: -8 }, {
    yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
  }));
  gsap.from('.source__over h2', { y: 60, opacity: 0, duration: 1.2, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.source__over h2', start: 'top 85%' } });

  /* Generic reveals */
  const revealSets = ['.sec-title', '.sec-lead', '.source__text > *', '.source__render', '.mineral', '.mineral-detail > *', '.tile', '.cmp__head, .cmp__row', '.life', '.shop__media', '.shop__panel > *', '.quotes blockquote', '.acc details', '.foot__top > *'];
  revealSets.forEach(sel => {
    gsap.utils.toArray(sel).forEach((el, i) => {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', delay: (i % 4) * .08, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
  });

  /* Image mini-parallax inside tiles */
  gsap.utils.toArray('.tile img, .life img, .source__render img').forEach(img => {
    gsap.fromTo(img, { scale: 1.12, yPercent: -4 }, { scale: 1.12, yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Counters */
  gsap.utils.toArray('.count').forEach(c => {
    const o = { v: 0 }, to = +c.dataset.to, dec = +c.dataset.dec;
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 85%' }, onUpdate: () => c.textContent = o.v.toFixed(dec) });
  });

  /* Bars */
  gsap.to('.bar__fill', { scaleX: 1, duration: 1.6, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.bars', start: 'top 75%' } });
  gsap.from('.bar', { opacity: 0, y: 20, duration: .8, stagger: .08, scrollTrigger: { trigger: '.bars', start: 'top 80%' } });

  /* Rings */
  gsap.utils.toArray('.ring').forEach((r, i) => {
    gsap.to(r.querySelector('.ring__fg'), { strokeDashoffset: 339.3 * (1 - r.dataset.pct / 100), duration: 2, delay: i * .15, ease: 'power3.out', scrollTrigger: { trigger: '.absorb', start: 'top 75%' } });
  });


  addEventListener('load', () => ScrollTrigger.refresh());
})();
