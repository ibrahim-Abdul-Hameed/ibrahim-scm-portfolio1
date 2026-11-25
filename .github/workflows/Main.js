(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;

  /* ---------- Split hero name into animated letters ---------- */
  let ci = 0;
  $$('.split .line').forEach(line => {
    const text = line.textContent;
    line.textContent = '';
    [...text].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.setProperty('--i', ci++);
      s.setAttribute('aria-hidden', 'true');
      line.appendChild(s);
    });
  });

  /* ---------- Stagger delays for grouped reveals ---------- */
  $$('.stagger').forEach(g => $$('.reveal', g).forEach((el, i) => el.style.setProperty('--d', i * 0.12 + 's')));
  $$('.timeline .event').forEach((el, i) => el.style.setProperty('--d', (i % 2) * 0.08 + 's'));

  /* ---------- Reveal on scroll ---------- */
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('visible');
    obs.unobserve(el);
    // clear the entrance delay so hover effects respond instantly afterwards
    setTimeout(() => el.style.removeProperty('--d'), 1400);
    if (el.classList.contains('scoreboard')) runCounters(el);
  }), { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

  const startReveals = () => $$('.reveal, .mask-reveal, .split').forEach(x => obs.observe(x));

  /* ---------- Preloader ---------- */
  const loader = $('#loader');
  const countEl = $('#loadCount');
  body.classList.add('loading');
  let pct = 0, loaded = false;
  window.addEventListener('load', () => { loaded = true; });
  const finishLoader = () => {
    loader.classList.add('done');
    body.classList.remove('loading');
    setTimeout(startReveals, reduce ? 0 : 450);
  };
  if (reduce) { countEl.textContent = 100; finishLoader(); }
  else {
    const tick = () => {
      const cap = loaded ? 100 : 88;
      pct = Math.min(cap, pct + (loaded ? 6 : Math.random() * 4 + 1));
      countEl.textContent = Math.round(pct);
      if (pct >= 100) return setTimeout(finishLoader, 150);
      requestAnimationFrame(() => setTimeout(tick, 28));
    };
    tick();
    setTimeout(() => { loaded = true; }, 3500); // never block longer than a few seconds
  }

  /* ---------- Typed role rotator ---------- */
  const roles = ['Procurement Executive', 'SCM Analyst', 'Sourcing Specialist', 'SAP MM End User', 'P2P Process Partner'];
  const typed = $('#typed');
  if (!reduce && typed) {
    let r = 0, i = roles[0].length, deleting = true;
    const loop = () => {
      const word = roles[r];
      if (deleting) {
        i--;
        typed.textContent = word.slice(0, i);
        if (i === 0) { deleting = false; r = (r + 1) % roles.length; }
        setTimeout(loop, 45);
      } else {
        const next = roles[r];
        i++;
        typed.textContent = next.slice(0, i);
        if (i === next.length) { deleting = true; return setTimeout(loop, 2200); }
        setTimeout(loop, 85);
      }
    };
    setTimeout(loop, 3800);
  }

  /* ---------- Scoreboard counters ---------- */
  function runCounters(root) {
    $$('.count', root).forEach((el, idx) => {
      const to = +el.dataset.to;
      if (reduce) { el.textContent = to; return; }
      const dur = 1400 + idx * 150;
      const t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Scroll-driven effects ---------- */
  const progress = $('#progress');
  const header = $('#top');
  const toTop = $('#toTop');
  const ring = $('#topRing');
  const p2p = $('#p2pTrack');
  const p2pFill = $('#p2pFill');
  const p2pBall = $('#p2pBall');
  const steps = $$('.p2p-steps .step');
  const tl = $('#timelineEl');
  const tlFill = $('#timelineFill');
  let lastY = 0, ticking = false;

  const onScroll = () => {
    const h = document.documentElement;
    const y = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const ratio = max > 0 ? y / max : 0;
    progress.style.width = ratio * 100 + '%';
    ring.style.strokeDashoffset = 132 - 132 * ratio;
    toTop.classList.toggle('show', y > 600);
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > lastY && y > 500 && !body.classList.contains('menu-open'));
    lastY = y;

    const vh = innerHeight;
    // P2P ball travels as the section crosses the viewport
    const pr = p2p.getBoundingClientRect();
    const pp = Math.max(0, Math.min(1, (vh * 0.85 - pr.top) / (vh * 0.6)));
    p2pFill.style.width = pp * 100 + '%';
    p2pBall.style.left = pp * 100 + '%';
    p2pBall.style.transform = `rotate(${pp * 1080}deg)`;
    steps.forEach((s, i) => s.classList.toggle('lit', pp >= (i + 0.2) / steps.length || (innerWidth <= 1000 && s.getBoundingClientRect().top < vh * 0.8)));

    // Timeline line draws downward
    const tr = tl.getBoundingClientRect();
    const tp = Math.max(0, Math.min(1, (vh * 0.7 - tr.top) / tr.height));
    tlFill.style.height = tp * 100 + '%';

    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { onScroll(); moveTabSlider(); });
  onScroll();

  /* ---------- Scroll-spy nav indicator ---------- */
  const nav = $('#nav');
  const indicator = $('#navIndicator');
  const links = $$('a', nav);
  const placeIndicator = a => {
    if (!a) { indicator.style.opacity = 0; return; }
    indicator.style.opacity = 1;
    indicator.style.left = a.offsetLeft + 'px';
    indicator.style.width = a.offsetWidth + 'px';
  };
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const a = links.find(l => l.getAttribute('href') === '#' + e.target.id);
    links.forEach(l => l.classList.toggle('active', l === a));
    if (a) placeIndicator(a);
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const t = $(l.getAttribute('href')); if (t) spy.observe(t); });

  /* ---------- Mobile menu ---------- */
  const toggle = $('#menuToggle');
  const setMenu = open => {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  links.forEach(l => l.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Skill filter with sliding tab + staggered pills ---------- */
  const tabs = $$('.skilltabs button');
  const slider = $('#tabSlider');
  const pills = $$('#skillset .pill');
  function moveTabSlider() {
    const a = $('.skilltabs button.active');
    if (!a) return;
    slider.style.left = a.offsetLeft + 'px';
    slider.style.top = a.offsetTop + 'px';
    slider.style.width = a.offsetWidth + 'px';
    slider.style.height = a.offsetHeight + 'px';
  }
  const showPills = group => {
    let n = 0;
    pills.forEach(p => {
      const on = group === 'all' || p.dataset.cat === group;
      p.classList.remove('show');
      p.classList.toggle('hidden', !on);
      if (on) p.style.setProperty('--i', n++);
    });
    void document.body.offsetWidth; // restart the entrance animation
    pills.forEach(p => { if (!p.classList.contains('hidden')) p.classList.add('show'); });
  };
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
    b.classList.add('active');
    b.setAttribute('aria-selected', 'true');
    moveTabSlider();
    showPills(b.dataset.group);
  }));
  moveTabSlider();
  showPills('all');
  document.fonts && document.fonts.ready.then(moveTabSlider);

  /* ---------- Copy buttons + toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $$('.copy-btn').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); showToast('Copied — that’s a SIX! 🏏'); }
    catch { showToast(b.dataset.copy); }
  }));

  /* ---------- Card spotlight follows pointer ---------- */
  $$('.card.spot').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  if (reduce || !finePointer) return; // pointer-heavy effects only on desktop

  /* ---------- 3D tilt ---------- */
  $$('[data-tilt]').forEach(el => {
    const max = el.classList.contains('hero-card') ? 10 : 6;
    el.addEventListener('pointerenter', () => { el.classList.add('tilting'); el.style.transition = 'transform .12s ease-out, border-color .35s, box-shadow .35s'; });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * max * 2}deg) rotateX(${(0.5 - y) * max * 2}deg) translateY(-6px)`;
      el.style.setProperty('--gx', x * 100 + '%');
      el.style.setProperty('--gy', y * 100 + '%');
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), border-color .35s, box-shadow .35s';
      el.style.transform = '';
      el.classList.remove('tilting');
    });
  });

  /* ---------- Magnetic buttons ---------- */
  $$('.magnetic').forEach(btn => {
    const inner = $('span', btn);
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      if (inner) inner.style.transform = `translate(${dx * 0.12}px, ${dy * 0.15}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; if (inner) inner.style.transform = ''; });
  });

  /* ---------- Cricket-ball cursor ---------- */
  const dot = $('.cursor-dot'), ringEl = $('.cursor-ring');
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    body.classList.add('has-cursor');
  });
  document.addEventListener('pointerleave', () => body.classList.remove('has-cursor'));
  const follow = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ringEl.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.addEventListener('pointerover', e => {
    body.classList.toggle('cursor-hover', !!e.target.closest('a, button, .pill, .card, .stat'));
  });

  /* ---------- Hero parallax ---------- */
  const heroCopy = $('.hero-copy'), orbs = $$('.hero .orb');
  $('.hero').addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    heroCopy.style.translate = `${x * -14}px ${y * -10}px`;
    orbs.forEach((o, i) => { o.style.translate = `${x * (30 + i * 30)}px ${y * (30 + i * 30)}px`; });
  });

  /* ---------- Supply-network particle canvas ---------- */
  const cv = $('#network');
  const ctx = cv.getContext('2d');
  let W, H, nodes = [];
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const size = () => {
    W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
    const count = Math.round(Math.min(70, innerWidth / 22));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25 * DPR, vy: (Math.random() - 0.5) * 0.25 * DPR,
      r: (Math.random() * 1.6 + 0.6) * DPR
    }));
  };
  size();
  addEventListener('resize', size);
  const LINK = 130 * DPR;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const px = mx * DPR, py = my * DPR;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(214,255,87,${(1 - d / LINK) * 0.18})`;
          ctx.lineWidth = DPR * 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - px, a.y - py);
      if (dm < LINK * 1.4) {
        ctx.strokeStyle = `rgba(120,214,160,${(1 - dm / (LINK * 1.4)) * 0.35})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(px, py); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(214,255,87,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
})();
