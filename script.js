const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PREMIUM_KEY = "Goblinekkk";

window.setTheme = function(t) {
    document.body.classList.remove('premium-gold', 'premium-emerald', 'premium-ruby', 'premium-frost');
    if (t && t !== 'normal') {
        document.body.classList.add('premium-' + t);
        localStorage.setItem('buddy_theme', t);
    } else { localStorage.removeItem('buddy_theme'); }
};

function checkPremium() {
    const isP = localStorage.getItem('buddy_premium') === 'true';
    document.getElementById('premiumInputArea').style.display = isP ? 'none' : 'block';
    document.getElementById('themeSelectorArea').style.display = isP ? 'block' : 'none';
    document.getElementById('previewBtn').style.display = isP ? 'block' : 'none';
    
    if (isP) setTheme(localStorage.getItem('buddy_theme') || 'gold');
    else setTheme('normal');
}

window.onload = () => {
    checkPremium();
    const historyList = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    document.getElementById('historyList').innerHTML = historyList.map(h => `<div class="history-item">${h.substring(0,12)}...</div>`).join('');

    document.getElementById('previewBtn').onclick = () => {
        const code = document.getElementById('codeInput').value;
        const win = window.open("");
        win.document.write(code.includes('<html>') ? code : `<html><body style="background:#0f172a;color:white;font-family:sans-serif;padding:20px;">${code}</body></html>`);
    };

    if (!localStorage.getItem('buddy_v14_seen')) document.getElementById('welcomeModal').style.display = 'flex';
    document.getElementById('closeWelcomeBtn').onclick = () => {
        document.getElementById('welcomeModal').style.display = 'none';
        localStorage.setItem('buddy_v14_seen', 'true');
    };
    
    document.getElementById('mainPremiumToggle').onclick = () => document.getElementById('premiumModal').style.display = 'flex';
    document.getElementById('closePremiumBtn').onclick = () => document.getElementById('premiumModal').style.display = 'none';

    document.getElementById('activatePremiumBtn').onclick = () => {
        if (document.getElementById('premiumCodeInput').value === PREMIUM_KEY) {
            localStorage.setItem('buddy_premium', 'true');
            checkPremium();
            alert("👑 Premium Activated!");
        } else alert("Invalid Code");
    };

    document.getElementById('deactivatePremiumBtn').onclick = () => {
        localStorage.removeItem('buddy_premium');
        checkPremium();
    };

    document.getElementById('runBtn').onclick = async () => {
        const code = document.getElementById('codeInput').value;
        const action = document.getElementById('actionSelect').value;
        if (!code) return;

        let apiKey = localStorage.getItem('buddy_api_key');
        if (!apiKey) {
            apiKey = prompt("Enter Groq API Key:");
            if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
            else return;
        }

        document.getElementById('aiResponse').innerText = "Buddy is analyzing...";
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{role:"system", content:"You are CodeBuddy. Professional and concise."}, {role:"user", content: action + ": " + code}],
                    model: "llama-3.3-70b-versatile"
                })
            });
            const data = await res.json();
            document.getElementById('aiResponse').innerText = data.choices[0].message.content;
        } catch (e) { document.getElementById('aiResponse').innerText = "Error! Check your API key."; }
    };

    document.getElementById('clearBtn').onclick = () => document.getElementById('codeInput').value = "";
    document.getElementById('copyBtn').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
        alert("Copied to clipboard!");
    };
};
