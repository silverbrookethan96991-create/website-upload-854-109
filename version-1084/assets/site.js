(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function textOf(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initGridFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector(".local-filter");
    var region = document.querySelector(".region-filter");
    var year = document.querySelector(".year-filter");
    var empty = document.querySelector(".empty-state");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var q = textOf(input && input.value);
      var selectedRegion = region ? region.value : "";
      var selectedYear = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var show = matchText && matchRegion && matchYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.page) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"card-pills\"><span class=\"pill\">" + escapeHtml(movie.region) + "</span><span class=\"pill pill-soft\">" + escapeHtml(movie.category) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.page) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"movie-card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-tags\">" + tags + "</div>" +
      "<div class=\"card-foot\"><span>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.type) + "</span><a href=\"" + escapeHtml(movie.page) + "\">立即观看</a></div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var form = document.querySelector(".big-search-form");
    var input = form ? form.querySelector("input[name='q']") : null;
    var heading = document.querySelector(".search-heading");
    var empty = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }

    function render(query) {
      var normalized = textOf(query).trim();
      var data = window.SITE_MOVIES.filter(function (movie) {
        if (!normalized) {
          return true;
        }
        var haystack = [movie.title, movie.region, movie.year, movie.genre, movie.tagsText, movie.oneLine].join(" ").toLowerCase();
        return haystack.indexOf(normalized) !== -1;
      }).slice(0, 96);

      results.innerHTML = data.map(movieCard).join("");
      if (heading) {
        heading.textContent = normalized ? "相关影片" : "热门影片";
      }
      if (empty) {
        empty.hidden = data.length !== 0;
      }
    }

    render(q);
  }

  window.initDetailPlayer = function (address) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      var start = document.getElementById("playerStart");
      if (!video || !start || !address) {
        return;
      }
      var loaded = false;
      var hls = null;

      function bind() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = address;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(address);
          });
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = address;
        }
      }

      function play() {
        bind();
        start.classList.add("is-hidden");
        video.play().catch(function () {});
      }

      start.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        start.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          start.classList.remove("is-hidden");
        }
      });
    });
  };

  ready(function () {
    initNavigation();
    initHeroSlider();
    initGridFilters();
    initSearchPage();
  });
}());
