(() => {
  const track = document.getElementById('dtTrack');
  const sticky = document.getElementById('dtSticky');
  const cursor = document.getElementById('dtCursor');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth <= 768;

  if (cursor) {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;
    let rafC = null;

    const tickCursor = () => {
      const k = reduceMotion ? 1 : 0.2;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      cursor.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      rafC = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1)
        ? requestAnimationFrame(tickCursor)
        : null;
    };

    document.addEventListener('mousemove', (event) => {
      tx = event.clientX;
      ty = event.clientY;
      if (!rafC) rafC = requestAnimationFrame(tickCursor);
    }, { passive: true });

    document.addEventListener('mouseover', (event) => {
      cursor.classList.toggle('is-link', !!event.target.closest('a, button'));
    });
  }

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

  setup();
  window.addEventListener('load', setup);

  document.querySelectorAll('.dt-panel-img img').forEach((img) => {
    img.addEventListener('load', setup, { passive: true });
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });
})();
