exports.handler = async function(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            HF_API_KEY: process.env.HF_API_KEY || '',
            SUPABASE_URL: process.env.SUPABASE_URL || '',
            SUPABASE_KEY: process.env.SUPABASE_KEY || ''
        })
    };
};
