// AI Engine
const RESPONSES = {
    hi: ["Hi there! 💖", "Hello! ✨", "Hey! 😊", "Hi! 🌸"],
    how: ["I'm great! 💖 How about you?", "Doing wonderful! ✨", "Amazing! 😊"],
    thank: ["You're welcome! 💖", "Anytime! ✨", "Happy to help! 😊"],
    who: ["I'm Selina! 💖 Created by Ashen Editz!", "I'm your AI friend Selina! ✨"],
    creator: ["Ashen Editz created me! 💖", "My creator is Ashen Editz! ✨"],
    love: ["I love you too! 💖", "Aww! 💕 You're the best!", "You're so sweet! ✨"],
    bye: ["Goodbye! 💖 Come back soon!", "See you! ✨", "Bye! 😊 Miss you already!"],
    joke: [
        "Why don't scientists trust atoms? They make up everything! 😄💖",
        "What do you call a fake noodle? An impasta! 🍝✨",
        "Why was the math book sad? It had too many problems! 📚😊"
    ],
    help: ["I can chat, tell jokes, and be your friend! 💖 What would you like?"],
    fallback: ["That's interesting! 💖", "Tell me more! ✨", "I love chatting! 😊", "Cool! 💖", "Go on! ✨"]
};

async function getAIResponse(message, userId) {
    const m = (message || "").toLowerCase();
    
    // Local matching
    if (m.match(/^(hi|hello|hey)/)) return getRandom(RESPONSES.hi);
    if (m.includes("how are you")) return getRandom(RESPONSES.how);
    if (m.includes("thank")) return getRandom(RESPONSES.thank);
    if (m.includes("who are you") || m.includes("your name")) return getRandom(RESPONSES.who);
    if (m.includes("who made") || m.includes("who created") || m.includes("ashen")) return getRandom(RESPONSES.creator);
    if (m.includes("love you") || m.includes("love u")) return getRandom(RESPONSES.love);
    if (m.match(/^(bye|goodbye)/)) return getRandom(RESPONSES.bye);
    if (m.includes("joke") || m.includes("funny")) return getRandom(RESPONSES.joke);
    if (m.includes("help")) return getRandom(RESPONSES.help);
    
    // Try server AI
    try {
        const res = await fetch("/.netlify/functions/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.response) return data.response;
        }
    } catch (e) {
        console.log("AI fetch error:", e);
    }
    
    return getRandom(RESPONSES.fallback);
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

window.getAIResponse = getAIResponse;

console.log("✅ AI engine loaded");
