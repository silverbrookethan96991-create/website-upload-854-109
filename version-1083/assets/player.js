(function() {
  window.initMoviePlayer = function(videoUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var trigger = document.querySelector("[data-play-trigger]");
    var hlsInstance = null;
    var ready = false;

    if (!video || !videoUrl) return;

    function prepare() {
      if (ready) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
      ready = true;
    }

    function play() {
      prepare();
      if (overlay) overlay.classList.add("is-hidden");
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function() {
          if (overlay) overlay.classList.remove("is-hidden");
        });
      }
    }

    if (overlay) overlay.addEventListener("click", play);
    if (trigger) trigger.addEventListener("click", play);

    video.addEventListener("click", function() {
      if (video.paused) play();
    });

    video.addEventListener("play", function() {
      if (overlay) overlay.classList.add("is-hidden");
    });

    video.addEventListener("error", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
        ready = false;
      }
    });
  };
})();
