/**
 * LOS SANTOS STUDIO — Google Calendar booking endpoint
 * Deploy as a versioned Apps Script web app, execute as the calendar owner.
 * Do not connect the public site until deployment and end-to-end tests pass.
 */
const LSOS_CONFIG = {
  CALENDAR_ID: '', // Empty = primary calendar. Use a dedicated studio calendar ID if preferred.
  TIME_ZONE: 'America/Argentina/Cordoba',
  CLOSED_WEEKDAY: 0, // Sunday
  OPEN_WINDOWS: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '20:00' }],
  SLOT_STEP_MINUTES: 15,
  MIN_ADVANCE_MINUTES: 30,
  MAX_DAYS_AHEAD: 60
};

const LSOS_SERVICES = {
  'Corte De Autor 🇦🇷 ✂️': { price: 23000, duration: 40 },
  'Atención - Estándar - Corte y Cejas': { price: 27000, duration: 45 },
  'Atención - Ejecutiva - Corte / Cejas / Barba 🏅': { price: 40000, duration: 40 },
  'Atención - Deluxe 💎': { price: 70000, duration: 100 },
  'Arreglo de Barba Express': { price: 15000, duration: 20 },
  'Ritual de Barba (Toallas Calientes)': { price: 18000, duration: 25 },
  'Perfilado y Diseño de Cejas': { price: 5000, duration: 20 },
  'Limpieza Facial Deluxe': { price: 35000, duration: 30 },
  'Limpieza Facial Express': { price: 25000, duration: 20 },
  'Cristales Simples 💠': { price: 15000, duration: 15 },
  'Cristales con Forma 💠': { price: 22000, duration: 15 },
  'Combinaciones de Cristales 💎🎁': { price: 30000, duration: 20 }
};

function lsCalendar_() {
  const calendar = LSOS_CONFIG.CALENDAR_ID
    ? CalendarApp.getCalendarById(LSOS_CONFIG.CALENDAR_ID)
    : CalendarApp.getDefaultCalendar();
  if (!calendar) throw new Error('No se encontró el calendario configurado.');
  return calendar;
}

function lsJson_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function lsOutput_(payload, callback) {
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return lsJson_(payload);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'health') {
      return lsOutput_({ ok: true, service: 'Los Santos Studio Calendar', mode: 'read-only health check' }, p.callback);
    }
    if (p.action !== 'slots') return lsOutput_({ ok: false, error: 'Acción no válida.' }, p.callback);
    const date = lsParseDate_(p.date);
    const service = LSOS_SERVICES[p.service];
    if (!service) throw new Error('Seleccioná un servicio válido.');
    lsValidateDate_(date);
    const calendar = lsCalendar_();
    const bounds = lsDayBounds_(p.date);
    const events = calendar.getEvents(bounds.start, bounds.end);
    const slots = [];
    LSOS_CONFIG.OPEN_WINDOWS.forEach(window => {
      let minute = lsMinute_(window.start);
      const finish = lsMinute_(window.end);
      while (minute + service.duration <= finish) {
        const time = lsClock_(minute);
        const start = lsAt_(p.date, time);
        const end = new Date(start.getTime() + service.duration * 60000);
        const futureEnough = start.getTime() >= Date.now() + LSOS_CONFIG.MIN_ADVANCE_MINUTES * 60000;
        const inBounds = lsInsideWindow_(minute, service.duration);
        const busy = events.some(ev => ev.isAllDayEvent() || (ev.getStartTime() < end && ev.getEndTime() > start));
        if (futureEnough && inBounds && !busy) slots.push({ time: time, duration: service.duration });
        minute += LSOS_CONFIG.SLOT_STEP_MINUTES;
      }
    });
    return lsOutput_({ ok: true, date: p.date, service: p.service, slots: slots }, p.callback);
  } catch (err) {
    return lsOutput_({ ok: false, error: String(err.message || 'No se pudo consultar la agenda.') }, p.callback);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 10000) throw new Error('Solicitud vacía o demasiado grande.');
    const p = JSON.parse(raw);
    const name = lsText_(p.name, 2, 100, 'Nombre');
    const phone = lsText_(p.phone, 7, 30, 'WhatsApp');
    const notes = lsText_(p.notes || '', 0, 1000, 'Notas');
    const serviceName = lsText_(p.service, 1, 100, 'Servicio');
    const service = LSOS_SERVICES[serviceName];
    if (!service) throw new Error('Seleccioná un servicio válido.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.date || ''))) throw new Error('Fecha inválida.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p.time || ''))) throw new Error('Horario inválido.');
    const date = lsParseDate_(p.date);
    lsValidateDate_(date);
    const start = lsAt_(p.date, p.time);
    const end = new Date(start.getTime() + service.duration * 60000);
    if (start.getTime() < Date.now() + LSOS_CONFIG.MIN_ADVANCE_MINUTES * 60000) throw new Error('Ese horario ya no admite reservas. Elegí otro.');
    if (!lsInsideWindow_(lsMinute_(p.time), service.duration)) throw new Error('El servicio termina fuera del horario de atención.');
    if (!lock.tryLock(15000)) throw new Error('La agenda está procesando otra reserva. Intentá nuevamente.');
    const calendar = lsCalendar_();
    const conflicts = calendar.getEvents(start, end).some(ev => ev.isAllDayEvent() || (ev.getStartTime() < end && ev.getEndTime() > start));
    if (conflicts) throw new Error('Ese horario acaba de ocuparse. Consultá otro horario.');
    const title = 'LS Studio · ' + serviceName + ' · ' + name;
    const description = [
      'Reserva solicitada desde la web de Los Santos Studio',
      'Cliente: ' + name,
      'WhatsApp: ' + phone,
      'Servicio: ' + serviceName,
      'Precio de referencia: ARS ' + service.price,
      'Notas: ' + (notes || 'Sin notas'),
      'Estado: RESERVA REGISTRADA — confirmar con el cliente'
    ].join('\n');
    const event = calendar.createEvent(title, start, end, { description: description });
    event.setColor(CalendarApp.EventColor.PALE_YELLOW);
    return lsJson_({ ok: true, status: 'pending_confirmation', message: 'Solicitud registrada; falta confirmar con el cliente.', eventId: event.getId() });
  } catch (err) {
    return lsJson_({ ok: false, error: String(err.message || 'No se pudo registrar la solicitud.') });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function lsParseDate_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) throw new Error('Fecha inválida.');
  const parts = value.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  if (date.getFullYear() !== parts[0] || date.getMonth() !== parts[1] - 1 || date.getDate() !== parts[2]) throw new Error('Fecha inexistente.');
  return date;
}

function lsValidateDate_(date) {
  if (date.getDay() === LSOS_CONFIG.CLOSED_WEEKDAY) throw new Error('El estudio no atiende los domingos.');
  const today = new Date();
  const todayLocal = new Date(Utilities.formatDate(today, LSOS_CONFIG.TIME_ZONE, 'yyyy/MM/dd') + ' 12:00:00');
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const days = Math.floor((target.getTime() - todayLocal.getTime()) / 86400000);
  if (days < 0) throw new Error('La fecha elegida ya pasó.');
  if (days > LSOS_CONFIG.MAX_DAYS_AHEAD) throw new Error('Podés reservar con hasta ' + LSOS_CONFIG.MAX_DAYS_AHEAD + ' días de anticipación.');
}

function lsDayBounds_(dateText) {
  return { start: lsAt_(dateText, '00:00'), end: lsAt_(dateText, '23:59') };
}

function lsAt_(dateText, timeText) {
  // Argentina time is UTC-03:00; the configured calendar timezone is used for display.
  return new Date(dateText + 'T' + timeText + ':00-03:00');
}

function lsMinute_(clock) {
  const p = clock.split(':').map(Number);
  return p[0] * 60 + p[1];
}

function lsClock_(minute) {
  return String(Math.floor(minute / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0');
}

function lsInsideWindow_(minute, duration) {
  return LSOS_CONFIG.OPEN_WINDOWS.some(w => minute >= lsMinute_(w.start) && minute + duration <= lsMinute_(w.end));
}

function lsText_(value, min, max, label) {
  const text = String(value == null ? '' : value).trim();
  if (text.length < min || text.length > max) throw new Error(label + ': revisá el dato ingresado.');
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}
