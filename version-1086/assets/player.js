(function () {
  const video = document.getElementById('moviePlayer');
  const cover = document.querySelector('.play-cover');
  const status = document.querySelector('.player-status');

  if (!video || typeof mediaSource === 'undefined') {
    return;
  }

  let initialized = false;
  let hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
      status.hidden = !message;
    }
  }

  function attachSource() {
    if (initialized) {
      return true;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaSource;
      initialized = true;
      return true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(mediaSource);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('无法播放视频');
        }
      });
      initialized = true;
      return true;
    }

    setStatus('无法播放视频');
    return false;
  }

  function startPlayback() {
    if (!attachSource()) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        setStatus('点击视频继续播放');
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!initialized) {
      startPlayback();
    }
  });

  video.addEventListener('playing', function () {
    setStatus('');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
