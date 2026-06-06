(() => {
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.site-header');
  const projectsSection = document.querySelector('.projects');
  const projectFigures = Array.from(document.querySelectorAll('.projects .project-strip figure'));
  const sharpLayer = document.querySelector('.hero-layer-sharp');
  const square = document.querySelector('.hero-square');
  const aboutSteps = Array.from(document.querySelectorAll('.about-step'));
  const aboutVisuals = Array.from(document.querySelectorAll('.about-visual'));
  const projectRows = Array.from(document.querySelectorAll('.project-row'));

  if (!hero || !sharpLayer || !square) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    size: 360,
    sharpScale: 1,
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    rafId: null,
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getSharpScale = () => {
    const transform = window.getComputedStyle(sharpLayer).transform;
    if (!transform || transform === 'none') {
      return 1;
    }

    const matrix = transform.match(/^matrix\(([^)]+)\)$/);
    if (matrix) {
      const values = matrix[1].split(',').map((value) => Number(value.trim()));
      const scaleX = values[0];
      return Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1;
    }

    const matrix3d = transform.match(/^matrix3d\(([^)]+)\)$/);
    if (matrix3d) {
      const values = matrix3d[1].split(',').map((value) => Number(value.trim()));
      const scaleX = values[0];
      return Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1;
    }

    return 1;
  };

  const syncSquareSize = () => {
    const width = square.getBoundingClientRect().width;
    state.size = width || 320;
    state.sharpScale = getSharpScale();
  };

  const toLocalPoint = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    const half = state.size / 2;
    const localX = clamp(clientX - rect.left, half, rect.width - half);
    const localY = clamp(clientY - rect.top, half, rect.height - half);
    return { x: localX, y: localY, rect };
  };

  const applyMask = (x, y, rect) => {
    const scale = state.sharpScale || 1;
    const sourceHalf = (state.size / scale) / 2;

    // Map viewport-aligned target center into the sharp layer's pre-transform space.
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const sourceX = cx + (x - cx) / scale;
    const sourceY = cy + (y - cy) / scale;

    const left = clamp(sourceX - sourceHalf, 0, rect.width);
    const top = clamp(sourceY - sourceHalf, 0, rect.height);
    const right = clamp(rect.width - (sourceX + sourceHalf), 0, rect.width);
    const bottom = clamp(rect.height - (sourceY + sourceHalf), 0, rect.height);

    square.style.left = `${x}px`;
    square.style.top = `${y}px`;
    sharpLayer.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  };

  const tick = () => {
    const rect = hero.getBoundingClientRect();
    const speed = reduceMotion ? 1 : 0.16;

    state.currentX += (state.targetX - state.currentX) * speed;
    state.currentY += (state.targetY - state.currentY) * speed;

    applyMask(state.currentX, state.currentY, rect);

    const dx = Math.abs(state.currentX - state.targetX);
    const dy = Math.abs(state.currentY - state.targetY);

    if (dx < 0.08 && dy < 0.08) {
      state.currentX = state.targetX;
      state.currentY = state.targetY;
      applyMask(state.currentX, state.currentY, rect);
      state.rafId = null;
      return;
    }

    state.rafId = window.requestAnimationFrame(tick);
  };

  const startTick = () => {
    if (state.rafId !== null) {
      return;
    }
    state.rafId = window.requestAnimationFrame(tick);
  };

  const moveTo = (clientX, clientY) => {
    const point = toLocalPoint(clientX, clientY);
    state.targetX = point.x;
    state.targetY = point.y;
    if (document.hidden) {
      state.currentX = state.targetX;
      state.currentY = state.targetY;
      applyMask(state.currentX, state.currentY, point.rect);
      return;
    }
    startTick();
  };

  const setCenter = () => {
    const rect = hero.getBoundingClientRect();
    state.targetX = rect.width / 2;
    state.targetY = rect.height / 2;
    if (state.currentX === 0 && state.currentY === 0) {
      state.currentX = state.targetX;
      state.currentY = state.targetY;
      applyMask(state.currentX, state.currentY, rect);
      return;
    }
    startTick();
  };

  const handleMove = (event) => {
    moveTo(event.clientX, event.clientY);
  };

  hero.addEventListener('pointermove', handleMove);
  hero.addEventListener('mousemove', handleMove);

  hero.addEventListener('pointerenter', handleMove);
  hero.addEventListener('mouseenter', handleMove);

  hero.addEventListener('pointerleave', () => {
    setCenter();
  });

  hero.addEventListener('mouseleave', () => {
    setCenter();
  });

  hero.addEventListener(
    'touchmove',
    (event) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      moveTo(touch.clientX, touch.clientY);
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    syncSquareSize();
    setCenter();
  });

  syncSquareSize();
  setCenter();

  if (header && projectsSection) {
    const updateHeaderTheme = () => {
      const rect = projectsSection.getBoundingClientRect();
      const headerProbeY = 62;
      const onLightBackground = rect.top <= headerProbeY && rect.bottom >= headerProbeY;
      header.classList.toggle('is-on-light', onLightBackground);
    };

    window.addEventListener('scroll', updateHeaderTheme, { passive: true });
    window.addEventListener('resize', updateHeaderTheme);
    updateHeaderTheme();
  }

  if (projectsSection && projectFigures.length && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    projectsSection.classList.add('has-project-cursor');

    const cursor = document.createElement('span');
    cursor.className = 'projects-cursor';
    cursor.innerHTML = '<span class="projects-cursor-label">View</span>';
    document.body.appendChild(cursor);

    const cursorState = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      inProjects: false,
      inFigure: false,
      rafId: null,
    };

    const renderCursor = () => {
      cursorState.x += (cursorState.targetX - cursorState.x) * 0.24;
      cursorState.y += (cursorState.targetY - cursorState.y) * 0.24;

      cursor.style.setProperty('--cursor-x', `${cursorState.x.toFixed(2)}px`);
      cursor.style.setProperty('--cursor-y', `${cursorState.y.toFixed(2)}px`);

      const dx = Math.abs(cursorState.targetX - cursorState.x);
      const dy = Math.abs(cursorState.targetY - cursorState.y);
      if (dx < 0.08 && dy < 0.08 && !cursorState.inProjects) {
        cursorState.rafId = null;
        return;
      }

      cursorState.rafId = window.requestAnimationFrame(renderCursor);
    };

    const requestCursorFrame = () => {
      if (cursorState.rafId !== null) {
        return;
      }
      cursorState.rafId = window.requestAnimationFrame(renderCursor);
    };

    const moveCursorTo = (event) => {
      cursorState.targetX = event.clientX;
      cursorState.targetY = event.clientY;
      requestCursorFrame();
    };

    const showCursor = () => {
      cursorState.inProjects = true;
      cursor.classList.add('is-visible');
      requestCursorFrame();
    };

    const hideCursor = () => {
      cursorState.inProjects = false;
      cursorState.inFigure = false;
      cursor.classList.remove('is-visible');
      cursor.classList.remove('is-view');
    };

    const activateViewMode = () => {
      cursorState.inFigure = true;
      cursor.classList.add('is-view');
    };

    const deactivateViewMode = () => {
      cursorState.inFigure = false;
      cursor.classList.remove('is-view');
    };

    projectsSection.addEventListener('pointerenter', showCursor);
    projectsSection.addEventListener('pointermove', moveCursorTo);
    projectsSection.addEventListener('pointerleave', hideCursor);

    projectFigures.forEach((figure) => {
      figure.addEventListener('pointerenter', activateViewMode);
      figure.addEventListener('pointerleave', deactivateViewMode);
    });
  }

  if (projectRows.length) {
    if (reduceMotion) {
      projectRows.forEach((row) => {
        row.classList.add('is-visible');
        row.style.setProperty('--offset', '0px');
      });
    } else {
      let projectsRafId = null;

      const updateProjects = () => {
        const viewportHeight = window.innerHeight;

        projectRows.forEach((row) => {
          const rect = row.getBoundingClientRect();
          const drift = Number(row.dataset.drift) || 0;
          const centerDelta = rect.top + rect.height / 2 - viewportHeight / 2;
          const normalized = clamp(centerDelta / viewportHeight, -1.2, 1.2);
          const offset = normalized * drift;

          row.style.setProperty('--offset', `${offset.toFixed(2)}px`);

          if (rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.08) {
            row.classList.add('is-visible');
          }
        });
      };

      const onProjectsMove = () => {
        if (projectsRafId !== null) {
          return;
        }

        projectsRafId = window.requestAnimationFrame(() => {
          updateProjects();
          projectsRafId = null;
        });
      };

      window.addEventListener('scroll', onProjectsMove, { passive: true });
      window.addEventListener('resize', onProjectsMove);
      updateProjects();
    }
  }

  if (aboutSteps.length && aboutVisuals.length) {
    const setActiveAboutStep = (index) => {
      aboutSteps.forEach((step, stepIndex) => {
        step.classList.toggle('is-active', stepIndex === index);
      });

      aboutVisuals.forEach((visual, visualIndex) => {
        visual.classList.toggle('is-active', visualIndex === index);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const nextIndex = Number(visibleEntries[0].target.dataset.step);
        if (Number.isFinite(nextIndex)) {
          setActiveAboutStep(nextIndex);
        }
      },
      {
        threshold: [0.25, 0.45, 0.65],
        rootMargin: '-10% 0px -28% 0px',
      }
    );

    aboutSteps.forEach((step) => observer.observe(step));
    setActiveAboutStep(0);
  }
})();
