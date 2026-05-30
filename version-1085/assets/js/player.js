import { H as Hls } from './hls-vendor-dru42stk.js';

const frames = document.querySelectorAll('[data-player-frame]');
const instances = [];

function initializePlayer(frame) {
  const video = frame.querySelector('.js-hls-player');
  const overlay = frame.querySelector('.player-overlay');

  if (!video) {
    return;
  }

  const source = video.dataset.src;

  if (!source) {
    return;
  }

  const start = function () {
    if (video.dataset.ready !== 'true') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        instances.push(hls);
      } else {
        video.src = source;
      }

      video.dataset.ready = 'true';
      video.controls = true;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('play', function () {
    if (video.dataset.ready !== 'true') {
      start();
    }
  });
}

frames.forEach(initializePlayer);

window.addEventListener('pagehide', function () {
  instances.forEach(function (hls) {
    hls.destroy();
  });
});
