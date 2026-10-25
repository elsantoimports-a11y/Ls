/* Asistente de reservas de Los Santos Studio.
   Interfaz guiada sin API de IA externa: recomienda desde el catálogo real y dirige al calendario oficial o WhatsApp. */
(function () {
  'use strict';
  var C = window.LS_CONFIG;
  if (!C || !C.catalog || !C.booking) return;
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var money = function (n) { return '$' + new Intl.NumberFormat('es-AR').format(n); };
  var activeServices = C.catalog.filter(function (s) { return s.active; });
  var chosen = null;
  var panelOpen = false;
  var launch = document.createElement('button');
  launch.id = 'ls-agent-launch';
  launch.type = 'button';
  launch.setAttribute('aria-controls', 'ls-agent-panel');
  launch.setAttribute('aria-expanded', 'false');
  launch.innerHTML = '<span class="ls-agent-icon" aria-hidden="true">✦</span><span>Asistente de reservas</span>';
  var panel = document.createElement('section');
  panel.id = 'ls-agent-panel';
  panel.setAttribute('aria-label', 'Asistente virtual de Los Santos Studio');
  panel.setAttribute('aria-live', 'polite');
  panel.innerHTML = '<div class="ls-agent-head"><div class="ls-agent-avatar" aria-hidden="true">LS</div><div class="ls-agent-head-copy"><strong>Los Santos Studio</strong><span>Asistente de reservas · Córdoba</span></div><button id="ls-agent-close" type="button" aria-label="Cerrar asistente">×</button></div><div class="ls-agent-messages" id="ls-agent-messages"></div><div class="ls-agent-options" id="ls-agent-options"></div><div class="ls-agent-foot">Te ayudo a elegir. El turno se confirma únicamente en el sistema oficial.</div>';
  document.body.appendChild(launch);
  document.body.appendChild(panel);
  var messages = $('#ls-agent-messages', panel);
  var options = $('#ls-agent-options', panel);
  var form = document.createElement('form');
  form.className = 'ls-agent-input';
  form.innerHTML = '<input id="ls-agent-text" type="text" maxlength="500" autocomplete="off" placeholder="Escribí qué necesitás…" aria-label="Tu consulta"><button type="submit" aria-label="Enviar mensaje">Enviar</button>';
  panel.insertBefore(form, panel.querySelector('.ls-agent-foot'));
  var textInput = $('#ls-agent-text', form);

  function addMessage(text, who) {
    var node = document.createElement('div');
    node.className = 'ls-agent-msg ' + who;
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  }
  function clearOptions() { options.textContent = ''; }
  function option(label, callback, style) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ls-agent-option' + (style ? ' ' + style : '');
    b.textContent = label;
    b.addEventListener('click', callback);
    options.appendChild(b);
    return b;
  }
  function priceLine(s) { return money(s.price) + (s.duration ? ' · ' + s.duration + ' min' : ''); }
  function waLink(service) {
    var message = 'Hola, Los Santos Studio. Quiero reservar un turno';
    if (service) message += ' para ' + service.name + ' (' + money(service.price) + ')';
    message += '. ¿Me ayudan a coordinar disponibilidad?';
    return 'https://wa.me/' + C.business.whatsapp + '?text=' + encodeURIComponent(message);
  }
  function externalAction(label, url, primary) {
    var a = document.createElement('a');
    a.className = 'ls-agent-option' + (primary ? ' primary' : '');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    options.appendChild(a);
  }
  function handleText(raw) {
    var text = String(raw || '').trim();
    if (!text) return;
    addMessage(text, 'user');
    textInput.value = '';
    clearOptions();
    var q = text.toLowerCase();
    if (C.ai && C.ai.endpoint) {
      askAI(text, q);
      return;
    }
    if (/\b(reserv|turno|agenda|horario|cita|disponib)/.test(q)) {
      addMessage('Vamos a llevarte a la reserva. Para consultar horarios reales, abrí la agenda oficial; si preferís coordinar, te conecto por WhatsApp.', 'agent');
      externalAction('Elegir día y horario', C.booking.url, true);
      externalAction('Coordinar por WhatsApp', waLink(chosen), false);
      option('Ver servicios', home);
      return;
    }
    if (/\b(precio|cu[aá]nto|vale|cuesta|cat[aá]logo|servicio)/.test(q)) { allPrices(); return; }
    if (/\b(facial|piel|limpieza|radiofrecuencia|microdermo)/.test(q)) { category('Tratamientos faciales'); return; }
    if (/\b(gema|cristal|dental|dientes|sonrisa)/.test(q)) { category('Gemas dentales'); return; }
    if (/\b(barba|ceja|perfilado)/.test(q)) { category('barba'); return; }
    if (/\b(corte|pelo|cabello|degradado|fade|barber)/.test(q)) { category('Barbería'); return; }
    if (/\b(hola|buenas|buenos|buen|info|ayuda|quiero)/.test(q)) {
      addMessage('Te puedo orientar con corte, barba, cejas, limpieza facial o gemas dentales. Decime qué servicio buscás o elegí una opción.', 'agent');
      home(); return;
    }
    addMessage('Quiero orientarte bien y no inventarte información. Elegí el servicio que te interesa o escribinos por WhatsApp para una consulta personalizada.', 'agent');
    option('Ver todos los servicios', allPrices);
    externalAction('Consultar por WhatsApp', waLink(chosen), true);
    option('Volver al inicio', home);
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); handleText(textInput.value); });

  function askAI(text, query) {
    addMessage('Estoy revisando tu consulta…', 'agent');
    var pending = messages.lastElementChild;
    textInput.disabled = true;
    form.querySelector('button').disabled = true;
    fetch(C.ai.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        services: activeServices.map(function (s) {
          return { name: s.name, category: s.category, price: s.price, duration: s.duration, description: s.description };
        })
      })
    }).then(function (response) {
      if (!response.ok) throw new Error('AI endpoint returned ' + response.status);
      return response.json();
    }).then(function (data) {
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Respuesta inválida');
      pending.textContent = data.reply.trim().slice(0, 1800);
      clearOptions();
      if (/\\b(reserv|turno|agenda|horario|cita|disponib)\\b/.test(query)) {
        externalAction('Elegir día y horario', C.booking.url, true);
        externalAction('Coordinar por WhatsApp', waLink(chosen), false);
      } else if (/\\b(precio|cu[aá]nto|vale|cuesta|servicio|corte|barba|ceja|facial|gema|cristal)\\b/.test(query)) {
        option('Ver catálogo y precios', allPrices);
        externalAction('Reservar por agenda', C.booking.url, true);
        externalAction('Consultar por WhatsApp', waLink(chosen), false);
      } else {
        option('Ver servicios', allPrices);
        externalAction('Reservar turno', C.booking.url, true);
        externalAction('WhatsApp', waLink(chosen), false);
      }
    }).catch(function () {
      pending.textContent = 'Ahora no pude responder con el asistente inteligente. Podés consultar el catálogo o escribirnos directamente por WhatsApp.';
      clearOptions();
      option('Ver todos los servicios', allPrices);
      externalAction('Consultar por WhatsApp', waLink(chosen), true);
    }).finally(function () {
      textInput.disabled = false;
      form.querySelector('button').disabled = false;
      textInput.focus();
    });
  }

  function home() {
    clearOptions();
    addMessage('¿Qué te gustaría hacer hoy?', 'agent');
    option('Corte y estilo', function () { category('Barbería'); });
    option('Barba y cejas', function () { category('barba'); });
    option('Cuidado facial', function () { category('Tratamientos faciales'); });
    option('Gemas dentales', function () { category('Gemas dentales'); });
    option('Ver todos los precios', allPrices);
    option('Quiero reservar ahora', reserveNow, 'primary');
  }
  function category(kind) {
    clearOptions();
    var list = activeServices.filter(function (s) {
      if (kind === 'barba') return /barba|cejas/i.test(s.name + ' ' + s.category);
      return (s.category || '').toLowerCase().indexOf(kind.toLowerCase()) !== -1;
    });
    if (!list.length) {
      addMessage('Para orientarte bien, podés ver el catálogo completo o escribirnos por WhatsApp.', 'agent');
      option('Ver todos los servicios', allPrices);
      option('Hablar por WhatsApp', function () { window.open(waLink(chosen), '_blank', 'noopener'); });
      return;
    }
    addMessage('Estas son las opciones disponibles en esa categoría. Elegí la que más se acerque a lo que buscás:', 'agent');
    list.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ls-agent-service';
      var info = document.createElement('span');
      var title = document.createElement('strong'); title.textContent = s.name;
      var detail = document.createElement('small'); detail.textContent = s.description || priceLine(s);
      info.appendChild(title); info.appendChild(detail);
      var cost = document.createElement('b'); cost.textContent = priceLine(s);
      b.appendChild(info); b.appendChild(cost);
      b.addEventListener('click', function () { chooseService(s); });
      options.appendChild(b);
    });
    option('Volver al inicio', home);
  }
  function allPrices() {
    clearOptions();
    addMessage('Catálogo vigente publicado en la web. Elegí un servicio para ver la acción de reserva.', 'agent');
    activeServices.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ls-agent-service';
      var info = document.createElement('span');
      var title = document.createElement('strong'); title.textContent = s.name;
      var detail = document.createElement('small'); detail.textContent = s.category + (s.duration ? ' · ' + s.duration + ' min' : '');
      info.appendChild(title); info.appendChild(detail);
      var cost = document.createElement('b'); cost.textContent = money(s.price);
      b.appendChild(info); b.appendChild(cost);
      b.addEventListener('click', function () { chooseService(s); });
      options.appendChild(b);
    });
    option('Volver al inicio', home);
  }
  function chooseService(s) {
    chosen = s;
    clearOptions();
    addMessage(s.name + '\n' + priceLine(s) + '\n\n' + (s.description || 'Servicio de Los Santos Studio.'), 'agent');
    addMessage('¿Seguimos con la reserva? Podés elegir un horario en la agenda oficial o consultarnos por WhatsApp para coordinar.', 'agent');
    externalAction('Elegir día y horario', C.booking.url, true);
    externalAction('Coordinar por WhatsApp', waLink(s), false);
    option('Elegir otro servicio', home);
  }
  function reserveNow() {
    clearOptions();
    addMessage('Perfecto. Abrí la agenda oficial para ver los horarios realmente disponibles. El turno queda confirmado cuando completás el proceso de reserva.', 'agent');
    externalAction('Abrir agenda de reservas', C.booking.url, true);
    externalAction('Necesito ayuda por WhatsApp', waLink(chosen), false);
    option('Ver servicios antes', home);
  }
  function openPanel() {
    panelOpen = true;
    panel.setAttribute('data-open', 'true');
    launch.setAttribute('aria-expanded', 'true');
    launch.querySelector('span:last-child').textContent = 'Cerrar asistente';
    if (!messages.children.length) {
      addMessage('Hola. Soy el asistente virtual de Los Santos Studio. Te ayudo a encontrar el servicio indicado y avanzar a la reserva.', 'agent');
      home();
    }
    $('#ls-agent-close', panel).focus();
  }
  function closePanel() {
    panelOpen = false;
    panel.removeAttribute('data-open');
    launch.setAttribute('aria-expanded', 'false');
    launch.querySelector('span:last-child').textContent = 'Asistente de reservas';
    launch.focus();
  }
  launch.addEventListener('click', function () { panelOpen ? closePanel() : openPanel(); });
  $('#ls-agent-close', panel).addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panelOpen) closePanel(); });
})();