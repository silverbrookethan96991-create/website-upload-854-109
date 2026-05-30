(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      });
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupCarousel() {
    var hero = document.querySelector("[data-carousel]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
        dot.setAttribute("aria-pressed", String(dotIndex === index));
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var targetSelector = input.getAttribute("data-filter-input");
      var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
          card.hidden = keyword && text.indexOf(keyword) === -1;
        });
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class=\"movie-card\" href=\"" + item.url + "\" data-filter=\"" + escapeHtml(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre) + "\">",
      "  <span class=\"poster-frame\">",
      "    <img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "    <span class=\"poster-glow\"></span>",
      "  </span>",
      "  <span class=\"card-content\">",
      "    <span class=\"card-topline\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.year) + "</span></span>",
      "    <strong>" + escapeHtml(item.title) + "</strong>",
      "    <em>" + escapeHtml(item.region) + " · " + escapeHtml(item.category) + "</em>",
      "    <span class=\"card-desc\">" + escapeHtml(item.oneLine) + "</span>",
      "    <span class=\"card-tags\">" + tags + "</span>",
      "  </span>",
      "</a>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var grid = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-box]");
    var note = document.querySelector("[data-search-note]");
    if (!grid || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var results = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.category, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return !keyword || text.indexOf(keyword) !== -1;
      }).slice(0, keyword ? 120 : 48);

      grid.innerHTML = results.map(cardTemplate).join("\n");
      if (note) {
        note.textContent = keyword ? "已展示匹配影片" : "已展示热门片库";
      }
      setupImages();
    }

    input.addEventListener("input", render);
    render();
  }

  function setupPlayers() {
    document.querySelectorAll(".video-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream") || "";
      var hlsInstance = null;

      function attachStream() {
        if (video.dataset.ready === "true" || !stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        video.dataset.ready = "true";
      }

      function playVideo(event) {
        if (event) {
          event.preventDefault();
        }
        attachStream();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", playVideo);
      shell.addEventListener("click", function (event) {
        if (event.target === video && !video.paused) {
          return;
        }
        if (event.target.closest("button") === button || video.paused) {
          playVideo(event);
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupImages();
    setupMobileMenu();
    setupCarousel();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
