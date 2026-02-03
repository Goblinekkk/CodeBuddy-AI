const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PREMIUM_KEY = "Goblinekkk";
const MASTER_KEY = "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"; // Sem vlož svůj Groq API klíč

window.setTheme = function(t) {
    document.body.classList.remove('premium-gold', 'premium-emerald', 'premium-ruby', 'premium-frost', 'premium-cyber', 'premium-ocean', 'premium-hacker', 'premium-sunset');
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
    const welcomeModal = document.getElementById('welcomeModal');
    const premiumModal = document.getElementById('premiumModal');
    
    if (!localStorage.getItem('buddy_v111_seen')) welcomeModal.style.display = 'flex';

    document.getElementById('closeWelcomeBtn').onclick = () => {
        welcomeModal.style.display = 'none';
        localStorage.setItem('buddy_v111_seen', 'true');
    };

    document.getElementById('openPremiumBtnWelcome').onclick = () => {
        welcomeModal.style.display = 'none';
        premiumModal.style.display = 'flex';
        localStorage.setItem('buddy_v111_seen', 'true');
    };

    document.getElementById('mainPremiumToggle').onclick = () => premiumModal.style.display = 'flex';
    document.getElementById('closePremiumBtn').onclick = () => premiumModal.style.display = 'none';

    document.getElementById('activatePremiumBtn').onclick = () => {
        if (document.getElementById('premiumCodeInput').value === PREMIUM_KEY) {
            localStorage.setItem('buddy_premium', 'true');
            checkPremium();
            alert("👑 Anniversary Premium Activated!");
            premiumModal.style.display = 'none';
        } else alert("Invalid Code!");
    };

    document.getElementById('deactivatePremiumBtn').onclick = () => {
        localStorage.removeItem('buddy_premium');
        checkPremium();
    };

    document.getElementById('previewBtn').onclick = () => {
        const code = document.getElementById('codeInput').value;
        const win = window.open("");
        win.document.write(`<html><body style="background:#0f172a;color:white;font-family:sans-serif;padding:20px;">${code}</body></html>`);
    };

    document.getElementById('runBtn').onclick = async () => {
        const code = document.getElementById('codeInput').value;
        if (!code) return;
        
        const isP = localStorage.getItem('buddy_premium') === 'true';
        let apiKey = isP ? MASTER_KEY : localStorage.getItem('buddy_api_key');

        if (!apiKey) {
            apiKey = prompt("Free User: Enter Groq Key (or use Premium):");
            if (apiKey) localStorage.setItem('buddy_api_key', apiKey); else return;
        }

        document.getElementById('aiResponse').innerText = "Buddy v111 is thinking...";
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{role:"system", content:"You are CodeBuddy v111. Professional dev."}, {role:"user", content: code}],
                    model: "llama-3.3-70b-versatile"
                })
            });
            const data = await res.json();
            document.getElementById('aiResponse').innerText = data.choices[0].message.content;
        } catch (e) { document.getElementById('aiResponse').innerText = "Error! Check API key."; }
    };
    
    document.getElementById('clearBtn').onclick = () => document.getElementById('codeInput').value = "";
    document.getElementById('copyBtn').onclick = () => { navigator.clipboard.writeText(document.getElementById('aiResponse').innerText); alert("Copied!"); };
};
