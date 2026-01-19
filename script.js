// Ses listesi
const allSoundKeys = [
    'rain', 'fire', 'birds', 'cafe', 
    'thunder', 'river', 'waves', 'washing_machine', 
    'shower', 'vacuum', 'keyboard', 'baby', 'traffic', 'train',
    'forest', 'night', 'fan', 'white_noise'
];

// İkon Eşleşmeleri
const soundIcons = {
    rain: 'fa-cloud-rain', fire: 'fa-fire', birds: 'fa-feather-alt', cafe: 'fa-mug-hot',
    thunder: 'fa-bolt', river: 'fa-water', waves: 'fa-water', washing_machine: 'fa-soap',
    shower: 'fa-shower', vacuum: 'fa-broom', keyboard: 'fa-keyboard', baby: 'fa-baby',
    traffic: 'fa-car', train: 'fa-train', forest: 'fa-tree', night: 'fa-moon',
    fan: 'fa-fan', white_noise: 'fa-wave-square'
};

const defaultState = {
    firstRun: true,
    language: 'en', 
    username: '',
    city: '',
    bgSource: 'collection',
    bgCustomUrl: '',
    bgCurrentUrl: '',
    bgLastUpdate: 0,
    overlayOpacity: 0.3, 
    bgBlur: 0,
    settings: {
        showWeather: true,
        showFocus: true,
        showShortcuts: true,
        showShortcutTitles: true,
        showQuote: true,
        showPomodoro: false,
        use24h: true,
        showSeconds: false,
        showClock: true,
        showGreeting: true, // YENİ
        showSearch: true,
        zen: {
            hideClock: false,
            hideGreeting: false, // YENİ
            hideSearch: true,
            hideWeather: true,
            hideShortcuts: true,
            hideQuote: true,
            hideTodo: true,
            hidePomodoro: true,
            hideFocus: false
        }
    },
    sounds: allSoundKeys.reduce((acc, key) => ({ ...acc, [key]: 0.5 }), {}),
    activeSounds: [],
    todos: [],
    focus: { text: '', done: false },
    shortcuts: [
        { title: 'YouTube', url: 'https://youtube.com' },
        { title: 'Google', url: 'https://google.com' },
        { title: 'Loruv', url: 'https://loruv.com' }
    ]
};

// Yedek Arkaplanlar
const FALLBACK_BACKGROUNDS = [
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop"
];

let timerInterval = null;
let timeLeft = 25 * 60;
let isTimerRunning = false;
let state = JSON.parse(JSON.stringify(defaultState));
let currentTranslations = {}; 
let zenMouseTimer;

document.addEventListener('DOMContentLoaded', async () => {
    await loadState();
    if (state.firstRun) {
        const browserLang = navigator.language.slice(0, 2);
        state.language = ['en', 'tr', 'de', 'es'].includes(browserLang) ? browserLang : 'en';
    }
    await loadTranslations(state.language);
    initApp();
});

async function loadTranslations(lang) {
    try {
        const res = await fetch(`_locales/${lang}/messages.json`);
        currentTranslations = await res.json();
    } catch (e) {
        console.error("Dil yüklenemedi, varsayılan (en) deneniyor...", e);
        try {
            const res = await fetch(`_locales/en/messages.json`);
            currentTranslations = await res.json();
        } catch(ex) { console.error("Varsayılan dil de yüklenemedi."); }
    }
    localizePage();
}

function t(key) {
    if (currentTranslations[key] && currentTranslations[key].message) {
        return currentTranslations[key].message;
    }
    return chrome.i18n.getMessage(key) || key;
}

function localizePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    updateGreeting(); 
}

function loadState() {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, (data) => {
            if (data && Object.keys(data).length > 0) {
                state = { 
                    ...defaultState, 
                    ...data,
                    settings: { ...defaultState.settings, ...data.settings },
                    sounds: { ...defaultState.sounds, ...data.sounds }
                };
                if(!state.settings.zen) state.settings.zen = defaultState.settings.zen;
                // Yeni özelliklerin eski ayarlarda olup olmadığını kontrol et
                if(typeof state.settings.showGreeting === 'undefined') state.settings.showGreeting = true;
                if(typeof state.settings.zen.hideGreeting === 'undefined') state.settings.zen.hideGreeting = false;

                allSoundKeys.forEach(key => {
                    if (typeof state.sounds[key] === 'undefined') state.sounds[key] = 0.5;
                });
                state.activeSounds = []; 
            }
            resolve();
        });
    });
}

function saveState() {
    const stateToSave = { ...state };
    delete stateToSave.activeSounds;
    chrome.storage.local.set(stateToSave);
}

function initApp() {
    if (state.firstRun) {
        document.getElementById('welcome-modal').classList.remove('hidden');
        setupWelcome();
    } else {
        document.getElementById('app-container').classList.remove('hidden');
        renderUI();
        startClock();
        fetchWeather();
    }
    setupEventListeners();
    applyAppearance();
    document.addEventListener('mousemove', handleZenMouseMove);
}

function handleZenMouseMove() {
    if (!document.body.classList.contains('zen-active')) return;
    const btn = document.getElementById('zen-exit-btn');
    btn.classList.add('visible');
    clearTimeout(zenMouseTimer);
    zenMouseTimer = setTimeout(() => {
        btn.classList.remove('visible');
    }, 2000); 
}

function setupWelcome() {
    const langSelect = document.getElementById('setup-lang');
    langSelect.value = state.language;
    langSelect.addEventListener('change', async (e) => { 
        state.language = e.target.value; 
        await loadTranslations(state.language);
    });

    document.getElementById('setup-finish-btn').onclick = () => {
        state.username = document.getElementById('setup-name').value.trim();
        state.city = document.getElementById('setup-city').value.trim();
        state.firstRun = false;
        saveState();
        document.getElementById('welcome-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        renderUI();
        startClock();
        fetchWeather();
    };
}

function renderUI() {
    handleBackground();
    updateGreeting();

    const s = state.settings;
    const toggle = (id, cond) => document.getElementById(id).classList.toggle('hidden', !cond);

    toggle('weather-widget', s.showWeather && state.city);
    toggle('focus-container', s.showFocus);
    toggle('quote-wrapper', s.showQuote);
    toggle('pomodoro-container', s.showPomodoro);
    toggle('shortcuts-grid', s.showShortcuts);
    toggle('search-container', s.showSearch);
    
    // --- GÜNCELLENMİŞ KISIM: Saat ve Selamlama Ayrımı ---
    document.getElementById('clock').style.display = s.showClock ? 'block' : 'none';
    document.getElementById('greeting').style.display = s.showGreeting ? 'block' : 'none';

    const body = document.body;
    // Zen Class Toggles
    body.classList.toggle('zen-hide-clock', s.zen.hideClock);
    body.classList.toggle('zen-hide-greeting', s.zen.hideGreeting); // YENİ
    body.classList.toggle('zen-hide-search', s.zen.hideSearch);
    body.classList.toggle('zen-hide-weather', s.zen.hideWeather);
    body.classList.toggle('zen-hide-shortcuts', s.zen.hideShortcuts);
    body.classList.toggle('zen-hide-quote', s.zen.hideQuote);
    body.classList.toggle('zen-hide-todo', s.zen.hideTodo);
    body.classList.toggle('zen-hide-pomodoro', s.zen.hidePomodoro);
    body.classList.toggle('zen-hide-focus', s.zen.hideFocus);

    const fInput = document.getElementById('focus-text');
    fInput.value = state.focus.text;
    fInput.classList.toggle('completed', state.focus.done);
    document.getElementById('focus-checkbox').checked = state.focus.done;
    document.getElementById('focus-clear').style.visibility = state.focus.text ? 'visible' : 'hidden';

    renderTodos();
    renderShortcuts();
    if (s.showQuote) loadQuote();
    
    updateSoundMixerUI();
}

function updateSoundMixerUI() {
    allSoundKeys.forEach(sound => {
        const btn = document.querySelector(`.sound-play-btn[data-sound="${sound}"]`);
        const volSlider = document.getElementById(`vol-${sound}`);
        if(btn) {
            btn.style.background = state.activeSounds.includes(sound) ? "white" : "rgba(255,255,255,0.1)";
            btn.style.color = state.activeSounds.includes(sound) ? "black" : "white";
        }
        if(volSlider) volSlider.value = state.sounds[sound];
    });
}

function applyAppearance() {
    document.getElementById('bg-overlay').style.opacity = state.overlayOpacity;
    document.getElementById('bg-layer').style.filter = `blur(${state.bgBlur}px)`;
}

function toggleSound(name) {
    const audio = document.getElementById(`audio-${name}`);
    if (!audio) return;
    if (state.activeSounds.includes(name)) {
        audio.pause();
        state.activeSounds = state.activeSounds.filter(s => s !== name);
    } else {
        audio.volume = state.sounds[name];
        audio.play().catch(e => console.warn("Audio error:", e));
        state.activeSounds.push(name);
    }
    updateSoundMixerUI();
}

function stopAllSounds() {
    state.activeSounds.forEach(name => {
        const audio = document.getElementById(`audio-${name}`);
        if (audio) audio.pause();
    });
    state.activeSounds = [];
    updateSoundMixerUI();
}

function openSoundsTab() {
    document.getElementById('settings-modal').classList.remove('hidden');
    initSettingsValues();
    const btn = document.querySelector('.tab-btn[data-tab="tab-sounds"]');
    if(btn) btn.click();
}

function initSettingsValues() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        };
    });

    document.getElementById('set-username').value = state.username;
    document.getElementById('set-city').value = state.city;
    document.getElementById('set-lang').value = state.language;

    const bindRange = (id, key, action) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = state[key];
        el.oninput = (e) => { state[key] = e.target.value; if(action) action(); };
    };
    bindRange('overlay-range', 'overlayOpacity', applyAppearance);
    bindRange('blur-range', 'bgBlur', applyAppearance);

    const bindCheck = (id, obj, key, action) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.checked = obj[key];
        el.onchange = (e) => {
            obj[key] = e.target.checked;
            renderUI();
            if (action) action();
        };
    };

    bindCheck('check-weather', state.settings, 'showWeather', fetchWeather);
    bindCheck('check-focus', state.settings, 'showFocus');
    bindCheck('check-quote', state.settings, 'showQuote');
    bindCheck('check-pomodoro', state.settings, 'showPomodoro');
    bindCheck('check-24h', state.settings, 'use24h', startClock);
    bindCheck('check-seconds', state.settings, 'showSeconds', startClock);
    bindCheck('check-shortcuts', state.settings, 'showShortcuts');
    bindCheck('check-shortcut-titles', state.settings, 'showShortcutTitles');
    
    bindCheck('check-clock', state.settings, 'showClock');
    bindCheck('check-greeting', state.settings, 'showGreeting', updateGreeting); // YENİ
    bindCheck('check-search', state.settings, 'showSearch');

    // Zen mod seçenekleri
    bindCheck('zen-check-clock', state.settings.zen, 'hideClock');
    bindCheck('zen-check-greeting', state.settings.zen, 'hideGreeting'); // YENİ
    bindCheck('zen-check-search', state.settings.zen, 'hideSearch');
    bindCheck('zen-check-weather', state.settings.zen, 'hideWeather');
    bindCheck('zen-check-shortcuts', state.settings.zen, 'hideShortcuts');
    bindCheck('zen-check-quote', state.settings.zen, 'hideQuote');
    bindCheck('zen-check-todo', state.settings.zen, 'hideTodo');
    bindCheck('zen-check-pomodoro', state.settings.zen, 'hidePomodoro');
    bindCheck('zen-check-focus', state.settings.zen, 'hideFocus');

    const closeBtn = document.getElementById('settings-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            state.username = document.getElementById('set-username').value;
            state.city = document.getElementById('set-city').value;
            saveState();
            updateGreeting();
            fetchWeather();
            document.getElementById('settings-modal').classList.add('hidden');
        };
    }
    
    const langSelect = document.getElementById('set-lang');
    if (langSelect) {
        langSelect.onchange = async (e) => { 
            state.language = e.target.value;
            await loadTranslations(state.language);
        };
    }

    const bgSelect = document.getElementById('bg-source-select');
    const customOpts = document.getElementById('custom-bg-options');
    bgSelect.value = state.bgSource;
    customOpts.classList.toggle('hidden', state.bgSource !== 'custom');

    bgSelect.onchange = (e) => {
        state.bgSource = e.target.value;
        customOpts.classList.toggle('hidden', state.bgSource !== 'custom');
        handleBackground();
    };
    document.getElementById('bg-save-custom').onclick = () => {
        state.bgCustomUrl = document.getElementById('bg-custom-url').value;
        handleBackground();
    };
    document.getElementById('bg-refresh-force').onclick = () => {
        state.bgLastUpdate = 0;
        if(state.bgSource === 'custom') {
            state.bgSource = 'collection';
            bgSelect.value = 'collection';
            customOpts.classList.add('hidden');
        }
        handleBackground(true);
    };
}

function setupEventListeners() {
    const toggleZen = () => {
        document.body.classList.toggle('zen-active');
        if(document.body.classList.contains('zen-active')) {
            handleZenMouseMove();
        }
    };
    document.getElementById('zen-mode-toggle').onclick = toggleZen;
    document.getElementById('zen-exit-btn').onclick = toggleZen;

    document.getElementById('settings-toggle').onclick = () => {
        document.getElementById('settings-modal').classList.remove('hidden');
        initSettingsValues();
    };
    
    document.getElementById('quick-sounds-btn').onclick = openSoundsTab;
    document.getElementById('stop-all-sounds').onclick = stopAllSounds;

    const soundGrid = document.querySelector('.sound-grid');
    if(soundGrid) {
        soundGrid.innerHTML = ''; 
        allSoundKeys.forEach(key => {
            const icon = soundIcons[key] || 'fa-music';
            const labelKey = 'sound' + key.charAt(0).toUpperCase() + key.slice(1);
            
            const div = document.createElement('div');
            div.className = 'sound-row';
            div.innerHTML = `
                <button class="sound-play-btn" data-sound="${key}"><i class="fas ${icon}"></i></button>
                <div class="vol-control">
                    <span data-i18n="${labelKey}">${key}</span> 
                    <input type="range" id="vol-${key}" min="0" max="1" step="0.05">
                </div>
            `;
            soundGrid.appendChild(div);
        });
        
        document.querySelectorAll('.sound-play-btn').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); toggleSound(btn.getAttribute('data-sound')); };
        });
        allSoundKeys.forEach(key => {
            const slider = document.getElementById(`vol-${key}`);
            if(slider) slider.oninput = (e) => {
                 const val = parseFloat(e.target.value);
                 state.sounds[key] = val;
                 const audio = document.getElementById(`audio-${key}`);
                 if(audio) audio.volume = val;
                 saveState();
            };
        });
        localizePage(); 
    }

    document.getElementById('pomo-toggle').onclick = togglePomodoro;
    document.getElementById('pomo-reset').onclick = resetPomodoro;

    document.getElementById('search-input').addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && e.target.value.trim()) {
            let val = e.target.value.trim();
            if((val.includes('.') && !val.includes(' ')) || val.startsWith('http')) {
                 if(!val.startsWith('http')) val = 'https://' + val;
                 window.location.href = val;
            } else {
                chrome.search.query({
                    text: val,
                    disposition: 'CURRENT_TAB'
                });
            }
        }
    });

    setupFocusAndTodoListeners();

    const shortcutModal = document.getElementById('shortcut-modal');
    document.getElementById('shortcut-cancel-btn').onclick = () => {
        shortcutModal.classList.add('hidden');
    };
    document.getElementById('shortcut-save-btn').onclick = () => {
        const title = document.getElementById('shortcut-name-input').value.trim();
        let url = document.getElementById('shortcut-url-input').value.trim();
        if (title && url) {
            if (!url.startsWith('http')) url = 'https://' + url;
            state.shortcuts.push({ title, url });
            saveState();
            renderShortcuts();
            shortcutModal.classList.add('hidden');
            document.getElementById('shortcut-name-input').value = '';
            document.getElementById('shortcut-url-input').value = '';
        } else {
            alert(t("urlPlaceholder"));
        }
    };
}

function setupFocusAndTodoListeners() {
    const fInput = document.getElementById('focus-text');
    fInput.addEventListener('input', (e) => {
        state.focus.text = e.target.value;
        document.getElementById('focus-clear').style.visibility = e.target.value ? 'visible' : 'hidden';
        saveState();
    });
    document.getElementById('focus-checkbox').addEventListener('change', (e) => {
        state.focus.done = e.target.checked;
        e.target.checked ? fInput.classList.add('completed') : fInput.classList.remove('completed');
        saveState();
    });
    document.getElementById('focus-clear').addEventListener('click', () => {
        state.focus.text = ''; state.focus.done = false;
        fInput.value = ''; fInput.classList.remove('completed');
        document.getElementById('focus-checkbox').checked = false;
        saveState();
        document.getElementById('focus-clear').style.visibility = 'hidden';
    });

    document.getElementById('todo-toggle-btn').onclick = () => document.getElementById('todo-panel').classList.remove('hidden');
    document.getElementById('todo-close').onclick = () => document.getElementById('todo-panel').classList.add('hidden');
    
    document.getElementById('new-todo').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            state.todos.push({ text: e.target.value, done: false });
            e.target.value = '';
            saveState();
            renderTodos();
        }
    });
}

async function handleBackground(forceRefresh = false) {
    const bgEl = document.getElementById('bg-layer');
    const now = Date.now();

    if (state.bgSource === 'custom' && state.bgCustomUrl && !forceRefresh) {
        bgEl.style.backgroundImage = `url("${state.bgCustomUrl}")`;
        return;
    }

    if (!state.bgCurrentUrl || forceRefresh || (now - state.bgLastUpdate) > (1000 * 60 * 60 * 4)) {
        try {
            const res = await fetch('data/backgrounds.json');
            if(!res.ok) throw new Error("JSON Fetch Failed");
            const images = await res.json();
            
            if(!Array.isArray(images) || images.length === 0) throw new Error("Empty List");

            const randomImg = images[Math.floor(Math.random() * images.length)];
            state.bgCurrentUrl = randomImg;
            state.bgLastUpdate = now;
            saveState();
        } catch (e) { 
            console.warn("Background fetch failed, using fallback.", e);
            const fallbackImg = FALLBACK_BACKGROUNDS[Math.floor(Math.random() * FALLBACK_BACKGROUNDS.length)];
            state.bgCurrentUrl = fallbackImg;
            state.bgLastUpdate = now;
        }
    }
    
    if(state.bgCurrentUrl) {
        bgEl.style.backgroundImage = `url("${state.bgCurrentUrl}")`;
    } else {
        bgEl.style.backgroundImage = `url("${FALLBACK_BACKGROUNDS[0]}")`;
    }
}

function startClock() {
    const tick = () => {
        const now = new Date();
        let h = now.getHours();
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        updateGreeting(h);
        if (!state.settings.use24h) h = h % 12 || 12;
        else h = String(h).padStart(2, '0');
        let timeStr = `${h}:${m}`;
        if (state.settings.showSeconds) {
            timeStr += `<span style="font-size:0.4em; opacity:0.8; vertical-align:top; margin-left:8px">${s}</span>`;
        }
        document.getElementById('clock').innerHTML = timeStr;
    };
    tick();
    if(window.clockInterval) clearInterval(window.clockInterval);
    window.clockInterval = setInterval(tick, 1000);
}

function updateGreeting(h) {
    if (!h) h = new Date().getHours();
    let key = 'goodEvening';
    if (h >= 5 && h < 12) key = 'goodMorning';
    else if (h >= 12 && h < 17) key = 'goodAfternoon';
    else if (h >= 17 && h < 22) key = 'goodEvening';
    else key = 'goodNight';
    
    let text = t(key) || "Hello";
    if (state.username) text += `, ${state.username}`;
    document.getElementById('greeting').textContent = text;
}

function fetchWeather() {
    if (!state.settings.showWeather || !state.city) {
        document.getElementById('weather-widget').classList.add('hidden');
        return;
    }
    const langCode = state.language === 'tr' ? 'tr' : 'en';
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(state.city)}&count=1&language=${langCode}`)
        .then(r => r.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const { latitude, longitude, name } = data.results[0];
                const displayName = name.length > 15 ? name.substring(0, 12) + '...' : name;
                document.getElementById('weather-city').textContent = displayName;
                return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            } else throw new Error("City not found");
        })
        .then(r => r.json())
        .then(data => {
            const temp = Math.round(data.current_weather.temperature);
            document.getElementById('weather-temp').textContent = `${temp}°C`;
            document.getElementById('weather-widget').classList.remove('hidden');
        })
        .catch((e) => {
            document.getElementById('weather-widget').classList.add('hidden');
        });
}

function togglePomodoro() {
    const btnIcon = document.querySelector('#pomo-toggle i');
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        btnIcon.className = 'fas fa-play';
    } else {
        isTimerRunning = true;
        btnIcon.className = 'fas fa-pause';
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                resetPomodoro();
                sendNotification("ZenTab Pomodoro", "Time is up! Take a break.");
                try { new Audio('assets/audio/bell.mp3').play().catch(()=>{}); } catch(e){}
            }
        }, 1000);
    }
}

function resetPomodoro() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    document.querySelector('#pomo-toggle i').className = 'fas fa-play';
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('pomo-time').textContent = `${m}:${s}`;
}

function sendNotification(title, message) {
    if (chrome.notifications) {
        chrome.notifications.create({ type: 'basic', iconUrl: 'assets/icons/icon128.png', title, message, priority: 2 });
    } else alert(message);
}

function renderTodos() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';
    state.todos.forEach((t, i) => {
        const li = document.createElement('li');
        li.className = `todo-li ${t.done ? 'done' : ''}`;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = t.text;
        
        li.innerHTML = `
            <div style="flex:1; display:flex; align-items:center; gap:10px; cursor:pointer" class="toggle-area">
                <i class="${t.done ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
            </div>
            <i class="fas fa-trash" style="cursor:pointer; opacity:0.5; font-size:0.9rem"></i>
        `;
        li.querySelector('.toggle-area').appendChild(textSpan);
        li.querySelector('.toggle-area').onclick = () => { state.todos[i].done = !t.done; saveState(); renderTodos(); };
        li.querySelector('.fa-trash').onclick = () => { state.todos.splice(i, 1); saveState(); renderTodos(); };
        list.appendChild(li);
    });
}

function renderShortcuts() {
    const grid = document.getElementById('shortcuts-grid');
    grid.innerHTML = '';
    
    if (!state.settings.showShortcuts) {
        grid.style.display = 'none';
        return;
    }
    grid.style.display = 'flex';

    state.shortcuts.forEach((s, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'shortcut-item-wrapper';
        
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${s.url}&sz=64`;
        
        const titleHtml = state.settings.showShortcutTitles 
            ? `<span class="shortcut-title">${s.title}</span>` 
            : '';

        wrapper.innerHTML = `
            <a href="${s.url}" class="shortcut-item-wrapper transition-element" title="${s.title}">
                <div class="shortcut-icon-box">
                    <img src="${faviconUrl}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIC8+PC9zdmc+'">
                </div>
                ${titleHtml}
            </a>
            <div class="shortcut-del"><i class="fas fa-times"></i></div>
        `;
        
        wrapper.querySelector('.shortcut-del').onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            state.shortcuts.splice(i, 1);
            saveState();
            renderShortcuts();
        };
        grid.appendChild(wrapper);
    });

    const addBtn = document.createElement('div');
    addBtn.className = 'shortcut-item-wrapper add-new transition-element';
    addBtn.innerHTML = `
        <div class="shortcut-icon-box">
            <i class="fas fa-plus"></i>
        </div>
        ${state.settings.showShortcutTitles ? `<span class="shortcut-title">${t("btnAddShortcut")}</span>` : ''}
    `;
    addBtn.onclick = () => {
        document.getElementById('shortcut-modal').classList.remove('hidden');
        document.getElementById('shortcut-name-input').focus();
    };
    grid.appendChild(addBtn);
}

async function loadQuote() {
    try {
        const res = await fetch('data/quotes.json');
        const quotes = await res.json();
        const today = new Date().getDate();
        const index = today % quotes.length;
        const q = quotes[index];
        const lang = state.language;
        const text = q.text[lang] || q.text['en'];
        const author = q.author[lang] || q.author['en'];
        document.getElementById('quote-content').textContent = `"${text}"`;
        document.getElementById('quote-author').textContent = author;
    } catch(e) { console.error("Quote Error", e); }
}