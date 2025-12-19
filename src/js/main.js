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
        aiErrorShort: 'Sorry, AI did not respond correctly.'
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
        aiErrorShort: 'Ospravedlňujeme sa, AI neodpovedala správne.'
    }
};

function getLanguage() {
    return localStorage.getItem('rgb-language') || 'sk';
}

function setLanguage(lang) {
    localStorage.setItem('rgb-language', lang);
    updateLanguage();
}

function updateLanguage() {
    const lang = getLanguage();
    document.documentElement.lang = lang;
    document.title = translations[lang].title;

    // Update labels
    document.querySelector('label[for="red"]').textContent = translations[lang].red;
    document.querySelector('label[for="green"]').textContent = translations[lang].green;
    document.querySelector('label[for="blue"]').textContent = translations[lang].blue;
    document.querySelector('.hint').textContent = translations[lang].hint;
    document.querySelector('.ai-assistant h3').textContent = translations[lang].aiAssistant;
    document.getElementById('askAiButton').textContent = translations[lang].askAi;

    // Update lang toggle text
    document.getElementById('langToggle').textContent = lang === 'en' ? 'SK' : 'EN';

    // Update aria-labels
    document.getElementById('redNum').setAttribute('aria-label', `${translations[lang].red} value`);
    document.getElementById('greenNum').setAttribute('aria-label', `${translations[lang].green} value`);
    document.getElementById('blueNum').setAttribute('aria-label', `${translations[lang].blue} value`);
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

    // update color name
    updateColorName(r, g, b);
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

// initialize
updateColor();

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
    const colorHex = rgbToHex(r, g, b);
    fetch('https://wild-shadow-4360.romankniha95.workers.dev/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            colorHex,
            language: getLanguage(),
            prompt: 'What is the name of this color in simple terms? Just the name, no extra text.'
        })
    }).then(res => res.json()).then(data => {
        const name = data.response ? data.response.trim() : 'Neznáma';
        document.getElementById('colorName').textContent = 'Názov farby: ' + name;
    }).catch(() => {
        document.getElementById('colorName').textContent = 'Názov farby: Neznáma';
    });
}

// Initialize language
updateLanguage();

// AI Assistant
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
