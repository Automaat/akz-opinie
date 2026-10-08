# akz-opinie

Prosta aplikacja web do wystawiania opinii z rejsu AKŻ AGH. Zastępuje korespondencję seryjną Word + Excel: wpisujesz dane rejsu i załogi, wgrywasz zdjęcia, a aplikacja pokazuje podgląd opinii na żywo i generuje PDF o tym samym układzie co wzór.

## Funkcje

- Dane rejsu, jachtu, godzin, kapitana i załogi w jednym formularzu (komponenty [sui](https://github.com/smykla-skalski/sui)).
- Podgląd opinii wybranego załoganta na żywo, w tym ostrzeżenie, gdy tekst nie mieści się na jednej stronie.
- PDF dla jednej osoby, jeden PDF ze wszystkimi opiniami albo ZIP z osobnymi plikami.
- Zapis automatyczny na serwerze: odświeżenie strony, zamknięcie przeglądarki czy inne urządzenie niczego nie gubi.
- Zdjęcia załogi i jachtu wspólne dla wszystkich opinii z rejsu; logo AKŻ wstawiane automatycznie.
- Formy żeńskie (Załogantka, Nie podlegała) dobierane po przełączniku przy osobie.
- Duplikowanie rejsu (np. na kolejny rejs z tą samą załogą).

## Uruchomienie

```sh
mise install
npm ci
npm run dev
```

Do PDF potrzebny jest Chrome/Chromium (wykrywany automatycznie na macOS i w `/usr/bin/chromium`, albo `CHROME_PATH`).

## Docker

```sh
docker compose up -d
```

Aplikacja nasłuchuje na porcie 3000. Dane (JSON + zdjęcia) leżą w wolumenie `/data`, więc do kopii zapasowej wystarczy ten katalog.

| Zmienna           | Domyślnie | Opis                                 |
| ----------------- | --------- | ------------------------------------ |
| `DATA_DIR`        | `./data`  | Katalog z rejsami i zdjęciami        |
| `CHROME_PATH`     | auto      | Ścieżka do Chromium używanego do PDF |
| `PORT`            | `3000`    | Port HTTP                            |
| `BODY_SIZE_LIMIT` | `40M`     | Limit uploadu zdjęć (obraz Dockera)  |

Brak logowania: aplikacja jest przeznaczona do sieci domowej. Nie wystawiaj jej publicznie bez reverse proxy z uwierzytelnianiem.

## Rozwój

```sh
npm run check
npm test
npm run format
```

Układ opinii (`src/lib/render.ts`) jest jednym HTML-em używanym zarówno w podglądzie, jak i do PDF (Chromium), więc podgląd odpowiada plikowi. Czcionka Carlito (metrycznie zgodna z Calibri, licencja OFL) leży w `static/fonts`.

## Licencje

Kod: MIT. Logo AKŻ AGH pochodzi z [systemu identyfikacji wizualnej](https://keja.agh.edu.pl/siw/) i należy do klubu.
