# RGB Color Mixer

## Overview
The RGB Color Mixer is a simple web application that allows users to mix colors using RGB (Red, Green, Blue) values. Users can adjust sliders to change the intensity of each color component and see the resulting color in real-time.

## Features
- Interactive sliders for adjusting RGB values.
- Real-time color display based on user input.
- Responsive design for optimal viewing on various devices.

## Project Structure
```
rgb-color-mixer
├── src
│   ├── index.html        # Main HTML document
│   ├── css
│   │   └── styles.css    # Styles for the application
│   ├── js
│   │   └── main.js       # Main JavaScript logic
│   └── components
│       └── slider.js     # Slider component for RGB adjustment
├── .gitignore            # Files to ignore in Git
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   # RGB Color Mixer

   Jednoduchá responzívna webová stránka na mixovanie farieb (R, G, B).

   ## Čo projekt robí
   - Zobrazuje farebnú plochu podľa kombinácie posuvníkov R/G/B.
   - Zobrazuje HEX kód farby a číselné hodnoty R/G/B.
   - Kliknutím na farebnú plochu skopírujete HEX do schránky.

   ## Štruktúra projektu
   ```
   rgb-color-mixer/
   ├── src/
   │   ├── index.html
   │   ├── css/
   │   │   └── styles.css
   │   └── js/
   │       └── main.js
   ├── package.json
   └── README.md
   ```

   ## Rýchle spustenie (Windows PowerShell)
   1. Otvoriť terminál v priečinku projektu:

   ```powershell
   cd C:\Users\Roman\test\rgb-color-mixer
   ```

   2. Nainštalovať závislosti (potrebné pre `live-server`):

   ```powershell
   npm install
   ```

   3. Spustiť lokálny server a otvoriť aplikáciu v prehliadači:

   ```powershell
   npm start
   ```

   Alternatíva bez Node.js: otvorte `src/index.html` priamo v prehliadači (niektoré prehliadače obmedzia clipboard API).

   ## Offline single-file verzia
   - Vytvoril som aj offline single-file verziu v `offline/index.html`.
   - Otvorenie: dvojkliknite na `offline/index.html` alebo v prehliadači vyberte *Open File*.
   - Táto verzia má vložené štýly, skripty a SVG ikonky, takže funguje bez `npm` alebo servera.

   ## Favicon a ikony
   - Do `src/icons/` som pridal jednoduché SVG ikonky (`red.svg`, `green.svg`, `blue.svg`) a `favicon.svg`.
   - `src/index.html` odkazuje na `src/icons/favicon.svg`.

   ## Ďalšie kroky, ktoré ti môžem pripraviť
   - Pridať favicon a jednoduché ikonky
   - Vygenerovať statickú verziu vhodnú na GitHub Pages
   - Urobiť export farby do CSS premenných alebo stiahnuť súbor s farbou

   Napíš, ktorú z týchto vecí chceš ďalej a ja to za teba pridám.

   ---
   Made with care — ak chceš, spravím všetko ďalej za teba.
