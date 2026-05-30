(function () {
    var header = document.querySelector('[data-header]');
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    function startSlides() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(slideTimer);
        slideTimer = setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startSlides();
        });
    });

    showSlide(0);
    startSlides();

    document.querySelectorAll('[data-play-button]').forEach(function (button) {
        button.addEventListener('click', function () {
            var player = document.querySelector('[data-player]');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var start = player.querySelector('[data-player-start]');
                if (start) {
                    start.click();
                }
            }
        });
    });

    function initializePlayer(player) {
        var video = player.querySelector('video');
        var source = player.getAttribute('data-source');
        var start = player.querySelector('[data-player-start]');
        var playButton = player.querySelector('[data-player-play]');
        var muteButton = player.querySelector('[data-player-mute]');
        var fullButton = player.querySelector('[data-player-fullscreen]');
        var hls = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function setPlaying(isPlaying) {
            player.classList.toggle('is-playing', isPlaying);
            if (playButton) {
                playButton.textContent = isPlaying ? '暂停' : '播放';
            }
        }

        function loadVideo(shouldPlay) {
            if (!loaded) {
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (shouldPlay) {
                            video.play().catch(function () {});
                        }
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    if (shouldPlay) {
                        video.play().catch(function () {});
                    }
                }
            } else if (shouldPlay) {
                video.play().catch(function () {});
            }
        }

        function togglePlayback() {
            loadVideo(true);
            if (!video.paused && !video.ended) {
                video.pause();
            } else {
                video.play().catch(function () {});
            }
        }

        if (start) {
            start.addEventListener('click', function () {
                loadVideo(true);
            });
        }

        if (playButton) {
            playButton.addEventListener('click', togglePlayback);
        }

        video.addEventListener('click', togglePlayback);
        video.addEventListener('play', function () {
            setPlaying(true);
        });
        video.addEventListener('pause', function () {
            setPlaying(false);
        });
        video.addEventListener('ended', function () {
            setPlaying(false);
        });

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (fullButton) {
            fullButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(function () {});
                } else {
                    player.requestFullscreen().catch(function () {});
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(initializePlayer);

    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderSearch() {
        var resultGrid = document.querySelector('[data-search-results]');
        var state = document.querySelector('[data-search-state]');
        var input = document.querySelector('[data-search-input]');
        if (!resultGrid || !state || !window.SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        if (input) {
            input.value = query;
        }

        if (!query) {
            state.textContent = '输入片名、类型、地区或年份即可搜索。';
            resultGrid.innerHTML = '';
            return;
        }

        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var results = window.SEARCH_INDEX.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
            return terms.every(function (term) {
                return text.indexOf(term) !== -1;
            });
        }).slice(0, 120);

        state.textContent = '“' + query + '” 的相关结果';
        if (!results.length) {
            resultGrid.innerHTML = '<div class="search-state">没有找到匹配影片。</div>';
            return;
        }

        resultGrid.innerHTML = results.map(function (movie) {
            var tags = String(movie.tags || '').split(',').filter(Boolean).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHTML(tag) + '</span>';
            }).join('');
            return '<a class="movie-card" href="./' + escapeHTML(movie.url) + '">' +
                '<div class="movie-cover">' +
                '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
                '<span class="cover-badge">' + escapeHTML(movie.region) + '</span>' +
                '</div>' +
                '<div class="movie-card-body">' +
                '<h2>' + escapeHTML(movie.title) + '</h2>' +
                '<p>' + escapeHTML(movie.oneLine) + '</p>' +
                '<div class="movie-meta"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.type) + '</span></div>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</a>';
        }).join('');
    }

    renderSearch();
})();
