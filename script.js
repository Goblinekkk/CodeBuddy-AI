const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PREMIUM_KEY = "Goblinekkk";

// Theme Engine
window.setTheme = function(t) {
    document.body.classList.remove('premium-gold', 'premium-emerald', 'premium-ruby', 'premium-frost');
    if (t && t !== 'normal') {
        document.body.classList.add('premium-' + t);
        localStorage.setItem('buddy_theme', t);
    } else { localStorage.removeItem('buddy_theme'); }
};

// Premium Features Logic
function checkPremium() {
    const isP = localStorage.getItem('buddy_premium') === 'true';
    document.getElementById('premiumInputArea').style.display = isP ? 'none' : 'block';
    document.getElementById('themeSelectorArea').style.display = isP ? 'block' : 'none';
    document.getElementById('voiceBtn').style.display = isP ? 'block' : 'none';
    document.getElementById('previewBtn').style.display = isP ? 'block' : 'none';
    
    if (isP) setTheme(localStorage.getItem('buddy_theme') || 'gold');
    else setTheme('normal');
}

// Voice Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US'; 
recognition.onresult = (e) => {
    document.getElementById('codeInput').value += e.results[0][0].transcript;
    document.getElementById('voiceBtn').style.filter = "none";
};

// Main Logic
window.onload = () => {
    checkPremium();
    const historyList = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    document.getElementById('historyList').innerHTML = historyList.map(h => `<div class="history-item">${h.substring(0,10)}...</div>`).join('');

    // Voice Toggle
    document.getElementById('voiceBtn').onclick = () => {
        document.getElementById('voiceBtn').style.filter = "drop-shadow(0 0 5px #fbbf24)";
        recognition.start();
    };

    // Live Preview
    document.getElementById('previewBtn').onclick = () => {
        const code = document.getElementById('codeInput').value;
        const win = window.open("");
        win.document.write(code.includes('<html>') ? code : `<html><body style="background:#1a1a1a;color:white;font-family:sans-serif;padding:20px;">${code}</body></html>`);
    };

    // Modals
    if (!localStorage.getItem('buddy_v13_seen')) document.getElementById('welcomeModal').style.display = 'flex';
    document.getElementById('closeWelcomeBtn').onclick = () => {
        document.getElementById('welcomeModal').style.display = 'none';
        localStorage.setItem('buddy_v13_seen', 'true');
    };
    document.getElementById('mainPremiumToggle').onclick = () => document.getElementById('premiumModal').style.display = 'flex';
    document.getElementById('closePremiumBtn').onclick = () => document.getElementById('premiumModal').style.display = 'none';

    // Activate Premium
    document.getElementById('activatePremiumBtn').onclick = () => {
        if (document.getElementById('premiumCodeInput').value === PREMIUM_KEY) {
            localStorage.setItem('buddy_premium', 'true');
            checkPremium();
            alert("👑 Welcome to Premium!");
        } else alert("Invalid Code");
    };

    document.getElementById('deactivatePremiumBtn').onclick = () => {
        localStorage.removeItem('buddy_premium');
        checkPremium();
    };

    // Run AI
    document.getElementById('runBtn').onclick = async () => {
        const code = document.getElementById('codeInput').value;
        const action = document.getElementById('actionSelect').value;
        if (!code) return;

        const apiKey = localStorage.getItem('buddy_api_key') || prompt("Enter Groq API Key:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey);

        document.getElementById('aiResponse').innerText = "Buddy is thinking...";
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{role:"system", content:"You are CodeBuddy. Concise."}, {role:"user", content: action + ": " + code}],
                    model: "llama-3.3-70b-versatile"
                })
            });
            const data = await res.json();
            document.getElementById('aiResponse').innerText = data.choices[0].message.content;
        } catch (e) { document.getElementById('aiResponse').innerText = "API Error. Check Key."; }
    };

    document.getElementById('clearBtn').onclick = () => document.getElementById('codeInput').value = "";
    document.getElementById('copyBtn').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
        alert("Copied!");
    };
};
