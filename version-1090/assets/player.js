function attachMoviePlayer(videoId, streamUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }

  var box = video.closest('.video-box');
  var cover = box ? box.querySelector('.player-cover') : null;
  var button = box ? box.querySelector('.play-trigger') : null;
  var hlsInstance = null;
  var prepared = false;

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
    video.load();
  }

  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  function play() {
    prepare();
    hideCover();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      play();
    });
  }

  if (cover) {
    cover.addEventListener('click', function () {
      play();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('playing', hideCover);

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
