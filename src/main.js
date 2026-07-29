// scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Insights — las tarjetas se generan desde /content/insights.json, que
// scripts/build-insights.mjs regenera automáticamente en cada build a partir
// de los artículos publicados en content/insights/*.md (vía Decap CMS)
const insightsGrid = document.getElementById('insights-grid');
const insightsEmpty = document.getElementById('insights-empty');
if (insightsGrid) {
  fetch('/content/insights.json')
    .then(res => (res.ok ? res.json() : []))
    .then(articles => {
      if (!Array.isArray(articles) || articles.length === 0) {
        if (insightsEmpty) insightsEmpty.classList.remove('hidden');
        return;
      }
      articles.slice(0, 3).forEach(article => {
        const card = document.createElement('a');
        card.href = `/insights/${article.slug}/`;
        card.className = 'group reveal';
        card.innerHTML = `
          <div class="ph aspect-[4/3] mb-5" role="img" aria-label="${article.title}" style="background-image:url('${article.cover}')"></div>
          <p class="eyebrow text-dark mb-2">${article.tag}</p>
          <p class="font-display text-xl group-hover:text-dark transition-colors">${article.title}</p>
        `;
        insightsGrid.appendChild(card);
        io.observe(card);
      });
    })
    .catch(() => {
      if (insightsEmpty) insightsEmpty.classList.remove('hidden');
    });
}

// contador animado de la métrica de impacto en "La plataforma"
// (cuenta hacia arriba una sola vez, al entrar en viewport)
const counterEl = document.getElementById('platform-counter');
const counterSection = document.getElementById('platform-stat');
if (counterEl && counterSection) {
  const target = parseInt(counterEl.dataset.target, 10) || 0;
  const duration = 1200;
  let started = false;

  const animateCount = () => {
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      counterEl.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io3 = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        animateCount();
        io3.disconnect();
      }
    });
  }, { threshold: 0.4 });
  io3.observe(counterSection);
}

// "Tecnología" — módulo BI & Reporting: la cifra parece recalcularse
// mientras el mouse está sobre esa celda (Bloomberg-terminal feel)
const biCell = document.getElementById('tech-bi-cell');
const biFigure = document.getElementById('tech-bi-figure');
if (biCell && biFigure) {
  let biTimer = null;
  biCell.addEventListener('mouseenter', () => {
    biTimer = setInterval(() => {
      const jitter = (Math.random() * 1.4 - 0.7).toFixed(1);
      const value = (94.2 + parseFloat(jitter)).toFixed(1);
      biFigure.textContent = `RevPAR\u00A0${value}`;
    }, 700);
  });
  biCell.addEventListener('mouseleave', () => {
    clearInterval(biTimer);
    biFigure.textContent = 'RevPAR\u00A094.2';
  });
}

// "Hospitality Operating System" — al hacer scroll por las 6 capacidades,
// el mockup del dashboard cambia de escena según cuál esté en el centro
// de la pantalla
const osBlocks = document.querySelectorAll('.os-block');
const osScenes = document.querySelectorAll('.os-scene');
if (osBlocks.length && osScenes.length) {
  const activateScene = (name) => {
    osScenes.forEach(s => s.classList.toggle('is-active', s.dataset.osTarget === name));
  };
  const ioOS = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) activateScene(e.target.dataset.osScene);
    });
  }, { threshold: 0.5, rootMargin: '-35% 0px -35% 0px' });
  osBlocks.forEach(b => ioOS.observe(b));
}

// "Why it works" — cada punto se activa (opacidad completa) al pasar el
// mouse y se desactiva al quitarlo, en loop; el medidor circular refleja
// en cada momento cuál punto está bajo el cursor (r=54 → circunferencia ≈ 339.29)
const whyBlocks = document.querySelectorAll('.why-block');
if (whyBlocks.length) {
  const GAUGE_CIRCUMFERENCE = 339.29;
  const gaugeArc = document.getElementById('why-gauge-arc');
  const gaugePercent = document.getElementById('why-gauge-percent');
  const hovered = new Set();

  const updateGauge = () => {
    const highest = hovered.size ? Math.max(...hovered) : 0;
    const pct = highest * 20;
    const offset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * pct / 100);
    if (gaugeArc) gaugeArc.style.strokeDashoffset = String(offset);
    if (gaugePercent) gaugePercent.textContent = `${pct}%`;

    const isComplete = pct >= 100;
    if (gaugeArc) gaugeArc.classList.toggle('is-complete', isComplete);
    if (gaugePercent) gaugePercent.classList.toggle('is-complete', isComplete);
  };

  whyBlocks.forEach(b => {
    const index = parseInt(b.dataset.whyIndex, 10) || 0;
    b.addEventListener('mouseenter', () => {
      b.classList.add('is-active');
      hovered.add(index);
      updateGauge();
    });
    b.addEventListener('mouseleave', () => {
      b.classList.remove('is-active');
      hovered.delete(index);
      updateGauge();
    });
  });
}

// "One Asset Strategy" — el edificio de la derecha se unifica gradualmente
// (crossfade de dos capas SVG) según el progreso de scroll a través de la
// sección, atado directamente al scroll del usuario (sin scroll-jacking)
const oaSection = document.getElementById('one-asset');
if (oaSection) {
  let oaTicking = false;
  const updateOA = () => {
    const rect = oaSection.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height + vh * 0.5;
    const scrolled = vh - rect.top;
    let progress = scrolled / total;
    progress = Math.max(0, Math.min(1, progress));
    document.documentElement.style.setProperty('--oa-progress', progress.toFixed(3));
    oaTicking = false;
  };
  const onOAScroll = () => {
    if (!oaTicking) {
      requestAnimationFrame(updateOA);
      oaTicking = true;
    }
  };
  window.addEventListener('scroll', onOAScroll, { passive: true });
  window.addEventListener('resize', onOAScroll);
  updateOA();
}

// nav: al bajar el scroll más allá de la posición inicial, pasa a estado "is-scrolled"
// (fondo Accent; logo y textos se mantienen en blanco — ver src/input.css)
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
});
