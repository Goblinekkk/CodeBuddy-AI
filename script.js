const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PREMIUM_KEY = "Goblinekkk";
const MASTER_KEY = "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"; // <--- VLOŽ SEM SVŮJ GROQ KLÍČ

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
    
    // Načtení historie
    const historyList = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    document.getElementById('historyList').innerHTML = historyList.map(h => `<div class="history-item">${h.substring(0,12)}...</div>`).join('');

    // BUG FIX: Tlačítka v Welcome Modalu
    const welcomeModal = document.getElementById('welcomeModal');
    const premiumModal = document.getElementById('premiumModal');
    
    if (!localStorage.getItem('buddy_v16_seen')) {
        welcomeModal.style.display = 'flex';
    }

    document.getElementById('closeWelcomeBtn').onclick = () => {
        welcomeModal.style.display = 'none';
        localStorage.setItem('buddy_v16_seen', 'true');
    };

    document.getElementById('openPremiumBtnWelcome').onclick = () => {
        welcomeModal.style.display = 'none'; // Zavře úvodní okno
        premiumModal.style.display = 'flex'; // Otevře okno pro kód
        localStorage.setItem('buddy_v16_seen', 'true');
    };

    // Tlačítka v aplikaci
    document.getElementById('mainPremiumToggle').onclick = () => premiumModal.style.display = 'flex';
    document.getElementById('closePremiumBtn').onclick = () => premiumModal.style.display = 'none';

    document.getElementById('activatePremiumBtn').onclick = () => {
        if (document.getElementById('premiumCodeInput').value === PREMIUM_KEY) {
            localStorage.setItem('buddy_premium', 'true');
            checkPremium();
            alert("👑 Premium Activated! Welcome to the elite.");
            premiumModal.style.display = 'none';
        } else alert("Invalid Code!");
    };

    document.getElementById('deactivatePremiumBtn').onclick = () => {
        localStorage.removeItem('buddy_premium');
        checkPremium();
        alert("Switched to Normal version.");
    };

    document.getElementById('previewBtn').onclick = () => {
        const code = document.getElementById('codeInput').value;
        const win = window.open("");
        win.document.write(code.includes('<html>') ? code : `<html><body style="background:#0f172a;color:white;font-family:sans-serif;padding:20px;">${code}</body></html>`);
    };

    document.getElementById('runBtn').onclick = async () => {
        const code = document.getElementById('codeInput').value;
        const action = document.getElementById('actionSelect').value;
        if (!code) return;

        let apiKey;
        const isPremium = localStorage.getItem('buddy_premium') === 'true';

        if (isPremium) {
            apiKey = MASTER_KEY;
        } else {
            apiKey = localStorage.getItem('buddy_api_key');
            if (!apiKey) {
                apiKey = prompt("Free User: Enter Groq API Key (or use Premium to skip):");
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
                    messages: [{role:"system", content:"You are CodeBuddy. Professional developer."}, {role:"user", content: action + ": " + code}],
                    model: "llama-3.3-70b-versatile"
                })
            });
            const data = await res.json();
            document.getElementById('aiResponse').innerText = data.choices[0].message.content;
        } catch (e) { document.getElementById('aiResponse').innerText = "Error! Key might be wrong or empty."; }
    };

    document.getElementById('clearBtn').onclick = () => { document.getElementById('codeInput').value = ""; };
    document.getElementById('copyBtn').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
        alert("Copied!");
    };
};
