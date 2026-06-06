(() => {
  const track = document.querySelector('.about-motion-track');
  const stage = document.querySelector('.about-motion-stage');
  const grid = document.querySelector('.about-motion-grid');
  const lines = Array.from(document.querySelectorAll('.motion-line'));

  if (grid) {
    const basePhotos = Array.from({ length: 20 }, (_, i) => `assets/about-photos/img${i + 1}.JPG`);
    basePhotos[3] = 'assets/about-photos/img4.jpg';
    basePhotos[11] = 'assets/about-photos/img12.jpg';
    basePhotos[12] = 'assets/about-photos/img13.jpg';
    basePhotos[13] = 'assets/about-photos/img14.jpg';
    basePhotos[14] = 'assets/about-photos/img15.jpg';
    basePhotos[15] = 'assets/about-photos/img16.jpg';
    basePhotos[16] = 'assets/about-photos/img17.jpg';
    basePhotos[17] = 'assets/about-photos/img18.jpg';
    basePhotos[18] = 'assets/about-photos/img19.jpg';
    basePhotos[19] = 'assets/about-photos/img20.jpg';

    const extraPhotoNumbers = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      37, 38, 39, 40, 41, 42,
    ];
    const extraPhotos = extraPhotoNumbers.map((n) => `assets/about-photos-extra/i${n}.jpg`);
    const allPhotos = [...basePhotos, ...extraPhotos];

    grid.innerHTML = allPhotos
      .map(
        (src, index) =>
          `<figure class="motion-grid-item" data-index="${index}"><img src="${src}" alt="" loading="lazy" /></figure>`
      )
      .join('');
  }

  const gridItems = Array.from(document.querySelectorAll('.motion-grid-item'));

  if (!track || !lines.length || !gridItems.length) {
    lines.forEach((line) => line.classList.add('is-active'));
    return;
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lineCount = lines.length;
  const colorfulStart = 0.92;

  const setActiveLine = (progress) => {
    const clampedProgress = clamp(progress, 0, 0.999);
    const activeIndex = clamp(Math.floor(clampedProgress * lineCount), 0, lineCount - 1);

    lines.forEach((line, lineIndex) => {
      line.classList.toggle('is-active', lineIndex === activeIndex);
    });
  };

  const update = () => {
    const rect = track.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    const maxTravel = Math.max(travel, 1);
    const passed = clamp(-rect.top, 0, maxTravel);
    const progress = passed / maxTravel;

    const viewportH = window.innerHeight;
    const fadeDistance = viewportH * 0.35;
    const fadeIn = clamp((viewportH - rect.top) / fadeDistance, 0, 1);
    const fadeOut = clamp(rect.bottom / fadeDistance, 0, 1);
    const overlayOpacity = Math.min(fadeIn, fadeOut);

    stage.style.opacity = overlayOpacity.toFixed(3);
    if (overlayOpacity > 0.01) {
      stage.classList.add('is-visible');
    } else {
      stage.classList.remove('is-visible');
    }

    setActiveLine(progress);
    stage.classList.toggle('is-colorful', progress >= colorfulStart);
  };

  let rafId = null;
  const onScroll = () => {
    if (rafId !== null) {
      return;
    }

    rafId = window.requestAnimationFrame(() => {
      update();
      rafId = null;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  update();
})();
