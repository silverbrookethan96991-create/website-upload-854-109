(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    if (!button) return;
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;
    var slides = Array.prototype.slice.call(
      slider.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        stop();
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        stop();
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        stop();
        show(index + 1);
        play();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(
      document.querySelectorAll("[data-search-area]"),
    );
    areas.forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(
        area.querySelectorAll("[data-filter]"),
      );
      var cards = Array.prototype.slice.call(
        area.querySelectorAll("[data-movie-card]"),
      );
      var empty = area.querySelector("[data-empty-state]");
      var active = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || "").toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchedText = !query || text.indexOf(query) !== -1;
          var matchedFilter = active === "all" || category === active;
          var ok = matchedText && matchedFilter;
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle("is-visible", visible === 0);
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
