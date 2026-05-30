(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (value) {
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-pressed', String(dotIndex === current));
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var emptyMessage = document.querySelector('.empty-message');

  function filterCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!cards.length) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var yearOk = !year || (card.getAttribute('data-year') || '') === year;
      var regionOk = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
      var queryOk = !query || haystack.indexOf(query) !== -1;
      var show = yearOk && regionOk && queryOk;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle('is-visible', visible === 0);
    }
  }

  [filterInput, yearFilter, regionFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterCards);
      element.addEventListener('change', filterCards);
    }
  });

  filterCards();

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');

  function createSearchCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="./' + item.file + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
      '<span class="play-chip">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '<h2><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.desc) + '</p>',
      '<div class="card-foot"><span>' + escapeHtml(item.type) + '</span><span>热度 ' + escapeHtml(String(item.hot)) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch() {
    if (!searchInput || !searchResults || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = searchInput.value.trim() || params.get('q') || '';
    if (searchInput.value.trim() === '' && query) {
      searchInput.value = query;
    }
    var lower = query.toLowerCase();
    var items = window.SEARCH_ITEMS;
    var matches = lower
      ? items.filter(function (item) {
          return item.search.indexOf(lower) !== -1;
        }).slice(0, 120)
      : items.slice(0, 60);

    searchResults.innerHTML = '';
    matches.forEach(function (item) {
      searchResults.appendChild(createSearchCard(item));
    });
    if (searchEmpty) {
      searchEmpty.classList.toggle('is-visible', matches.length === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }
})();
