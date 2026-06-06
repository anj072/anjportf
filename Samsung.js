(() => {
  const track  = document.getElementById('sgTrack');
  const sticky = document.getElementById('sgSticky');
  const cursor = document.getElementById('sgCursor');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth <= 768;

  /* ── Custom cursor ─────────────────────────────────────────────────── */
  if (cursor) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy, rafC = null;

    const tickCursor = () => {
      const k = reduceMotion ? 1 : 0.2;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      cursor.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`;
      rafC = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1)
        ? requestAnimationFrame(tickCursor) : null;
    };

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!rafC) rafC = requestAnimationFrame(tickCursor);
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      cursor.classList.toggle('is-link', !!e.target.closest('a, button'));
    });
  }

  /* ── Horizontal scroll (exact Neo Tokyo mechanic) ──────────────────
     1. track.height = sticky.scrollWidth   → creates scroll distance
     2. On scroll: sticky.transform = translateX(-window.scrollY)
     Body must use overflow-x: clip (not hidden) so body does not
     become a scroll container, which would break position:sticky.
  ────────────────────────────────────────────────────────────────── */
  let rafS = null;

  const applyTranslate = () => {
    if (!track || !sticky || isMobile()) {
      rafS = null;
      return;
    }

    const startY = track.offsetTop;
    const maxX = Math.max(0, sticky.scrollWidth - window.innerWidth);
    const x = Math.min(Math.max(window.scrollY - startY, 0), maxX);
    sticky.style.transform = `translateX(${-x}px)`;
    rafS = null;
  };

  window.addEventListener('scroll', () => {
    if (!rafS) rafS = requestAnimationFrame(applyTranslate);
  }, { passive: true });

  const setup = () => {
    if (!track || !sticky) return;
    if (isMobile()) {
      track.style.height = '';
      sticky.style.transform = '';
      return;
    }

    const maxX = Math.max(0, sticky.scrollWidth - window.innerWidth);
    track.style.height = `${Math.ceil(maxX + window.innerHeight)}px`;
    applyTranslate();
  };

  /* Run setup immediately, then again after full load (images inflate scrollWidth) */
  setup();
  window.addEventListener('load', setup);

  document.querySelectorAll('.sg-panel-img img').forEach((img) => {
    img.addEventListener('load', setup, { passive: true });
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });
})();
