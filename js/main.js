// Lunchee · design v0.3
// Zasada: dotyk jest bazą (przewijanie palcem, scroll snap), hover i strzałki są nadpisaniem.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Nagłówek ---------- */
const header = $('.header');
const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const toggle = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
const desktopMenu = matchMedia('(min-width: 1000px)');
let menuScroll = 0;
const menuBackground = $$('main, footer, .sticky-buy');
const setMenu = (open, restoreFocus = true) => {
  if (!toggle || !mobileNav) return;
  open = open && !desktopMenu.matches;
  if (open === mobileNav.classList.contains('is-open')) return;
  if (open) {
    menuScroll = scrollY;
    document.body.style.setProperty('--menu-scroll-top', `-${menuScroll}px`);
  }
  mobileNav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  toggle.classList.toggle('is-open', open);
  document.body.classList.toggle('no-scroll', open);
  menuBackground.forEach(el => { el.inert = open || (el === stickyBuy && !el.classList.contains('is-visible')); });
  if (open) {
    $('a', mobileNav)?.focus({ preventScroll: true });
  } else {
    document.body.style.removeProperty('--menu-scroll-top');
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    scrollTo(0, menuScroll);
    root.style.scrollBehavior = previous;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
};
toggle?.addEventListener('click', () => setMenu(!mobileNav.classList.contains('is-open')));
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => {
  if (!mobileNav?.classList.contains('is-open')) return;
  if (e.key === 'Escape') { e.preventDefault(); setMenu(false); }
  if (e.key === 'Tab') {
    const targets = [toggle, ...$$('a', mobileNav)];
    const current = targets.indexOf(document.activeElement);
    e.preventDefault();
    targets[(current + (e.shiftKey ? -1 : 1) + targets.length) % targets.length].focus();
  }
});
desktopMenu.addEventListener('change', () => {
  if (desktopMenu.matches) {
    const hadMenuFocus = mobileNav?.contains(document.activeElement) || document.activeElement === toggle;
    setMenu(false, false);
    if (hadMenuFocus) $('.nav a')?.focus({ preventScroll: true });
  }
});
if (header && 'ResizeObserver' in window) {
  new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`)).observe(header);
}

// Podświetlenie bieżącej podstrony w menu
const here = location.pathname.split('/').pop() || 'index.html';
$$('.nav a, .mobile-nav a').forEach(a => {
  const href = a.getAttribute('href');
  if (href.includes('#')) return; // link do sekcji (np. index.html#jak-korzystac) nie jest bieżącą podstroną
  const target = href;
  const group = { 'produkt-': 'lunch-boxy.html', 'akcesoria-': 'akcesoria.html' };
  const alias = Object.keys(group).find(k => here.startsWith(k));
  if (target === here || (alias && target === group[alias])) a.setAttribute('aria-current', 'page');
});

/* ---------- Pojawianie sekcji przy przewijaniu ---------- */
if (!reduceMotion && 'IntersectionObserver' in window) {
  const targets = $$('main > section > .wrap > *, .story__row, .card, .step, .moment, .persona');
  targets.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--i', i % 6); });
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  targets.forEach(el => io.observe(el));
}

/* ---------- Modele (wspólne dla wyboru koloru i koszyka) ---------- */
const MODELS = {
  lb745: { code: 'LB745', name: 'City', available: true, photos: [1, 2, 6, 8, 19], price: 249, old: 279 },
  lb755: { code: 'LB755', name: 'Glamour', available: true, photos: [1, 2, 6, 8, 19], price: 249 },
  lb725: { code: 'LB725', name: 'Nature', available: true, photos: [1, 2, 6, 8, 19], price: 249 },
  lb715: { code: 'LB715', name: 'Pearl', available: true, photos: [1, 2, 6, 8, 19], price: 249 },
  lb795: { code: 'LB795', name: 'Night', available: false, photos: [1, 2, 6, 5, 13], price: 249 },
};
const zl = v => v.toFixed(2).replace('.', ',') + ' zł';
const photo = (id, n) => `assets/img/${id}/${id}-${String(n).padStart(2, '0')}.webp`;

/* ---------- Wybór koloru na stronie głównej ---------- */
$$('[data-picker]').forEach(picker => {
  const img = $('[data-picker-img]', picker);
  const full = $('[data-picker-full]', picker);
  const status = $('[data-picker-status]', picker);
  const buy = $('[data-picker-buy]', picker);
  const thumbs = $('.thumbs', picker);
  const swatches = $$('.swatch', picker);

  const swap = src => {
    if (img.getAttribute('src') === src) return;
    img.classList.add('is-fading');
    const next = new Image();
    next.onload = () => { img.src = src; setTimeout(() => img.classList.remove('is-fading'), 30); };
    next.src = src;
  };

  const renderThumbs = id => {
    if (!thumbs) return;
    const m = MODELS[id];
    thumbs.innerHTML = [`assets/img/produkty/${id}.webp`, ...m.photos.map(n => photo(id, n))]
      .map((src, i) => `<button type="button" aria-label="Zdjęcie ${i + 1}" aria-pressed="${i === 0}"><img src="${src}" alt="" loading="lazy"></button>`).join('');
    $$('button', thumbs).forEach((b, i) => b.addEventListener('click', () => {
      $$('button', thumbs).forEach(x => x.setAttribute('aria-pressed', x === b));
      swap(b.querySelector('img').getAttribute('src'));
      img.classList.toggle('is-photo', i > 0);
    }));
  };

  const select = id => {
    const m = MODELS[id];
    swatches.forEach(b => b.setAttribute('aria-pressed', b.dataset.model === id));
    swap(`assets/img/produkty/${id}.webp`);
    img.classList.remove('is-photo');
    img.alt = `Elektryczny Lunch Box NOVEEN Lunchee ${m.code} ${m.name}`;
    full.textContent = `Elektryczny Lunch Box NOVEEN Lunchee ${m.code} ${m.name}`;
    status.hidden = m.available;
    const pp = $('[data-picker-price]', picker), po = $('[data-picker-old]', picker);
    if (pp) pp.textContent = zl(m.price);
    if (po) { po.hidden = !m.old; if (m.old) po.textContent = zl(m.old); }
    if (buy) {
      buy.href = `produkt-${id}.html`;
      buy.classList.toggle('btn--outline', !m.available);
      buy.classList.toggle('btn--blue', m.available);
      buy.firstChild.textContent = m.available ? 'Zobacz produkt ' : 'Zobacz model ';
    }
    renderThumbs(id);
  };
  swatches.forEach(b => b.addEventListener('click', () => select(b.dataset.model)));
  renderThumbs('lb745');
});

/* ---------- Karuzele: przewijanie palcem, strzałki i kropki jako nadpisanie ---------- */
$$('[data-carousel]').forEach(track => {
  const items = [...track.children];
  const dots = track.dataset.dots ? document.getElementById(track.dataset.dots) : null;
  const wrap = track.closest('section') || document;
  const prev = $('[data-carousel-prev]', wrap), next = $('[data-carousel-next]', wrap);
  const bar = track.dataset.progress ? $('i', document.getElementById(track.dataset.progress)) : null;
  if (dots) items.forEach(() => dots.appendChild(document.createElement('span')));
  const step = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16);
  const index = () => Math.min(Math.round(track.scrollLeft / step()), items.length - 1);
  const update = () => {
    const i = index();
    dots && [...dots.children].forEach((d, k) => d.classList.toggle('is-active', k === i));
    if (bar) { bar.style.width = Math.min(100, track.clientWidth / track.scrollWidth * 100) + '%'; bar.style.marginLeft = track.scrollLeft / track.scrollWidth * 100 + '%'; }
    const overflow = track.scrollWidth > track.clientWidth + 2;
    if (prev) { prev.disabled = track.scrollLeft <= 2; prev.hidden = !overflow; }
    if (next) { next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; next.hidden = !overflow; }
  };
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  update();
});

/* ---------- Galeria karty produktu ---------- */
$$('[data-gallery]').forEach(g => {
  const main = $('.gallery__main', g);
  const slides = $$('img', main);
  const thumbs = $$('.gallery__thumbs button', g);
  const dots = $('.gallery__dots', g);
  slides.forEach(() => dots.appendChild(document.createElement('span')));
  const dotEls = [...dots.children];
  let i = 0;
  const setActive = k => {
    i = Math.max(0, Math.min(k, slides.length - 1));
    thumbs.forEach((t, n) => t.setAttribute('aria-current', n === i));
    dotEls.forEach((d, n) => d.classList.toggle('is-active', n === i));
    thumbs[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  const go = k => main.scrollTo({ left: Math.max(0, Math.min(k, slides.length - 1)) * main.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  main.addEventListener('scroll', () => setActive(Math.round(main.scrollLeft / main.clientWidth)), { passive: true });
  thumbs.forEach((t, n) => t.addEventListener('click', () => go(n)));
  $$('.gallery__arrow', g).forEach(a => a.addEventListener('click', () => go(i + +a.dataset.dir)));
  g.tabIndex = 0;
  g.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
  });
  setActive(0);
});

/* ---------- Ilość ---------- */
$$('.qty').forEach(q => {
  const out = $('output', q);
  $$('button', q).forEach(b => b.addEventListener('click', () => {
    out.textContent = Math.max(1, Math.min(99, (+out.textContent || 1) + +b.dataset.step));
  }));
});

/* ---------- Promocja dla par: rabat na każdą parę lunch boxów (wysokość w <meta name="lunchee-para">) ---------- */
const PARA = +(document.querySelector('meta[name="lunchee-para"]')?.content || 0) / 100;
// Sztuki lunch boxów od najdroższej, rabat obejmuje pełne pary
function pairDiscount(items) {
  const units = items.filter(x => MODELS[x.id]).flatMap(x => Array(x.qty).fill(x.price || 0)).sort((a, b) => b - a);
  const paired = units.slice(0, Math.floor(units.length / 2) * 2);
  return { units: units.length, pairs: paired.length / 2, value: Math.round(paired.reduce((s, v) => s + v, 0) * PARA * 100) / 100 };
}

/* ---------- Koszyk (localStorage, prototyp bez cen) ---------- */
const CART_KEY = 'lunchee-koszyk';
const cart = {
  read() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } },
  write(items) { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {} cart.render(); },
  add(item, qty) {
    const items = cart.read();
    const found = items.find(x => x.id === item.id);
    found ? (found.qty = Math.min(99, found.qty + qty)) : items.push({ ...item, qty });
    cart.write(items);
  },
  setQty(id, qty) { cart.write(cart.read().map(x => x.id === id ? { ...x, qty: Math.max(1, Math.min(99, qty)) } : x)); },
  remove(id) { cart.write(cart.read().filter(x => x.id !== id)); },
  count() { return cart.read().reduce((s, x) => s + x.qty, 0); },
  render() {
    const n = cart.count();
    $$('[data-cart-count]').forEach(c => { c.textContent = n; c.hidden = n === 0; });
    $$('[data-cart-qty]').forEach(c => c.textContent = n);
    const gross = cart.read().reduce((s, x) => s + (x.price || 0) * x.qty, 0);
    const disc = pairDiscount(cart.read());
    const sum = gross - disc.value;
    $$('[data-cart-discount-row]').forEach(r => r.hidden = !disc.value);
    $$('[data-cart-discount]').forEach(c => c.textContent = '−' + zl(disc.value));
    paraCart(disc);
    const shipEl = $('[data-cart-ship]');
    const free = +(shipEl?.dataset.free || Infinity);
    const ship = n && sum < free ? +(shipEl?.dataset.ship || 0) : 0;
    $$('[data-cart-sum]').forEach(c => c.textContent = zl(gross));
    $$('[data-cart-ship]').forEach(c => c.textContent = zl(ship));
    $$('[data-cart-total]').forEach(c => c.textContent = zl(sum + ship));
    const list = $('[data-cart-list]');
    if (list) {
      const items = cart.read();
      $('[data-cart-empty]').hidden = items.length > 0;
      $('[data-cart-full]').hidden = items.length === 0;
      list.innerHTML = items.map(x => `
        <li class="cart__item" data-id="${x.id}">
          <img src="${x.img}" alt="" width="96" height="96">
          <div class="cart__item-body"><b>${x.name}</b><span class="price price--sm">${zl(x.price || 0)}</span></div>
          <div class="qty"><button type="button" data-cart-step="-1" aria-label="Mniej">−</button><output>${x.qty}</output><button type="button" data-cart-step="1" aria-label="Więcej">+</button></div>
          <button class="cart__remove" type="button" data-cart-remove aria-label="Usuń z koszyka"><svg><use href="#i-trash"/></svg></button>
        </li>`).join('');
      $$('[data-cart-step]', list).forEach(b => b.addEventListener('click', () => {
        const li = b.closest('[data-id]'); cart.setQty(li.dataset.id, +$('output', li).textContent + +b.dataset.cartStep);
      }));
      $$('[data-cart-remove]', list).forEach(b => b.addEventListener('click', () => cart.remove(b.closest('[data-id]').dataset.id)));
    }
    const mini = $('[data-cart-mini]');
    shipBars();
    if (mini) mini.innerHTML = cart.read().map(x => `<li><img src="${x.img}" alt="" width="56" height="56"><span>${x.name}</span><em>× ${x.qty} · ${zl((x.price || 0) * x.qty)}</em></li>`).join('') || '<li class="cart__note">Koszyk jest pusty.</li>';
  },
};
cart.render();
addEventListener('storage', e => e.key === CART_KEY && cart.render());

let toastTimer;
const toast = text => {
  const t = $('.toast'); if (!t) return;
  $('[data-toast-text]', t).textContent = text;
  t.hidden = false; setTimeout(() => t.classList.add('is-visible'), 20);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('is-visible'); setTimeout(() => t.hidden = true, 300); }, 3200);
};
$$('[data-add]').forEach(b => b.addEventListener('click', () => {
  const qtyEl = b.closest('.buy__row')?.querySelector('.qty output');
  const qty = qtyEl ? +qtyEl.textContent : 1;
  cart.add({ id: b.dataset.add, name: b.dataset.name, img: b.dataset.img, price: +b.dataset.price || 0 }, qty);
  toast(`${b.dataset.name} dodany do koszyka`);
  b.classList.add('is-added'); setTimeout(() => b.classList.remove('is-added'), 900);
}));

/* ---------- Akcesoria do dobrania i pasek darmowej dostawy ---------- */
// var, bo cart.render() wywołuje shipBars() wcześniej, niż ten blok się wykona
var buyBox = $('.buy');
var withAddons = buyBox && $('[data-with-addons]', buyBox);
var addonInputs = buyBox ? $$('[data-addon]', buyBox) : [];
// Wartość wyboru w polu zakupu: lunch box razy ilość plus zaznaczone akcesoria
function selection() {
  if (!withAddons) return 0;
  const qty = +($('.qty output', buyBox)?.textContent || 1);
  const price = +withAddons.dataset.price;
  const pairOff = Math.floor(qty / 2) * 2 * price * PARA;
  return price * qty - pairOff + addonInputs.filter(i => i.checked).reduce((s, i) => s + +i.dataset.price, 0);
}
function shipBars() {
  $$('[data-ship-bar]').forEach(bar => {
    const free = +bar.dataset.free;
    // Na karcie produktu liczymy wybór plus to, co już leży w koszyku poza tym produktem i jego akcesoriami
    const skip = withAddons ? [withAddons.dataset.add, ...(addonInputs || []).map(i => i.dataset.addon)] : [];
    const rest = cart.read().filter(x => !skip.includes(x.id));
    const inCart = rest.reduce((s, x) => s + (x.price || 0) * x.qty, 0) - pairDiscount(rest).value;
    const total = inCart + (bar.closest('.buy') ? selection() : 0);
    const missing = free - total;
    $('[data-ship-fill]', bar).style.width = Math.min(100, total / free * 100) + '%';
    $('[data-ship-text]', bar).innerHTML = missing > 0
      ? `Do darmowej dostawy brakuje <b>${zl(missing)}</b>`
      : 'Masz darmową dostawę';
  });
}
function updateBuySum() {
  const out = buyBox && $('[data-buy-sum]', buyBox);
  if (out) out.textContent = zl(selection());
  shipBars();
}
addonInputs.forEach(i => i.addEventListener('change', updateBuySum));
if (buyBox) $$('.qty button', buyBox).forEach(b => b.addEventListener('click', updateBuySum));
if (withAddons) withAddons.addEventListener('click', () => {
  const picked = addonInputs.filter(i => i.checked);
  picked.forEach(i => { cart.add({ id: i.dataset.addon, name: i.dataset.name, img: i.dataset.img, price: +i.dataset.price }, 1); i.checked = false; });
  if (picked.length) toast(`${withAddons.dataset.name} i ${picked.length === 1 ? 'akcesorium' : picked.length + ' akcesoria'} w koszyku`);
  updateBuySum();
});
shipBars();

// Przycisk „Dodaj dwa” w boksie promocji na karcie produktu
$$('[data-add-pair]').forEach(b => b.addEventListener('click', () => {
  cart.add({ id: b.dataset.addPair, name: b.dataset.name, img: b.dataset.img, price: +b.dataset.price }, 2);
  toast(`Dwa ${b.dataset.name} w koszyku, rabat za parę naliczony`);
}));

// Boks promocji w koszyku: trzy stany zależne od liczby lunch boxów
function paraCart(disc) {
  const box = $('[data-para-cart]'); if (!box) return;
  const h = $('[data-para-h]', box), p = $('[data-para-p]', box), btn = $('[data-para-btn]', box);
  const r = Math.round(PARA * 100);
  box.classList.toggle('is-done', disc.pairs > 0 && disc.units % 2 === 0);
  if (disc.units % 2 === 1) {
    const first = disc.units === 1;
    h.textContent = first ? `Dodaj drugi Lunchee, rabat ${r}% obejmie parę` : `Dodaj jeszcze jeden Lunchee, rabat ${r}% obejmie kolejną parę`;
    p.textContent = first ? 'Druga sztuka może być w innym kolorze, dla Ciebie albo dla bliskiej osoby.' : `Za ${disc.pairs === 1 ? 'parę' : disc.pairs + ' pary'} masz już ${zl(disc.value)} rabatu. Kolory możesz łączyć.`;
    btn.hidden = false;
  } else if (disc.pairs > 0) {
    h.textContent = `Rabat ${r}% za ${disc.pairs === 1 ? 'parę' : disc.pairs + ' pary'} naliczony`;
    p.textContent = `Oszczędzasz ${zl(disc.value)}. Każda kolejna para lunch boxów też kosztuje ${r}% mniej.`;
    btn.hidden = true;
  } else {
    h.textContent = `Dwa Lunchee ${r}% taniej`;
    p.textContent = 'Jeden dla Ciebie, drugi dla bliskiej osoby. Rabat obejmuje każdą parę lunch boxów, kolory możesz łączyć.';
    btn.hidden = false; btn.textContent = 'Wybierz Lunchee';
  }
  if (disc.units % 2 === 1) btn.textContent = disc.units === 1 ? 'Wybierz drugi Lunchee' : 'Wybierz kolejny Lunchee';
}

/* ---------- Pasek zakupu na telefonie ---------- */
const mainBuy = $('[data-main-buy]'), stickyBuy = $('.sticky-buy');
if (mainBuy && stickyBuy && 'IntersectionObserver' in window) {
  document.body.classList.add('has-sticky-buy');
  stickyBuy.inert = true;
  stickyBuy.setAttribute('aria-hidden', 'true');
  const measureStickyBuy = () => document.body.style.setProperty('--sticky-buy-height', `${stickyBuy.offsetHeight}px`);
  measureStickyBuy();
  if ('ResizeObserver' in window) new ResizeObserver(measureStickyBuy).observe(stickyBuy);
  new IntersectionObserver(([e]) => {
    const visible = !e.isIntersecting && e.boundingClientRect.top < 0;
    stickyBuy.classList.toggle('is-visible', visible);
    document.body.classList.toggle('has-visible-sticky-buy', visible);
    stickyBuy.inert = !visible || document.body.classList.contains('no-scroll');
    stickyBuy.setAttribute('aria-hidden', String(!visible));
  }).observe(mainBuy);
}

/* ---------- Formularze: walidacja i pola warunkowe (prototyp, bez wysyłki) ---------- */
const nipOk = v => {
  const d = v.replace(/\D/g, ''); if (d.length !== 10) return false;
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  return d.split('').slice(0, 9).reduce((s, c, i) => s + c * w[i], 0) % 11 === +d[9];
};
$$('[data-toggle]').forEach(cb => {
  const box = $(cb.dataset.toggle);
  const sync = () => { box.hidden = !cb.checked; $$('input', box).forEach(i => i.required = cb.checked && i.name !== 'firma-adres'); };
  cb.addEventListener('change', sync); sync();
});
$$('[data-form]').forEach(f => {
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('input, select, textarea', f).forEach(i => {
      const field = i.closest('.field, .check');
      let valid = i.checkValidity();
      if (i.hasAttribute('data-nip') && !i.closest('[hidden]') && i.value && !nipOk(i.value)) valid = false;
      field?.classList.toggle('is-invalid', !valid);
      if (!valid && ok) { ok = false; i.focus(); }
    });
    if (!ok) return;
    $('[data-form-ok]', f).hidden = false;
    f.querySelector('button[type=submit]').disabled = true;
    if (f.classList.contains('checkout')) cart.write([]);
  });
  $$('input, select, textarea', f).forEach(i => i.addEventListener('input', () => i.closest('.field, .check')?.classList.remove('is-invalid')));
});

/* ---------- Cookies: zgoda per kategoria, pamięć w localStorage (prototyp) ---------- */
const COOKIES_KEY = 'lunchee-cookies';
const cookiesBox = $('.cookies');
if (cookiesBox) {
  let saved = null; try { saved = JSON.parse(localStorage.getItem(COOKIES_KEY)); } catch {}
  if (!saved) cookiesBox.hidden = false;
  $$('[data-cookies]', cookiesBox).forEach(b => b.addEventListener('click', () => {
    const mode = b.dataset.cookies;
    const v = { niezbedne: true,
      analityka: mode === 'wszystkie' || (mode === 'wybrane' && $('[name=analityka]', cookiesBox).checked),
      marketing: mode === 'wszystkie' || (mode === 'wybrane' && $('[name=marketing]', cookiesBox).checked),
      data: new Date().toISOString() };
    try { localStorage.setItem(COOKIES_KEY, JSON.stringify(v)); } catch {}
    cookiesBox.hidden = true;
  }));
}

/* ---------- Dostawa w zamówieniu: koszt przykładowy zależny od wyboru ---------- */
$$('input[name=dostawa]').forEach(r => r.addEventListener('change', () => {
  const ship = $('[data-cart-ship]'); if (!ship) return;
  ship.dataset.ship = r.value === 'paczkomat' ? '12.99' : '14.99'; cart.render();
}));

/* ---------- Dla firm: podgląd logo na produkcie (plik zostaje w przeglądarce) ---------- */
$$('[data-logo-demo]').forEach(demo => {
  const product = $('[data-logo-product]', demo), zone = $('[data-logo-zone]', demo);
  const img = $('[data-logo-img]', demo), ph = $('[data-logo-placeholder]', demo);
  const input = $('[data-logo-input]', demo), reset = $('[data-logo-reset]', demo);
  const sw = $$('[data-color]', demo);
  sw.forEach(b => b.addEventListener('click', () => {
    sw.forEach(x => x.setAttribute('aria-pressed', x === b));
    product.style.opacity = 0;
    setTimeout(() => { product.src = `assets/img/produkty/${b.dataset.color}.webp`; product.style.opacity = 1; }, 180);
    zone.style.color = b.dataset.color === 'lb715' ? 'var(--tekst-slaby)' : '';
    zone.style.borderColor = b.dataset.color === 'lb715' && !zone.classList.contains('has-logo') ? 'var(--tekst-slaby)' : '';
  }));
  input?.addEventListener('change', () => {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { img.src = r.result; img.hidden = false; ph.hidden = true; zone.classList.add('has-logo'); reset.hidden = false; };
    r.readAsDataURL(f);
  });
  reset?.addEventListener('click', () => { img.hidden = true; img.removeAttribute('src'); ph.hidden = false; zone.classList.remove('has-logo'); reset.hidden = true; input.value = ''; });
});

/* Ebook na hasło (runda 01). Prototyp: hasło sprawdzane w przeglądarce,
   docelowo po stronie serwera razem z plikiem PDF. */
const gate = $('[data-gate]');
if (gate) {
  const panel = $('[data-gate-panel]'), err = $('[data-gate-err]');
  gate.addEventListener('submit', ev => {
    ev.preventDefault();
    const ok = gate.haslo.value.trim().toLowerCase() === 'lunchee';
    err.hidden = ok;
    if (!ok) { gate.haslo.focus(); return; }
    panel.hidden = false;
    gate.hidden = true;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
