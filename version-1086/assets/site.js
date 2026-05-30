(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"], input[type="search"]');
      const query = input ? input.value.trim() : '';
      const action = form.getAttribute('action') || './search.html';
      const target = query ? action + '?q=' + encodeURIComponent(query) : action;
      window.location.href = target;
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const filterBox = document.querySelector('[data-filter-box]');

  if (filterBox) {
    const cards = Array.from(document.querySelectorAll('#movieGrid .movie-card'));
    const search = filterBox.querySelector('[data-local-search]');
    const year = filterBox.querySelector('[data-year-filter]');
    const typeButtons = Array.from(filterBox.querySelectorAll('[data-type-filter]'));
    let selectedType = '';

    function filterCards() {
      const keyword = search ? search.value.trim().toLowerCase() : '';
      const selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const cardYear = card.getAttribute('data-year') || '';
        const cardType = card.getAttribute('data-type') || '';
        const cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        const byKeyword = !keyword || title.includes(keyword) || cardRegion.includes(keyword);
        const byYear = !selectedYear || cardYear === selectedYear;
        const byType = !selectedType || cardType === selectedType;
        card.style.display = byKeyword && byYear && byType ? '' : 'none';
      });
    }

    if (search) {
      search.addEventListener('input', filterCards);
    }

    if (year) {
      year.addEventListener('change', filterCards);
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedType = button.getAttribute('data-type-filter') || '';
        typeButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        filterCards();
      });
    });
  }

  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');

  if (results && summary && Array.isArray(window.SEARCH_MOVIES)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const input = document.querySelector('.search-page-form input[name="q"]');

    if (input) {
      input.value = query;
    }

    function renderSearch(value) {
      const keyword = value.trim().toLowerCase();

      if (!keyword) {
        summary.textContent = '请输入关键词开始搜索';
        results.innerHTML = '';
        return;
      }

      const matched = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.text.includes(keyword);
      }).slice(0, 120);

      summary.textContent = '搜索关键词：' + value + '，找到 ' + matched.length + ' 部相关影片';

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">未找到相关影片</div>';
        return;
      }

      results.innerHTML = matched.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">' +
          '<span class="poster-badge">' + movie.region + '</span>' +
          '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<a class="movie-title" href="' + movie.url + '">' + movie.title + '</a>' +
          '<p>' + movie.line + '</p>' +
          '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.type + '</span><span>' + movie.genre + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    renderSearch(query);
  }
})();
