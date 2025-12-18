const API_URL = '/api/wave';
const ROBLOX_API_URL = '/api/roblox';
const CACHE_API_URL = 'https://wave-chat-server.onrender.com/api/wave-cache';
const REFRESH_INTERVAL = 30000;
const STORAGE_KEY = 'waveDowntimeData';

const WEAO_DOMAINS = [
    'weao.xyz',
    'whatexpsare.online',
    'whatexploitsaretra.sh',
    'weao.gg'
];

let currentState = {
    isDown: false,
    version: null,
    lastKnownVersion: null,
    downSince: null,
    apiDownSince: null,
    lastDowntimeDuration: 0,
    longestDowntime: 0,
    savedLastDowntime: 0,
    apiAvailable: true,
    previousRobloxVersion: 'version-e380c8edc8f6477c',
    robloxVersionAtDownStart: null,
    lastDowntimeDate: null,
    longestDowntimeDate: null,
    robloxUpdateCombo: 0,
    lastRobloxCombo: 0,
    longestRobloxCombo: 0
};

let notificationsEnabled = false;
let notificationAudio = null;

async function loadSavedData() {
    try {

        const dbCache = await loadCacheFromDB();

        if (dbCache) {

            if (dbCache.lastDowntimeDuration) {
                currentState.lastDowntimeDuration = dbCache.lastDowntimeDuration;
            }
            if (dbCache.longestDowntime) {
                currentState.longestDowntime = dbCache.longestDowntime;
            }
            if (dbCache.savedLastDowntime !== undefined) {
                currentState.savedLastDowntime = dbCache.savedLastDowntime;
            } else if (dbCache.longestDowntime && !dbCache.savedLastDowntime) {

                currentState.savedLastDowntime = dbCache.longestDowntime;
            }
            if (dbCache.lastKnownVersion) {
                currentState.lastKnownVersion = dbCache.lastKnownVersion;
            }
            if (dbCache.isDown !== undefined) {
                currentState.isDown = dbCache.isDown;
            }
            // Use manualApiDownSince if it's set (admin override), otherwise use apiDownSince
            if (dbCache.manualTimerOverride && dbCache.manualApiDownSince) {
                currentState.apiDownSince = dbCache.manualApiDownSince;
            } else if (dbCache.apiDownSince) {
                currentState.apiDownSince = dbCache.apiDownSince;
            }
            if (dbCache.robloxVersionAtDownStart) {
                currentState.robloxVersionAtDownStart = dbCache.robloxVersionAtDownStart;
            }
            if (dbCache.lastDowntimeDate) {
                currentState.lastDowntimeDate = dbCache.lastDowntimeDate;
            }
            if (dbCache.longestDowntimeDate) {
                currentState.longestDowntimeDate = dbCache.longestDowntimeDate;
            }
            if (dbCache.lastRobloxCombo) {
                currentState.lastRobloxCombo = dbCache.lastRobloxCombo;
            }
            if (dbCache.longestRobloxCombo) {
                currentState.longestRobloxCombo = dbCache.longestRobloxCombo;
            }
            if (dbCache.robloxUpdateCombo) {
                currentState.robloxUpdateCombo = dbCache.robloxUpdateCombo;
            }
        } else {

            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.lastDowntimeDuration) {
                    currentState.lastDowntimeDuration = data.lastDowntimeDuration;
                }
                if (data.longestDowntime) {
                    currentState.longestDowntime = data.longestDowntime;
                }
                if (data.savedLastDowntime !== undefined) {
                    currentState.savedLastDowntime = data.savedLastDowntime;
                } else if (data.longestDowntime && !data.savedLastDowntime) {

                    currentState.savedLastDowntime = data.longestDowntime;
                }
                if (data.lastKnownVersion) {
                    currentState.lastKnownVersion = data.lastKnownVersion;
                }
                if (data.isDown !== undefined) {
                    currentState.isDown = data.isDown;
                }
                if (data.apiDownSince) {
                    currentState.apiDownSince = data.apiDownSince;
                }
                if (data.previousRobloxVersion) {
                    currentState.previousRobloxVersion = data.previousRobloxVersion;
                }
                if (data.robloxVersionAtDownStart) {
                    currentState.robloxVersionAtDownStart = data.robloxVersionAtDownStart;
                }
                if (data.lastDowntimeDate) {
                    currentState.lastDowntimeDate = data.lastDowntimeDate;
                }
                if (data.longestDowntimeDate) {
                    currentState.longestDowntimeDate = data.longestDowntimeDate;
                }
                if (data.lastRobloxCombo) {
                    currentState.lastRobloxCombo = data.lastRobloxCombo;
                }
                if (data.longestRobloxCombo) {
                    currentState.longestRobloxCombo = data.longestRobloxCombo;
                }
                if (data.robloxUpdateCombo) {
                    currentState.robloxUpdateCombo = data.robloxUpdateCombo;
                }
            }
        }
        
        const savedPrevVersion = localStorage.getItem('previousRobloxVersion');
        if (savedPrevVersion) {
            currentState.previousRobloxVersion = savedPrevVersion;
        }

        updateStatsDisplay();
    } catch (e) {
    }
}

async function saveData() {
    try {
        const dataToSave = {
            lastDowntimeDuration: currentState.lastDowntimeDuration,
            longestDowntime: currentState.longestDowntime,
            savedLastDowntime: currentState.savedLastDowntime,
            lastKnownVersion: currentState.lastKnownVersion,
            isDown: currentState.isDown,
            apiDownSince: currentState.apiDownSince,
            previousRobloxVersion: currentState.previousRobloxVersion,
            robloxVersionAtDownStart: currentState.robloxVersionAtDownStart,
            lastDowntimeDate: currentState.lastDowntimeDate,
            longestDowntimeDate: currentState.longestDowntimeDate,
            lastRobloxCombo: currentState.lastRobloxCombo,
            longestRobloxCombo: currentState.longestRobloxCombo,
            robloxUpdateCombo: currentState.robloxUpdateCombo,
            // Reset manual override when Wave is up
            manualTimerOverride: currentState.isDown ? undefined : false,
            manualApiDownSince: currentState.isDown ? undefined : null
        };
        
        localStorage.setItem('previousRobloxVersion', currentState.previousRobloxVersion);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

        try {
            await fetch(CACHE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
        } catch (error) {
        }
    } catch (e) {
    }
}

async function loadCacheFromDB() {
    try {
        const response = await fetch(CACHE_API_URL);
        if (response.ok) {
            const cache = await response.json();
            return cache;
        }
    } catch (error) {
    }
    return null;
}

async function fetchWithFallback(endpoint) {

    const domains = [...WEAO_DOMAINS].sort(() => Math.random() - 0.5);

    for (const domain of domains) {
        try {
            const url = `https://${domain}${endpoint}`;

            const response = await fetch(url, {
                headers: { 'User-Agent': 'WEAO-3PService' }
            });

            if (response.status === 429) {
                continue;
            }

            if (!response.ok) {
                continue;
            }

            const data = await response.json();
            return data;

        } catch (error) {
            continue;
        }
    }

    return null;
}

async function fetchRobloxVersion() {
    try {

        const response = await fetch(ROBLOX_API_URL);

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        return await fetchWithFallback('/api/versions/current');

    } catch (error) {

        return await fetchWithFallback('/api/versions/current');
    }
}

async function fetchWaveStatus() {
    try {

        const response = await fetch(API_URL);

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        return await fetchWithFallback('/api/status/exploits/wave');

    } catch (error) {

        return await fetchWithFallback('/api/status/exploits/wave');
    }
}

function parseApiDate(dateString) {

    try {
        const cleanDate = dateString.replace(' UTC', '').replace(',', '');
        return new Date(cleanDate + ' UTC').getTime();
    } catch (e) {
        return null;
    }
}

function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function formatTimer(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimer() {
    const timerElement = document.getElementById('timer');

    if (currentState.isDown && currentState.apiDownSince) {
        const elapsed = Date.now() - currentState.apiDownSince;
        timerElement.textContent = formatTimer(elapsed);

        // Only update longest downtime value, don't re-render stats
        if (elapsed > currentState.longestDowntime) {
            currentState.longestDowntime = elapsed;
            // Only update the duration text, not the whole HTML
            const recordDuration = document.querySelector('#record .stat-duration');
            if (recordDuration) {
                recordDuration.textContent = formatDuration(elapsed);
            }
        }
    }
}

function formatDate(timestamp) {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatCombo(combo) {
    if (!combo || combo <= 1) return '';
    return `<img src="Roblox.webp" alt="Roblox" class="stat-combo-icon">x${combo}`;
}

function updateStatsDisplay() {
    const lastDowntimeElement = document.getElementById('lastDowntime');
    const recordElement = document.getElementById('record');

    // Check if last downtime data changed
    const lastChanged = lastRenderedStats.savedLastDowntime !== currentState.savedLastDowntime ||
                       lastRenderedStats.lastDowntimeDate !== currentState.lastDowntimeDate ||
                       lastRenderedStats.lastRobloxCombo !== currentState.lastRobloxCombo;

    if (lastChanged) {
        if (currentState.savedLastDowntime > 0) {
            let html = `<span class="stat-duration">${formatDuration(currentState.savedLastDowntime)}</span>`;
            if (currentState.lastDowntimeDate) {
                html += `<span class="stat-date">${formatDate(currentState.lastDowntimeDate)}</span>`;
            }
            if (currentState.lastRobloxCombo > 1) {
                html += `<span class="stat-combo">${formatCombo(currentState.lastRobloxCombo)}</span>`;
            }
            lastDowntimeElement.innerHTML = html;
        } else {
            lastDowntimeElement.textContent = 'No data yet';
        }
        lastRenderedStats.savedLastDowntime = currentState.savedLastDowntime;
        lastRenderedStats.lastDowntimeDate = currentState.lastDowntimeDate;
        lastRenderedStats.lastRobloxCombo = currentState.lastRobloxCombo;
    }

    // Check if longest downtime data changed (excluding live duration updates)
    const longestChanged = lastRenderedStats.longestDowntimeDate !== currentState.longestDowntimeDate ||
                          lastRenderedStats.longestRobloxCombo !== currentState.longestRobloxCombo ||
                          (lastRenderedStats.longestDowntime === null && currentState.longestDowntime > 0);

    if (longestChanged) {
        if (currentState.longestDowntime > 0) {
            let html = `<span class="stat-duration">${formatDuration(currentState.longestDowntime)}</span>`;
            if (currentState.longestDowntimeDate) {
                html += `<span class="stat-date">${formatDate(currentState.longestDowntimeDate)}</span>`;
            }
            if (currentState.longestRobloxCombo > 1) {
                html += `<span class="stat-combo">${formatCombo(currentState.longestRobloxCombo)}</span>`;
            }
            recordElement.innerHTML = html;
        } else {
            recordElement.textContent = 'No data yet';
        }
        lastRenderedStats.longestDowntime = currentState.longestDowntime;
        lastRenderedStats.longestDowntimeDate = currentState.longestDowntimeDate;
        lastRenderedStats.longestRobloxCombo = currentState.longestRobloxCombo;
    }
    
    // Update combo display under timer
    updateComboDisplay();
}

function getComboLevel(combo) {
    if (combo <= 1) return 0;
    if (combo === 2) return 1;
    if (combo === 3) return 2;
    if (combo === 4) return 3;
    if (combo >= 5) return 4;
    return 0;
}

// Cache for preventing unnecessary re-renders
let lastRenderedStats = {
    savedLastDowntime: null,
    lastDowntimeDate: null,
    lastRobloxCombo: null,
    longestDowntime: null,
    longestDowntimeDate: null,
    longestRobloxCombo: null,
    robloxUpdateCombo: null
};

function updateComboDisplay() {
    let comboContainer = document.getElementById('robloxComboContainer');
    
    // Create container if it doesn't exist
    if (!comboContainer) {
        const timerSection = document.getElementById('timerSection');
        if (timerSection) {
            comboContainer = document.createElement('div');
            comboContainer.id = 'robloxComboContainer';
            comboContainer.className = 'roblox-combo-container';
            timerSection.appendChild(comboContainer);
        }
    }
    
    if (!comboContainer) return;
    
    const combo = currentState.robloxUpdateCombo;
    
    if (combo <= 1 || !currentState.isDown) {
        comboContainer.classList.add('hidden');
        lastRenderedStats.robloxUpdateCombo = null;
        return;
    }
    
    // Only update if combo changed
    if (lastRenderedStats.robloxUpdateCombo === combo) {
        return;
    }
    lastRenderedStats.robloxUpdateCombo = combo;
    
    comboContainer.classList.remove('hidden');
    
    const level = getComboLevel(combo);
    comboContainer.className = 'roblox-combo-container combo-level-' + level;
    
    comboContainer.innerHTML = `
        <div class="combo-text">
            <img src="Roblox.webp" alt="Roblox" class="combo-roblox-icon">
            <span class="combo-label">Roblox Updated</span>
            <span class="combo-count">x${combo}</span>
        </div>
    `;
}

async function updateUI(data) {
    const versionElement = document.getElementById('version');
    const statusTextElement = document.getElementById('statusText');
    const statusIndicatorElement = document.getElementById('statusIndicator');
    const timerSectionElement = document.getElementById('timerSection');
    const timerLabelElement = document.getElementById('timerLabel');

    const apiStatusSection = document.getElementById('apiStatusSection');
    const apiStatusMessage = document.getElementById('apiStatusMessage');

    if (!data) {

        currentState.apiAvailable = false;

        apiStatusSection.classList.remove('hidden');
        apiStatusMessage.textContent = '⚠️ WEAO API is currently unavailable - Using cached data from database';
        apiStatusMessage.className = 'api-status-message error';

        if (currentState.lastKnownVersion) {
            versionElement.textContent = currentState.lastKnownVersion;
        } else {
            versionElement.textContent = 'Unknown';
        }

        if (currentState.isDown) {
            statusTextElement.innerHTML = 'WAVE IS DOWN! <img src="warningemoji.webp" alt="Warning" class="status-emoji">';
            statusTextElement.className = 'status-text status-down';
            timerSectionElement.classList.remove('hidden');
            timerLabelElement.textContent = 'Down for';
            const warningEl = document.getElementById('downgradeWarning');
            const buttonEl = document.getElementById('downgradeButtonContainer');
            if (warningEl) {
                warningEl.style.display = 'block';
            } else {
            }
            if (buttonEl) {
                buttonEl.style.display = 'block';
            }

            if (currentState.apiDownSince) {
                updateTimer();
            }
        } else {
            const warningEl = document.getElementById('downgradeWarning');
            const buttonEl = document.getElementById('downgradeButtonContainer');
            if (warningEl) {
                warningEl.style.display = 'none';
            }
            if (buttonEl) {
                buttonEl.style.display = 'none';
            }
            statusTextElement.innerHTML = 'WAVE IS UP! <img src="happyemoji.webp" alt="Happy" class="status-emoji">';
            statusTextElement.className = 'status-text status-up';

            if (currentState.lastDowntimeDuration > 0) {
                timerSectionElement.classList.remove('hidden');
                document.getElementById('timer').textContent = formatDuration(currentState.lastDowntimeDuration);
                timerLabelElement.textContent = 'Last downtime duration';
            } else {
                timerSectionElement.classList.add('hidden');
            }
        }

        updateStatsDisplay();
        return;
    }

    if (!currentState.apiAvailable) {

        apiStatusSection.classList.remove('hidden');
        apiStatusMessage.textContent = '✅ API reconnected successfully';
        apiStatusMessage.className = 'api-status-message success';
        setTimeout(() => {
            apiStatusSection.classList.add('hidden');
        }, 3000);
    } else {

        apiStatusSection.classList.add('hidden');
    }
    currentState.apiAvailable = true;

    if (data.version) {
        const wasUpdated = currentState.lastKnownVersion && currentState.lastKnownVersion !== data.version;
        currentState.lastKnownVersion = data.version;
        versionElement.textContent = data.version;

        if (wasUpdated && currentState.isDown) {

            const finalDowntime = currentState.apiDownSince ? Date.now() - currentState.apiDownSince : 0;
            const nowTimestamp = Date.now();
            const finalCombo = currentState.robloxUpdateCombo || 1;

            currentState.lastDowntimeDuration = finalDowntime;
            currentState.savedLastDowntime = finalDowntime;
            currentState.lastDowntimeDate = nowTimestamp;
            currentState.lastRobloxCombo = finalCombo;

            if (finalDowntime > currentState.longestDowntime) {
                currentState.longestDowntime = finalDowntime;
                currentState.longestDowntimeDate = nowTimestamp;
                currentState.longestRobloxCombo = finalCombo;
            }

            await saveData();
        }
    } else {
        versionElement.textContent = currentState.lastKnownVersion || 'Unknown';
    }

    const isCurrentlyDown = data.updateStatus === false;

    const robloxData = await fetchRobloxVersion();
    const currentRobloxVersion = robloxData && robloxData.Windows ? robloxData.Windows : null;
    
    if (isCurrentlyDown && !currentState.isDown) {
        // Wave just went down - save the Roblox version at the start of downtime
        if (currentRobloxVersion) {
            currentState.robloxVersionAtDownStart = currentRobloxVersion;
            currentState.previousRobloxVersion = currentRobloxVersion;
            localStorage.setItem('previousRobloxVersion', currentRobloxVersion);
        }
        
        // Set apiDownSince to now (start of this downtime)
        if (robloxData && robloxData.WindowsDate) {
            const robloxTimestamp = parseApiDate(robloxData.WindowsDate);
            if (robloxTimestamp) {
                currentState.apiDownSince = robloxTimestamp;
            }
        } else {
            currentState.apiDownSince = Date.now();
        }
        
        // Reset combo counter for new downtime
        currentState.robloxUpdateCombo = 1;
        
        currentState.isDown = true;
        currentState.downSince = Date.now();
        currentState.version = data.version;
        await saveData();
    } else if (isCurrentlyDown && currentState.isDown) {
        // Wave is still down - check if Roblox updated again
        // Use robloxVersionAtDownStart if available, otherwise fall back to previousRobloxVersion
        const versionToCompare = currentState.robloxVersionAtDownStart || currentState.previousRobloxVersion;
        
        if (currentRobloxVersion && versionToCompare && 
            currentRobloxVersion !== versionToCompare) {
            // Roblox updated while Wave was still down - INCREMENT COMBO!
            currentState.robloxUpdateCombo = (currentState.robloxUpdateCombo || 1) + 1;
            
            // Update the start time to the new Roblox update time
            if (robloxData && robloxData.WindowsDate) {
                const robloxTimestamp = parseApiDate(robloxData.WindowsDate);
                if (robloxTimestamp) {
                    currentState.apiDownSince = robloxTimestamp;
                }
            }
            currentState.robloxVersionAtDownStart = currentRobloxVersion;
            currentState.previousRobloxVersion = currentRobloxVersion;
            localStorage.setItem('previousRobloxVersion', currentRobloxVersion);
            
            // Update combo display with animation
            updateComboDisplay();
            
            await saveData();
        }
    } else if (!isCurrentlyDown && currentState.isDown) {

        const finalDowntime = currentState.apiDownSince ? Date.now() - currentState.apiDownSince : 0;
        const nowTimestamp = Date.now();
        const finalCombo = currentState.robloxUpdateCombo || 1;

        if (finalDowntime > 0) {

            currentState.savedLastDowntime = finalDowntime;
            currentState.lastDowntimeDate = nowTimestamp;
            currentState.lastRobloxCombo = finalCombo;

            if (finalDowntime > currentState.longestDowntime) {
                currentState.longestDowntime = finalDowntime;
                currentState.longestDowntimeDate = nowTimestamp;
                currentState.longestRobloxCombo = finalCombo;
            }

            currentState.lastDowntimeDuration = finalDowntime;
        }

        showWaveUpNotification();

        currentState.isDown = false;
        currentState.downSince = null;
        currentState.apiDownSince = null;
        currentState.robloxVersionAtDownStart = null;
        currentState.robloxUpdateCombo = 0;
        await saveData();
        updateStatsDisplay();
    }

    if (isCurrentlyDown) {
        statusTextElement.innerHTML = 'WAVE IS DOWN! <img src="warningemoji.webp" alt="Warning" class="status-emoji">';
        statusTextElement.className = 'status-text status-down';
        timerSectionElement.classList.remove('hidden');
        timerLabelElement.textContent = 'Down for';
        const warningEl = document.getElementById('downgradeWarning');
        const buttonEl = document.getElementById('downgradeButtonContainer');
        if (warningEl) {
            warningEl.style.display = 'block';
        } else {
        }
        if (buttonEl) {
            buttonEl.style.display = 'block';
        }
        updateTimer();
        updateComboDisplay();
    } else {
        statusTextElement.innerHTML = 'WAVE IS UP! <img src="happyemoji.webp" alt="Happy" class="status-emoji">';
        statusTextElement.className = 'status-text status-up';
        const warningEl = document.getElementById('downgradeWarning');
        const buttonEl = document.getElementById('downgradeButtonContainer');
        if (warningEl) {
            warningEl.style.display = 'none';
        }
        if (buttonEl) {
            buttonEl.style.display = 'none';
        }

        if (currentState.lastDowntimeDuration > 0) {
            timerSectionElement.classList.remove('hidden');
            document.getElementById('timer').textContent = formatDuration(currentState.lastDowntimeDuration);
            timerLabelElement.textContent = 'Last downtime duration';
        } else {
            timerSectionElement.classList.add('hidden');
        }
        
        // Hide combo when Wave is up
        const comboContainer = document.getElementById('robloxComboContainer');
        if (comboContainer) {
            comboContainer.classList.add('hidden');
        }
    }
}

async function init() {
    await loadSavedData();

    const data = await fetchWaveStatus();
    await updateUI(data);

    setInterval(async () => {
        const data = await fetchWaveStatus();
        await updateUI(data);
    }, REFRESH_INTERVAL);

    setInterval(() => {
        if (currentState.isDown) {
            updateTimer();
        }
    }, 1000);

    setInterval(async () => {
        await saveData();
    }, 2 * 60 * 1000);
}

let nyaAudio = null;
let isNyaPlaying = false;

function toggleNyaSound() {
    const wavetyanImg = document.querySelector('.wavetyan-sitting');

    if (!nyaAudio) {
        nyaAudio = new Audio('nya.mp3');
        nyaAudio.addEventListener('ended', () => {
            isNyaPlaying = false;
            if (wavetyanImg) {
                wavetyanImg.classList.remove('bouncing');
            }
        });
    }

    if (isNyaPlaying) {
        nyaAudio.pause();
        nyaAudio.currentTime = 0;
        isNyaPlaying = false;
        if (wavetyanImg) {
            wavetyanImg.classList.remove('bouncing');
        }
    } else {
        nyaAudio.play();
        isNyaPlaying = true;
        if (wavetyanImg) {
            wavetyanImg.classList.add('bouncing');
        }
    }
}

function initNotifications() {
    notificationAudio = document.getElementById('notificationAudio');
    const notificationBtn = document.getElementById('notificationBtn');

    if (notificationAudio) {
        notificationAudio.load();

        notificationAudio.addEventListener('error', (e) => {
        });
    }

    const savedPref = localStorage.getItem('notificationsEnabled');
    if (savedPref === 'true') {
        notificationsEnabled = true;
        notificationBtn.classList.add('active');
    }

    notificationBtn.addEventListener('click', async () => {
        if (!notificationsEnabled) {

            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    notificationsEnabled = true;
                    notificationBtn.classList.add('active');
                    localStorage.setItem('notificationsEnabled', 'true');

                    new Notification('Wave Downtime Tracker', {
                        body: 'Notifications enabled! You will be notified when Wave is UP.',
                        icon: 'wavebluelogo.webp',
                        tag: 'wave-notification-test'
                    });
                } else {
                    alert('Please allow notifications to use this feature');
                }
            } else {
                alert('Your browser does not support notifications');
            }
        } else {

            notificationsEnabled = false;
            notificationBtn.classList.remove('active');
            localStorage.setItem('notificationsEnabled', 'false');
        }
    });
}

function showWaveUpNotification() {
    if (!notificationsEnabled) {
        return;
    }

    if (notificationAudio) {
        notificationAudio.currentTime = 0;
        notificationAudio.volume = 1.0;

        const playPromise = notificationAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
            });
        }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('WAVE IS UP! 🎉', {
            body: 'Wave exploit is now available!',
            icon: 'wavebluelogo.webp',
            tag: 'wave-status-up',
            requireInteraction: true
        });
    }
}

function initSiteBrandingCopy() {
    const siteBranding = document.getElementById('siteBranding');
    if (!siteBranding) return;

    siteBranding.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('wavestatus.com');

            const originalTooltip = siteBranding.getAttribute('data-tooltip');

            siteBranding.setAttribute('data-tooltip', 'Copied!');

            setTimeout(() => {
                siteBranding.setAttribute('data-tooltip', originalTooltip);
            }, 2000);
        } catch (err) {
        }
    });
}

init();
initNotifications();
initSiteBrandingCopy();

document.addEventListener('DOMContentLoaded', () => {
    const warningEl = document.getElementById('downgradeWarning');
    const buttonEl = document.getElementById('downgradeButtonContainer');
    if (warningEl) {
        warningEl.style.display = 'block';
    } else {
    }
    if (buttonEl) {
        buttonEl.style.display = 'block';
    }
});