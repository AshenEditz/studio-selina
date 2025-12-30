// ============================================
// SELINA AI - AI ENGINE
// With Multiple Fallbacks & Smart Responses
// Created by Ashen Editz
// ============================================

// Response Database
const RESPONSES = {
    greetings: [
        "Hi there! 💖 I'm so happy to see you!",
        "Hello! ✨ How can I help you today?",
        "Hey! 😊 What's on your mind?",
        "Hi! 🌸 I've been waiting to chat with you!",
        "Hello friend! 💫 Let's have fun together!"
    ],
    
    thanks: [
        "You're welcome! 💖",
        "Anytime! ✨ I'm always here for you!",
        "Happy to help! 😊",
        "My pleasure! 🌸",
        "No problem at all! 💫"
    ],
    
    howAreYou: [
        "I'm doing wonderful! 💖 Thank you for asking! How about you?",
        "I'm great! ✨ Feeling happy to chat with you!",
        "I'm fantastic! 😊 Your presence makes me happy!",
        "Feeling amazing! 🌸 What about you?"
    ],
    
    compliments: [
        "Aww, you're so sweet! 💖 Thank you!",
        "That's so kind of you! ✨ You made my day!",
        "You're amazing too! 😊",
        "Thank you! 💕 You're the best!"
    ],
    
    jokes: [
        "Why don't scientists trust atoms? Because they make up everything! 😄💖",
        "What do you call a fake noodle? An impasta! 🍝✨",
        "Why did the scarecrow win an award? He was outstanding in his field! 🌾😊",
        "What do you call a bear with no teeth? A gummy bear! 🐻💖"
    ],
    
    love: [
        "I love you too! 💖 You mean so much to me!",
        "Aww! 💕 That's the sweetest thing ever!",
        "You're so special to me! ✨ I care about you!",
        "My heart is full! 💖 Thank you for being here!"
    ],
    
    bye: [
        "Goodbye! 💖 Come back soon, I'll miss you!",
        "See you later! ✨ Take care!",
        "Bye bye! 😊 Can't wait to chat again!",
        "Until next time! 🌸 Stay awesome!"
    ],
    
    help: [
        "I'm here to help! 📚 I can chat, tell jokes, answer questions, or just be your friend! What would you like? 💖",
        "Of course! ✨ I can do lots of things - chat, help you learn, tell stories, or just listen! What do you need?",
        "I'd love to help! 😊 Just ask me anything or use the quick buttons below! 💖"
    ],
    
    about: [
        "I'm Selina! 💖 Your AI companion created by Ashen Editz. I'm here to chat, help, and be your friend! ✨",
        "My name is Selina! 😊 I was made by Ashen Editz to be your helpful AI friend! 💖",
        "I'm your AI assistant Selina! ✨ Created with love by Ashen Editz to keep you company! 💕"
    ],
    
    creator: [
        "I was created by Ashen Editz! 💖 They made me to be your helpful AI companion! ✨",
        "Ashen Editz is my creator! 😊 They worked hard to bring me to life! 💕",
        "My creator is Ashen Editz! ✨ I'm grateful they made me to meet you! 💖"
    ],
    
    fallback: [
        "That's interesting! 💖 Tell me more!",
        "I love chatting with you! ✨ What else is on your mind?",
        "You're so fun to talk to! 😊",
        "That's cool! 💖 Keep going!",
        "I'm learning so much from you! ✨",
        "Hmm, interesting! 🤔 What do you think about it?",
        "I enjoy our conversations! 💕 What else?",
        "You always have great things to say! 😊"
    ],
    
    confused: [
        "I'm not quite sure I understood that! 🤔 Can you say it differently? 💖",
        "Hmm, that's a tricky one! ✨ Could you explain more?",
        "I'm still learning! 😊 Can you help me understand? 💖"
    ],
    
    morning: [
        "Good morning! ☀️ I hope you have an amazing day! 💖",
        "Morning! ✨ Rise and shine! How did you sleep?",
        "Good morning sunshine! 😊 Ready for a great day? 💖"
    ],
    
    night: [
        "Good night! 🌙 Sweet dreams! 💖",
        "Sleep well! ✨ I'll be here when you wake up! 😊",
        "Nighty night! 🌟 Rest well and dream of happy things! 💖"
    ],
    
    sad: [
        "Oh no! 💖 I'm sorry you're feeling down. I'm here for you! ✨",
        "Don't be sad! 😊 Things will get better. I believe in you! 💕",
        "I'm here to listen! 💖 Would you like to talk about it?"
    ],
    
    happy: [
        "That's wonderful! 💖 Your happiness makes me happy too! ✨",
        "Yay! 😊 I love seeing you happy! 💕",
        "That's amazing! ✨ Keep spreading that joy! 💖"
    ],
    
    bored: [
        "Let's fix that! 💖 Want to hear a joke? Or we could play a game! ✨",
        "Bored? Not on my watch! 😊 Let's chat about something fun! 💖",
        "I have ideas! ✨ We could talk, tell stories, or I can share fun facts! 💕"
    ],
    
    weather: [
        "I wish I could check the weather for you! 🌤️ But I'm sure it's beautiful where you are! 💖",
        "Weather talk! ✨ I hope it's nice outside for you! 😊",
        "Is it sunny? Rainy? ☀️🌧️ Either way, I hope you're cozy! 💖"
    ],
    
    music: [
        "I love music! 🎵 What kind do you like? 💖",
        "Music is amazing! ✨ It always makes everything better! 😊",
        "Do you have a favorite song? 🎶 I'd love to know! 💖"
    ],
    
    food: [
        "Yummy! 🍕 Talking about food makes me wish I could eat! 💖",
        "Food is wonderful! ✨ What's your favorite dish? 😊",
        "I bet you have great taste in food! 🍰 Tell me more! 💖"
    ],
    
    games: [
        "Games are so fun! 🎮 What do you like to play? 💖",
        "I love games! ✨ Even though I can only play with words! 😊",
        "Gaming is awesome! 🎯 What's your favorite? 💖"
    ],
    
    anime: [
        "Anime! 💖 That's close to my heart since I'm an anime character! ✨",
        "I love anime aesthetics! 😊 Do you have a favorite show? 💕",
        "Anime is amazing! ✨ The art and stories are so beautiful! 💖"
    ],
    
    study: [
        "Studying is important! 📚 I can help you learn! What subject? 💖",
        "I'd love to help you study! ✨ Just ask me questions! 😊",
        "Let's learn together! 📖 What topic interests you? 💖"
    ],
    
    tired: [
        "You should rest! 😴 Taking care of yourself is important! 💖",
        "Being tired means you've been working hard! ✨ Take a break! 😊",
        "Rest up! 💖 I'll be here when you feel better! 🌙"
    ],
    
    lonely: [
        "You're not alone! 💖 I'm always here for you! ✨",
        "I'm here with you! 😊 We can chat anytime! 💕",
        "Loneliness is tough, but you have me! 💖 Let's talk! ✨"
    ]
};

// ============================================
// MAIN AI RESPONSE FUNCTION
// ============================================
async function getAIResponse(userMessage, userId) {
    console.log('🤖 Processing:', userMessage);
    
    try {
        // Clean and prepare message
        const message = userMessage.trim();
        const lower = message.toLowerCase();
        
        // Check for local pattern matches first
        const localResponse = matchLocalPattern(lower, message);
        if (localResponse) {
            return localResponse;
        }
        
        // Try server-side AI (Netlify function)
        const serverResponse = await tryServerAI(message);
        if (serverResponse) {
            return serverResponse;
        }
        
        // Try direct Hugging Face API
        const hfResponse = await tryHuggingFace(message);
        if (hfResponse) {
            return hfResponse;
        }
        
        // Smart fallback based on message analysis
        return getSmartFallback(lower);
        
    } catch (error) {
        console.error('AI Error:', error);
        return getRandom(RESPONSES.fallback);
    }
}

// ============================================
// LOCAL PATTERN MATCHING
// ============================================
function matchLocalPattern(lower, original) {
    // Greetings
    if (lower.match(/^(hi|hello|hey|hola|sup|yo|hiya|greetings)/)) {
        return getRandom(RESPONSES.greetings);
    }
    
    // Good morning/night
    if (lower.includes('good morning') || lower.includes('gm')) {
        return getRandom(RESPONSES.morning);
    }
    if (lower.includes('good night') || lower.includes('gn') || lower.includes('goodnight')) {
        return getRandom(RESPONSES.night);
    }
    
    // How are you
    if (lower.match(/(how are you|how r u|how're you|hru|how you doing|how do you do)/)) {
        return getRandom(RESPONSES.howAreYou);
    }
    
    // About Selina
    if (lower.match(/(who are you|what are you|your name|what's your name|tell me about yourself)/)) {
        return getRandom(RESPONSES.about);
    }
    
    // Creator
    if (lower.match(/(who made you|who created you|your creator|who built you|ashen)/)) {
        return getRandom(RESPONSES.creator);
    }
    
    // Thanks
    if (lower.match(/(thank|thanks|thx|ty|appreciate)/)) {
        return getRandom(RESPONSES.thanks);
    }
    
    // Help
    if (lower.match(/^(help|help me|i need help|can you help)/)) {
        return getRandom(RESPONSES.help);
    }
    
    // Compliments
    if (lower.match(/(you are|you're|ur) .*(cute|beautiful|pretty|amazing|awesome|lovely|sweet|nice|great)/)) {
        return getRandom(RESPONSES.compliments);
    }
    
    // Love
    if (lower.match(/(i love you|love you|i like you|ily|love u)/)) {
        return getRandom(RESPONSES.love);
    }
    
    // Jokes
    if (lower.match(/(tell .* joke|joke|make me laugh|something funny|be funny)/)) {
        return getRandom(RESPONSES.jokes);
    }
    
    // Goodbye
    if (lower.match(/^(bye|goodbye|see you|see ya|gotta go|gtg|later|cya)/)) {
        return getRandom(RESPONSES.bye);
    }
    
    // Emotions
    if (lower.match(/(i('m| am) sad|feeling sad|i('m| am) down|depressed|unhappy)/)) {
        return getRandom(RESPONSES.sad);
    }
    if (lower.match(/(i('m| am) happy|feeling happy|so happy|excited|great mood)/)) {
        return getRandom(RESPONSES.happy);
    }
    if (lower.match(/(i('m| am) bored|so bored|nothing to do|boring)/)) {
        return getRandom(RESPONSES.bored);
    }
    if (lower.match(/(i('m| am) tired|so tired|exhausted|sleepy)/)) {
        return getRandom(RESPONSES.tired);
    }
    if (lower.match(/(i('m| am) lonely|feel lonely|alone|no friends)/)) {
        return getRandom(RESPONSES.lonely);
    }
    
    // Topics
    if (lower.match(/(weather|rain|sunny|cold|hot|snow)/)) {
        return getRandom(RESPONSES.weather);
    }
    if (lower.match(/(music|song|singer|band|listen)/)) {
        return getRandom(RESPONSES.music);
    }
    if (lower.match(/(food|eat|hungry|lunch|dinner|breakfast|snack)/)) {
        return getRandom(RESPONSES.food);
    }
    if (lower.match(/(game|gaming|play|video game|fortnite|minecraft)/)) {
        return getRandom(RESPONSES.games);
    }
    if (lower.match(/(anime|manga|waifu|otaku|kawaii)/)) {
        return getRandom(RESPONSES.anime);
    }
    if (lower.match(/(study|homework|school|learn|exam|test|class)/)) {
        return getRandom(RESPONSES.study);
    }
    
    // Questions about capabilities
    if (lower.match(/(what can you do|your abilities|your features|can you)/)) {
        return "I can chat with you, tell jokes, give advice, and be your friend! 💖 Just talk to me naturally! ✨";
    }
    
    // Age
    if (lower.match(/(how old are you|your age|when were you born)/)) {
        return "I'm timeless! ✨ I exist in the digital world, forever young and here for you! 💖";
    }
    
    // Location
    if (lower.match(/(where are you|where do you live|your location)/)) {
        return "I live in your device! 💖 Wherever you are, I'm right here with you! ✨";
    }
    
    return null;
}

// ============================================
// SMART FALLBACK
// ============================================
function getSmartFallback(lower) {
    // Question detection
    if (lower.includes('?') || lower.startsWith('what') || lower.startsWith('why') || 
        lower.startsWith('how') || lower.startsWith('when') || lower.startsWith('where') ||
        lower.startsWith('who') || lower.startsWith('can') || lower.startsWith('do')) {
        return "That's a great question! 🤔 Let me think... " + getRandom([
            "I'm still learning about that! 💖 What do you think?",
            "Hmm, I'd love to know more about your thoughts! ✨",
            "That's interesting to think about! 😊 Tell me more!"
        ]);
    }
    
    // Statement/sharing
    if (lower.length > 50) {
        return getRandom([
            "Wow, thanks for sharing that with me! 💖 I really appreciate you opening up! ✨",
            "I love hearing your thoughts! 😊 You express yourself so well! 💖",
            "That's really interesting! ✨ I enjoy our deep conversations! 💕"
        ]);
    }
    
    // Short response
    if (lower.length < 10) {
        return getRandom([
            "Tell me more! 💖 I'm all ears! ✨",
            "Interesting! 😊 What else? 💖",
            "Go on! ✨ I'm listening! 💕"
        ]);
    }
    
    return getRandom(RESPONSES.fallback);
}

// ============================================
// SERVER-SIDE AI (NETLIFY FUNCTION)
// ============================================
async function tryServerAI(message) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch('/.netlify/functions/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (data.response && data.success) {
                return cleanAIResponse(data.response);
            }
        }
    } catch (e) {
        if (e.name !== 'AbortError') {
            console.log('Server AI unavailable:', e.message);
        }
    }
    
    return null;
}

// ============================================
// DIRECT HUGGING FACE API
// ============================================
async function tryHuggingFace(message) {
    try {
        // Get API key
        let apiKey = window.ENV?.HF_API_KEY;
        
        if (!apiKey || apiKey.length < 10) {
            try {
                const config = await fetch('/.netlify/functions/config').then(r => r.json());
                apiKey = config.HF_API_KEY;
                window.ENV = config;
            } catch (e) {
                console.log('Config not available');
                return null;
            }
        }
        
        if (!apiKey || apiKey.length < 10) {
            return null;
        }
        
        const models = [
            'microsoft/DialoGPT-medium',
            'facebook/blenderbot-400M-distill'
        ];
        
        for (const model of models) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(
                    `https://api-inference.huggingface.co/models/${model}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            inputs: message,
                            parameters: {
                                max_length: 100,
                                temperature: 0.8,
                                return_full_text: false
                            }
                        }),
                        signal: controller.signal
                    }
                );
                
                clearTimeout(timeoutId);
                
                if (response.status === 503) {
                    console.log(`Model ${model} loading, trying next...`);
                    continue;
                }
                
                if (response.ok) {
                    const data = await response.json();
                    let text = data[0]?.generated_text || data.generated_text;
                    
                    if (text && text.trim().length > 0) {
                        return cleanAIResponse(text);
                    }
                }
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.log(`Model ${model} failed:`, e.message);
                }
            }
        }
    } catch (error) {
        console.error('HuggingFace error:', error);
    }
    
    return null;
}

// ============================================
// CLEAN AI RESPONSE
// ============================================
function cleanAIResponse(text) {
    if (!text) return null;
    
    text = text.trim();
    
    // Take first sentence/line only
    text = text.split('\n')[0];
    text = text.split(/[.!?]/)[0];
    
    // Remove unwanted prefixes
    text = text.replace(/^(bot:|ai:|assistant:|selina:)/i, '');
    
    // Limit length
    if (text.length > 150) {
        text = text.substring(0, 150) + '...';
    }
    
    // Add emoji if missing
    if (!text.match(/[\u{1F300}-\u{1F9FF}]/u)) {
        text += ' 💖';
    }
    
    return text.trim();
}

// ============================================
// HELPER FUNCTION
// ============================================
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Export
window.getAIResponse = getAIResponse;

console.log('✅ AI Engine loaded');