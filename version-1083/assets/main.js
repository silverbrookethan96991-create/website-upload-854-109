(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = qs("[data-mobile-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  function setupBackTop() {
    var button = qs("[data-back-top]");
    if (!button) return;

    function sync() {
      if (window.scrollY > 420) {
        button.classList.add("is-visible");
      } else {
        button.classList.remove("is-visible");
      }
    }

    window.addEventListener("scroll", sync, { passive: true });
    button.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    sync();
  }

  function setupHero() {
    var slides = qsa("[data-hero-slide]");
    var dots = qsa("[data-hero-dot]");
    if (!slides.length) return;

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        stop();
        show(i);
        start();
      });
    });

    var stage = qs("[data-hero-stage]");
    if (stage) {
      stage.addEventListener("mouseenter", stop);
      stage.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function setupSiteSearch() {
    qsa("[data-site-search]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = qs("input[name='search']", form);
        if (!input) return;
        var value = input.value.trim();
        if (!value) return;
        event.preventDefault();
        var action = form.getAttribute("action") || "movies.html";
        window.location.href = action + "?search=" + encodeURIComponent(value);
      });
    });
  }

  function setupFilters() {
    var cards = qsa("[data-movie-card]");
    var search = qs("[data-filter-search]");
    var selects = qsa("[data-filter-select]");
    var reset = qs("[data-filter-reset]");
    var empty = qs("[data-empty-state]");
    if (!cards.length || !search) return;

    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get("search");
    if (initialSearch) search.value = initialSearch;

    function apply() {
      var text = normalize(search.value);
      var filters = {};
      selects.forEach(function(select) {
        filters[select.getAttribute("data-filter-select")] = normalize(select.value);
      });

      var visible = 0;
      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));

        var matched = true;
        if (text && haystack.indexOf(text) === -1) matched = false;
        Object.keys(filters).forEach(function(key) {
          var value = filters[key];
          if (!value) return;
          var target = normalize(card.getAttribute("data-" + key));
          if (target.indexOf(value) === -1) matched = false;
        });

        card.style.display = matched ? "" : "none";
        if (matched) visible += 1;
      });

      if (empty) empty.classList.toggle("is-visible", visible === 0);
    }

    search.addEventListener("input", apply);
    selects.forEach(function(select) {
      select.addEventListener("change", apply);
    });
    if (reset) {
      reset.addEventListener("click", function() {
        search.value = "";
        selects.forEach(function(select) {
          select.value = "";
        });
        apply();
      });
    }
    apply();
  }

  document.addEventListener("DOMContentLoaded", function() {
    setupMobileNav();
    setupBackTop();
    setupHero();
    setupSiteSearch();
    setupFilters();
  });
})();
