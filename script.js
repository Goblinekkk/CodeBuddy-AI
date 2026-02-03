const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PREMIUM_KEY = "Goblinekkk";
const MASTER_KEY = "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"; // Vlož svůj klíč mezi uvozovky

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

    if (!localStorage.getItem('buddy_v15_seen')) document.getElementById('welcomeModal').style.display = 'flex';
    document.getElementById('closeWelcomeBtn').onclick = () => {
        document.getElementById('welcomeModal').style.display = 'none';
        localStorage.setItem('buddy_v15_seen', 'true');
    };
    
    document.getElementById('mainPremiumToggle').onclick = () => document.getElementById('premiumModal').style.display = 'flex';
    document.getElementById('closePremiumBtn').onclick = () => document.getElementById('premiumModal').style.display = 'none';

    document.getElementById('activatePremiumBtn').onclick = () => {
        if (document.getElementById('premiumCodeInput').value === PREMIUM_KEY) {
            localStorage.setItem('buddy_premium', 'true');
            checkPremium();
            alert("👑 Premium Activated! No more API prompts.");
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

        let apiKey;
        const isPremium = localStorage.getItem('buddy_premium') === 'true';

        // LOGIKA KLÍČE: Premium má tvůj klíč, Normal se ptá
        if (isPremium) {
            apiKey = MASTER_KEY;
        } else {
            apiKey = localStorage.getItem('buddy_api_key');
            if (!apiKey) {
                apiKey = prompt("Free Version: Please enter your Groq API Key (or go Premium to skip this):");
                if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
                else return;
            }
        }

        document.getElementById('aiResponse').innerText = "Buddy is analyzing...";
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{role:"system", content:"You are CodeBuddy. Concise and helpful."}, {role:"user", content: action + ": " + code}],
                    model: "llama-3.3-70b-versatile"
                })
            });
            const data = await res.json();
            document.getElementById('aiResponse').innerText = data.choices[0].message.content;
        } catch (e) { document.getElementById('aiResponse').innerText = "Error! Key might be invalid."; }
    };

    document.getElementById('clearBtn').onclick = () => document.getElementById('codeInput').value = "";
    document.getElementById('copyBtn').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
        alert("Copied!");
    };
};
