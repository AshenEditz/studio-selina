// Main Controller
let recognition = null;
let isListening = false;
let voiceSupported = true;

// Init
window.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Starting Selina AI...");
    
    setLoad(10, "Starting...");
    
    await initDatabase();
    setLoad(30, "Database ready...");
    
    await sleep(300);
    setLoad(50, "Building world...");
    
    try {
        initWorld();
    } catch (e) {
        console.error("World error:", e);
    }
    
    await sleep(300);
    setLoad(70, "Setting up voice...");
    
    initVoice();
    
    setLoad(90, "Almost ready...");
    
    setupEvents();
    
    await sleep(300);
    setLoad(100, "Ready!");
    
    await sleep(500);
    
    document.getElementById("loading").classList.add("hide");
    document.getElementById("app").classList.remove("hide");
    
    setStatus("online", "Online");
    
    await sleep(500);
    addMsg("ai", "Hi! I'm Selina! 💖 Tap the button to talk!");
    speak("Hi! I'm Selina! Your AI friend by Ashen Editz!");
    
    console.log("✅ Ready!");
});

// Force show
setTimeout(() => {
    const l = document.getElementById("loading");
    if (l && !l.classList.contains("hide")) {
        l.classList.add("hide");
        document.getElementById("app").classList.remove("hide");
    }
}, 10000);

function setLoad(pct, txt) {
    const fill = document.getElementById("loadFill");
    const text = document.getElementById("loadText");
    if (fill) fill.style.width = pct + "%";
    if (text) text.textContent = txt;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function setStatus(type, text) {
    const status = document.getElementById("status");
    const statusText = document.getElementById("statusText");
    if (status) {
        status.classList.remove("listening");
        if (type === "listening") status.classList.add("listening");
    }
    if (statusText) statusText.textContent = text;
}

// Voice
function initVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SR) {
        voiceSupported = false;
        setMicStatus("Voice not supported. Try Chrome!");
        disableVoice();
        return;
    }
    
    try {
        recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        
        recognition.onstart = () => {
            isListening = true;
            setStatus("listening", "Listening...");
            updateVoiceBtn(true);
            setMicStatus("🎤 Listening...");
        };
        
        recognition.onresult = async (e) => {
            if (e.results[0]?.[0]) {
                const text = e.results[0][0].transcript.trim();
                if (text) {
                    setMicStatus("");
                    await handleInput(text);
                }
            }
        };
        
        recognition.onerror = (e) => {
            isListening = false;
            updateVoiceBtn(false);
            setStatus("online", "Online");
            
            if (e.error === "no-speech") setMicStatus("Didn't hear you!");
            else if (e.error === "not-allowed") setMicStatus("Allow microphone!");
            else setMicStatus("Try again!");
        };
        
        recognition.onend = () => {
            isListening = false;
            updateVoiceBtn(false);
            setStatus("online", "Online");
        };
        
        console.log("✅ Voice ready");
        
    } catch (e) {
        console.error("Voice error:", e);
        voiceSupported = false;
        disableVoice();
    }
}

function setMicStatus(txt) {
    const el = document.getElementById("micStatus");
    if (el) el.textContent = txt;
}

function disableVoice() {
    const btn = document.getElementById("voiceBtn");
    if (btn) btn.classList.add("disabled");
    const label = document.getElementById("voiceLabel");
    if (label) label.textContent = "Voice Not Available";
}

function updateVoiceBtn(listening) {
    const btn = document.getElementById("voiceBtn");
    const icon = document.getElementById("voiceIcon");
    const label = document.getElementById("voiceLabel");
    
    if (btn) {
        if (listening) btn.classList.add("listening");
        else btn.classList.remove("listening");
    }
    if (icon) icon.textContent = listening ? "🔴" : "🎤";
    if (label) label.textContent = listening ? "Listening..." : "Tap to Talk";
}

async function startListening() {
    if (isListening || !voiceSupported || !recognition) return;
    
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
    } catch (e) {
        setMicStatus("Allow microphone!");
        showToast("Please allow microphone access!");
    }
}

function stopListening() {
    if (recognition && isListening) {
        try { recognition.stop(); } catch (e) {}
    }
}

// Input handling
async function handleInput(text) {
    addMsg("user", text);
    setStatus("thinking", "Thinking...");
    
    try {
        const response = await getAIResponse(text, "user");
        addMsg("ai", response);
        speak(response);
        saveChat(text, response);
        addFriendship(1);
    } catch (e) {
        const fallback = "I'm still learning! 💖";
        addMsg("ai", fallback);
        speak(fallback);
    }
    
    setStatus("online", "Online");
}

// Speech
function speak(text) {
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    
    const clean = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "");
    if (!clean) return;
    
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "en-US";
    u.rate = 1.0;
    u.pitch = 1.3;
    
    u.onstart = () => {
        if (typeof startLipSync === "function") startLipSync();
    };
    
    u.onend = () => {
        if (typeof stopLipSync === "function") stopLipSync();
    };
    
    window.speechSynthesis.speak(u);
}

// Messages
function addMsg(type, text) {
    const container = document.getElementById("messages");
    if (!container) return;
    
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    
    while (container.children.length > 10) {
        container.removeChild(container.firstChild);
    }
}

// Quick chat
async function quickTalk(type) {
    const chats = {
        hi: { user: "Hello Selina!", ai: "Hi there! 💖 How are you today?" },
        help: { user: "Help me!", ai: "I can chat, tell jokes, and be your friend! 💖" },
        joke: { user: "Tell me a joke!", ai: "Why don't eggs tell jokes? They'd crack up! 😄💖" },
        love: { user: "I love you!", ai: "I love you too! 💖 You're the best!" }
    };
    
    const c = chats[type];
    if (!c) return;
    
    addMsg("user", c.user);
    await sleep(500);
    addMsg("ai", c.ai);
    speak(c.ai);
    saveChat(c.user, c.ai);
    addFriendship(2);
}

window.quickTalk = quickTalk;

// Toast
function showToast(msg) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    
    setTimeout(() => t.remove(), 3000);
}

window.showToast = showToast;

// Events
function setupEvents() {
    const btn = document.getElementById("voiceBtn");
    if (!btn) return;
    
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (!btn.classList.contains("disabled")) startListening();
    }, { passive: false });
    
    btn.addEventListener("touchend", (e) => {
        e.preventDefault();
    }, { passive: false });
    
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (btn.classList.contains("disabled")) {
            showToast("Voice not available!");
            return;
        }
        if (isListening) stopListening();
        else startListening();
    });
}

console.log("✅ Script loaded");
