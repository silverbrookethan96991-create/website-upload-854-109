(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle('is-active', idx === current);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle('is-active', idx === current);
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            show(0);
            start();
        }

        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
            var section = scope.closest('section') || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
            var empty = section.querySelector('[data-empty-result]');

            function matchCard(card) {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }
                return selects.every(function (select) {
                    var field = select.getAttribute('data-filter-select');
                    var value = select.value;
                    if (!value) {
                        return true;
                    }
                    return (card.getAttribute('data-' + field) || '').indexOf(value) !== -1;
                });
            }

            function applyFilter() {
                var shown = 0;
                cards.forEach(function (card) {
                    var ok = matchCard(card);
                    card.hidden = !ok;
                    if (ok) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilter);
            });
        });

        var video = document.querySelector('#movie-player');
        var playButton = document.querySelector('[data-play-button]');
        if (video) {
            var stream = video.getAttribute('data-stream');
            var initialized = false;
            var hls;

            function setupVideo() {
                if (initialized || !stream) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function playVideo() {
                setupVideo();
                if (playButton) {
                    playButton.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (playButton) {
                            playButton.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (playButton) {
                playButton.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                if (playButton) {
                    playButton.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (playButton && video.currentTime === 0) {
                    playButton.classList.remove('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                setupVideo();
            });
        }
    });
})();