(function () {
  const data = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const count = document.querySelector('[data-search-count]');

  if (!form || !input || !results) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  input.value = initial;

  const normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  const card = function (movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="./' + movie.file + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
      '    <span class="play-badge">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-list">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  };

  const render = function () {
    const query = normalize(input.value);
    const matches = query
      ? data.filter(function (movie) {
          return normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.oneLine,
            (movie.tags || []).join(' '),
            movie.categoryName
          ].join(' ')).includes(query);
        })
      : data.slice(0, 48);

    results.innerHTML = matches.slice(0, 200).map(card).join('\n');

    if (count) {
      count.textContent = String(matches.length);
    }
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('q', input.value);
    window.history.replaceState({}, '', url);
    render();
  });

  input.addEventListener('input', render);
  render();
})();

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
