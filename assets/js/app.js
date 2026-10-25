/* Los Santos Studio — comportamiento de la landing. Los datos viven en config.js. */
(function () {
  'use strict';
  var C = window.LS_CONFIG;
  if (!C) { return; }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function money(n) { return 'ARS ' + new Intl.NumberFormat('es-AR').format(n); }

  /* ---------- Medición (GA4, solo si hay ID configurado) ---------- */
  var debug = /[?&]lsdebug=1/.test(location.search);
  var gaId = C.analytics && C.analytics.ga4MeasurementId;
  if (gaId && /^G-[A-Z0-9]+$/.test(gaId)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(s);
  }
  // Nunca se envían datos personales: solo nombre del evento, ubicación del botón y servicio/precio.
  function track(name, params) {
    if (debug) { console.info('[LS evento]', name, params || {}); }
    if (typeof window.gtag === 'function') { window.gtag('event', name, params || {}); }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-track]') : null;
    if (t) { track(t.getAttribute('data-track'), { where: t.getAttribute('data-where') || '' }); }
  });

  /* ---------- Estado ---------- */
  var services = (C.catalog || []).filter(function (s) { return s.active; });
  var selected = null;

  /* ---------- WhatsApp ---------- */
  function waHref() {
    var msg = 'Hola, Los Santos Studio. Quiero consultar por un turno';
    if (selected) { msg += ' para: ' + selected.name; }
    return 'https://wa.me/' + C.business.whatsapp + '?text=' + encodeURIComponent(msg + '.');
  }
  function refreshWa() { $$('[data-wa]').forEach(function (a) { a.href = waHref(); }); }

  /* ---------- Catálogo ---------- */
  function renderCatalog() {
    var root = $('#catalog');
    if (!root) { return; }
    var groups = [];
    services.forEach(function (s) {
      var g = groups.filter(function (x) { return x.name === s.category; })[0];
      if (!g) { g = { name: s.category, items: [] }; groups.push(g); }
      g.items.push(s);
    });
    var ns = $('noscript', root);
    if (ns) { ns.remove(); }
    groups.forEach(function (g) {
      var cat = el('div', 'cat');
      cat.appendChild(el('h3', 'cat-title', g.name));
      g.items.forEach(function (s) {
        var row = el('div', 'svc');
        row.setAttribute('data-id', s.id);
        row.setAttribute('data-selected', 'false');
        var info = el('div');
        var h = el('h3', null, s.name);
        if (s.duration) { h.appendChild(el('span', 'dur', s.duration + ' min')); }
        info.appendChild(h);
        info.appendChild(el('p', null, s.description));
        var meta = el('div', 'svc-meta');
        if (s.duration) { meta.appendChild(el('span', 'svc-meta-item', '◷ ' + (s.duration >= 60 ? Math.floor(s.duration / 60) + ' h' + (s.duration % 60 ? ' ' + (s.duration % 60) + ' min' : '') : s.duration + ' min'))); }
        if (s.depositPercent) { meta.appendChild(el('span', 'svc-meta-item svc-deposit', 'Seña ' + s.depositPercent + '% · ' + money(Math.round(s.price * s.depositPercent / 100)))); }
        if (s.extras) { meta.appendChild(el('span', 'svc-meta-item', s.extras + ' adicionales')); }
        if (meta.children.length) { info.appendChild(meta); }
        var price = el('div', 'price', money(s.price));
        var btn = el('button', 'btn small', 'Elegir servicio');
        btn.type = 'button';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Elegir servicio: ' + s.name + ', ' + money(s.price));
        btn.addEventListener('click', function () { choose(s.id); });
        row.appendChild(info); row.appendChild(price); row.appendChild(btn);
        cat.appendChild(row);
      });
      root.appendChild(cat);
    });
  }

  function choose(id) {
    selected = services.filter(function (s) { return s.id === id; })[0] || null;
    $$('.svc').forEach(function (r) {
      var on = selected && r.getAttribute('data-id') === selected.id;
      r.setAttribute('data-selected', on ? 'true' : 'false');
      var b = $('button', r);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Elegido' : 'Elegir servicio';
    });
    if (selected) {
      $('#chosen-name').textContent = selected.name + ' · ' + money(selected.price);
      var note = $('#chosen-note');
      note.textContent = 'Seña del ' + (selected.depositPercent || 90) + '%: ' + money(Math.round(selected.price * (selected.depositPercent || 90) / 100)) + '. Google Calendar no recibe esta elección automáticamente: indicá el servicio al reservar o confirmalo por ';
      var a = el('a', null, 'WhatsApp');
      a.href = waHref(); a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('data-track', 'whatsapp_click'); a.setAttribute('data-where', 'chosen_note');
      note.appendChild(a); note.appendChild(document.createTextNode('.'));
      track('select_service', { service_id: selected.id, price: selected.price, currency: 'ARS' });
    }
    refreshWa();
    var target = $('#reservar');
    if (target) { target.scrollIntoView(); var h2 = $('#h-res'); if (h2) { h2.setAttribute('tabindex', '-1'); h2.focus({ preventScroll: true }); } }
  }

  /* ---------- Horarios (desde config) ---------- */
  function renderHours() {
    var ul = $('#hours');
    if (!ul || !C.business.hours) { return; }
    ul.textContent = '';
    C.business.hours.forEach(function (h) {
      var li = el('li');
      li.appendChild(el('span', null, h.days));
      li.appendChild(el('span', null, h.time));
      ul.appendChild(li);
    });
  }

  /* ---------- Calendario ---------- */
  var mobileMq = window.matchMedia('(max-width:680px)');
  var iframeLoaded = false, loading = false;

  function showCalAlert() { var a = $('#cal-alert'); if (a) { a.hidden = false; } }

  function loadCalendar() {
    if (iframeLoaded || loading || mobileMq.matches) { return; }
    loading = true;
    var box = $('#cal-box');
    var f = document.createElement('iframe');
    f.title = 'Calendario de reservas de Los Santos Studio';
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    var timer = setTimeout(showCalAlert, (C.booking.loadTimeoutSeconds || 12) * 1000);
    f.addEventListener('load', function () {
      clearTimeout(timer);
      iframeLoaded = true;
      var ph = $('#cal-ph'); if (ph) { ph.remove(); }
      track('calendar_loaded', {});
    });
    f.src = C.booking.url;
    box.appendChild(f);
  }

  function wireCalendarLinks() {
    $('#cal-alt').href = C.booking.url;
    $('#cal-new').href = C.booking.url;
    var btn = $('#open-cal');
    function sync() {
      if (mobileMq.matches) {
        // En móvil el calendario embebido es incómodo: se abre el flujo oficial directamente.
        btn.href = C.booking.url; btn.target = '_blank'; btn.rel = 'noopener';
      } else {
        btn.href = '#calendario'; btn.removeAttribute('target'); btn.removeAttribute('rel');
        if (!iframeLoaded) { loadCalendar(); }
      }
    }
    btn.addEventListener('click', function (e) {
      if (!mobileMq.matches) { e.preventDefault(); loadCalendar(); $('#calendario').scrollIntoView(); }
    });
    if (mobileMq.addEventListener) { mobileMq.addEventListener('change', sync); }
    sync();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { loadCalendar(); io.disconnect(); }
      }, { rootMargin: '600px 0px' });
      io.observe($('#reservar'));
    } else { loadCalendar(); }
  }

  /* ---------- Ficha y reseñas de Google ---------- */
  function renderReviews() {
    var R = C.reviews;
    if (!R) { return; }
    var section = $('#resenas');
    if (!section) { return; }
    var open = $('#reviews-open-google');
    if (open && R.sourceUrl) { open.href = R.sourceUrl; }
    var write = $('#reviews-write-google');
    if (write && R.writeUrl) { write.href = R.writeUrl; }

    // Fallback: conservar los testimonios previamente aprobados cuando Places API no está configurada.
    var ratingBox = $('#google-rating-live');
    var score = $('#google-rating-score');
    var count = $('#google-rating-count');
    if (ratingBox && score && typeof R.rating === 'number') {
      score.textContent = R.rating.toFixed(1) + ' ';
      var ratingStars = el('span', null, '★★★★★');
      ratingStars.setAttribute('aria-label', 'estrellas de Google');
      score.appendChild(ratingStars);
      count.textContent = 'Calificación pública en Google · ' + (R.reviewCount || 0) + ' reseñas';
      ratingBox.hidden = false;
    }
    var list = $('#google-reviews-live');
    if (list && Array.isArray(R.items) && R.items.length) {
      list.textContent = '';
      R.items.forEach(function (review) {
        var card = el('article', 'google-review-card');
        var top = el('div', 'google-review-top');
        top.appendChild(el('strong', 'google-review-author', review.author || 'Cliente'));
        top.appendChild(el('span', 'google-review-time', review.date || ''));
        card.appendChild(top);
        card.appendChild(el('div', 'google-review-stars', '★★★★★'));
        card.appendChild(el('p', 'google-review-text', '“' + (review.text || '') + '”'));
        if (R.sourceUrl) {
          var source = el('a', 'google-review-attribution', 'Consultar ficha pública');
          source.href = R.sourceUrl;
          source.target = '_blank';
          source.rel = 'noopener';
          card.appendChild(source);
        }
        list.appendChild(card);
      });
    }

    // Si existe clave de Places, se intenta actualizar con la ficha en vivo.
    if (!R.placesApiKey || !R.placeId) { return; }
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(R.placesApiKey) + '&libraries=places&v=weekly';
    script.async = true;
    script.onerror = function () { console.error('No se pudo cargar Google Places API.'); };
    script.onload = function () {
      if (!window.google || !google.maps || !google.maps.places || !google.maps.places.Place) { return; }
      var place = new google.maps.places.Place({ id: R.placeId, requestedLanguage: 'es' });
      place.fetchFields({ fields: ['displayName', 'rating', 'userRatingCount', 'reviews', 'googleMapsURI'] })
        .then(function () {
          if (ratingBox && typeof place.rating === 'number') {
            score.textContent = place.rating.toFixed(1) + ' ';
            var liveStars = el('span', null, '★★★★★');
            liveStars.setAttribute('aria-label', 'estrellas de Google');
            score.appendChild(liveStars);
            count.textContent = 'Calificación en Google · ' + (place.userRatingCount || 0) + ' reseñas';
            ratingBox.hidden = false;
          }
          if (!list || !Array.isArray(place.reviews) || !place.reviews.length) { return; }
          list.textContent = '';
          place.reviews.forEach(function (review) {
            var card = el('article', 'google-review-card');
            var top = el('div', 'google-review-top');
            var author = review.authorAttribution || {};
            top.appendChild(el('strong', 'google-review-author', author.displayName || 'Cliente de Google'));
            top.appendChild(el('span', 'google-review-time', review.relativePublishTimeDescription || ''));
            card.appendChild(top);
            card.appendChild(el('div', 'google-review-stars', '★'.repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))));
            if (review.text && review.text.text) { card.appendChild(el('p', 'google-review-text', '“' + review.text.text + '”')); }
            if (author.uri) {
              var attribution = el('a', 'google-review-attribution', 'Ver perfil en Google');
              attribution.href = author.uri; attribution.target = '_blank'; attribution.rel = 'noopener';
              card.appendChild(attribution);
            }
            list.appendChild(card);
          });
        })
        .catch(function (error) { console.error('No se pudieron cargar las reseñas de Google.', error); });
    };
    document.head.appendChild(script);
  }

  /* ---------- Partículas interactivas del hero ---------- */
  function initHeroParticles() {
    var canvas = $('#hero-particles');
    var hero = $('.hero');
    if (!canvas || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
    var ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    var particles = [], width = 0, height = 0, dpr = 1, pointer = { x: -9999, y: -9999 };
    var colors = ['198,165,106', '224,197,142', '151,31,38', '190,46,50'];
    var maxParticles = Math.min(88, Math.max(34, Math.floor(window.innerWidth / 16)));
    function resize() {
      var rect = hero.getBoundingClientRect();
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxParticles = Math.min(88, Math.max(30, Math.floor(width / 17)));
      while (particles.length < maxParticles) {
        particles.push({
          x: Math.random() * width, y: Math.random() * height,
          vx: (Math.random() - .5) * .28, vy: -.12 - Math.random() * .34,
          r: .7 + Math.random() * 2.1, a: .18 + Math.random() * .55,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2, drop: Math.random() > .7
        });
      }
      particles.length = maxParticles;
    }
    function movePointer(e) {
      var rect = hero.getBoundingClientRect();
      pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top;
    }
    hero.addEventListener('pointermove', movePointer, { passive: true });
    hero.addEventListener('pointerleave', function () { pointer.x = -9999; pointer.y = -9999; });
    window.addEventListener('resize', resize, { passive: true });
    resize();
    var frame;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(function (p) {
        p.phase += .012;
        p.x += p.vx + Math.sin(p.phase) * .11;
        p.y += p.vy;
        var dx = p.x - pointer.x, dy = p.y - pointer.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 115 && dist > 0) { p.x += dx / dist * .45; p.y += dy / dist * .45; }
        if (p.y < -12) { p.y = height + 8; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 8;
        if (p.x > width + 10) p.x = -8;
        var pulse = .72 + Math.sin(p.phase * 1.8) * .22;
        ctx.beginPath();
        if (p.drop) {
          ctx.ellipse(p.x, p.y, p.r * .62, p.r * 1.6, -.28, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        ctx.fillStyle = 'rgba(' + p.color + ',' + (p.a * pulse) + ')';
        ctx.shadowBlur = p.r > 1.7 ? 13 : 5;
        ctx.shadowColor = 'rgba(' + p.color + ',.55)';
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j], dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 90 * 90) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(198,165,106,' + (0.07 * (1 - Math.sqrt(d2) / 90)) + ')';
            ctx.lineWidth = .6; ctx.stroke();
          }
        }
      }
      frame = window.requestAnimationFrame(draw);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { window.cancelAnimationFrame(frame); }
      else { window.cancelAnimationFrame(frame); frame = window.requestAnimationFrame(draw); }
    });
    frame = window.requestAnimationFrame(draw);
  }

  /* ---------- Barra móvil: se oculta mientras se ve la sección de reserva ---------- */
  function wireBar() {
    var bar = $('#mbar'), target = $('#reservar');
    if (!bar || !target || !('IntersectionObserver' in window)) { return; }
    new IntersectionObserver(function (en) {
      var hide = en[0].isIntersecting;
      bar.setAttribute('data-hidden', hide ? 'true' : 'false');
      if (hide) { bar.setAttribute('inert', ''); bar.setAttribute('aria-hidden', 'true'); }
      else { bar.removeAttribute('inert'); bar.removeAttribute('aria-hidden'); }
    }, { threshold: 0.05 }).observe(target);
  }

  /* ---------- Init ---------- */
  var y = $('#year'); if (y) { y.textContent = new Date().getFullYear(); }
  $('#maps').href = C.business.mapsUrl;
  $('#directions').href = C.business.directionsUrl;
  (function () {
    var box = $('#map-box'); if (!box) { return; }
    function load() {
      var f = document.createElement('iframe');
      f.title = 'Mapa de Los Santos Studio en Google Maps';
      f.loading = 'lazy';
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      f.addEventListener('load', function () { var ph = $('#map-ph'); if (ph) { ph.remove(); } });
      f.src = C.business.mapsEmbedUrl;
      box.appendChild(f);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '400px 0px' });
      io.observe(box);
    } else { load(); }
  })();
  renderCatalog();
  renderHours();
  renderReviews();
  initHeroParticles();
  (function () {
    var sr = $('#see-reviews');
    if (sr && C.reviews && C.reviews.sourceUrl) { sr.href = C.reviews.sourceUrl; sr.hidden = false; }
    var a = $('#write-review');
    if (a && C.reviews && C.reviews.writeUrl) { a.href = C.reviews.writeUrl; a.hidden = false; }
  })();
  refreshWa();
  wireCalendarLinks();
  wireBar();
})();
