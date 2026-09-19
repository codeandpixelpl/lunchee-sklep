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
- **Coolvetica** (nagłówki) wymaga Web Projectu w Adobe Fonts i linku `use.typekit.net`
  w `<head>`. Plików fontu nie wolno hostować samodzielnie. Bez kitu nagłówki spadają
  na Arial Rounded albo krój systemowy.
- **LB795 Night** jest pokazany jako niedostępny w sklepie (sprzedaż u partnera).
- **Strony prawne** zawierają strukturę i wzór formularza odstąpienia,
  treść regulaminu i polityki prywatności dostarcza klient.
- **Zgodność**: przy cenie promocyjnej wyświetla się najniższa cena z 30 dni (Omnibus),
  zgody w formularzach są rozdzielone.
