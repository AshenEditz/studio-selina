// ============================================
// SELINA AI - DATABASE MODULE
// Supabase Integration
// Created by Ashen Editz
// ============================================

let supabase = null;
let currentUser = null;
let isDbConnected = false;

// ============================================
// INITIALIZE DATABASE
// ============================================
async function initDatabase() {
    console.log('💾 Initializing database...');
    
    try {
        // Get credentials
        let url = window.ENV?.SUPABASE_URL;
        let key = window.ENV?.SUPABASE_KEY;
        
        // Try to fetch from config if not available
        if (!url || !key) {
            try {
                const config = await fetch('/.netlify/functions/config').then(r => r.json());
                url = config.SUPABASE_URL;
                key = config.SUPABASE_KEY;
                window.ENV = config;
            } catch (e) {
                console.log('Config not available, using local storage');
            }
        }
        
        // Check if credentials are valid
        if (!url || !key || url.length < 20 || key.length < 20) {
            console.log('Supabase credentials not found, using local storage');
            initLocalUser();
            return false;
        }
        
        // Check if Supabase library is loaded
        if (typeof window.supabase === 'undefined') {
            console.log('Supabase library not loaded');
            initLocalUser();
            return false;
        }
        
        // Create Supabase client
        supabase = window.supabase.createClient(url, key);
        
        // Test connection
        const { error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            console.warn('Supabase connection error:', error.message);
            initLocalUser();
            return false;
        }
        
        isDbConnected = true;
        
        // Get or create user
        await getOrCreateUser();
        
        console.log('✅ Database connected');
        return true;
        
    } catch (error) {
        console.error('Database init error:', error);
        initLocalUser();
        return false;
    }
}

// ============================================
// LOCAL USER (FALLBACK)
// ============================================
function initLocalUser() {
    let id = localStorage.getItem('selina_user_id');
    
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
        localStorage.setItem('selina_user_id', id);
    }
    
    currentUser = {
        id: id,
        user_id: id,
        name: localStorage.getItem('selina_user_name') || 'Friend',
        created_at: localStorage.getItem('selina_created') || new Date().toISOString(),
        friendship_level: parseInt(localStorage.getItem('selina_friendship') || '0'),
        local: true
    };
    
    if (!localStorage.getItem('selina_created')) {
        localStorage.setItem('selina_created', currentUser.created_at);
    }
    
    console.log('📱 Using local user:', currentUser.user_id);
}

// ============================================
// GET OR CREATE USER (SUPABASE)
// ============================================
async function getOrCreateUser() {
    if (!supabase) {
        initLocalUser();
        return;
    }
    
    let userId = localStorage.getItem('selina_user_id');
    
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
        localStorage.setItem('selina_user_id', userId);
    }
    
    try {
        // Check if user exists
        const { data: existing, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (existing && !fetchError) {
            currentUser = existing;
            
            // Update last active
            await supabase
                .from('users')
                .update({ last_active: new Date().toISOString() })
                .eq('user_id', userId);
        } else {
            // Create new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                    user_id: userId,
                    name: 'Friend',
                    created_at: new Date().toISOString(),
                    last_active: new Date().toISOString(),
                    friendship_level: 0
                }])
                .select()
                .single();
            
            if (!insertError && newUser) {
                currentUser = newUser;
            } else {
                initLocalUser();
            }
        }
    } catch (error) {
        console.error('User fetch error:', error);
        initLocalUser();
    }
}

// ============================================
// STORE CONVERSATION
// ============================================
async function storeConversation(userMessage, aiResponse) {
    const userId = currentUser?.user_id || currentUser?.id;
    
    // Always store locally
    const localHistory = JSON.parse(localStorage.getItem('selina_chat_history') || '[]');
    localHistory.push({
        user_message: userMessage,
        ai_response: aiResponse,
        timestamp: new Date().toISOString()
    });
    
    // Keep last 100 messages
    if (localHistory.length > 100) {
        localHistory.shift();
    }
    
    localStorage.setItem('selina_chat_history', JSON.stringify(localHistory));
    
    // Store in Supabase if connected
    if (supabase && isDbConnected && userId) {
        try {
            await supabase.from('conversations').insert([{
                user_id: userId,
                user_message: userMessage,
                ai_response: aiResponse,
                created_at: new Date().toISOString()
            }]);
        } catch (e) {
            console.warn('Could not store conversation:', e.message);
        }
    }
}

// ============================================
// UPDATE FRIENDSHIP LEVEL
// ============================================
async function updateFriendship(amount) {
    if (!currentUser) return;
    
    const newLevel = Math.min(100, Math.max(0, (currentUser.friendship_level || 0) + amount));
    currentUser.friendship_level = newLevel;
    
    // Store locally
    localStorage.setItem('selina_friendship', newLevel.toString());
    
    // Update in Supabase
    if (supabase && isDbConnected) {
        try {
            await supabase
                .from('users')
                .update({ friendship_level: newLevel })
                .eq('user_id', currentUser.user_id || currentUser.id);
        } catch (e) {
            console.warn('Could not update friendship:', e.message);
        }
    }
    
    return newLevel;
}

// ============================================
// GET CONVERSATION HISTORY
// ============================================
async function getConversationHistory(limit = 20) {
    const userId = currentUser?.user_id || currentUser?.id;
    
    // Try Supabase first
    if (supabase && isDbConnected && userId) {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (!error && data) {
                return data.reverse();
            }
        } catch (e) {
            console.warn('Could not fetch history:', e.message);
        }
    }
    
    // Fallback to local
    const localHistory = JSON.parse(localStorage.getItem('selina_chat_history') || '[]');
    return localHistory.slice(-limit);
}

// ============================================
// GET USER STATS
// ============================================
async function getUserStats() {
    const history = await getConversationHistory(1000);
    
    return {
        totalChats: history.length,
        friendshipLevel: currentUser?.friendship_level || 0,
        memberSince: currentUser?.created_at || localStorage.getItem('selina_created'),
        isConnected: isDbConnected
    };
}

// ============================================
// SET USER NAME
// ============================================
async function setUserName(name) {
    if (!name || name.trim().length === 0) return;
    
    name = name.trim();
    
    if (currentUser) {
        currentUser.name = name;
    }
    
    localStorage.setItem('selina_user_name', name);
    
    if (supabase && isDbConnected) {
        try {
            await supabase
                .from('users')
                .update({ name: name })
                .eq('user_id', currentUser.user_id || currentUser.id);
        } catch (e) {
            console.warn('Could not update name:', e.message);
        }
    }
}

// Export functions
window.initDatabase = initDatabase;
window.storeConversation = storeConversation;
window.updateFriendship = updateFriendship;
window.getConversationHistory = getConversationHistory;
window.getUserStats = getUserStats;
window.setUserName = setUserName;
window.getCurrentUser = () => currentUser;

console.log('✅ Database module loaded');