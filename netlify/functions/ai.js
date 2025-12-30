const fetch = require('node-fetch');

exports.handler = async function(event, context) {
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
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.HF_API_KEY;
        
        if (!apiKey || apiKey.length < 10) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ response: "I'm here to chat! 💖", success: true })
            };
        }
        
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
                            parameters: { max_length: 100, temperature: 0.8 }
                        })
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data[0]?.generated_text || data.generated_text;
                    if (text) {
                        return {
                            statusCode: 200,
                            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                            body: JSON.stringify({ response: text + ' 💖', success: true })
                        };
                    }
                }
            } catch (e) {
                console.log(`Model ${model} failed`);
            }
        }
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ response: "That's interesting! Tell me more! 💖", success: true })
        };
        
    } catch (error) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ response: "I'm still learning! 💖", success: false })
        };
    }
};
