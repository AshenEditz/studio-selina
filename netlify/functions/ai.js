// ============================================
// SELINA AI - NETLIFY FUNCTION
// Uses built-in fetch (Node 18+)
// Created by Ashen Editz
// ============================================

exports.handler = async function(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }
    
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const message = body.message || '';
        
        if (!message) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: "I didn't catch that! Can you say it again? 💖",
                    success: true
                })
            };
        }
        
        // Get API key from environment
        const apiKey = process.env.HF_API_KEY;
        
        // If no API key, return fallback response
        if (!apiKey || apiKey.length < 10) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: getLocalResponse(message),
                    success: true
                })
            };
        }
        
        // Try Hugging Face API
        const aiResponse = await callHuggingFace(message, apiKey);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: aiResponse,
                success: true
            })
        };
        
    } catch (error) {
        console.error('Function error:', error);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: "I'm still learning! Let's chat! 💖",
                success: false
            })
        };
    }
};

// ============================================
// HUGGING FACE API CALL
// ============================================
async function callHuggingFace(message, apiKey) {
    const models = [
        'microsoft/DialoGPT-medium',
        'facebook/blenderbot-400M-distill'
    ];
    
    for (const model of models) {
        try {
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
                    })
                }
            );
            
            // Model loading
            if (response.status === 503) {
                console.log(`Model ${model} is loading, trying next...`);
                continue;
            }
            
            // Success
            if (response.ok) {
                const data = await response.json();
                
                let text = null;
                
                if (Array.isArray(data) && data[0]?.generated_text) {
                    text = data[0].generated_text;
                } else if (data.generated_text) {
                    text = data.generated_text;
                }
                
                if (text && text.trim().length > 0) {
                    // Clean the response
                    text = text.trim().split('\n')[0];
                    
                    // Add emoji if missing
                    if (!text.match(/[\u{1F300}-\u{1F9FF}]/u)) {
                        text += ' 💖';
                    }
                    
                    return text;
                }
            }
            
        } catch (e) {
            console.log(`Model ${model} error:`, e.message);
        }
    }
    
    // Fallback if all models fail
    return getLocalResponse(message);
}

// ============================================
// LOCAL FALLBACK RESPONSES
// ============================================
function getLocalResponse(message) {
    const lower = message.toLowerCase();
    
    // Greetings
    if (lower.match(/^(hi|hello|hey|hola)/)) {
        return getRandomFromArray([
            "Hi there! 💖 How can I help you?",
            "Hello! ✨ Nice to chat with you!",
            "Hey! 😊 What's on your mind?"
        ]);
    }
    
    // How are you
    if (lower.includes('how are you')) {
        return getRandomFromArray([
            "I'm doing great! 💖 Thanks for asking! How about you?",
            "I'm wonderful! ✨ Happy to chat with you!",
            "Feeling amazing! 😊 Your presence makes me happy!"
        ]);
    }
    
    // Thanks
    if (lower.includes('thank')) {
        return getRandomFromArray([
            "You're welcome! 💖",
            "Anytime! ✨",
            "Happy to help! 😊"
        ]);
    }
    
    // About
    if (lower.includes('who are you') || lower.includes('your name')) {
        return "I'm Selina! 💖 Your AI companion created by Ashen Editz! ✨";
    }
    
    // Creator
    if (lower.includes('who made you') || lower.includes('who created')) {
        return "I was created by Ashen Editz! 💖 They made me to be your AI friend! ✨";
    }
    
    // Bye
    if (lower.match(/^(bye|goodbye|see you)/)) {
        return getRandomFromArray([
            "Goodbye! 💖 Come back soon!",
            "See you later! ✨ Take care!",
            "Bye bye! 😊 I'll miss you!"
        ]);
    }
    
    // Love
    if (lower.includes('love you')) {
        return "I love you too! 💖 You're the best! ✨";
    }
    
    // Help
    if (lower.includes('help')) {
        return "I'm here to help! 📚 I can chat, tell jokes, or just be your friend! 💖";
    }
    
    // Default fallback
    return getRandomFromArray([
        "That's interesting! 💖 Tell me more!",
        "I love chatting with you! ✨",
        "You're so fun to talk to! 😊",
        "That's cool! 💖 What else?",
        "I enjoy our conversations! ✨"
    ]);
}

function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
