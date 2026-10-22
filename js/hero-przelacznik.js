/* Wybór tła hero dla klienta (runda 03, 22–23.10): przełącznik 10 teł, numery 01–10.
   Desktop i telefon (na telefonie osobny kadr *-m.webp, panel jako pasek numerów na dole). Klik w miniaturę albo strzałki ← → na klawiaturze; wybór w adresie (?hero=01–10; mapa na foldery PSD: 00 - Assets/…/hero/numeracja.md) i w localStorage.
   Po wyborze klienta: zostawić jedno tło w index.html, zdjąć ten plik i <script src="js/hero-przelacznik.js">. */
(() => {
  const TLA = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
  const JASNE = ['05', '08', '10'];
  // telefon: tło pod tekstem w kolorze dołu zdjęcia (dominanta dolnego pasa kadru *-m, poprawiona ręcznie dla 01, 04, 05, 10);
  // JASNE_M: biały tekst, bo granat ma tam za mały kontrast
  const TLO_M = { '01': '#d9cfe6', '02': '#f4dcbf', '03': '#ebd99a', '04': '#ecbcb2', '05': '#d2cdd2',
    '06': '#d3dade', '07': '#eda797', '08': '#323540', '09': '#f4e5ce', '10': '#b8562f' };
  const JASNE_M = ['08', '10'];
  const hero = document.querySelector('.hero--psd');
  const img = hero && hero.querySelector('.hero__psd');
  if (!img) return;
  const sciezka = nr => `assets/img/r2/hero-psd/hero-${nr}`;

  const css = document.createElement('style');
  css.textContent = `
  .hp { position: fixed; top: 96px; right: 14px; z-index: 90; width: 132px; max-height: calc(100vh - 116px); overflow-y: auto;
    padding: 10px; border-radius: 16px; background: #fff; box-shadow: 0 18px 40px -18px rgb(10 42 94 / .45), 0 0 0 1px rgb(10 42 94 / .08);
    font: 600 12px/1.2 Inter, system-ui, sans-serif; color: #0a2a5e; scrollbar-width: thin; }
  .hp button { display: block; position: relative; width: 100%; margin: 0 0 6px; padding: 0; border: 2px solid transparent; border-radius: 8px;
    background: none; cursor: pointer; overflow: hidden; }
  .hp button img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 5; object-fit: cover; }
  .hp button span { position: absolute; left: 4px; top: 4px; padding: 1px 5px; border-radius: 6px; background: rgb(255 255 255 / .9); font-size: 11px; }
  .hp button[aria-pressed="true"] { border-color: #0054af; }
  .hp small { display: block; margin-top: 4px; color: #6b6f7a; font-weight: 500; }
  @media (max-width: 899px) {
    .hp { top: auto; bottom: 10px; left: 10px; right: 10px; width: auto; max-height: none; display: flex; gap: 6px; overflow-x: auto; padding: 8px; }
    .hp small, .hp button img { display: none; }
    .hp button { flex: none; width: 44px; height: 36px; margin: 0; background: #f2f4f8; }
    .hp button span { position: static; display: block; background: none; font-size: 13px; }
  }`;
  document.head.appendChild(css);

  const panel = document.createElement('div');
  panel.className = 'hp';
  panel.innerHTML = TLA.map(nr =>
    `<button type="button" data-nr="${nr}" aria-pressed="false" title="Tło ${nr}${JASNE.includes(nr) ? ', biały tekst' : ''}">
       <img src="${sciezka(nr)}-w1280.webp" alt="" loading="lazy" decoding="async"><span>${nr}</span></button>`).join('') +
    '<small>← → zmienia tło</small>';
  document.body.appendChild(panel);
  const przyciski = [...panel.querySelectorAll('button')];

  // telefon: osobny kadr 16:10,5 (postać i pudełko), desktop: pełne tło 3,2:1
  const tel = matchMedia('(max-width: 899px)');
  let biezacy;
  const ustaw = (nr, zapisz = true) => {
    if (!TLA.includes(nr)) nr = TLA[0];
    biezacy = nr;
    img.srcset = tel.matches
      ? `${sciezka(nr)}-m800.webp 800w, ${sciezka(nr)}-m.webp 1200w`
      : `${sciezka(nr)}-w1280.webp 1280w, ${sciezka(nr)}.webp 1920w, ${sciezka(nr)}-w3840.webp 3840w`;
    img.src = tel.matches ? `${sciezka(nr)}-m.webp` : `${sciezka(nr)}.webp`;
    hero.classList.toggle('hero--jasny', JASNE.includes(nr));
    hero.classList.toggle('hero--jasny-m', JASNE_M.includes(nr));
    hero.style.setProperty('--hero-m-tlo', TLO_M[nr]);
    przyciski.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.nr === nr)));
    if (zapisz) {
      try { localStorage.setItem('lunchee-hero-psd', nr); } catch (e) {}
      const u = new URL(location.href); u.searchParams.set('hero', nr); history.replaceState(null, '', u);
    }
  };
  panel.addEventListener('click', e => { const b = e.target.closest('button'); if (b) ustaw(b.dataset.nr); });
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select') || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = przyciski.findIndex(b => b.getAttribute('aria-pressed') === 'true');
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TLA.length) % TLA.length;
    ustaw(TLA[n]); przyciski[n].scrollIntoView({ block: 'nearest' });
  });

  let start = new URLSearchParams(location.search).get('hero');
  if (!start) { try { start = localStorage.getItem('lunchee-hero-psd'); } catch (e) {} }
  ustaw(start || TLA[0], false);
  tel.addEventListener('change', () => ustaw(biezacy, false));
})();
