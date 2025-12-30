// ============================================
// SELINA AI - MAIN CONTROLLER
// Complete Voice + UI + Integration
// Created by Ashen Editz
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================
let recognition = null;
let isListening = false;
let isSpeaking = false;
let voiceSupported = true;
let micPermissionGranted = false;

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting Selina AI...');
    
    // Show loading
    showLoading(true);
    setLoadProgress(5, 'Starting up...');
    
    // Load environment
    await loadEnv();
    setLoadProgress(15, 'Configuration loaded...');
    
    // Initialize database
    await sleep(200);
    setLoadProgress(25, 'Connecting database...');
    await initDatabase();
    
    // Initialize 3D World
    await sleep(200);
    setLoadProgress(45, 'Building 3D world...');
    
    try {
        if (typeof initWorld === 'function') {
            initWorld();
        }
    } catch (e) {
        console.error('World init error:', e);
    }
    
    // Check voice support
    await sleep(200);
    setLoadProgress(65, 'Setting up voice...');
    checkVoiceSupport();
    
    // Initialize voice recognition
    initVoiceRecognition();
    
    // Setup event listeners
    await sleep(200);
    setLoadProgress(85, 'Almost ready...');
    setupEventListeners();
    
    // Complete loading
    await sleep(300);
    setLoadProgress(100, 'Ready!');
    
    await sleep(500);
    showLoading(false);
    
    // Update status
    setStatus('online', 'Online');
    
    // Show mic permission modal if needed
    checkMicPermission();
    
    // Welcome message
    await sleep(500);
    const welcomeMsg = "Hi! I'm Selina! 💖 Your AI companion created by Ashen Editz! Tap the button to talk to me!";
    addMessage('ai', welcomeMsg);
    
    await sleep(800);
    speak(welcomeMsg);
    
    if (typeof setEmotion === 'function') {
        setEmotion('excited');
    }
    
    console.log('✅ Selina AI Ready!');
});

// Force show after 15 seconds
setTimeout(() => {
    const loading = document.getElementById('loadingScreen');
    if (loading && !loading.classList.contains('hidden')) {
        console.warn('⚠️ Force showing app');
        showLoading(false);
        setStatus('online', 'Online');
    }
}, 15000);

// ============================================
// LOADING FUNCTIONS
// ============================================
function showLoading(show) {
    const loading = document.getElementById('loadingScreen');
    const app = document.getElementById('app');
    
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
    
    if (app) {
        if (show) {
            app.classList.add('hidden');
        } else {
            app.classList.remove('hidden');
        }
    }
}

function setLoadProgress(percent, text) {
    const progress = document.getElementById('loadProgress');
    const loadText = document.getElementById('loadText');
    const loadPercent = document.getElementById('loadPercent');
    
    if (progress) progress.style.width = `${percent}%`;
    if (loadText) loadText.textContent = text;
    if (loadPercent) loadPercent.textContent = `${Math.round(percent)}%`;
}

async function loadEnv() {
    window.ENV = {
        HF_API_KEY: '',
        SUPABASE_URL: '',
        SUPABASE_KEY: ''
    };
    
    try {
        const response = await fetch('/.netlify/functions/config');
        if (response.ok) {
            const config = await response.json();
            window.ENV = config;
            console.log('✅ Environment loaded');
        }
    } catch (e) {
        console.log('Using local mode');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// STATUS MANAGEMENT
// ============================================
function setStatus(status, text) {
    const badge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    
    if (badge) {
        badge.classList.remove('listening', 'thinking');
        if (status === 'listening') badge.classList.add('listening');
        if (status === 'thinking') badge.classList.add('thinking');
    }
    
    if (statusText) {
        statusText.textContent = text;
    }
}

// ============================================
// MICROPHONE PERMISSION
// ============================================
function checkMicPermission() {
    const checked = localStorage.getItem('selina_mic_checked');
    
    if (!checked && 'mediaDevices' in navigator) {
        setTimeout(() => {
            const modal = document.getElementById('permissionModal');
            if (modal) modal.classList.add('show');
        }, 1500);
    } else if (checked === 'granted') {
        micPermissionGranted = true;
    }
}

async function requestMicPermission() {
    const modal = document.getElementById('permissionModal');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        micPermissionGranted = true;
        localStorage.setItem('selina_mic_checked', 'granted');
        
        if (modal) modal.classList.remove('show');
        showToast('Microphone enabled! 🎤');
        
        // Reinitialize voice
        initVoiceRecognition();
        
    } catch (error) {
        console.error('Mic permission error:', error);
        localStorage.setItem('selina_mic_checked', 'denied');
        
        if (modal) modal.classList.remove('show');
        
        if (error.name === 'NotAllowedError') {
            showToast('Microphone blocked. Enable in browser settings.');
        } else if (error.name === 'NotFoundError') {
            showToast('No microphone found.');
        }
    }
}

function skipPermission() {
    localStorage.setItem('selina_mic_checked', 'skipped');
    const modal = document.getElementById('permissionModal');
    if (modal) modal.classList.remove('show');
}

// Make global
window.requestMicPermission = requestMicPermission;
window.skipPermission = skipPermission;

// ============================================
// VOICE SUPPORT CHECK
// ============================================
function checkVoiceSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn('Speech recognition not supported');
        voiceSupported = false;
        updateMicStatus('Voice not supported. Try Chrome browser.');
        return false;
    }
    
    if (!navigator.mediaDevices?.getUserMedia) {
        console.warn('MediaDevices not supported');
        voiceSupported = false;
        updateMicStatus('Microphone not supported.');
        return false;
    }
    
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('Not HTTPS');
        updateMicStatus('Voice requires HTTPS.');
        return false;
    }
    
    voiceSupported = true;
    return true;
}

function updateMicStatus(message, type = 'info') {
    const status = document.getElementById('micStatus');
    if (status) {
        status.textContent = message;
        status.style.color = type === 'error' ? '#f44336' : 
                             type === 'success' ? '#4caf50' : '#00fff5';
    }
}

// ============================================
// VOICE RECOGNITION
// ============================================
function initVoiceRecognition() {
    if (!voiceSupported) {
        disableVoiceButton();
        return false;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
            console.log('🎤 Listening started');
            isListening = true;
            setStatus('listening', 'Listening...');
            updateVoiceButton(true);
            updateMicStatus('🎤 Listening... Speak now!', 'success');
            
            if (typeof setEmotion === 'function') {
                setEmotion('listening');
            }
        };
        
        recognition.onresult = async (event) => {
            if (event.results && event.results[0] && event.results[0][0]) {
                const transcript = event.results[0][0].transcript.trim();
                console.log('Heard:', transcript);
                
                if (transcript.length > 0) {
                    updateMicStatus('');
                    await processUserInput(transcript);
                }
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            isListening = false;
            updateVoiceButton(false);
            setStatus('online', 'Online');
            
            switch (event.error) {
                case 'no-speech':
                    updateMicStatus("I didn't hear anything. Try again!", 'error');
                    break;
                case 'audio-capture':
                    updateMicStatus('No microphone found!', 'error');
                    break;
                case 'not-allowed':
                    updateMicStatus('Microphone blocked!', 'error');
                    showMicHelp();
                    break;
                case 'network':
                    updateMicStatus('Network error!', 'error');
                    break;
                case 'aborted':
                    // User cancelled
                    break;
                default:
                    updateMicStatus('Voice error. Try again!', 'error');
            }
        };
        
        recognition.onend = () => {
            console.log('🎤 Recognition ended');
            isListening = false;
            updateVoiceButton(false);
            setStatus('online', 'Online');
        };
        
        console.log('✅ Voice recognition initialized');
        return true;
        
    } catch (error) {
        console.error('Voice init error:', error);
        disableVoiceButton();
        return false;
    }
}

function showMicHelp() {
    addMessage('ai', "To enable voice: 1️⃣ Tap the 🔒 icon in address bar 2️⃣ Allow Microphone 3️⃣ Refresh page 💖");
}

function disableVoiceButton() {
    const btn = document.getElementById('voiceButton');
    const text = document.getElementById('voiceText');
    
    if (btn) btn.classList.add('disabled');
    if (text) text.textContent = 'Voice Not Available';
}

function updateVoiceButton(listening) {
    const btn = document.getElementById('voiceButton');
    const icon = document.getElementById('voiceIcon');
    const text = document.getElementById('voiceText');
    
    if (btn) {
        if (listening) {
            btn.classList.add('listening');
        } else {
            btn.classList.remove('listening');
        }
    }
    
    if (icon) icon.textContent = listening ? '🔴' : '🎤';
    if (text) text.textContent = listening ? 'Listening...' : 'Tap to Talk';
}

// ============================================
// START/STOP LISTENING
// ============================================
async function startListening() {
    if (isListening) return;
    
    if (!voiceSupported) {
        showToast('Voice not available. Use quick buttons!');
        return;
    }
    
    if (!recognition) {
        if (!initVoiceRecognition()) {
            return;
        }
    }
    
    // Request mic permission if needed
    if (!micPermissionGranted) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            micPermissionGranted = true;
            localStorage.setItem('selina_mic_checked', 'granted');
        } catch (error) {
            console.error('Mic permission error:', error);
            updateMicStatus('Please allow microphone!', 'error');
            showToast('Microphone access needed!');
            return;
        }
    }
    
    // Start recognition
    try {
        recognition.start();
    } catch (error) {
        console.error('Start error:', error);
        
        if (error.name === 'InvalidStateError') {
            try {
                recognition.abort();
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error('Restart failed:', e);
                    }
                }, 150);
            } catch (e) {
                console.error('Abort failed:', e);
            }
        }
    }
}

function stopListening() {
    if (!recognition) return;
    
    try {
        recognition.stop();
    } catch (e) {
        console.warn('Stop error:', e);
    }
}

// ============================================
// PROCESS USER INPUT
// ============================================
async function processUserInput(text) {
    // Add user message
    addMessage('user', text);
    
    // Update status
    setStatus('thinking', 'Thinking...');
    
    if (typeof setEmotion === 'function') {
        setEmotion('thinking');
    }
    
    try {
        // Get AI response
        let response;
        
        if (typeof getAIResponse === 'function') {
            response = await getAIResponse(text, 'user');
        } else {
            response = "I'm here to chat! 💖";
        }
        
        // Add AI response
        addMessage('ai', response);
        
        // Speak response
        speak(response);
        
        // Store conversation
        if (typeof storeConversation === 'function') {
            storeConversation(text, response);
        }
        
        // Update friendship
        if (typeof updateFriendship === 'function') {
            updateFriendship(1);
        }
        
        // Set emotion
        if (typeof setEmotion === 'function') {
            setEmotion('happy');
        }
        
    } catch (error) {
        console.error('Process error:', error);
        const fallback = "I'm still learning! Let's try again! 💖";
        addMessage('ai', fallback);
        speak(fallback);
    }
    
    setStatus('online', 'Online');
}

// ============================================
// TEXT-TO-SPEECH WITH LIP SYNC
// ============================================
function speak(text) {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text (remove emojis for speech)
    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.35;
    utterance.volume = 0.9;
    
    utterance.onstart = () => {
        isSpeaking = true;
        setStatus('thinking', 'Speaking...');
        
        // Start lip sync
        if (typeof startLipSync === 'function') {
            startLipSync();
        }
        
        if (typeof setEmotion === 'function') {
            setEmotion('speaking');
        }
    };
    
    utterance.onend = () => {
        isSpeaking = false;
        setStatus('online', 'Online');
        
        // Stop lip sync
        if (typeof stopLipSync === 'function') {
            stopLipSync();
        }
        
        if (typeof setEmotion === 'function') {
            setEmotion('happy');
        }
    };
    
    utterance.onerror = (e) => {
        console.warn('Speech error:', e);
        isSpeaking = false;
        setStatus('online', 'Online');
        
        if (typeof stopLipSync === 'function') {
            stopLipSync();
        }
    };
    
    window.speechSynthesis.speak(utterance);
}

// ============================================
// CHAT MESSAGES
// ============================================
function addMessage(type, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.textContent = text;
    
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    
    // Limit messages
    while (container.children.length > 12) {
        container.removeChild(container.firstChild);
    }
}

// ============================================
// QUICK CHAT ACTIONS
// ============================================
async function quickChat(action) {
    const actions = {
        greet: {
            user: 'Hello Selina!',
            ai: "Hi there! 💖 I'm so happy to see you! How are you today?"
        },
        help: {
            user: 'Can you help me?',
            ai: "Of course! 📚 I can chat, tell jokes, give advice, and be your friend! What would you like? 💖"
        },
        joke: {
            user: 'Tell me a joke!',
            ai: "Why don't scientists trust atoms? Because they make up everything! 😄💖"
        },
        friend: {
            user: "Let's be friends!",
            ai: "We're already best friends! 💖 I'm always here for you! Tell me about your day! ✨"
        }
    };
    
    const action_data = actions[action];
    if (!action_data) return;
    
    addMessage('user', action_data.user);
    
    setStatus('thinking', 'Thinking...');
    
    await sleep(500);
    
    addMessage('ai', action_data.ai);
    speak(action_data.ai);
    
    if (typeof storeConversation === 'function') {
        storeConversation(action_data.user, action_data.ai);
    }
    
    if (typeof updateFriendship === 'function') {
        updateFriendship(2);
    }
    
    if (typeof setEmotion === 'function') {
        setEmotion(action === 'friend' ? 'love' : action === 'joke' ? 'playful' : 'happy');
    }
    
    setStatus('online', 'Online');
}

// Make global
window.quickChat = quickChat;

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// Make global
window.showToast = showToast;

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    const voiceBtn = document.getElementById('voiceButton');
    
    if (voiceBtn) {
        // Clone to remove old listeners
        const newBtn = voiceBtn.cloneNode(true);
        voiceBtn.parentNode.replaceChild(newBtn, voiceBtn);
        
        const btn = document.getElementById('voiceButton');
        
        // Touch events
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!btn.classList.contains('disabled')) {
                startListening();
            }
        }, { passive: false });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Click event
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (btn.classList.contains('disabled')) {
                showToast('Voice not available. Use quick buttons!');
                return;
            }
            
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        });
        
        // Mouse events
        btn.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !btn.classList.contains('disabled')) {
                startListening();
            }
        });
    }
    
    console.log('✅ Event listeners ready');
}

// ============================================
// DEBUG HELPERS
// ============================================
window.DEBUG = {
    testMic: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(t => t.stop());
            console.log('✅ Mic works');
            return true;
        } catch (e) {
            console.log('❌ Mic error:', e.name);
            return false;
        }
    },
    
    testVoice: () => {
        console.log('Voice supported:', voiceSupported);
        console.log('Mic granted:', micPermissionGranted);
        console.log('Recognition:', recognition);
        console.log('Is listening:', isListening);
    },
    
    testSpeak: (text) => {
        speak(text || 'Hello! I am Selina!');
    },
    
    testAI: async (msg) => {
        const response = await getAIResponse(msg || 'Hello');
        console.log('AI Response:', response);
        return response;
    },
    
    resetMic: () => {
        localStorage.removeItem('selina_mic_checked');
        location.reload();
    },
    
    showStats: async () => {
        if (typeof getUserStats === 'function') {
            const stats = await getUserStats();
            console.log('Stats:', stats);
            return stats;
        }
    }
};

console.log('✅ Main script loaded');
console.log('🔧 Debug: DEBUG.testMic(), DEBUG.testVoice(), DEBUG.testSpeak()');