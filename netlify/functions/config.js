exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            HF_API_KEY: process.env.HF_API_KEY || "",
            SUPABASE_URL: process.env.SUPABASE_URL || "",
            SUPABASE_KEY: process.env.SUPABASE_KEY || ""
        })
    };
};
