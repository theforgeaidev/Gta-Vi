document.addEventListener('DOMContentLoaded', () => {
  const TARGET_DATE = new Date('2026-11-19T00:00:00-05:00');
  const pad = (num) => String(num).padStart(2, '0');

  const elDays = document.getElementById('d-days');
  const elHours = document.getElementById('d-hours');
  const elMin = document.getElementById('d-min');
  const elSec = document.getElementById('d-sec');

  function updateCountdown() {
    if (!elDays || !elHours || !elMin || !elSec) return;

    const diff = TARGET_DATE - Date.now();
    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMin.textContent = '00';
      elSec.textContent = '00';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMin.textContent = pad(minutes);
    elSec.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const heroVideo = document.getElementById('heroVideo');
  let isSoundEnabled = true;

  async function startHeroPlayback() {
    if (!heroVideo) return;
    heroVideo.volume = isSoundEnabled ? 0.9 : 0;
    heroVideo.muted = !isSoundEnabled;

    try {
      await heroVideo.play();
    } catch (err) {
      heroVideo.muted = true;
      try {
        await heroVideo.play();
      } catch (e) {}
    }
  }

  const trailerList = ['WebVideos/GtaViTrailer1.mp4', 'WebVideos/GtaViTrailer2.mp4', 'WebVideos/GtaViTrailer3.mp4'];

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  let currentBag = shuffleArray(trailerList);
  let bagIndex = 0;
  let lastPlayedFile = null;

  function getNextTrailerFromBag() {
    if (bagIndex >= currentBag.length) {
      let newBag = shuffleArray(trailerList);
      if (newBag[0] === lastPlayedFile && newBag.length > 1) {
        newBag.push(newBag.shift());
      }
      currentBag = newBag;
      bagIndex = 0;
    }
    const nextVideo = currentBag[bagIndex++];
    lastPlayedFile = nextVideo;
    return nextVideo;
  }

  if (heroVideo) {
    const initialSource = getNextTrailerFromBag();
    heroVideo.src = initialSource;
    heroVideo.load();
    startHeroPlayback();

    heroVideo.addEventListener('ended', () => {
      const nextTrailer = getNextTrailerFromBag();
      heroVideo.src = nextTrailer;
      heroVideo.load();
      heroVideo.play().catch(() => {});
    });
  }

  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });

    document.querySelectorAll('.mobile-nav-link, .mobile-cta-btn').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
    });
  }

  const storeButtonLabels = {
    xbox: {
      standard: 'Pre-Order Standard on Xbox',
      ultimate: 'Pre-Order Ultimate on Xbox'
    },
    ps: {
      standard: 'Pre-Order Standard on PlayStation',
      ultimate: 'Pre-Order Ultimate on PlayStation'
    }
  };

  function updateStoreButtonLabel(card) {
    const platform = card.dataset.platform;
    const storeBtn = card.querySelector('.store-btn');
    const label = storeBtn ? storeBtn.querySelector('span') : null;
    const selectedOption = card.querySelector('.edition-option.is-selected');
    const editionType = selectedOption ? selectedOption.dataset.edition : 'standard';

    if (label && storeButtonLabels[platform] && storeButtonLabels[platform][editionType]) {
      label.textContent = storeButtonLabels[platform][editionType];
    }
  }

  document.querySelectorAll('.platform-card').forEach(card => {
    const platform = card.dataset.platform;
    const storeBtn = card.querySelector('.store-btn');
    const editionOptions = card.querySelectorAll('.edition-option');

    updateStoreButtonLabel(card);

    editionOptions.forEach(option => {
      option.addEventListener('click', () => {
        editionOptions.forEach(opt => opt.classList.remove('is-selected'));
        option.classList.add('is-selected');

        const editionType = option.dataset.edition;
        const links = {
          xbox: {
            standard: 'https://www.xbox.com/en-us/games/store/grand-theft-auto-vi/9nl3wwnzlzzn',
            ultimate: 'https://www.xbox.com/en-us/games/store/grand-theft-auto-vi-ultimate-edition/9NNZSNHLR63L/0017'
          },
          ps: {
            standard: 'https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001',
            ultimate: 'https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVIULTIMATE001'
          }
        };

        if (storeBtn && links[platform] && links[platform][editionType]) {
          storeBtn.href = links[platform][editionType];
        }

        updateStoreButtonLabel(card);
      });
    });
  });

  const videoModal = document.getElementById('videoModal');
  const modalMedia = document.getElementById('modalMedia');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');

  function openTrailerModal(videoUrl, title) {
    if (heroVideo) heroVideo.pause();

    if (!modalMedia || !videoModal) return;

    modalMedia.innerHTML = `
      <video controls autoplay playsinline style="width:100%;height:100%;object-fit:contain;background:#000;" title="${title}">
        <source src="${videoUrl}" type="video/mp4">
      </video>
    `;

    const modalVideoElement = modalMedia.querySelector('video');
    if (modalVideoElement) {
      modalVideoElement.muted = false;
      modalVideoElement.volume = 0.9;
      modalVideoElement.play().catch(() => {});
    }

    videoModal.classList.add('is-open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeTrailerModal() {
    if (!videoModal || !modalMedia) return;
    videoModal.classList.remove('is-open');
    videoModal.setAttribute('aria-hidden', 'true');
    modalMedia.innerHTML = '';
    document.body.style.overflow = '';

    if (heroVideo) {
      heroVideo.play().catch(() => {});
    }
  }

  document.querySelectorAll('.trailer-item').forEach(item => {
    item.addEventListener('click', () => {
      const videoSrc = item.dataset.video;
      const videoTitle = item.dataset.title;
      if (videoSrc) openTrailerModal(videoSrc, videoTitle || 'Grand Theft Auto VI');
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeTrailerModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeTrailerModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('is-open')) {
      closeTrailerModal();
    }
  });
});
