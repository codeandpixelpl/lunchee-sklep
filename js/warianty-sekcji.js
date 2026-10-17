/* Podgląd dla klienta (runda 02, 16.10): warianty sekcji z Figmy (strona 9, wiersze „Warianty Codex”).
   Każda sekcja dostaje własny widżet, przyklejony do niej podczas przewijania. Warianty leżą w warianty/<klucz>.html:
   <style> dla wszystkich wariantów sekcji + <template data-nr="1..5" data-nazwa="…">. Oryginał zostaje w DOM (ukryty),
   więc skrypty strony działają dalej po powrocie do „Teraz”. Wybór: ?<klucz>=N w adresie i localStorage.
   ZDJĄĆ PRZED ODDANIEM: <script src="js/warianty-sekcji.js"> z podstron, ten plik i katalog warianty/. */
(() => {
  // klucz: selektor sekcji, plik miniatur (wiersz w Figmie), nazwa w widżecie
  const SEKCJE = [
    ['promocje', '#promocje', '02-promocje', 'Promocje'],
    ['sposob', 'section.way', '03-kazdy-ma-swoj-sposob', 'Każdy ma swój sposób'],
    // 17.10 (audyt R2-36): wybrana infografika parametrów stoi też na kartach produktu, ze zdjęciami i nazwą modelu strony
    ['parametry', 'section.feats', '04-parametry', 'Parametry', /(index\.html|\/|produkt-lb7\d\d\.html)$/],
    ['modele', '#modele', '05-modele', 'Modele'],
    // 17.10 (audyt sekcji): wybrane kroki stoją też na stronie ebooka (tam wcześniej pięć kółek z samymi nazwami)
    ['kroki', '#jak-korzystac', '06-jak-korzystac', 'Jak korzystać', /(index\.html|\/|ebook\.html)$/],
    ['momenty', '#dla-kogo', '07-jedz-po-swojemu', 'Twój Lunchee moment'],
    ['ebook', '#ebook', '08-ebook', 'Ebook'],
    ['b2b', '#dla-firm', '09-b2b', 'Dla firm'],
    ['produkt', 'section.pdp', '10-karta-produktu', 'Karta produktu', /produkt-lb745\.html/],
    ['kategoria', 'main > section.sec:first-of-type', '11-kategoria', 'Kategoria', /lunch-boxy\.html/],
    ['koszyk', 'main > section.sec:first-of-type', '12-koszyk', 'Koszyk', /koszyk\.html/],
  ];
  const MIN = 'assets/img/r2/warianty-min/';
  // warianty wybrane przez Grzegorza: stoją na stronie na stałe, bez widżetu wyboru
  // sekcje, w których zostaje obecna wersja (bez wariantów i widżetu)
  const ZOSTAJE = ['momenty', 'ebook', 'produkt']; // 17.10: karta produktu zostaje w obecnej wersji, bez widżetu
  const WYBRANE = { promocje: 2, sposob: 2, parametry: 3, modele: 2, kroki: 2, b2b: 1, kategoria: 3, koszyk: 4 };
  // rekomendacja Claude 16.10 po analizie uwag klienta z 9.10 (po dwa warianty na sekcję), powód widoczny po najechaniu
  const POLECANE = {
    promocje: { 1: 'Zostaje układ, który klient zna, a dochodzi naklejka 30% na czerwono i żółte zdjęcie z jedzeniem', 2: 'Najmocniej pokazuje 30% w czerwonej ramce i „Promocja dla Ciebie”, gwarancja i dostawa jako kupony' },
    sposob: { 1: 'Najczytelniejsze porównanie kiedyś / dziś, pod spodem ikony z opakowania', 4: 'Bohaterem jest ciepły posiłek dziś, kanapka „kiedyś” zostaje małym, przekreślonym zdjęciem' },
    parametry: { 4: 'Płytki 60°C, 3, 1,7 l i INOX jak na opakowaniu: odpowiedź na „rozmijamy się z naszymi materiałami”', 2: 'Wizualizuje podgrzewanie: parujące danie w dużej karcie 60°C, o co klient prosił wprost' },
    modele: { 1: 'Produkt na białej karcie, duża nazwa modelu i dodatki nawiązujące do nazwy, bez jednolitych teł', 2: 'Tła z motywem nazwy (miasto, peonie, liście, perły, noc), czyli „dodatki w tle” z uwagi klienta' },
    kroki: { 4: 'Historia dnia użytkownika (rano, w drodze, w biurze, przerwa) i podpowiedź przewijania na telefonie', 1: 'Pięć zdjęć z historii w jednym rzędzie, zasilanie i 60°C jako płytki z opakowania' },
    momenty: { 3: 'Ludzie przy jedzeniu zamiast „person ze strategii”, karuzela pokazuje przewijanie', 5: 'Trasa jednego dnia: opowiada historię, której klient szuka, zamiast listy segmentów' },
    ebook: { 4: 'Największa okładka z Michałem (uwaga: „powiększyć ebook”), granat i żółty z marki', 1: 'Duża okładka na żółtym stole z carbonarą, czyli smak i przepis w jednym kadrze' },
    b2b: { 1: 'Od razu widać, że to oferta dla firm: teczka, prezent z kokardą i plakietka „Prezent firmowy”', 2: 'Inne zdjęcie, o które prosił klient: zespół w biurze z prezentem Lunchee' },
    produkt: { 1: 'Produkt jest bohaterem, ebook zaraz pod „Dodaj do koszyka”, mniejsze kropki kolorów', 2: 'To samo, ale ze smakiem: zdjęcie z ciepłym daniem na pierwszym planie' },
    kategoria: { 1: 'Zamknięte urządzenia z warzywami, po najechaniu ten sam kąt z daniem, dokładnie jak w uwadze klienta', 5: 'Apetyczne otwarte pudełka i duże zdjęcie u góry, wszystkie modele na równi' },
    koszyk: { 1: 'Komplet z uwag: gwarancja „teraz 0 zł”, kod rabatowy, akcesoria, rabat 30%, w spokojnym układzie', 3: 'Pasek darmowej dostawy i cztery akcesoria do dołożenia, rabat i gwarancja przy podsumowaniu' },
  };


  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap';
  document.head.appendChild(font);

  const css = document.createElement('style');
  css.textContent = `
  .ws-sekcja { position: relative; }
  /* lewitujące składniki strony nachodzą na kadry wariantów: na czas podglądu wariantu chowamy tę nakładkę */
  body.ws-aktywne .nakladka .lewitujacy { display: none !important; }
  .ws-sekcja.ws-on { padding: 0 !important; background: none !important; border: 0 !important; min-height: 0 !important; }
  .ws-sekcja.ws-on::before, .ws-sekcja.ws-on::after { display: none !important; }
  .ws-sekcja > .ws-oryginal { display: contents; }
  .ws-sekcja.ws-on > .ws-oryginal { display: none; }
  .ws-szyna { position: absolute; top: 0; bottom: 0; right: 14px; width: 0; z-index: 60; pointer-events: none; }
  .ws { position: sticky; top: 96px; float: right; width: 200px; margin: 24px 0; padding: 14px; border-radius: 20px; pointer-events: auto;
    background: #fff; box-shadow: 0 18px 40px -18px rgb(10 42 94 / .45), 0 0 0 1px rgb(10 42 94 / .08);
    font-family: var(--font-tekst, Inter, sans-serif); color: #0a2a5e; text-align: left; }
  .ws__gora { display: flex; align-items: center; gap: 8px; margin: 0 18px 2px 0; }
  .ws__gora b { font-size: 12.5px; font-weight: 800; line-height: 1.2; }
  .ws__kropka { flex: none; width: 8px; height: 8px; border-radius: 50%; background: #d42a1c; box-shadow: 0 0 0 4px rgb(212 42 28 / .15); }
  .ws__tekst { margin: 2px 0 10px; font-size: 11px; line-height: 1.35; color: #5b6475; }
  .ws, .ws * { box-sizing: border-box; }
  .ws__lista { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .ws__opcja { all: unset; box-sizing: border-box; min-width: 0; width: 100%; cursor: pointer; display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; padding: 4px; border-radius: 12px; outline: 2px solid transparent; }
  .ws__opcja--polecana { position: relative; box-shadow: inset 0 0 0 2px #1d7a3f; background: #eef7f0; }
  .ws__opcja--polecana::after { content: "polecam"; position: absolute; top: -7px; right: -4px; padding: 2px 6px; border-radius: 99px; background: #1d7a3f; color: #fff; font: 800 9px/1.2 var(--font-tekst, Inter, sans-serif); letter-spacing: .02em; }
  .ws__legenda { display: flex; align-items: center; gap: 6px; margin: 0 0 8px; font-size: 10.5px; line-height: 1.3; color: #1d5c34; }
  .ws__legenda i { flex: none; width: 10px; height: 10px; border-radius: 3px; background: #1d7a3f; }
  .ws--zwiniety .ws__legenda { display: none; }
  .ws__opcja:hover { background: var(--tlo-alt); }
  .ws__opcja:focus-visible { outline-color: #0a2a5e; }
  .ws__opcja[aria-pressed="true"] { outline-color: var(--akcent); background: var(--tlo-produkt); }
  .ws__min { width: 100%; display: grid; place-items: center; aspect-ratio: 16 / 9; border-radius: 8px; background: var(--tlo-alt) center / cover no-repeat;
    font-size: 10px; font-weight: 700; color: #7a5600; }
  .ws__opcja > span:last-child { display: block; min-width: 0; overflow-wrap: break-word; letter-spacing: 0; text-transform: none; font-size: 11px; font-weight: 700; line-height: 1.2; }
  .ws__zwin { all: unset; cursor: pointer; position: absolute; top: 9px; right: 12px; font-size: 18px; line-height: 1; color: #5b6475; }
  .ws--zwiniety { width: max-content; max-width: calc(100vw - 32px); padding: 10px 14px; cursor: pointer; } /* 17.10: w szynie o zerowej szerokości „auto” dawało słupek 55 px */
  .ws--zwiniety .ws__tekst, .ws--zwiniety .ws__lista, .ws--zwiniety .ws__zwin { display: none; }
  .ws--zwiniety .ws__gora { margin: 0; }
  @media (max-width: 899px) { .ws-szyna { right: 8px; } .ws { top: 72px; width: 170px; } }
  /* 17.10: na karcie produktu odznaki 60°C i 3 źródła stoją w prawym górnym rogu zdjęcia (audyt R1-44), więc zwinięty panel
     wyboru stoi na telefonie w lewym górnym rogu, nad pustym tłem packshotu */
  @media (max-width: 899px) { section.pdp > .ws-szyna { right: auto; left: 8px; } section.pdp > .ws-szyna > .ws { float: left; } }
  /* 17.10 (audyt R1-75): na karcie produktu panel startuje zwinięty i nie jedzie za przewijaniem, więc nie wchodzi na nazwę
     ani na „Dodaj do koszyka”. Na desktopie stoi w pasku okruszków nad sekcją, po prawej (ten pas jest pusty),
     na telefonie w lewym górnym rogu zdjęcia. Pod przypiętym nagłówkiem (z-index 50) chowa się przy przewijaniu. */
  section.pdp > .ws-szyna { z-index: 40; }
  section.pdp > .ws-szyna > .ws { position: absolute; top: 0; right: 0; }
  @media (max-width: 899px) { section.pdp > .ws-szyna > .ws { right: auto; left: 0; } }
  @media (min-width: 900px) { section.pdp > .ws-szyna > .ws { top: -56px; margin: 0; } }

  /* Płótno wariantu: kadr z Figmy 1672×941, wszystko w pikselach kadru (--x --y --w --h --fs), skaluje się z szerokością.
     Do 1672 px kadr jest na całą szerokość strony, wyżej stoi pośrodku, a tło sekcji (--tlo-v) biegnie dalej. */
  /* zmienne pozycji nie przechodzą z elementu na jego dzieci (zagnieżdżone .a), reset o zerowej wadze, więc styl inline wygrywa */
  .vk .a :where(*) { --x: 0; --y: 0; --w: initial; --h: initial; --fs: initial; --rot: initial; }
  .vk .odz { position: absolute; left: calc(var(--x) * var(--u)); top: calc(var(--y) * var(--u)); }
  .vk .odz > .odznaka { --w: calc(var(--s) * var(--u)); }
  .vk .odznaka * { --w: inherit; }
  .vk .odznaka--cieplo .odznaka__plytka b, .vk .odznaka--cieplo .odznaka__plytka small { white-space: nowrap; }
  .vk .odznaka--zasilanie .odznaka__plytka small { white-space: normal; text-align: center; line-height: 1.05; }
  /* kadr stoi w kolumnie treści strony (--tresc + boczny margines), tło wariantu jest kartą z zaokrągleniem, strona ma swoje tło */
  .vk-sek { background: var(--tlo); padding-block: clamp(16px, 2.2vw, 32px); }
  .vk-ramka { container-type: inline-size; width: min(100% - 2 * var(--margines), var(--tresc)); margin: 0 auto; }
  /* wariant z tłem na całą szerokość sekcji, kadr bez karty */
  .vk-sek--pelne { background: var(--tlo-v); padding-block: clamp(28px, 3.8vw, 60px); }
  .vk-sek--pelne .vk { background: none; border-radius: 0; overflow: visible; }
  .vk .unos { z-index: 5; } /* lewitujące składniki wchodzą na sąsiednią sekcję, nie chowają się pod nią */
  .vk .unos { rotate: var(--r, 0deg); animation: vk-unos var(--t, 8s) ease-in-out infinite alternate; animation-delay: var(--d, 0s); }
  @keyframes vk-unos { 0% { translate: 0 -8px; } 100% { translate: 0 10px; } }
  @media (prefers-reduced-motion: reduce) { .vk .unos { animation: none; } }
  /* 17.10 (audyt R2-49, droga 2): składniki w wariantach przesuwają się o kilka pikseli przy przewijaniu. --py liczy paralaksa()
     niżej; animation-composition: add dokłada kołysanie z animacji do tego przesunięcia zamiast je nadpisywać. */
  .vk .a:is(.unos, .vp-unos) { translate: 0 var(--py, 0px); animation-composition: add; }
  .vk { --u: calc(100cqw / 1672); position: relative; background: var(--tlo-v, transparent); border-radius: var(--r-l); overflow: hidden; height: calc(var(--h-k, 941) * var(--u)); font-family: var(--font-tekst); color: var(--tekst); }
  .vk .a { position: absolute; left: calc(var(--x, 0) * var(--u)); top: calc(var(--y, 0) * var(--u)); width: calc(var(--w) * var(--u)); height: calc(var(--h) * var(--u)); }
  .vk [style*="--fs"] { font-size: calc(var(--fs) * var(--u)); }
  .vk img { display: block; max-width: none; }
  .vk img.a { width: calc(var(--w) * var(--u)); height: auto; }
  .vk .alt { color: var(--cta); }
  .vk .c { text-align: center; }
  /* 17.10 (audyt R2-02): tracking z tokenu nagłówków (.012em), jak h1 w hero; było .01em na sztywno */
  .vk .t-h { margin: 0; font-family: var(--font-naglowki); font-weight: 700; color: var(--tekst-mocny); line-height: 1.02; letter-spacing: var(--tracking-naglowki); }
  .vk .t-p { margin: 0; color: var(--tekst-slaby); line-height: 1.42; }
  .vk .t-e { margin: 0; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: var(--tekst-etykieta); }
  .vk .reka { font-family: "Caveat", cursive; font-weight: 700; color: var(--tekst-mocny); line-height: 1.02; text-align: center; transform: rotate(var(--rot, -8deg)); }
  .vk .karta { border-radius: calc(24 * var(--u)); }
  .vk .cien { filter: drop-shadow(0 calc(18 * var(--u)) calc(16 * var(--u)) rgb(60 30 0 / .25)); }
  .vk .cien-s { filter: drop-shadow(0 calc(8 * var(--u)) calc(8 * var(--u)) rgb(60 30 0 / .2)); }
  .vk .btn-v { display: inline-flex; align-items: center; justify-content: center; gap: .45em; border-radius: 99px; font-weight: 800; text-decoration: none; white-space: nowrap; }
  .vk .btn-v svg { width: 1em; height: 1em; }
  .vk .btn-n { background: var(--tekst-mocny); color: #fff; }
  .vk .btn-b { background: var(--cta); color: #fff; }
  .vk .btn-z { background: var(--akcent); color: var(--tekst-mocny); }
  .vk .btn-o { background: transparent; color: var(--tekst-mocny); box-shadow: inset 0 0 0 calc(2 * var(--u)) var(--tekst-mocny); }
  .vk .tag-r { display: inline-flex; align-items: center; justify-content: center; border-radius: 99px; background: var(--promocja); color: #fff; font-weight: 800; letter-spacing: .02em; text-transform: uppercase; white-space: nowrap; }
  /* 17.10 (audyt R1-73): pigułka na kremie z opakowania (token), było jasnożółte #fbe7a8 spoza palety */
  .vk .pill-r { display: inline-flex; align-items: center; justify-content: center; border-radius: 99px; background: var(--tlo-alt); color: var(--promocja); font-weight: 800; white-space: nowrap; }
  /* 16.10: rabat jako czerwona plakietka z białą cyfrą (wcześniej czerwony obrys na bieli wyglądał płasko).
     17.10 (audyt R2-02): tracking z tokenu nagłówków jak h1 w hero, było -.01em */
  .vk .rabat { display: inline-block; position: relative; padding: .04em .18em .08em; margin: 0 .04em; border-radius: .16em; color: #fff; line-height: .92; letter-spacing: var(--tracking-naglowki);
    background: linear-gradient(180deg, #ef4a37 0%, #d42a1c 55%, #b81c10 100%); rotate: -4deg;
    box-shadow: inset 0 .04em 0 rgb(255 255 255 / .28), inset 0 -.07em 0 rgb(0 0 0 / .2), 0 .1em .22em -.04em rgb(140 20 5 / .55);
    text-shadow: 0 .03em 0 rgb(0 0 0 / .18); }
  .vk .link-v { display: inline-flex; align-items: center; gap: .4em; font-weight: 800; color: var(--tekst-mocny); text-decoration: none; }
  .vk .link-v svg { width: 1em; height: 1em; }
  .vk .kolo { border-radius: 50%; overflow: hidden; }
  .vk .kolo > img:not(.a) { width: 100% !important; height: 100% !important; object-fit: cover; }
  .vk .foto { overflow: hidden; }
  .vk .foto > img:not(.a) { width: 100% !important; height: 100% !important; object-fit: cover; }
  /* TELEFON (do 899 px), 17.10: każdy wybrany wariant ma własne płótno mobilne 390 jednostek szerokości (= szerokość ekranu,
     bez bocznego marginesu ramki, więc 16-jednostkowy margines ustawia się w samych współrzędnych).
     Płótno mobilne włącza klasa .vk--m na .vk. Współrzędne mobilne elementu: --mx --my --mw --mh (jednostki płótna 390),
     --mfs (rozmiar pisma), --ms (rozmiar odznaki .odz), --mrot (obrót). Wysokość płótna: --mhk na .vk.
     Element bez --mx w stylu jest na telefonie UKRYTY (ozdobniki, dopiski). Zagnieżdżone .a liczą się względem rodzica.
     Płótno bez .vk--m (warianty jeszcze niewybrane) skaluje się w całości do szerokości ekranu. */
  @media (max-width: 899px) {
    /* tablet 600–899: układ telefonu nie rośnie bez końca, stoi pośrodku w kolumnie do 560 px (tło sekcji dalej na całą szerokość) */
    .vk-ramka { width: min(100%, 560px); }
    .vk:not(.vk--m) { --u: calc(100cqw / 1672); }
    .vk.vk--m { --u: calc(100cqw / 390); height: calc(var(--mhk, 800) * var(--u)); }
    .vk--m .a :where(*), .vk--m .odz :where(*) { --mx: initial; --my: initial; --mw: initial; --mh: initial; --mfs: initial; --ms: initial; --mrot: initial; }
    .vk--m .a:not([style*="--mx"]), .vk--m .odz:not([style*="--mx"]) { display: none !important; }
    .vk--m .a, .vk--m .odz { left: calc(var(--mx) * var(--u)); top: calc(var(--my) * var(--u)); }
    .vk--m .a[style*="--mw"] { width: calc(var(--mw) * var(--u)); }
    .vk--m .a:not([style*="--mw"]) { width: auto; }
    .vk--m .a[style*="--mh"] { height: calc(var(--mh) * var(--u)); }
    .vk--m .a:not([style*="--mh"]):not(img) { height: auto; }
    .vk--m img.a { height: auto; }
    .vk--m [style*="--mfs"] { font-size: calc(var(--mfs) * var(--u)) !important; }
    .vk--m [style*="--mrot"] { transform: rotate(var(--mrot)) !important; }
    /* --ms liczone na samym .odz (dzieci mają --ms wyzerowane resetem wyżej), odznaka dziedziczy gotową szerokość */
    .vk--m .odz[style*="--ms"] { --odz-w: calc(var(--ms) * var(--u)); }
    .vk--m .odz[style*="--ms"] > .odznaka { --w: var(--odz-w); }
  }
  `;
  document.head.appendChild(css);

  /* 17.10 (audyt R2-49, droga 2): lekka paralaksa składników wariantów (.unos, w promocjach .vp-unos), najwyżej ±10 px.
     Jeden nasłuch przewijania z requestAnimationFrame, liczone tylko składniki w pobliżu ekranu (IntersectionObserver).
     Przy „ogranicz ruch” nic się nie rusza. Globalna nakładka .nakladka .lewitujacy zostaje wyłączona. */
  const ruch = !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window;
  const blisko = new Set();
  let klatka = 0;
  const przelicz = () => {
    klatka = 0;
    const vh = innerHeight;
    blisko.forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.height) return; // ukryty na tej szerokości
      const teraz = parseFloat(el.style.getPropertyValue('--py')) || 0;
      const srodek = r.top + r.height / 2 - teraz;
      const v = Math.max(-10, Math.min(10, (srodek - vh / 2) / vh * -14 * (+el.dataset.glebiaV || 1)));
      el.style.setProperty('--py', v.toFixed(1) + 'px');
    });
  };
  const zadaj = () => { if (!klatka) klatka = requestAnimationFrame(przelicz); };
  const widz = ruch ? new IntersectionObserver(wpisy => {
    wpisy.forEach(w => w.isIntersecting ? blisko.add(w.target) : blisko.delete(w.target));
    zadaj();
  }, { rootMargin: '200px 0px' }) : null;
  if (ruch) { addEventListener('scroll', zadaj, { passive: true }); addEventListener('resize', zadaj); }
  function paralaksa(korzen) {
    if (!widz) return;
    korzen.querySelectorAll('.unos, .vp-unos').forEach((el, i) => {
      el.dataset.glebiaV = [.7, 1, 1.3][i % 3]; // różna głębokość, żeby składniki nie jechały równo
      widz.observe(el);
    });
  }

  /* 17.10 (audyt R2-36): na karcie produktu infografika parametrów pokazuje model strony. Zdjęcia LB745 (danie, zamknięty)
     zamieniamy na zdjęcia modelu w jego kolorze (assets/img/r2/produkty/<id>-*.webp), a obok znaku lunchee stoi kod i nazwa
     modelu. Nagłówek „Dlaczego Lunchee?” zostaje co do znaku z docx klienta. */
  const MODEL_ID = (location.pathname.match(/produkt-(lb7\d\d)\.html$/) || [])[1];
  function naModel(korzen) {
    if (!MODEL_ID) return;
    korzen.querySelectorAll('img[src*="/r2/produkty/lb745-"]').forEach(img => {
      img.src = img.getAttribute('src').replace('/lb745-', `/${MODEL_ID}-`);
    });
    const h1 = document.querySelector('section.pdp h1, main h1');
    const m = h1 && h1.textContent.match(/\b(LB7\d\d)\s+([A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż]+)/);
    const logo = korzen.querySelector('[role="img"][aria-label="Lunchee"]');
    if (!m || !logo) return;
    const rzad = document.createElement('span');
    rzad.className = 'a vr-model';
    rzad.setAttribute('style', '--x:300;--y:22;--w:1072;--h:70;--fs:58;--mx:16;--my:2;--mw:358;--mh:30;--mfs:24');
    const znak = document.createElement('span');
    znak.className = 'vr-model__znak';
    znak.setAttribute('style', logo.getAttribute('style').replace(/--[a-z]+:[^;]*;/g, ''));
    znak.setAttribute('role', 'img');
    znak.setAttribute('aria-label', 'Lunchee');
    const nazwa = document.createElement('span');
    nazwa.className = 'vr-model__nazwa';
    nazwa.textContent = `${m[1]} ${m[2]}`;
    rzad.append(znak, nazwa);
    logo.replaceWith(rzad);
    // telefon: rząd ze znakiem i nazwą jest szerszy niż sam znak, więc brokuł z prawego górnego rogu schodzi nad pudełko
    const brokul = korzen.querySelector('img[src*="/skladniki/brokul"]');
    if (brokul) { brokul.style.setProperty('--mx', '334'); brokul.style.setProperty('--my', '128'); }
  }

  const zwijaj = true; // 17.10 (audyt R1-75): zwinięty na każdej szerokości, rozwija się po kliknięciu
  for (const [klucz, sel, plik, nazwa, strona] of SEKCJE) {
    // warianty podstron są zrobione na jednej stronie (LB745, kategoria, koszyk), na innych ich nie pokazujemy
    if (strona ? !strona.test(location.pathname) : !/(index\.html|\/)$/.test(location.pathname)) continue;
    if (ZOSTAJE.includes(klucz)) continue;
    const sek = document.querySelector(sel);
    if (!sek) continue;
    fetch(`warianty/${klucz}.html`, { cache: 'no-cache' }).then(r => r.ok ? r.text() : Promise.reject(r.status)).then(html => {
      const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
      const style = doc.querySelector('style');
      if (style) { const s = document.createElement('style'); s.textContent = style.textContent; s.dataset.ws = klucz; document.head.appendChild(s); }
      const szablony = [...doc.querySelectorAll('template[data-nr]')].sort((a, b) => a.dataset.nr - b.dataset.nr);
      wlacz(sek, klucz, plik, nazwa, szablony);
    }).catch(e => console.warn('warianty', klucz, e));
  }

  function wlacz(sek, klucz, plik, nazwa, szablony) {
    sek.classList.add('ws-sekcja');
    const oryg = document.createElement('div');
    oryg.className = 'ws-oryginal';
    while (sek.firstChild) oryg.appendChild(sek.firstChild);
    sek.appendChild(oryg);
    const miejsce = document.createElement('div');
    miejsce.className = 'ws-wariant';
    // przyciski w wariancie (koszyk, ilość, kolory) przekazują kliknięcie do ukrytego oryginału, więc sklep działa jak dotąd
    miejsce.addEventListener('click', e => {
      const el = e.target.closest('[data-ws-klik]');
      if (!el) return;
      const cel = oryg.querySelector(el.dataset.wsKlik);
      if (cel) { e.preventDefault(); cel.click(); }
    });
    sek.appendChild(miejsce);

    const szyna = document.createElement('div');
    szyna.className = 'ws-szyna';
    const panel = document.createElement('aside');
    panel.className = 'ws' + (zwijaj ? ' ws--zwiniety' : '');
    panel.setAttribute('aria-label', `Warianty sekcji ${nazwa}`);
    panel.innerHTML = `<div class="ws__gora"><span class="ws__kropka"></span><b>${nazwa}: do wyboru</b></div>
      <p class="ws__tekst">Kliknij wariant, żeby zobaczyć go na stronie.</p>
      <p class="ws__legenda"><i></i>Zielone: dwa warianty, które polecamy</p><div class="ws__lista"></div><button class="ws__zwin" type="button" aria-label="Zwiń panel">×</button>`;
    const lista = panel.querySelector('.ws__lista');
    const opcje = [{ nr: 0, nazwa: 'Teraz' }, ...szablony.map(t => ({ nr: +t.dataset.nr, nazwa: t.dataset.nazwa || 'Wariant ' + t.dataset.nr, t }))];
    for (const o of opcje) {
      const b = document.createElement('button');
      const pol = (POLECANE[klucz] || {})[o.nr];
      b.type = 'button'; b.className = 'ws__opcja' + (pol ? ' ws__opcja--polecana' : ''); b.dataset.nr = o.nr;
      if (pol) b.title = 'Polecam: ' + pol;
      b.innerHTML = `<span class="ws__min">${o.nr ? '' : 'obecna'}</span><span>${o.nr ? o.nr + '. ' : ''}${o.nazwa}</span>`;
      if (o.nr) b.querySelector('.ws__min').style.backgroundImage = `url("${MIN}${plik}-${o.nr}.jpg")`;
      b.addEventListener('click', () => ustaw(o.nr, true));
      lista.appendChild(b);
    }
    panel.querySelector('.ws__zwin').addEventListener('click', e => { e.stopPropagation(); panel.classList.add('ws--zwiniety'); });
    panel.addEventListener('click', () => panel.classList.contains('ws--zwiniety') && panel.classList.remove('ws--zwiniety'));
    szyna.appendChild(panel);
    if (!WYBRANE[klucz]) sek.appendChild(szyna);

    function ustaw(nr, zapisz) {
      const o = opcje.find(x => x.nr === nr) || opcje[0];
      sek.classList.toggle('ws-on', !!o.nr);
      document.body.classList.toggle('ws-aktywne', !!document.querySelector('.ws-on'));
      miejsce.innerHTML = '';
      if (o.nr) miejsce.appendChild(o.t.content.cloneNode(true));
      if (o.nr && klucz === 'parametry') naModel(miejsce);
      lista.querySelectorAll('.ws__opcja').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.nr === o.nr)));
      paralaksa(miejsce);
      // main.js wypełnia wariant danymi (koszyk) po tym zdarzeniu
      document.dispatchEvent(new CustomEvent('ws:wariant', { detail: { klucz, nr: o.nr } }));
      if (zapisz) {
        try { localStorage.setItem('lunchee-ws-' + klucz, o.nr); } catch (e) {}
        const u = new URL(location.href); u.searchParams.set(klucz, o.nr); history.replaceState(null, '', u);
      }
    }
    let start = WYBRANE[klucz] || parseInt(new URLSearchParams(location.search).get(klucz), 10);
    if (Number.isNaN(start)) { try { start = parseInt(localStorage.getItem('lunchee-ws-' + klucz), 10); } catch (e) {} }
    ustaw(Number.isNaN(start) ? (WYBRANE[klucz] || 0) : start, false);
  }
})();
