(function (global) {
  function initMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;
    var engine = null;

    if (!video) return;

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      if (button) button.classList.add("is-hidden");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (global.Hls && global.Hls.isSupported()) {
        engine = new global.Hls({ enableWorker: true, lowLatencyMode: true });
        engine.loadSource(source);
        engine.attachMedia(video);
      } else {
        video.src = source;
      }

      video.play().catch(function () {});
    }

    if (button) button.addEventListener("click", start);
    video.addEventListener("click", start);
    video.addEventListener("play", function () {
      if (button) button.classList.add("is-hidden");
    });
    video.addEventListener("emptied", function () {
      if (engine && engine.destroy) engine.destroy();
      engine = null;
      started = false;
    });
  }

  global.initMoviePlayer = initMoviePlayer;
})(window);
