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
const setMenu = open => {
  if (!toggle || !mobileNav) return;
  mobileNav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.classList.toggle('is-open', open);
  document.body.classList.toggle('no-scroll', open);
};
toggle?.addEventListener('click', () => setMenu(!mobileNav.classList.contains('is-open')));
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

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
// Krótkie nazwy akcesoriów do wiersza koszyka i komunikatu po dodaniu (pełne nazwy z docx nie mieszczą się w wierszu)
const KROTKO = { lbb370: 'Torba termiczna LBB370', lbc7: 'Pojemnik INOX LBC7', lbcl7: 'Pojemnik z\u00a0pokrywą LBCL7', lbl7: 'Pokrywa LBL7' };
const krotkaNazwa = x => KROTKO[x.id] || x.name;
const sztuk = n => n + ' ' + (n === 1 ? 'produkt' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'produkty' : 'produktów');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

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
/* Runda 3 (22.10): karuzela jako funkcja, bo pasek cech „Dlaczego Lunchee?” przychodzi z wariantu (js/warianty-sekcji.js)
   po załadowaniu strony. Strzałki szukamy najpierw w najbliższym [data-karuzela]: w sekcji z wariantem stoi też ukryty oryginał. */
const karuzela = track => {
  if (track.dataset.karuzelaGotowa) return;
  track.dataset.karuzelaGotowa = '1';
  const items = [...track.children];
  const dots = track.dataset.dots ? document.getElementById(track.dataset.dots) : null;
  const wrap = track.closest('[data-karuzela]') || track.closest('section') || document;
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
};
$$('[data-carousel]').forEach(karuzela);
document.addEventListener('ws:wariant', () => $$('[data-carousel]').forEach(karuzela));

/* ---------- Galeria karty produktu ---------- */
$$('[data-gallery]').forEach(g => {
  const main = $('.gallery__main', g);
  const slides = $$('img', main);
  const thumbs = $$('.gallery__thumbs button', g);
  const pasek = $('.gallery__thumbs', g);
  const strzalki = $$('.gallery__pasek-strzalka', g);
  const odswiezStrzalki = () => {
    if (!pasek) return;
    const max = pasek.scrollWidth - pasek.clientWidth - 2;
    strzalki.forEach(b => { b.disabled = +b.dataset.krok < 0 ? pasek.scrollLeft <= 2 : pasek.scrollLeft >= max; });
  };
  strzalki.forEach(b => b.addEventListener('click', () => pasek.scrollBy({ left: +b.dataset.krok * pasek.clientWidth * .8, behavior: reduceMotion ? 'auto' : 'smooth' })));
  pasek?.addEventListener('scroll', odswiezStrzalki, { passive: true });
  addEventListener('resize', odswiezStrzalki);
  odswiezStrzalki();
  const dots = $('.gallery__dots', g);
  slides.forEach(() => dots.appendChild(document.createElement('span')));
  const dotEls = [...dots.children];
  let i = 0;
  const setActive = k => {
    i = Math.max(0, Math.min(k, slides.length - 1));
    thumbs.forEach((t, n) => t.setAttribute('aria-current', n === i));
    dotEls.forEach((d, n) => d.classList.toggle('is-active', n === i));
    // pasek miniatur przewijamy sam, bez scrollIntoView: to przesuwało całą stronę, gdy pasek był pod krawędzią ekranu
    const t = thumbs[i];
    if (t && pasek && (t.offsetLeft < pasek.scrollLeft || t.offsetLeft + t.offsetWidth > pasek.scrollLeft + pasek.clientWidth)) {
      pasek.scrollTo({ left: t.offsetLeft - (pasek.clientWidth - t.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
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

/* ---------- Promocja „Dwa Lunchee taniej”: rabat na każde dwa lunch boxy (wysokość w <meta name="lunchee-para">) ---------- */
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
    // runda 03: przy darmowej dostawie opcje w zamówieniu pokazują to samo co podsumowanie (przekreślona cena i 0,00 zł)
    const gratis = n > 0 && sum >= free;
    $$('[data-dostawa-cena]').forEach(e => e.innerHTML = gratis
      ? `<s><span class="sr-only">zamiast </span>${zl(+e.dataset.dostawaCena)}</s> <b>${zl(0)}</b>` : zl(+e.dataset.dostawaCena));
    $$('[data-cart-total]').forEach(c => c.textContent = zl(sum + ship));
    // zamówienie: wiersz o rozszerzonej gwarancji, gdy w koszyku jest lunch box (audyt R2-43, bez kwoty)
    $$('[data-cart-gw]').forEach(g => g.hidden = !cart.read().some(x => MODELS[x.id]));
    koszykV4({ items: cart.read(), n, gross, disc, sum, ship });
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
        </li>`).join('') + (items.some(x => MODELS[x.id]) ? `
        <li class="cart__item cart__item--gwarancja">
          <span class="pieczec" aria-hidden="true"><svg><use href="#i-rozeta"/></svg><span>Gwarancja<b>30</b>miesięcy</span></span>
          <div class="cart__item-body"><b>Rozszerzona gwarancja producenta jest już w koszyku</b><small>30 miesięcy gwarancji producenta, do każdego lunch boxa w zamówieniu.</small></div>
          <span class="price price--sm">teraz 0 zł</span>
        </li>` : '');
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
// Runda 02, 17.10 (audyt R2-43): klient otwiera prototyp z pustą przeglądarką, a koszyk ma pokazać wybrany układ.
// Przy pierwszym wejściu na koszyk wkładamy do niego dwa Lunchee z projektu (LB755 i LB715), jeden raz. Potem koszyk
// jest dokładnie taki, jak go ułożysz, a „Przejdź do zamówienia” przenosi tę samą zawartość.
if (here === 'koszyk.html') {
  try {
    if (localStorage.getItem(CART_KEY) === null && !localStorage.getItem(CART_KEY + '-przyklad')) {
      localStorage.setItem(CART_KEY + '-przyklad', '1');
      localStorage.setItem(CART_KEY, JSON.stringify(['lb755', 'lb715'].map(id => ({
        id, name: `Lunchee ${MODELS[id].code} ${MODELS[id].name}`, img: `assets/img/produkty/${id}.webp`, price: MODELS[id].price, qty: 1 }))));
    }
  } catch {}
}
cart.render();
addEventListener('storage', e => e.key === CART_KEY && cart.render());
// warianty sekcji wstawia js/warianty-sekcji.js po pobraniu pliku, wtedy koszyk w wariancie dostaje treść
document.addEventListener('ws:wariant', () => cart.render());

/* ---------- Koszyk, wariant 4 „Granatowe podsumowanie” (warianty/koszyk.html): treść z prawdziwego koszyka ----------
   Runda 02, 17.10 (audyt R2-43, R2-44, R2-46, R1-52). Współrzędne w jednostkach płótna wariantu: wiersz koszyka
   co 174 (desktop) i 148 (telefon), układ w pliku wariantu jest policzony dla dwóch pozycji. */
function koszykV4({ items, n, gross, disc, sum, ship }) {
  const vk = $('[data-kv-koszyk]'); if (!vk) return;
  const lb = items.some(x => MODELS[x.id]);
  const k = Math.max(1, items.length);
  const a = (k - 2) * 174, am = (k - 2) * 148;          // wiersze ponad dwa (albo mniej)
  const b = a - (lb ? 0 : 140), bm = am - (lb ? 0 : 130); // bez lunch boxa nie ma wiersza gwarancji (karta 118 plus odstęp jak nad nią)
  const r = disc.value ? 0 : -48, rm = disc.value ? 0 : -42;  // bez rabatu wiersz znika, podsumowanie się skraca
  const z = { '--kv-a': a, '--kv-am': am, '--kv-b': b, '--kv-bm': bm, '--kv-r': r, '--kv-rm': rm,
    '--h-k': 941 + Math.max(b, r), '--mhk': 2054 + bm + rm }; // desktop: wyższa z kolumn plus margines płótna
  Object.entries(z).forEach(([p, v]) => vk.style.setProperty(p, v));

  // wiersze; fokus wraca na ten sam przycisk po przerysowaniu (obsługa z klawiatury)
  const lista = $('[data-kv-lista]', vk), akt = document.activeElement;
  const fokus = lista.contains(akt) && akt.closest('[data-id]') ? [akt.closest('[data-id]').dataset.id, akt.dataset.kvKrok,
    $$('[data-id]', lista).indexOf(akt.closest('[data-id]'))] : null;
  lista.innerHTML = items.length ? items.map((x, i) => {
    const nazwa = esc(krotkaNazwa(x));
    const img = MODELS[x.id] ? `assets/img/r2/produkty/${x.id}-zamkniety.webp` : esc(x.img);
    return `<div class="a karta" data-id="${esc(x.id)}" style="--x:40;--y:${186 + i * 174};--w:894;--h:156;background:#fff;--mx:16;--my:${96 + i * 148};--mw:358;--mh:136">
    <span class="a kv-foto" style="--x:14;--y:12;--w:234;--h:132;--mx:12;--my:12;--mw:108;--mh:112"><img src="${img}" alt=""></span>
    <b class="a" style="--x:278;--y:37;--fs:22;color:var(--tekst-mocny);white-space:nowrap;--mx:134;--my:16;--mfs:15">${nazwa}</b>
    <span class="a" style="--x:278;--y:71;--fs:30;font-family:var(--font-naglowki);font-weight:700;color:var(--tekst-mocny);--mx:134;--my:38;--mfs:22">${zl(x.price || 0)}</span>
    <span class="a kv-ilosc" style="--x:614;--y:50;--w:160;--h:56;--fs:22;--mx:134;--my:76;--mw:116;--mh:48;--mfs:18"><button type="button" data-kv-krok="-1" aria-label="Mniej: ${nazwa}">−</button><output>${x.qty}</output><button type="button" data-kv-krok="1" aria-label="Więcej: ${nazwa}">+</button></span>
    <button type="button" class="a kv-usun" data-kv-usun aria-label="Usuń z koszyka: ${nazwa}" style="--x:790;--y:50;--w:52;--h:56;--fs:26;--mx:298;--my:76;--mw:48;--mh:48;--mfs:22">🗑</button>
  </div>`;
  }).join('') : `<div class="a karta" style="--x:40;--y:186;--w:894;--h:156;background:#fff;--mx:16;--my:96;--mw:358;--mh:136">
    <b class="a" style="--x:32;--y:34;--fs:26;color:var(--tekst-mocny);--mx:20;--my:20;--mfs:18">Twój koszyk jest pusty.</b>
    <a class="a btn-v btn-b" href="lunch-boxy.html" style="--x:32;--y:80;--w:300;--h:52;--fs:18;--mx:20;--my:62;--mw:318;--mh:52;--mfs:16">Wybierz swój Lunchee <svg><use href="#i-arrow"/></svg></a>
  </div>`;
  if (fokus) {
    // usunięta pozycja znika razem z przyciskiem: fokus idzie na kosz pozycji, która zajęła jej miejsce, a bez pozycji na nagłówek
    const cel = $(`[data-id="${fokus[0]}"] ${fokus[1] ? `[data-kv-krok="${fokus[1]}"]` : '[data-kv-usun]'}`, lista)
      || $$('[data-kv-usun]', lista)[Math.min(fokus[2], items.length - 1)] || $('[data-kv-h1]', vk);
    cel?.focus();
  }

  $$('[data-kv="gw"]', vk).forEach(e => e.toggleAttribute('data-kv-ukryj', !lb));
  $$('[data-kv-pelny]', vk).forEach(e => e.toggleAttribute('data-kv-ukryj', !items.length)); // pusty koszyk: bez dostawy i przejścia do zamówienia
  $$('[data-kv="rabat"]', vk).forEach(e => e.toggleAttribute('data-kv-ukryj', !disc.value));
  const pole = (nazwa, v, html) => $$(`[data-kv-pole="${nazwa}"]`, vk).forEach(e => html ? e.innerHTML = v : e.textContent = v);
  pole('ile', sztuk(n)); pole('wartosc', zl(gross)); pole('rabat', '−' + zl(disc.value)); pole('dostawa', zl(ship)); pole('razem', zl(sum + ship));

  // promocja: rabat naliczony albo zachęta do drugiego (kolejnego) Lunchee, teksty te same co w boksie koszyka
  const t = paraTeksty(disc);
  vk.dataset.kvPromo = t.stan === 'naliczony' ? 'naliczony' : 'dodaj';
  pole('naglowek', t.stan === 'naliczony' ? t.h : `Rabat ${t.ramka} naliczony`, true);
  pole('oszczedzasz', t.stan === 'naliczony' ? t.p : '');
  if (t.stan !== 'naliczony') { pole('zacheta', t.h, true); pole('przycisk', t.btn); }
  const szt = items.filter(x => MODELS[x.id]).flatMap(x => Array(x.qty).fill(x.id));
  const foto = (nr, id) => { const f = $(`[data-kv-foto="${nr}"]`, vk); if (!f) return; f.toggleAttribute('data-kv-ukryj', !id); if (id) f.src = `assets/img/r2/produkty/${id}-zamkniety.webp`; };
  foto(1, szt[0] || 'lb755'); foto(2, szt[1] || (szt.length ? '' : 'lb745'));

  if (!vk.dataset.kvGotowe) {
    vk.dataset.kvGotowe = '1';
    vk.addEventListener('click', e => {
      const krok = e.target.closest('[data-kv-krok]'), usun = e.target.closest('[data-kv-usun]');
      const id = (krok || usun)?.closest('[data-id]')?.dataset.id; if (!id) return;
      if (usun) { cart.remove(id); return; }
      const x = cart.read().find(y => y.id === id);
      if (x) cart.setQty(id, x.qty + +krok.dataset.kvKrok);
    });
  }
}

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
  toast(`Dodano do koszyka: ${krotkaNazwa({ id: b.dataset.add, name: b.dataset.name })}`); // forma bez rodzaju (audyt R2-46: „Torba… dodany”)
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
// Runda 02 (9.10): bez słowa „para”, które klient uznał za dwuznaczne; mówimy o dwóch lunch boxach.
$$('[data-add-pair]').forEach(b => b.addEventListener('click', () => {
  cart.add({ id: b.dataset.addPair, name: b.dataset.name, img: b.dataset.img, price: +b.dataset.price }, 2);
  toast(`Dwa ${b.dataset.name} w koszyku, rabat ${Math.round(PARA * 100)}% naliczony`);
}));

// Promocja w koszyku: trzy stany zależne od liczby lunch boxów (boks oryginału i wariant 4 biorą te same teksty)
function paraTeksty(disc) {
  const r = Math.round(PARA * 100);
  const ramka = `<span class="rabat">${r}%</span>`;
  if (disc.units % 2 === 1) {
    const first = disc.units === 1;
    return { stan: 'dodaj', r, ramka,
      h: first ? `Dodaj drugi Lunchee, a\u00a0rabat ${ramka} obejmie oba` : `Dodaj jeszcze jeden Lunchee, a\u00a0rabat ${ramka} obejmie kolejne\u00a0dwa`,
      p: first ? 'Drugi lunch box może być w\u00a0innym kolorze, dla Ciebie albo dla bliskiej osoby.' : `Masz już ${zl(disc.value)} rabatu. Kolory możesz łączyć.`,
      btn: first ? 'Wybierz drugi Lunchee' : 'Wybierz kolejny Lunchee' };
  }
  if (disc.pairs > 0) return { stan: 'naliczony', r, ramka, h: `Rabat ${ramka} naliczony`,
    p: `Oszczędzasz ${zl(disc.value)}. Każde kolejne dwa lunch boxy też kosztują ${r}% mniej.` };
  return { stan: 'zero', r, ramka, h: `Dwa Lunchee ${ramka} taniej`,
    p: 'Jeden dla Ciebie, drugi dla bliskiej osoby. Rabat obejmuje każde dwa lunch boxy, kolory możesz łączyć.', btn: 'Wybierz Lunchee' };
}
function paraCart(disc) {
  const box = $('[data-para-cart]'); if (!box) return;
  const h = $('[data-para-h]', box), p = $('[data-para-p]', box), btn = $('[data-para-btn]', box);
  const t = paraTeksty(disc);
  box.classList.toggle('is-done', t.stan === 'naliczony');
  h.innerHTML = t.h;
  p.textContent = t.p;
  btn.hidden = !t.btn;
  if (t.btn) btn.textContent = t.btn;
}

/* ---------- Pasek zakupu na telefonie ---------- */
const mainBuy = $('[data-main-buy]'), stickyBuy = $('.sticky-buy');
if (mainBuy && stickyBuy && 'IntersectionObserver' in window) {
  // Runda 02, 17.10 (audyt R1-47): na telefonie pasek jest od razu, gdy główny przycisk leży jeszcze pod ekranem
  // (wcześniej dopiero po przewinięciu za niego). Margines 80 px w dół chowa pasek, zanim przycisk wejdzie na ekran,
  // więc pasek go nie zasłania. Desktop bez zmian: pasek po minięciu przycisku.
  const telefon = matchMedia('(max-width: 899px)');
  let ost;
  const ustaw = () => {
    if (!ost) return;
    const on = !ost.isIntersecting && (telefon.matches || ost.boundingClientRect.top < 0);
    stickyBuy.classList.toggle('is-visible', on);
    document.body.classList.toggle('has-visible-sticky-buy', on); // komunikat „Dodano do koszyka” staje nad paskiem
    if (on) document.body.style.setProperty('--sticky-buy-height', stickyBuy.offsetHeight + 'px');
  };
  new IntersectionObserver(([e]) => { ost = e; ustaw(); }, { rootMargin: '0px 0px 80px 0px' }).observe(mainBuy);
  telefon.addEventListener('change', ustaw);
}

/* ---------- Formularze: walidacja i pola warunkowe (prototyp, bez wysyłki) ---------- */
// NIP (re-audyt P-13, 17.10): przyjmujemy zapis z kreskami, spacjami i prefiksem PL („526-000-00-05”, „PL 526 000 00 05”),
// sprowadzamy go do 10 cyfr i dopiero wtedy liczymy sumę kontrolną modulo 11. Inne znaki dalej dają błąd.
const nipNorm = v => v.trim().replace(/^PL/i, '').replace(/[\s-]/g, '');
const nipOk = v => {
  const d = nipNorm(v); if (!/^\d{10}$/.test(d)) return false;
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  return d.split('').slice(0, 9).reduce((s, c, i) => s + c * w[i], 0) % 11 === +d[9];
};
// poprawny NIP wpisany z kreskami albo z PL zostaje w polu jako 10 cyfr
$$('[data-nip]').forEach(i => i.addEventListener('change', () => { if (nipOk(i.value)) i.value = nipNorm(i.value); }));
$$('[data-toggle]').forEach(cb => {
  const box = $(cb.dataset.toggle);
  // 17.10 (audyt „Faktura VAT · pola”): adres firmy też wymagany, faktura musi mieć adres nabywcy (art. 106e ust. 1 pkt 3 ustawy o VAT)
  const sync = () => { box.hidden = !cb.checked; $$('input', box).forEach(i => i.required = cb.checked); };
  cb.addEventListener('change', sync); sync();
});
/* ---------- Zamówienie: „Zaznacz wszystkie zgody” (runda 03, KOS-2848) ----------
   Pole zbiorcze tylko ustawia zgody pod nim. Każda zgoda zostaje osobnym polem i można ją odznaczyć; gdy część jest
   zaznaczona, pole zbiorcze ma stan pośredni (indeterminate), gdy wszystkie, jest zaznaczone. Na starcie nic nie jest zaznaczone. */
$$('[data-zgody-wszystkie]').forEach(wszystkie => {
  const zgody = $$('[data-zgoda]', wszystkie.closest('fieldset') || document);
  const stan = () => {
    const ile = zgody.filter(z => z.checked).length;
    wszystkie.checked = ile === zgody.length;
    wszystkie.indeterminate = ile > 0 && ile < zgody.length;
  };
  wszystkie.addEventListener('change', () => {
    zgody.forEach(z => { if (z.checked !== wszystkie.checked) { z.checked = wszystkie.checked; z.dispatchEvent(new Event('input', { bubbles: true })); } });
    stan();
  });
  zgody.forEach(z => z.addEventListener('change', stan));
  addEventListener('pageshow', stan); // przeglądarka może odtworzyć zaznaczenia po powrocie na stronę
  stan();
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
    zamknijCookies();
  }));
  // Esc zamyka baner bez zapisu, ale tylko gdy wybór jest już zapisany (przy pierwszym wejściu zgoda jest wymagana)
  cookiesBox.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    let zapis = null; try { zapis = localStorage.getItem(COOKIES_KEY); } catch {}
    if (zapis) zamknijCookies();
  });
}
var cookiesOtwierajacy = null;
function zamknijCookies() {
  cookiesBox.hidden = true;
  if (cookiesOtwierajacy && document.contains(cookiesOtwierajacy)) cookiesOtwierajacy.focus();
  cookiesOtwierajacy = null;
}
// 17.10 (audyt „Cookies · baner”): „Ustawienia cookies” w stopce otwiera baner z zapisanym wyborem, zgodę można zmienić.
// Bez banera na stronie link prowadzi do opisu cookies w polityce prywatności.
$$('[data-cookies-open]').forEach(a => a.addEventListener('click', e => {
  if (!cookiesBox) return;
  e.preventDefault();
  let saved = null; try { saved = JSON.parse(localStorage.getItem(COOKIES_KEY)); } catch {}
  ['analityka', 'marketing'].forEach(k => { const i = $(`[name=${k}]`, cookiesBox); if (i) i.checked = !!saved?.[k]; });
  const opcje = $('.cookies__opts', cookiesBox); if (opcje) opcje.open = true;
  cookiesOtwierajacy = a;
  cookiesBox.hidden = false;
  $('[data-cookies]', cookiesBox)?.focus();
}));

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


/* ---------- Runda 02: kod rabatowy (kody waliduje docelowo platforma sklepu) ---------- */
// Delegacja na dokumencie, bo formularz w wariancie koszyka (warianty/koszyk.html) dochodzi po załadowaniu strony
document.addEventListener('submit', e => {
  const f = e.target.closest?.('[data-kod]'); if (!f) return;
  e.preventDefault();
  const kod = f.elements.kod.value.trim().toUpperCase();
  const msg = $('[data-kod-msg]', f.parentElement); if (!msg) return;
  msg.hidden = false;
  msg.dataset.stan = 'blad';
  const krotki = kod.length > 9 ? kod.slice(0, 8) + '…' : kod; // jeden wiersz komunikatu także przy kodzie z 16 znaków
  msg.textContent = kod ? `Kod „${krotki}” jest nieprawidłowy albo wygasł.` : 'Wpisz kod rabatowy.';
});

/* ---------- Runda 02: składniki w tle przesuwają się przy przewijaniu (data-glebia), w hero także za myszą ---------- */
(() => {
  const els = $$('.skladnik[data-glebia]');
  if (!els.length || reduceMotion) return;
  let mx = 0, my = 0, tick = false;
  const run = () => {
    tick = false;
    const vh = innerHeight;
    els.forEach(el => {
      const box = (el.closest('section') || el.parentElement).getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) return;
      const g = +el.dataset.glebia;
      const y = (box.top + box.height / 2 - vh / 2) * g * -0.35;
      el.style.setProperty('--przesun', `${(y + my * g * 26).toFixed(1)}px`);
      el.style.marginLeft = `${(mx * g * 26).toFixed(1)}px`;
    });
  };
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(run); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  $$('[data-paralaksa]').forEach(s => s.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = s.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; req();
  }));
  run();
})();

/* ---------- Runda 02: nakładka ze składnikami, kotwice na granicach sekcji ---------- */
(() => {
  const els = $$('.lewitujacy');
  if (!els.length) return;
  const main = $('main');
  const ustaw = () => els.forEach(el => {
    const k = $(el.dataset.kotwica);
    if (!k) { el.hidden = true; return; }
    const y = k.offsetTop + (el.dataset.krawedz === 'dol' ? k.offsetHeight : 0) + (+el.dataset.dy || 0);
    el.style.top = `${y - el.offsetHeight / 2}px`;
  });
  let tick = false;
  const plyn = () => {
    tick = false;
    if (reduceMotion) return;
    const vh = innerHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -400 || r.top > vh + 400) return;
      const srodek = r.top + r.height / 2 - (parseFloat(el.style.getPropertyValue('--przesun')) || 0);
      // ruch ograniczony do ±60 px: składnik przechodzi przez granicę sekcji, ale nie wjeżdża na treść
      const v = Math.max(-60, Math.min(60, (srodek - vh / 2) * +el.dataset.glebia * -0.45));
      el.style.setProperty('--przesun', `${v.toFixed(1)}px`);
    });
  };
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(plyn); } };
  ustaw(); plyn();
  addEventListener('load', () => { ustaw(); plyn(); });
  addEventListener('resize', () => { ustaw(); req(); });
  addEventListener('scroll', req, { passive: true });
  new ResizeObserver(() => { ustaw(); req(); }).observe(main);
})();

/* ---------- Hero 16.10: tło „Kuchnia” przypięte do kolumny tekstu ---------- */
(() => {
  const hero = $('.hero--tlo');
  if (!hero) return;
  const AR = 4088 / 1290, KOTWICA = .44, SRODEK = .56;   // lewa krawędź postaci (dłoń z widelcem) i jej środek, ułamki szerokości pliku
  const scena = $('.hero__scena', hero), tekst = $('.hero__text', hero), zdj = $('.hero__zdjecie', hero);
  const uklad = () => {
    const sc = scena.getBoundingClientRect();
    if (innerWidth >= 900) {
      const w = Math.max(sc.height * AR, sc.width + 2), prawy = tekst.getBoundingClientRect().right - sc.left;
      let l = Math.min(prawy + 24 - KOTWICA * w, sc.width * .74 - SRODEK * w);
      l = Math.max(sc.width - w, Math.min(0, l));
      hero.style.setProperty('--hero-l', l + 'px');
      hero.style.setProperty('--hero-w', w + 'px');
      hero.style.setProperty('--hero-t', (prawy - l) + 'px');
      // wolne pasy na warzywa: lewy kończy się przy tekście, prawy zaczyna się za postacią i widelcem
      hero.style.setProperty('--hero-tl', (tekst.getBoundingClientRect().left - sc.left) + 'px');
      hero.style.setProperty('--hero-pr', (l + .70 * w) + 'px');
    } else {
      const r = zdj.getBoundingClientRect(), v = Math.min(1, (r.width / r.height) / AR);
      hero.style.setProperty('--hero-poz-m', (v >= 1 ? 50 : Math.max(0, Math.min(100, (SRODEK - v / 2) / (1 - v) * 100))).toFixed(1) + '%');
    }
  };
  uklad();
  addEventListener('resize', uklad);
  addEventListener('load', uklad);
})();
