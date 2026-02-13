/* global MUSICALA_CATALOG */
(function () {
  'use strict';

  /* =============================================================================
     Musicala · Catálogo (app.js) — PRO++ v1.2
     - Robustez extra + accesibilidad (modal focus trap)
     - Topnav active section (aria-current) + smooth scroll
     - Fix: collectAllModalitiesFromData() (details.modalities)
     - Cards más limpias: note SOLO en modal (no en card)
  ============================================================================= */

  /* =========================
     CFG + helpers
  ========================= */
  const CFG = (window.MUSICALA_CATALOG && window.MUSICALA_CATALOG.meta) || {};
  const MOD_LABEL =
    CFG.modLabel || {
      sede: 'En sede',
      hogar: 'A domicilio',
      virtual: 'Virtual en vivo',
      online: 'Online',
    };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const isFinePointer = () =>
    window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function encode(text) {
    return encodeURIComponent(String(text ?? ''));
  }

  function waUrl(text) {
    const num = String(CFG.whatsappNumber || '').trim();
    if (!num) return `https://wa.me/?text=${encode(text)}`;
    return `https://wa.me/${num}?text=${encode(text)}`;
  }

  function fmtModalidades(set) {
    const arr = Array.from(set || []);
    if (!arr.length) return '';
    // Orden “humano” si existen keys conocidas
    const order = ['sede', 'hogar', 'virtual', 'online'];
    arr.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return arr.map((k) => MOD_LABEL[k] || k).join(', ');
  }

  function collectAllModalitiesFromData() {
    const out = new Set();
    const cat = window.MUSICALA_CATALOG || {};
    const all = []
      .concat(cat.principales || [])
      .concat(cat.catalogo || []);

    all.forEach((it) => {
      (it.modalidades || []).forEach((m) => out.add(m));
      const dm = (it.details && Array.isArray(it.details.modalities) && it.details.modalities) || [];
      dm.forEach((m) => out.add(m));
    });

    // fallback a las keys del label
    if (!out.size) Object.keys(MOD_LABEL).forEach((k) => out.add(k));
    return out;
  }

  function buildSummary(custom = {}) {
    const instrumento = (custom.instrumento ?? state.instrumento) || '';
    const plan = (custom.plan ?? state.plan) || '';
    const mod = (custom.modalidad ?? state.modalidad) || new Set();
    const g = (custom.guia ?? state.guia) || { area: '', formato: '' };

    const parts = [];
    parts.push('Hola Musicala 👋\n\n');

    if (instrumento || plan) {
      parts.push('Quiero información de planes y precios para:\n');
      if (instrumento) parts.push(`• Instrumento/Experiencia: ${instrumento}\n`);
      if (plan) parts.push(`• Plan: ${plan}\n`);

      // Solo agrega modalidad si hay selección clara (filtro activo por el usuario)
      if (mod && mod.size) parts.push(`• Modalidad: ${fmtModalidades(mod)}\n`);

      parts.push('\n¿Me comparten opciones y valores, porfa? 🙂');
      return parts.join('');
    }

    if (g.area || g.formato) {
      parts.push('Quiero que me recomienden un plan y precios:\n');
      if (g.area) parts.push(`• Me interesa: ${g.area}\n`);
      if (g.formato) parts.push(`• Prefiero: ${g.formato}\n`);
      parts.push('\n¿Me ayudan con opciones? 🙂');
      return parts.join('');
    }

    return String(CFG.defaultText || 'Hola Musicala 👋');
  }

  /* =========================
     State
  ========================= */
  const state = {
    modalidad: new Set(), // se inicializa en boot()
    instrumento: '',
    focus: '',
    plan: '',
    guia: { area: '', formato: '' },
    lastDetail: null,
  };

  /* =========================
     Toast
  ========================= */
  let toastT = null;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = String(msg || '');
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 1700);
  }

  /* =========================
     Modal (accesible)
  ========================= */
  let lastFocusEl = null;

  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input, select, details, summary, [tabindex]:not([tabindex="-1"])';

  function trapFocus(modalEl, ev) {
    if (ev.key !== 'Tab') return;

    const focusables = $$(FOCUSABLE, modalEl).filter((x) => x.offsetParent !== null);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault();
      first.focus();
    }
  }

  function modalOpen(title, bodyHtml, waPayload) {
    const modal = $('#modal');
    if (!modal) return;

    lastFocusEl = document.activeElement;

    const t = $('#modal-title');
    const b = $('#modal-body');
    if (t) t.textContent = title || 'Detalle';
    if (b) b.innerHTML = bodyHtml || '';

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    state.lastDetail = waPayload || null;

    document.body.style.overflow = 'hidden';

    // foco inicial
    const closeBtn = $('#modal-close');
    (closeBtn || modal).focus?.();

    // trap focus
    const onKeydown = (ev) => trapFocus(modal, ev);
    modal.__trap = onKeydown;
    modal.addEventListener('keydown', onKeydown);
  }

  function modalClose() {
    const modal = $('#modal');
    if (!modal) return;

    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // remove trap
    if (modal.__trap) {
      modal.removeEventListener('keydown', modal.__trap);
      modal.__trap = null;
    }

    // restore focus
    if (lastFocusEl && lastFocusEl.focus) lastFocusEl.focus();
    lastFocusEl = null;
  }

  /* =========================
     WhatsApp Bubble UI
  ========================= */
  function updateWaUI() {
    const sub = $('#wa-fab-sub');
    const bubble = $('#wa-bubble');
    const hasPick = !!(state.instrumento || state.plan || state.guia.area || state.guia.formato);

    if (sub) sub.textContent = hasPick ? 'Escribir sobre esto' : 'Te ayudamos';

    if (bubble) {
      bubble.classList.toggle('show', hasPick);
      bubble.textContent = hasPick
        ? 'Listo. Te armé el mensaje para WhatsApp ✅'
        : 'Elige una opción y te armo el mensaje ✍️';
    }
  }

  /* =========================
     Rendering
  ========================= */
  function renderRail() {
    const rail = $('#rail-instrumentos');
    if (!rail) return;
    rail.innerHTML = '';

    const list = window.MUSICALA_CATALOG?.instrumentos || [];
    const frag = document.createDocumentFragment();

    list.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'chip reveal';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.dataset.focus = String(item.focus || '');
      el.setAttribute('aria-selected', 'false');
      el.innerHTML = `
        <img src="${escapeHtml(item.icon)}" alt="" onerror="this.style.display='none'">
        <b>${escapeHtml(item.key)}</b>
      `;
      frag.appendChild(el);
    });

    rail.appendChild(frag);
  }

  function cardHtml(item, kind) {
    // kind: "principal" | "catalogo"
    const waInstrumento = item.instrumento || '';
    const waPlan = item.plan || item.waPlan || item.title || '';

    const dataAttrs = [
      `data-id="${escapeHtml(item.id)}"`,
      item.focus ? `data-focus="${escapeHtml(item.focus)}"` : '',
      item.modalidades ? `data-modalidades="${escapeHtml(item.modalidades.join(','))}"` : '',
      item.instrumento ? `data-instrumento="${escapeHtml(item.instrumento)}"` : '',
      `data-plan="${escapeHtml(item.plan || item.waPlan || item.title || '')}"`,
    ]
      .filter(Boolean)
      .join(' ');

    return `
      <article class="card reveal" ${dataAttrs}>
        <div class="media">
          <img src="${escapeHtml(item.media)}" alt="${escapeHtml(item.title)}" onerror="this.style.display='none'">
        </div>
        <div class="shine" aria-hidden="true"></div>

        <div class="body">
          <div class="top">
            <h3 class="title">${escapeHtml(item.title)}</h3>
            <span class="tag">${escapeHtml(item.tag || '')}</span>
          </div>

          <ul class="bullets">
            ${(item.bullets || [])
              .slice(0, 3)
              .map((b) => `<li>${escapeHtml(b)}</li>`)
              .join('')}
          </ul>

          <div class="price">
            <b>${escapeHtml(item.price || '')}</b>
          </div>

          <div class="actions">
            <button class="mini primary js-choose"
              data-instrumento="${escapeHtml(waInstrumento)}"
              data-plan="${escapeHtml(waPlan)}"
              type="button">💬 WhatsApp</button>

            <button class="mini js-details"
              data-ref="${escapeHtml(kind)}"
              data-id="${escapeHtml(item.id)}"
              type="button">Ver opciones</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderPrincipales() {
    const grid = $('#grid-principales');
    if (!grid) return;
    grid.innerHTML = (window.MUSICALA_CATALOG?.principales || []).map((p) => cardHtml(p, 'principal')).join('');
  }

  function renderCatalogo() {
    const grid = $('#grid-catalogo');
    if (!grid) return;
    grid.innerHTML = (window.MUSICALA_CATALOG?.catalogo || []).map((c) => cardHtml(c, 'catalogo')).join('');
  }

  /* =========================
     Filtering
  ========================= */
  function parseMods(card) {
    return (card.getAttribute('data-modalidades') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function applyFilters() {
    const cards = $$('#grid-principales .card, #grid-catalogo .card');
    const selectedMods = state.modalidad;
    const hasModFilter = selectedMods && selectedMods.size;

    cards.forEach((card) => {
      const mods = parseMods(card);
      const focus = (card.getAttribute('data-focus') || '').trim();
      const inst = (card.getAttribute('data-instrumento') || '').trim();

      // 1) Modalidad:
      // - si NO hay filtro activo: no filtra
      // - si hay filtro y el card trae modalidades: debe coincidir al menos una
      // - si hay filtro pero el card NO trae modalidades: lo dejamos pasar (mejor que "desaparecer" cosas)
      let ok = true;
      if (hasModFilter && mods.length) {
        ok = mods.some((m) => selectedMods.has(m));
      }

      // 2) Focus:
      // - si hay focus elegido, deja pasar:
      //   a) focus exacto
      //   b) focus "general"
      //   c) si no hay focus pero el instrumento coincide (fallback)
      if (ok && state.focus) {
        ok =
          focus === state.focus ||
          focus === 'general' ||
          (!focus && inst && state.instrumento && inst.toLowerCase() === state.instrumento.toLowerCase());
      }

      // show/hide con transición
      if (ok) {
        card.classList.remove('hide');
        card.style.display = '';
      } else {
        card.classList.add('hide');
        setTimeout(() => {
          if (card.classList.contains('hide')) card.style.display = 'none';
        }, 160);
      }
    });
  }

  /* =========================
     Reveal
  ========================= */
  function setupReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  }

  /* =========================
     Effects
  ========================= */
  function setupHeroTilt() {
    const hero = $('#hero-tilt');
    const spec = hero ? $('.specular', hero) : null;
    if (!hero || !spec) return;
    if (!isFinePointer()) return;

    hero.addEventListener(
      'mousemove',
      (ev) => {
        const r = hero.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width;
        const y = (ev.clientY - r.top) / r.height;

        const rx = (y - 0.5) * -6;
        const ry = (x - 0.5) * 6;

        hero.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
        hero.style.setProperty('--sx', `${(x - 0.5) * 40}px`);
        hero.style.setProperty('--sy', `${(y - 0.5) * 40}px`);
        spec.style.opacity = '0.75';
      },
      { passive: true }
    );

    hero.addEventListener('mouseleave', () => {
      hero.style.transform = '';
      spec.style.opacity = '0.55';
    });
  }

  function setupCardShine() {
    if (!isFinePointer()) return;

    document.addEventListener(
      'mousemove',
      (ev) => {
        const card = ev.target.closest && ev.target.closest('.card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        const x = ev.clientX - r.left;
        const y = ev.clientY - r.top;
        card.style.setProperty('--cx', `${(x - r.width / 2) * 0.18}px`);
        card.style.setProperty('--cy', `${(y - r.height / 2) * 0.18}px`);
      },
      { passive: true }
    );
  }

  /* =========================
     Guided flow
  ========================= */
  function renderGuide() {
    const a = $('#g-area');
    const f = $('#g-formato');
    if (!a || !f) return;

    a.innerHTML = (window.MUSICALA_CATALOG?.guided?.areas || [])
      .map((x) => `<button type="button" data-area="${escapeHtml(x.key)}">${escapeHtml(x.icon)} ${escapeHtml(x.key)}</button>`)
      .join('');

    f.innerHTML = (window.MUSICALA_CATALOG?.guided?.formatos || [])
      .map((x) => `<button type="button" data-formato="${escapeHtml(x.key)}">${escapeHtml(x.icon)} ${escapeHtml(x.key)}</button>`)
      .join('');
  }

  function setPressed(groupElId, value) {
    $$('#' + groupElId + ' button').forEach((b) => {
      const v = b.dataset.area || b.dataset.formato;
      b.setAttribute('aria-pressed', String(v === value));
    });
  }

  /* =========================
     Detail lookup + modal body
  ========================= */
  function findItem(ref, id) {
    const cat = window.MUSICALA_CATALOG || {};
    const arr = ref === 'principal' ? cat.principales || [] : cat.catalogo || [];
    return arr.find((x) => x.id === id) || null;
  }

  function buildModalBody(item) {
    const d = item.details || {};
    const mods = (item.modalidades || d.modalities || []).filter(Boolean);

    const desc = d.desc
      ? `<div class="hint" style="font-size:13px; color:rgba(11,16,32,.78)">${escapeHtml(d.desc)}</div>`
      : '';

    const modsHtml = mods.length
      ? `<div class="hint"><b>Modalidades:</b> ${mods.map((m) => escapeHtml(MOD_LABEL[m] || m)).join(' · ')}</div>`
      : '';

    const inc =
      Array.isArray(d.include) && d.include.length
        ? `<ul class="bullets">${d.include.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`
        : '';

    const note = item.note ? `<div class="hint" style="margin-top:8px;">${escapeHtml(item.note)}</div>` : '';

    return `
      ${desc}
      ${modsHtml}
      <div class="panel" style="padding:12px; border-radius:18px; margin-top:10px;">
        <div style="display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <b style="font-size:14px;">${escapeHtml(item.price || 'Precio')}</b>
          <span class="hint">${escapeHtml(item.tag || '')}</span>
        </div>
        ${inc}
        ${note}
      </div>
      <div class="hint" style="margin-top:10px;">Tip: si me dices tu edad y objetivo (hobby, nivel, presentación), te recomiendo mejor 🙂</div>
    `;
  }

  /* =========================
     Topnav: smooth + active section
  ========================= */
  function setupTopnav() {
    const links = $$('.topnav a[href^="#"]');
    if (!links.length) return;

    // Smooth scroll (sin depender de CSS)
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('.topnav a[href^="#"]');
      if (!a) return;

      const id = (a.getAttribute('href') || '').slice(1);
      const sec = id ? document.getElementById(id) : null;
      if (!sec) return;

      e.preventDefault();
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Active highlight
    const map = new Map();
    links.forEach((a) => {
      const id = (a.getAttribute('href') || '').slice(1);
      if (!id) return;
      const sec = document.getElementById(id);
      if (sec) map.set(sec, a);
    });

    if (!('IntersectionObserver' in window) || !map.size) return;

    const io = new IntersectionObserver(
      (entries) => {
        // el que esté más “presente” gana
        const visible = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (!visible) return;

        links.forEach((a) => a.removeAttribute('aria-current'));
        const a = map.get(visible.target);
        if (a) a.setAttribute('aria-current', 'page');
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
      }
    );

    map.forEach((_a, sec) => io.observe(sec));
  }

  /* =========================
     Events
  ========================= */
  function wireEvents() {
    // Modalidad pills (si existen)
    const pills = $$('.pillbar .pill');
    pills.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.filter;
        if (!key) return;

        const isOn = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!isOn));

        if (isOn) state.modalidad.delete(key);
        else state.modalidad.add(key);

        applyFilters();
        updateWaUI();
        toast('Filtro aplicado ✅');
      });
    });

    // Rail chips (toggle + reset)
    const rail = $('#rail-instrumentos');

    const selectChip = (chip) => {
      if (!chip) return;

      const wasSelected = chip.getAttribute('aria-selected') === 'true';

      // reset all
      $$('#rail-instrumentos .chip').forEach((c) => c.setAttribute('aria-selected', 'false'));

      if (wasSelected) {
        // toggle off
        state.focus = '';
        state.instrumento = '';
        state.plan = '';
        updateWaUI();
        applyFilters();
        toast('Mostrando todo ✅');
        return;
      }

      chip.setAttribute('aria-selected', 'true');
      state.focus = chip.dataset.focus || '';
      state.instrumento = chip.querySelector('b')?.textContent?.trim() || '';
      state.plan = '';

      updateWaUI();
      applyFilters();

      $('#catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast(`Mostrando: ${state.instrumento} ✨`);
    };

    rail?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      selectChip(chip);
    });

    rail?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const chip = e.target.closest('.chip');
      if (!chip) return;
      e.preventDefault();
      selectChip(chip);
    });

    // Choose (WhatsApp)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-choose');
      if (!btn) return;

      const inst = (btn.dataset.instrumento || '').trim();
      const plan = (btn.dataset.plan || '').trim();

      if (inst) state.instrumento = inst;
      if (plan) state.plan = plan;

      updateWaUI();
      window.open(waUrl(buildSummary()), '_blank', 'noopener');
    });

    // Details modal
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-details');
      if (!btn) return;

      const ref = btn.dataset.ref || 'catalogo';
      const id = btn.dataset.id || '';
      const item = findItem(ref, id);

      if (!item) {
        toast('No encontré ese detalle 😅');
        return;
      }

      const title = item.details?.title || item.title || 'Detalle';
      const body = buildModalBody(item);

      const payload = {
        instrumento: item.instrumento || state.instrumento || '',
        plan: item.plan || item.waPlan || item.title || '',
      };

      modalOpen(title, body, payload);
    });

    // Modal close (backdrop / close buttons)
    $('#modal')?.addEventListener('click', (e) => {
      const close = e.target.closest("[data-close='1']");
      if (close) modalClose();
    });
    $('#modal-close')?.addEventListener('click', modalClose);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('#modal')?.classList.contains('show')) modalClose();
    });

    $('#modal-wa')?.addEventListener('click', () => {
      const p = state.lastDetail || null;
      if (p) {
        state.instrumento = p.instrumento || state.instrumento;
        state.plan = p.plan || state.plan;
      }
      updateWaUI();
      window.open(waUrl(buildSummary(p || {})), '_blank', 'noopener');
    });

    // Guided flow
    $('#g-area')?.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      state.guia.area = b.dataset.area || '';
      setPressed('g-area', state.guia.area);
      const r = $('#g-result');
      if (r) r.textContent = `Ok. Te interesa: ${state.guia.area}. Ahora elige cómo prefieres aprender.`;
      updateWaUI();
      toast('Listo ✅');
    });

    $('#g-formato')?.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      state.guia.formato = b.dataset.formato || '';
      setPressed('g-formato', state.guia.formato);
      const r = $('#g-result');
      if (r) r.textContent = `Listo ✅ ${state.guia.area || '—'} · ${state.guia.formato}.`;
      updateWaUI();
      toast('Perfecto ✅');
    });

    $('#g-to-wa')?.addEventListener('click', () => {
      updateWaUI();
      window.open(waUrl(buildSummary()), '_blank', 'noopener');
    });

    $('#g-clear')?.addEventListener('click', () => {
      state.guia.area = '';
      state.guia.formato = '';
      setPressed('g-area', '__none__');
      setPressed('g-formato', '__none__');
      const r = $('#g-result');
      if (r) r.textContent = 'Elige 1 opción en cada paso y te armo el mensaje.';
      updateWaUI();
      toast('Limpio ✅');
    });

    // Hero guide button
    $('#btn-guia')?.addEventListener('click', () => {
      $('#guia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Floating WA
    $('#wa-fab')?.addEventListener('click', () => {
      updateWaUI();
      window.open(waUrl(buildSummary()), '_blank', 'noopener');
    });
  }

  /* =========================
     Boot
  ========================= */
  function initModalidadState() {
    // Si hay pills visibles, dejamos que el usuario filtre.
    // Si NO hay pills, arrancamos con todas las modalidades existentes para que no se “pierda” el catálogo.
    const hasPills = $$('.pillbar .pill').length > 0;
    if (hasPills) {
      // default “sin filtro” (muestra todo); si quieres sede-only, pon: new Set(["sede"])
      state.modalidad = new Set();
      return;
    }
    state.modalidad = collectAllModalitiesFromData(); // muestra todo disponible
  }

  function boot() {
    if (!window.MUSICALA_CATALOG) {
      console.warn('MUSICALA_CATALOG no está cargado. Revisa data.js antes de app.js');
      return;
    }

    initModalidadState();

    renderRail();
    renderPrincipales();
    renderCatalogo();
    renderGuide();

    applyFilters();
    updateWaUI();

    setupTopnav();
    setupHeroTilt();
    setupCardShine();
    setupReveal();

    wireEvents();
  }

  boot();
})();
