const red = document.getElementById('red');
const green = document.getElementById('green');
const blue = document.getElementById('blue');
const redNum = document.getElementById('redNum');
const greenNum = document.getElementById('greenNum');
const blueNum = document.getElementById('blueNum');
const colorDisplay = document.getElementById('colorDisplay');
const modeButtons = document.querySelectorAll('.mode-btn');

function getDisplayMode(){
    return localStorage.getItem('rgb-display-mode') || 'hex';
}

// Language support
const translations = {
    en: {
        title: 'RGB Color Mixer',
        red: 'Red',
        green: 'Green',
        blue: 'Blue',
        hint: 'Move the sliders or enter the value numerically; click on the area to copy HEX.',
        aiAssistant: 'AI Assistant',
        askAi: 'Ask AI about this color',
        copied: 'Copied!',
        aiError: 'An error occurred while communicating with AI. Please try again later.',
        aiErrorShort: 'Sorry, AI did not respond correctly.',
        landingTitle: 'RGB Values, Mixing, Color Names and Visual Harmony',
        description: '<span class="intro-text">Discover the complex world of digital colors</span> – from precise RGB values and mathematical mixing to creative combinations, gradients and naming of shades.<br><br><span class="secondary-text">Create color palettes, experiment with mixing and understand how colors work in design and code. Whether you\'re creating a website, graphics or just exploring colors out of curiosity, here you\'ll find tools and inspiration in one place.</span>',
        allTools: 'All Tools',
        comingSoon: 'Coming Soon'
    },
    sk: {
        title: 'RGB Color Mixer',
        red: 'Červená',
        green: 'Zelená',
        blue: 'Modrá',
        hint: 'Posuň posuvníky alebo zadaj hodnotu číslom; kliknutím na plochu skopíruješ HEX.',
        aiAssistant: 'AI asistent',
        askAi: 'Spýtať sa AI na túto farbu',
        copied: 'Skopírované!',
        aiError: 'Vyskytla sa chyba pri komunikácii s AI. Skúste to prosím znova neskôr.',
        aiErrorShort: 'Ospravedlňujeme sa, AI neodpovedala správne.',
        landingTitle: 'RGB hodnoty, miešanie, názvy farieb a vizuálna harmónia',
        description: 'Objav komplexný svet digitálnych farieb – od presných RGB hodnôt a matematického miešania až po kreatívne kombinácie, prechody a pomenovania odtieňov. Vytváraj farebné palety, experimentuj s mixovaním a pochop, ako farby fungujú v dizajne aj v kóde. Či tvoríš web, grafiku alebo len objavuješ farby zo zvedavosti, tu nájdeš nástroje aj inšpiráciu na jednom mieste.',
        allTools: 'Všetky nástroje',
        comingSoon: 'Čoskoro'
    }
};

function getLanguage() {
    return localStorage.getItem('rgb-language') || 'en';
}

function setLanguage(lang) {
    localStorage.setItem('rgb-language', lang);
    updateLanguage();
}

function updateLanguage() {
    const lang = getLanguage();
    document.documentElement.lang = lang;

    // Update labels if exist
    const redLabel = document.querySelector('label[for="red"]');
    if (redLabel) redLabel.textContent = translations[lang].red;
    const greenLabel = document.querySelector('label[for="green"]');
    if (greenLabel) greenLabel.textContent = translations[lang].green;
    const blueLabel = document.querySelector('label[for="blue"]');
    if (blueLabel) blueLabel.textContent = translations[lang].blue;
    const hint = document.querySelector('.hint');
    if (hint) hint.textContent = translations[lang].hint;
    const aiAssistant = document.querySelector('.ai-assistant h3');
    if (aiAssistant) aiAssistant.textContent = translations[lang].aiAssistant;
    const askAiButton = document.getElementById('askAiButton');
    if (askAiButton) askAiButton.textContent = translations[lang].askAi;

    // Update lang toggle text
    const langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.textContent = lang.toUpperCase();

    // Update aria-labels if exist
    const redNumEl = document.getElementById('redNum');
    if (redNumEl) redNumEl.setAttribute('aria-label', `${translations[lang].red} value`);
    const greenNumEl = document.getElementById('greenNum');
    if (greenNumEl) greenNumEl.setAttribute('aria-label', `${translations[lang].green} value`);
    const blueNumEl = document.getElementById('blueNum');
    if (blueNumEl) blueNumEl.setAttribute('aria-label', `${translations[lang].blue} value`);

    // Update landing page texts
    const landingTitle = document.querySelector('.description-panel h2');
    if (landingTitle) landingTitle.textContent = translations[lang].landingTitle;
    const description = document.querySelector('.description-panel p');
    if (description) description.innerHTML = translations[lang].description;
    const toolsHeading = document.querySelector('.tools-heading');
    if (toolsHeading) toolsHeading.textContent = translations[lang].allTools;
    const placeholders = document.querySelectorAll('.tool-placeholder span');
    placeholders.forEach(span => span.textContent = translations[lang].comingSoon);
}

function componentToHex(c){
    const hex = Number(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r,g,b){
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function luminance(r,g,b){
    // perceptual luminance
    return (0.299*r + 0.587*g + 0.114*b);
}

function updateColor(){
    const r = clamp(Number(red.value));
    const g = clamp(Number(green.value));
    const b = clamp(Number(blue.value));
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hex = rgbToHex(r,g,b).toUpperCase();
    colorDisplay.style.backgroundColor = rgb;
    // show either HEX or decimal RGB depending on persisted mode
    const mode = getDisplayMode();
    if(mode === 'rgb'){
        colorDisplay.textContent = rgb;
    } else {
        // in HEX mode show only the main hex string in the display
        colorDisplay.textContent = hex;
    }
    // update the small inputs next to sliders according to mode
    function setNumDisplay(el, dec){
        const m = mode;
        if(m === 'rgb') el.value = String(dec);
        else {
            const hx = componentToHex(dec).toUpperCase();
            el.value = hx;
        }
    }
    setNumDisplay(redNum, r);
    setNumDisplay(greenNum, g);
    setNumDisplay(blueNum, b);

    // choose contrasting text color
    colorDisplay.style.color = luminance(r,g,b) > 180 ? '#0b1220' : '#ffffff';

    // update slider backgrounds to show filled portion
    updateRangeBackground(red, '#ef4444');
    updateRangeBackground(green, '#22c55e');
    updateRangeBackground(blue, '#3b82f6');

    // colored glow / halo for the display: stronger at higher values
    const glow = `0 6px 18px rgba(${r}, ${g}, ${b}, 0.30), 0 22px 44px rgba(${r}, ${g}, ${b}, 0.18), 0 48px 96px rgba(${r}, ${g}, ${b}, 0.08)`;
    colorDisplay.style.setProperty('--display-glow', glow);
}

function updateRangeBackground(rangeEl, color){
    const min = Number(rangeEl.min) || 0;
    const max = Number(rangeEl.max) || 100;
    const val = Number(rangeEl.value);
    const pct = Math.round(((val - min) / (max - min)) * 100);

    // helper: hex -> {r,g,b}
    function hexToRgb(h){
        const hex = h.replace('#','');
        const bigint = parseInt(hex,16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }
    // helper: rgb -> hex
    function rgbToHexStr(r,g,b){
        const toHex = v => v.toString(16).padStart(2,'0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    // mix color with white by factor (0 = original, 1 = white)
    function mixWithWhite(hex, factor){
        const c = hexToRgb(hex);
        const r = Math.round(c.r + (255 - c.r) * factor);
        const g = Math.round(c.g + (255 - c.g) * factor);
        const b = Math.round(c.b + (255 - c.b) * factor);
        return rgbToHexStr(r,g,b);
    }

    const endHex = color;
    const pNorm = Math.max(0, Math.min(1, (val - min) / (max - min)));
    // start color: more white when p is small
    const startHex = mixWithWhite(endHex, 1 - pNorm);

    // set gradient: start -> end across filled portion, rest grey
    rangeEl.style.background = `linear-gradient(90deg, ${startHex} 0%, ${endHex} ${pct}%, #d9d9d9 ${pct}%)`;

    // set thumb halo via CSS variable (rgba of end color)
    const ec = hexToRgb(endHex);
    // stronger layered halo: three layered shadows for a richer glow
    const shadow = `0 6px 12px rgba(${ec.r}, ${ec.g}, ${ec.b}, 0.30), 0 14px 28px rgba(${ec.r}, ${ec.g}, ${ec.b}, 0.22), 0 26px 56px rgba(${ec.r}, ${ec.g}, ${ec.b}, 0.12)`;
    rangeEl.style.setProperty('--thumb-shadow', shadow);
}

function clamp(v){
    if(Number.isNaN(v)) return 0;
    return Math.min(255, Math.max(0, Math.round(v)));
}

if (red) {
    // when ranges change, update color and number inputs
    red.addEventListener('input', ()=>{ updateColor(); updateRangeBackground(red, '#ef4444'); });
    green.addEventListener('input', ()=>{ updateColor(); updateRangeBackground(green, '#22c55e'); });
    blue.addEventListener('input', ()=>{ updateColor(); updateRangeBackground(blue, '#3b82f6'); });

    // when small inputs change (typed), parse depending on mode and sync ranges
    function parseAndSetFromInput(el, slider){
        const mode = getDisplayMode();
        let v = 0;
        const raw = (el.value || '').toString().trim();
        if(mode === 'rgb'){
            v = clamp(Number(raw.replace(/[^0-9-]/g, '')));
        } else {
            // interpret as hex (allow with or without leading #)
            const h = raw.replace(/[^0-9a-fA-F]/g, '');
            if(h.length === 0) v = 0;
            else v = clamp(parseInt(h.slice(0,2), 16));
        }
        slider.value = v;
        updateColor();
    }

    redNum.addEventListener('blur', ()=> parseAndSetFromInput(redNum, red));
    greenNum.addEventListener('blur', ()=> parseAndSetFromInput(greenNum, green));
    blueNum.addEventListener('blur', ()=> parseAndSetFromInput(blueNum, blue));

    // copy hex to clipboard when clicking color display
    colorDisplay.addEventListener('click', function(){
        const toCopy = colorDisplay.textContent;
        navigator.clipboard && navigator.clipboard.writeText(toCopy).then(()=>{
            const old = colorDisplay.textContent;
            const lang = getLanguage();
            colorDisplay.textContent = translations[lang].copied;
            setTimeout(()=> colorDisplay.textContent = old, 900);
        });
    });
}

// initialize
if (red) updateColor();

// THEME TOGGLE: persist preference and apply
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme){
    if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
    // reflect icon state
    if(themeToggle){
        const isDark = theme === 'dark';
        themeToggle.classList.toggle('is-dark', isDark);
    }
}

function loadTheme(){
    const stored = localStorage.getItem('rgb-theme');
    if(stored) {
        applyTheme(stored);
        if(themeToggle) themeToggle.setAttribute('aria-pressed', String(stored === 'dark'));
    } else {
        // default to dark when no stored preference
        applyTheme('dark');
        if(themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
    }
}

loadTheme();

// Color mixer specific code
if (red) {
    // initialize display-mode buttons
    if(modeButtons && modeButtons.length){
        const stored = getDisplayMode();
        modeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === stored)));
        modeButtons.forEach(b => b.addEventListener('click', ()=>{
            const m = b.dataset.mode;
            localStorage.setItem('rgb-display-mode', m);
            modeButtons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            updateColor();
            // Update maxlength and inputmode for num inputs
            const maxLen = m === 'hex' ? 2 : 3;
            const inputMode = m === 'hex' ? 'text' : 'numeric';
            redNum.setAttribute('maxlength', maxLen);
            redNum.setAttribute('inputmode', inputMode);
            greenNum.setAttribute('maxlength', maxLen);
            greenNum.setAttribute('inputmode', inputMode);
            blueNum.setAttribute('maxlength', maxLen);
            blueNum.setAttribute('inputmode', inputMode);
        }));
    }
    // Set initial maxlength and inputmode
    const initialMode = getDisplayMode();
    const maxLen = initialMode === 'hex' ? 2 : 3;
    const inputMode = initialMode === 'hex' ? 'text' : 'numeric';
    redNum.setAttribute('maxlength', maxLen);
    redNum.setAttribute('inputmode', inputMode);
    greenNum.setAttribute('maxlength', maxLen);
    greenNum.setAttribute('inputmode', inputMode);
    blueNum.setAttribute('maxlength', maxLen);
    blueNum.setAttribute('inputmode', inputMode);
}

// UI toggles for all pages (including landing page)
if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        applyTheme(next === 'dark' ? 'dark' : null);
        localStorage.setItem('rgb-theme', next);
        // animate icon by toggling aria-pressed for possible CSS hooks
        themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    });
}

// Language toggle
const langToggle = document.getElementById('langToggle');
if(langToggle){
    langToggle.addEventListener('click', ()=>{
        const current = getLanguage();
        const next = current === 'en' ? 'sk' : 'en';
        setLanguage(next);
    });
}

function updateColorName(r, g, b) {
    // Simple color name detection based on RGB values
    const colors = [
        { name: 'Červená', r: 255, g: 0, b: 0 },
        { name: 'Zelená', r: 0, g: 255, b: 0 },
        { name: 'Modrá', r: 0, g: 0, b: 255 },
        { name: 'Žltá', r: 255, g: 255, b: 0 },
        { name: 'Purpurová', r: 255, g: 0, b: 255 },
        { name: 'Azúrová', r: 0, g: 255, b: 255 },
        { name: 'Biela', r: 255, g: 255, b: 255 },
        { name: 'Čierna', r: 0, g: 0, b: 0 },
        { name: 'Sivá', r: 128, g: 128, b: 128 },
        { name: 'Oranžová', r: 255, g: 165, b: 0 },
        { name: 'Ružová', r: 255, g: 192, b: 203 },
        { name: 'Hnedá', r: 165, g: 42, b: 42 },
    ];

    let closest = 'Neznáma';
    let minDist = Infinity;
    colors.forEach(color => {
        const dist = Math.sqrt((r - color.r) ** 2 + (g - color.g) ** 2 + (b - color.b) ** 2);
        if (dist < minDist) {
            minDist = dist;
            closest = color.name;
        }
    });

    // Special cases
    if (r === g && g === b) {
        if (r === 0) closest = 'Čierna';
        else if (r === 255) closest = 'Biela';
        else closest = 'Sivá';
    }

    document.getElementById('colorName').textContent = 'Názov farby: ' + closest;
}

// AI Assistant
if (red) {
    const askAiButton = document.getElementById('askAiButton');
    const aiResponse = document.getElementById('aiResponse');
    const aiLoading = document.getElementById('aiLoading');

    function typeText(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text[i];
            i++;
            if (i >= text.length) clearInterval(timer);
        }, speed);
    }

    askAiButton.addEventListener('click', async () => {
        const r = red.value;
        const g = green.value;
        const b = blue.value;
        const colorHex = rgbToHex(r, g, b);
        const colorRgb = `rgb(${r}, ${g}, ${b})`;

        aiLoading.style.display = 'block';
        aiResponse.innerHTML = '';
        askAiButton.disabled = true;

        try {
            // !!! IMPORTANT !!!
            // Set OPENROUTER_API_KEY environment variable in Netlify
            // API key is securely stored in Netlify Function

            const response = await fetch('https://wild-shadow-4360.romankniha95.workers.dev/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    colorHex,
                    colorRgb,
                    language: getLanguage()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.response) {
                typeText(aiResponse, result.response);
            } else if (result.error) {
                throw new Error(result.error);
            } else {
                const lang = getLanguage();
                typeText(aiResponse, translations[lang].aiErrorShort);
            }

        } catch (error) {
            console.error('Error fetching AI response:', error);
            const lang = getLanguage();
            typeText(aiResponse, translations[lang].aiError);
        } finally {
            aiLoading.style.display = 'none';
            askAiButton.disabled = false;
        }
    });
}

// Initialize language
updateLanguage();
