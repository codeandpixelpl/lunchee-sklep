# Lunchee · prototyp sklepu internetowego

Prototyp sklepu lunchee.pl (Lunchee, sub-marka NOVEEN) przygotowany przez Code&Pixel.
Statyczny HTML, CSS i JS, bez frameworka i bez kroku budowania.

> Ta paczka to stan z 24.10.2026 (runda 03). Na stronie głównej stoi przełącznik dziesięciu teł hero
> do wyboru przez klienta. Przed przekazaniem programiście trzeba zostawić jedno tło i zdjąć podgląd
> wariantów (opis niżej).

## Podgląd lokalny

```bash
python3 -m http.server 8000
```

Potem `http://localhost:8000/`. Strona działa też z GitHub Pages.

## Strony

| Plik | Strona |
|---|---|
| `index.html` | strona główna |
| `lunch-boxy.html`, `produkt-lb7xx.html` | lista i karty pięciu lunch boxów |
| `akcesoria.html`, `akcesoria-*.html` | lista i karty czterech akcesoriów |
| `koszyk.html`, `zamowienie.html` | koszyk i formularz zamówienia |
| `ebook.html`, `dla-firm.html`, `o-nas.html`, `kontakt.html` | strony informacyjne |
| `regulamin.html`, `polityka-prywatnosci.html`, `dostawa-i-platnosci.html`, `zwroty-i-reklamacje.html` | strony prawne |
| `dla-klienta/audyt-tresci.html` | lista tekstów, które klient musi jeszcze dostarczyć |

## Struktura

- `styleguide/tokens.css` kolory, typografia i odstępy jako zmienne CSS, jedyne źródło wartości
- `styleguide/components.css` komponenty wspólne dla wszystkich stron
- `css/style.css` układy sekcji, wartości wyłącznie przez `var()`
- `js/main.js` cała interakcja, w tym koszyk w `localStorage` i pasek darmowej dostawy
- `assets/` zdjęcia produktów, logo, ikony

## Uwagi do wdrożenia

- **Dane przykładowe**: ceny, koszt dostawy (14,99 zł) i próg darmowej dostawy (269 zł),
  opinie klientów i średnia ocen, nazwy dań w karuzeli przepisów oraz pojemności
  pojemników LBC7 i LBCL7. Wszystko do podmiany na dane klienta.
- **Koszyk i formularze** działają tylko w przeglądarce (koszyk w `localStorage`),
  bez backendu, płatności i wysyłki maili.
- **Fonty**: nagłówki używają Coolvetiki z projektu Adobe Fonts
  `https://use.typekit.net/gay0uyj.css` (rodzina `"coolvetica"`). Link znajduje
  się przed `styleguide/fonts.css` we wszystkich 23 stronach i w styleguide.
  Projekt zawiera wymagane wagi 400, 700 i 900 oraz pozostałe odmiany.
  Inter 4.1 dla tekstów i jako fallback nagłówków jest serwowany lokalnie
  z `assets/fonts/` (WOFF2, wagi 100–900, kursywa, polskie znaki; licencja OFL).
  Nie są potrzebne dodatkowe fonty. Plików Adobe nie kopiujemy na serwer.
  Zestaw Polish został opublikowany i zweryfikowany: komplet
  `ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ` renderuje się Coolvetiką w wagach 400, 700 i 900.
  Testy w Chromium, Firefox i WebKit przeszły; kontrola faktycznie użytych
  fontów w Chromium potwierdziła brak domieszki Inter dla tych znaków.
  Adobe obecnie dostarcza `font-display: auto`; ustawienie `swap` można
  włączyć w konfiguracji projektu Adobe. Lokalny Inter używa `swap`.
- **LB795 Night** jest pokazany jako niedostępny w sklepie (sprzedaż u partnera).
- **Strony prawne** zawierają strukturę i wzór formularza odstąpienia,
  treść regulaminu i polityki prywatności dostarcza klient.
- **Zgodność**: przy cenie promocyjnej wyświetla się najniższa cena z 30 dni (Omnibus),
  zgody w formularzach są rozdzielone.

## Przekazanie dla programisty (stan 17.10.2026)

Źródło prawdy to `03 - Design` w repozytorium projektu: strony generuje i uzupełnia `_build/build.py`
z `_build/produkty.json` i `_build/partials/`, a tokeny i komponenty leżą w `04 - Styleguide/`
(`tokens.css`, `components.css`, `styleguide.html`).

### Przed oddaniem: zdjąć podgląd wariantów sekcji

Wybrane warianty sekcji składa dziś w przeglądarce `js/warianty-sekcji.js` z plików `warianty/<sekcja>.html`.
Oryginalny kod sekcji leży na stronie ukryty w `.ws-oryginal`. Wybór:
`WYBRANE = { promocje: 2, sposob: 2, parametry: 3, modele: 2, kroki: 2, b2b: 1, kategoria: 3, koszyk: 4 }`,
a sekcje „momenty”, „ebook” i karta produktu zostają w wersji z `build.py` (`ZOSTAJE`).

1. Wypalić wybrane szablony na stałe w stronach: na `index.html` sześć sekcji z `WYBRANE`,
   na `lunch-boxy.html` kategorię, na `koszyk.html` koszyk, a na pięciu kartach `produkt-lb7xx.html` parametry t3
   z kodem, nazwą i zdjęciami modelu danej karty. Razem z szablonem przenieść wspólne style płótna
   (`.vk`, `.a`, `.t-h`, `.t-p`, `.rabat`, `.odz` i reszta) z `js/warianty-sekcji.js` do CSS.
2. W `_build/build.py` ustawić `PODGLAD_WARIANTOW = False`.
3. Usunąć `js/warianty-*.js` i katalog `warianty/`.
4. Przebudować strony: `python3 _build/build.py`.
5. Sprawdzić, że na żadnej stronie nie zostały statyczne kafle cech z `build.py` w miejscu parametrów t3
   i że nie ładuje się już Google Fonts. Krój Caveat (podpisy polaroidów w sekcji „Każdy ma swój sposób”)
   trzeba wtedy hostować lokalnie, jak Inter (licencja OFL).

### Przed oddaniem: zostawić jedno tło hero

Na stronie głównej `js/hero-przelacznik.js` przełącza dziesięć teł hero (numery 01–10, `?hero=NN` w adresie).
Na desktopie tło ma 3,2:1 (`hero-NN.webp`, `-w1280`, `-w3840`), na telefonie osobny kadr 16:10,5
(`hero-NN-m.webp`, `-m800`) i własny kolor tła pod tekstem. Tła 05, 08 i 10 mają biały tekst na desktopie,
08 i 10 także na telefonie.

1. W `index.html` wpisać w `<img class="hero__psd">` pliki wybranego tła (desktop i telefon, np. przez `<picture>`).
2. Przenieść do CSS kolor tła telefonu (`TLO_M`) i ewentualny biały tekst (`.hero--jasny`, `.hero--jasny-m`).
3. Usunąć `js/hero-przelacznik.js`, jego `<script>` w `index.html` i pozostałe pliki z `assets/img/r2/hero-psd/`.

### Części statyczne do podpięcia

- **Koszyk** żyje w `localStorage` (`lunchee-koszyk`). Przy pierwszym wejściu na `koszyk.html` skrypt wkłada
  przykładową zawartość LB755 + LB715 (flaga `lunchee-koszyk-przyklad`). Ten fragment usunąć na produkcji.
- **Promocja „Dwa Lunchee 30% taniej”** liczy się w `js/main.js` (`pairDiscount`, wysokość rabatu w `<meta name="lunchee-para">`).
  Na produkcji regułę trzyma platforma sklepu.
- **Kody rabatowe**: pole w koszyku odrzuca każdy kod komunikatem „nieprawidłowy albo wygasł”. Walidację robi platforma.
- **Formularze** na wszystkich stronach pokazują komunikat sukcesu bez wysyłki.
  Płatności (BLIK, przelew, karta) to sam interfejs, bez operatora.
- **Ceny i Omnibus**: ceny, `oldPrice` i `lowest30dPrice` są wpisane ręcznie w `produkty.json`. Najniższą cenę z 30 dni
  musi liczyć platforma z historii cen.
- **Dostawa**: kurier 14,99 zł, paczkomat 12,99 zł i próg 269 zł to wartości przykładowe z `produkty.json`.
  Strona `dostawa-i-platnosci.html` ma w ich miejscu znaczniki „do potwierdzenia przez sklep”.
- **Opinie** i ocena 4,8 / 127 opinii są przykładowe i mają widoczny znacznik. Przed startem podmienić na system opinii
  z opisaną weryfikacją albo zdjąć sekcję i ocenę przy cenie.
- **Ebook**: czytnik pokazuje dwa obrazy WEBP dostępne bez hasła. Docelowo strony ebooka wydaje serwer
  po weryfikacji hasła, bez stałego publicznego adresu pliku.
- **„Lunchee w sieci”** na kartach produktu pokazuje kreacje KV bez linków, do podmiany na posty klienta.
- **Znaczniki `.tbd`** na stronach prawnych, w kontakcie, we wzorze odstąpienia, w klauzulach RODO i w bloku
  „Producent i bezpieczeństwo” wymagają danych od klienta.

### Kod 30% po zakupie (R1-53)

- Wyzwalacz: opłacone zamówienie z jednym lunch boxem.
- Skutek: jednorazowy kod rabatowy 30% na kolejnego Lunchee, ważny 30 dni, wysyłany e-mailem.
- Kod generuje i wysyła platforma sklepu. Prototyp go nie tworzy.
- Do ustalenia z klientem: łączenie kodu z promocją „Dwa Lunchee 30% taniej” i treść maila.

### KSeF

- Faktury dla klientów z NIP idą przez KSeF. Obowiązek obowiązuje od 1.02.2026 dla największych podatników
  i od 1.04.2026 dla pozostałych.
- Integracja przez API systemu fakturowego sprzedawcy.
- Wyzwalacz: zamówienie z `payment_status: paid` i `invoice != null` (klient zaznaczył fakturę w zamówieniu).
- Numer KSeF zapisać przy zamówieniu.
- W prototypie zaznaczenie faktury wymaga nazwy firmy, NIP-u (z sumą kontrolną) i adresu firmy.

### Zgody na cookies

- Baner w prototypie ma trzy kategorie: niezbędne, analityczne i marketingowe. Wybór zapisuje w `localStorage`
  (`lunchee-cookies`). Link „Ustawienia cookies” w stopce (`[data-cookies-open]`) otwiera baner ponownie.
- Prototyp niczego nie blokuje. Adobe Fonts (`use.typekit.net`) ładuje się zawsze, a Google Fonts z podglądu wariantów
  ładuje się przed wyborem w banerze.
- Na produkcji wdrożyć CMP albo Google Consent Mode z blokadą skryptów analitycznych i marketingowych do czasu zgody.
  Warto też wyrównać wagę przycisków akceptacji i odrzucenia.
- Listę plików cookies i narzędzi w każdej kategorii trzeba wpisać do polityki prywatności (sekcja `#cookies`, dziś `.tbd`).

## Audyt fontów i mobile (8.10.2026)

Raport: [dla-klienta/audyt-fonty-mobile.html](dla-klienta/audyt-fonty-mobile.html).
Testy wymagają Node.js 22+ i Playwright; zależności mogą zostać poza projektem:

```bash
npm install --prefix /tmp/lunchee-audit-tools playwright@1.64.0
/tmp/lunchee-audit-tools/node_modules/.bin/playwright install chromium firefox webkit
# W drugim terminalu uruchom serwer z katalogu sklepu:
python3 -m http.server 8765 --bind 127.0.0.1
# W katalogu sklepu:
NODE_PATH=/tmp/lunchee-audit-tools/node_modules node scripts/audit-layout.cjs
NODE_PATH=/tmp/lunchee-audit-tools/node_modules node scripts/audit-interactions.cjs
```

`BASE_URL` pozwala wskazać inny adres podglądu. `ENGINE`, `PAGES`, `WIDTHS`
pozwalają ograniczyć test układu. Testy korzystają z izolowanego profilu
przeglądarki i zapisują wyniki oraz zrzuty w systemowym katalogu tymczasowym.
Nie składają zamówień w zewnętrznym sklepie.
