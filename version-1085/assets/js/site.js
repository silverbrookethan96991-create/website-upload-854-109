(function () {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (button && nav) {
    button.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle('is-active', Number(dot.dataset.heroDot) === active);
      });
    };

    const restart = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 6200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restart();
      });
    }

    restart();
  }

  const panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    const container = document.querySelector('[data-card-container]');
    const cards = container ? Array.from(container.querySelectorAll('[data-movie-card]')) : [];
    const search = panel.querySelector('[data-card-search]');
    const region = panel.querySelector('[data-filter-region]');
    const category = panel.querySelector('[data-filter-category]');
    const sort = panel.querySelector('[data-card-sort]');
    const count = document.querySelector('[data-result-count]');

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const apply = function () {
      const query = normalize(search ? search.value : '');
      const regionValue = region ? region.value : '';
      const categoryValue = category ? category.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        const regionMatch = !regionValue || card.dataset.region === regionValue;
        const categoryMatch = !categoryValue || card.dataset.category === categoryValue;
        const textMatch = !query || text.includes(query);
        const show = regionMatch && categoryMatch && textMatch;

        card.classList.toggle('is-hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    };

    const sortCards = function () {
      if (!container || !sort) {
        return;
      }

      const mode = sort.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year-desc') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === 'year-asc') {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (mode === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }
        return 0;
      });

      sorted.forEach(function (card) {
        container.appendChild(card);
      });
    };

    [search, region, category].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });

    if (sort) {
      sort.addEventListener('change', function () {
        sortCards();
        apply();
      });
    }

    apply();
  });
})();
