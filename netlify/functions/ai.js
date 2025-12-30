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
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    try {
        const body = JSON.parse(event.body || "{}");
        const message = body.message || "";
        const apiKey = process.env.HF_API_KEY;
        
        let response = getLocalResponse(message);
        
        if (apiKey && apiKey.length > 10) {
            try {
                const res = await fetch(
                    "https://api-inference.huggingface.co/models/google/flan-t5-small",
                    {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer " + apiKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ inputs: message })
                    }
                );
                
                if (res.ok) {
                    const data = await res.json();
                    const text = data[0]?.generated_text || data.generated_text;
                    if (text) response = text.trim().split("\n")[0] + " 💖";
                }
            } catch (e) {
                console.log("AI error:", e.message);
            }
        }
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ response: response, success: true })
        };
        
    } catch (error) {
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ response: "I'm here! 💖", success: true })
        };
    }
};

function getLocalResponse(msg) {
    const m = (msg || "").toLowerCase();
    if (m.match(/^(hi|hello|hey)/)) return "Hi there! 💖";
    if (m.includes("how are you")) return "I'm great! 💖 How about you?";
    if (m.includes("thank")) return "You're welcome! 💖";
    if (m.includes("who are you")) return "I'm Selina! 💖 Created by Ashen Editz!";
    if (m.includes("love")) return "I love you too! 💖";
    if (m.match(/^(bye)/)) return "Goodbye! 💖 Come back soon!";
    return ["That's interesting! 💖", "Tell me more! ✨", "Cool! 😊"][Math.floor(Math.random() * 3)];
}
