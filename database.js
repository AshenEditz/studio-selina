// Database Module
let currentUser = null;

async function initDatabase() {
    console.log("💾 Init database...");
    
    let id = localStorage.getItem("selina_user_id");
    if (!id) {
        id = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
        localStorage.setItem("selina_user_id", id);
    }
    
    currentUser = {
        id: id,
        name: localStorage.getItem("selina_name") || "Friend",
        friendship: parseInt(localStorage.getItem("selina_friendship") || "0")
    };
    
    console.log("✅ Database ready");
    return true;
}

function saveChat(userMsg, aiMsg) {
    const history = JSON.parse(localStorage.getItem("selina_history") || "[]");
    history.push({ user: userMsg, ai: aiMsg, time: Date.now() });
    if (history.length > 100) history.shift();
    localStorage.setItem("selina_history", JSON.stringify(history));
}

function addFriendship(amt) {
    if (!currentUser) return;
    currentUser.friendship = Math.min(100, currentUser.friendship + amt);
    localStorage.setItem("selina_friendship", currentUser.friendship.toString());
}

window.initDatabase = initDatabase;
window.saveChat = saveChat;
window.addFriendship = addFriendship;

console.log("✅ Database loaded");
