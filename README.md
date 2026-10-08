# Lunchee · prototyp sklepu internetowego

Prototyp sklepu lunchee.pl (Lunchee, sub-marka NOVEEN) przygotowany przez Code&Pixel.
Statyczny HTML, CSS i JS, bez frameworka i bez kroku budowania.

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
