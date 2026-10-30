/* Brothers Barber Shop · interfaz con control moderno de slots en tiempo real */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');
  const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  let toastT;
  const toast = m => { const t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); };
  const restaurarBoton = () => { const b = $('#submit-booking-btn'); if (b) { b.disabled = false; b.textContent = 'Confirmar cita'; } };

  /* ---------- Alertas del formulario ---------- */
  window.mostrarAlerta = (msg, tipo = 'error') => {
    const box = $('#form-alert'); if (!box) return;
    $('#form-alert-text').textContent = msg;
    box.className = 'show ' + (tipo === 'error' ? 'error' : 'info');
    restaurarBoton();
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  window.ocultarAlerta = () => { const b = $('#form-alert'); if (b) b.className = ''; };

  /* ---------- Pasos ---------- */
  const ir = (step, scroll = true) => {
    $$('.step-panel').forEach(p => p.classList.toggle('show', p.id === 'step-' + step));
    $$('.st').forEach((s, i) => { s.classList.toggle('on', i + 1 === step); s.classList.toggle('done', i + 1 < step); });
    $('.stepper')?.style.setProperty('--p', (step - 1) / 3);
    if (step === 4) window.actualizarResumen();
    if (scroll) $('.book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  window.nextStep = step => ir(step);
  window.prevStep = s => window.nextStep(s);

  /* ---------- Servicios ---------- */
  window.obtenerServiciosSeleccionados = () => {
    const c = $$('input[name="service"]:checked');
    return { nombres: c.map(x => x.value).join(', '), total: c.reduce((s, x) => s + parseInt(x.dataset.price), 0) };
  };
  const actualizarTotal = () => {
    const c = $$('input[name="service"]:checked'), s = window.obtenerServiciosSeleccionados();
    $('#tb-count').textContent = c.length + (c.length === 1 ? ' servicio' : ' servicios');
    $('#tb-total').textContent = `$${s.total}.00`;
  };
  $$('input[name="service"]').forEach(i => i.addEventListener('change', actualizarTotal));
  window.validarServiciosYavanzar = step => {
    if (!$$('input[name="service"]:checked').length) return window.mostrarAlerta('⚠️ Por favor, selecciona al menos un servicio para continuar.');
    window.ocultarAlerta(); window.nextStep(step);
  };
  window.actualizarResumen = () => {
    const s = window.obtenerServiciosSeleccionados();
    $('#summary-services').textContent = s.nombres;
    $('#summary-datetime').textContent = `${$('#booking-date').value} a las ${$('#booking-time').value}`;
    $('#summary-price').textContent = `$${s.total}.00`;
  };

  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    const chk = $$('input[name="service"]').find(i => i.value === b.dataset.pick);
    if (chk) { chk.checked = true; actualizarTotal(); }
    window.nextStep(1); toast('✓ ' + b.dataset.pick + ' agregado');
    $('#reservas').scrollIntoView({ behavior: 'smooth' });
  }));
  window.selectBarber = nombre => {
    const r = $$('input[name="barber"]').find(i => i.value === nombre); if (r) r.checked = true;
    $('#reservas').scrollIntoView({ behavior: 'smooth' }); toast('✓ ' + nombre + ' seleccionado');
  };
  $$('[data-barber]').forEach(b => b.addEventListener('click', () => window.selectBarber(b.dataset.barber)));

  /* ---------- Fecha y horarios ---------- */
  const fecha = $('#booking-date'), hora = $('#booking-time');
  if (fecha) fecha.min = hoy();

  fecha?.addEventListener('change', () => { 
    if (fecha.value && fecha.value < hoy()) { fecha.value = hoy(); toast('Elige una fecha desde hoy'); } 
    window.ocultarAlerta();
    if (window.actualizarSlotsOcupados) window.actualizarSlotsOcupados();
  });

  $$('.slot').forEach(s => s.addEventListener('click', () => {
    if (s.disabled) return;
    $$('.slot').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
    s.classList.add('sel'); s.setAttribute('aria-pressed', 'true'); hora.value = s.dataset.v; window.ocultarAlerta();
  }));

  /* ---------- Envío, reinicio ---------- */
  $('#booking-form')?.addEventListener('submit', () => { const b = $('#submit-booking-btn'); if (b) { b.disabled = true; b.textContent = 'Confirmando…'; } });
  window.resetBooking = () => {
    $('#booking-form').reset(); hora.value = ''; $$('.slot').forEach(s => s.classList.remove('sel'));
    $('#success-screen').classList.add('hidden'); $('#booking-form').classList.remove('hidden'); restaurarBoton(); actualizarTotal(); window.nextStep(1);
    if (window.actualizarSlotsOcupados) window.actualizarSlotsOcupados();
  };

  /* ---------- Efectos de página ---------- */
  const bg = $('.hero-bg');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $('.header').classList.toggle('scrolled', y > 30);
    $('#progress').style.width = (h > 0 ? y / h * 100 : 0) + '%';
    if (bg && y < innerHeight) bg.style.transform = `translateY(${y * .18}px)`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#menu-btn')?.addEventListener('click', () => $('#mobile-menu').classList.toggle('open'));
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => $('#mobile-menu').classList.remove('open')));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('[data-reveal]').forEach((el, k) => { el.style.setProperty('--d', (k % 3) * .1 + 's'); io.observe(el); });
  if (matchMedia('(pointer:fine)').matches) $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`; });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });
  actualizarTotal(); ir(1, false);
})();