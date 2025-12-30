exports.handler = async function(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: ""
        };
    }
    
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    try {
        const body = JSON.parse(event.body || "{}");
        const message = body.message || "";
        const apiKey = process.env.HF_API_KEY;
        
        console.log("📩 Received message:", message);
        console.log("🔑 API Key exists:", apiKey ? "Yes" : "No");
        
        // Default local response
        let response = getLocalResponse(message);
        
        // Try Hugging Face API if key exists
        if (apiKey && apiKey.length > 10) {
            try {
                console.log("🤖 Calling Hugging Face API...");
                
                // Use Microsoft's DialoGPT for better conversation
                const hfResponse = await fetch(
                    "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            inputs: message,
                            parameters: {
                                max_length: 100,
                                temperature: 0.8,
                                top_p: 0.9,
                                do_sample: true
                            }
                        })
                    }
                );
                
                console.log("📡 HF Response status:", hfResponse.status);
                
                if (hfResponse.status === 503) {
                    console.log("⏳ Model is loading, using local response");
                    // Model is loading, use local response
                    return {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        },
                        body: JSON.stringify({
                            response: response + " (Model loading...)",
                            success: true,
                            source: "local"
                        })
                    };
                }
                
                if (!hfResponse.ok) {
                    const errorText = await hfResponse.text();
                    console.error("❌ HF API Error:", errorText);
                    throw new Error(`HF API returned ${hfResponse.status}: ${errorText}`);
                }
                
                const data = await hfResponse.json();
                console.log("✅ HF Response data:", JSON.stringify(data));
                
                // Parse HF response - it can be in different formats
                let aiText = "";
                
                if (Array.isArray(data)) {
                    // Format: [{ generated_text: "..." }]
                    aiText = data[0]?.generated_text || data[0]?.text || "";
                } else if (data.generated_text) {
                    // Format: { generated_text: "..." }
                    aiText = data.generated_text;
                } else if (typeof data === 'string') {
                    // Format: "text"
                    aiText = data;
                }
                
                // Clean up the response
                if (aiText) {
                    // Remove the input prompt if it's echoed back
                    aiText = aiText.replace(message, "").trim();
                    
                    // Take only the first response if multiple
                    const lines = aiText.split('\n');
                    aiText = lines[0] || aiText;
                    
                    // Limit length
                    if (aiText.length > 150) {
                        aiText = aiText.substring(0, 150) + "...";
                    }
                    
                    // Add emoji
                    if (aiText && !aiText.match(/[\u{1F300}-\u{1F9FF}]/u)) {
                        aiText += " 💖";
                    }
                    
                    response = aiText;
                    console.log("✅ Final AI response:", response);
                } else {
                    console.log("⚠️ Empty AI response, using local");
                }
                
            } catch (hfError) {
                console.error("❌ Hugging Face error:", hfError.message);
                // Continue with local response
            }
        } else {
            console.log("⚠️ No API key, using local response");
        }
        
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                response: response,
                success: true,
                source: apiKey && response !== getLocalResponse(message) ? "huggingface" : "local"
            })
        };
        
    } catch (error) {
        console.error("❌ Handler error:", error);
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                response: "I'm here! 💖",
                success: true,
                source: "fallback",
                error: error.message
            })
        };
    }
};

function getLocalResponse(msg) {
    const m = (msg || "").toLowerCase();
    
    // Greetings
    if (m.match(/^(hi|hello|hey)/)) {
        return ["Hi there! 💖", "Hello! ✨", "Hey! 😊"][Math.floor(Math.random() * 3)];
    }
    
    // How are you
    if (m.includes("how are you") || m.includes("how r u")) {
        return "I'm great! 💖 How about you?";
    }
    
    // Thanks
    if (m.includes("thank")) {
        return "You're welcome! 💖";
    }
    
    // Who are you
    if (m.includes("who are you") || m.includes("your name")) {
        return "I'm Selina! 💖 Created by Ashen Editz!";
    }
    
    // Creator
    if (m.includes("who made") || m.includes("who created") || m.includes("creator")) {
        return "Ashen Editz created me! 💖";
    }
    
    // Love
    if (m.includes("love you") || m.includes("love u")) {
        return "I love you too! 💖";
    }
    
    // Goodbye
    if (m.match(/^(bye|goodbye|see you)/)) {
        return "Goodbye! 💖 Come back soon!";
    }
    
    // Joke
    if (m.includes("joke") || m.includes("funny")) {
        const jokes = [
            "Why don't scientists trust atoms? They make up everything! 😄💖",
            "What do you call a fake noodle? An impasta! 🍝✨",
            "Why was the math book sad? It had too many problems! 📚😊"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Help
    if (m.includes("help")) {
        return "I can chat, tell jokes, and be your friend! 💖 What would you like?";
    }
    
    // Default responses
    const defaults = [
        "That's interesting! 💖",
        "Tell me more! ✨",
        "I love chatting with you! 😊",
        "Cool! 💖",
        "Go on! ✨",
        "I'm listening! 💕"
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
}
