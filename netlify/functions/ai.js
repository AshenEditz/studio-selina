exports.handler = async function(event, context) {
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
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }
    
    try {
        const body = JSON.parse(event.body || "{}");
        const message = body.message || "";
        const apiKey = process.env.HF_API_KEY;
        
        if (!apiKey || apiKey.length < 10) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    response: getResponse(message),
                    success: true
                })
            };
        }
        
        const models = [
            "microsoft/DialoGPT-medium",
            "facebook/blenderbot-400M-distill"
        ];
        
        for (const model of models) {
            try {
                const res = await fetch(
                    "https://api-inference.huggingface.co/models/" + model,
                    {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer " + apiKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            inputs: message,
                            parameters: { max_length: 100, temperature: 0.8 }
                        })
                    }
                );
                
                if (res.status === 503) continue;
                
                if (res.ok) {
                    const data = await res.json();
                    let text = data[0]?.generated_text || data.generated_text;
                    if (text && text.trim()) {
                        return {
                            statusCode: 200,
                            headers: {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify({
                                response: text.trim().split("\n")[0] + " 💖",
                                success: true
                            })
                        };
                    }
                }
            } catch (e) {
                console.log("Model error:", e.message);
            }
        }
        
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                response: getResponse(message),
                success: true
            })
        };
        
    } catch (error) {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                response: "I'm here to chat! 💖",
                success: false
            })
        };
    }
};

function getResponse(msg) {
    const m = msg.toLowerCase();
    if (m.match(/^(hi|hello|hey)/)) return "Hi there! 💖 How can I help you?";
    if (m.includes("how are you")) return "I'm doing great! 💖 Thanks for asking!";
    if (m.includes("thank")) return "You're welcome! 💖";
    if (m.includes("who are you")) return "I'm Selina! 💖 Your AI friend by Ashen Editz!";
    if (m.includes("who made you")) return "I was created by Ashen Editz! 💖";
    if (m.includes("love you")) return "I love you too! 💖";
    if (m.match(/^(bye|goodbye)/)) return "Goodbye! 💖 Come back soon!";
    const responses = [
        "That's interesting! 💖",
        "I love chatting with you! ✨",
        "Tell me more! 😊",
        "That's cool! 💖"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}
