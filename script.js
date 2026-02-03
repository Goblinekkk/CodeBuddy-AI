const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PREMIUM_KEY = "Goblinekkk";

// Theme Engine
window.setTheme = function(themeName) {
    document.body.classList.remove('premium-gold', 'premium-emerald', 'premium-ruby', 'premium-frost');
    if (themeName && themeName !== 'normal') {
        document.body.classList.add('premium-' + themeName);
        localStorage.setItem('buddy_theme', themeName);
    } else {
        localStorage.removeItem('buddy_theme');
    }
}

function checkPremium() {
    const isPremium = localStorage.getItem('buddy_premium') === 'true';
    const inputArea = document.getElementById('premiumInputArea');
    const themeArea = document.getElementById('themeSelectorArea');
    const title = document.getElementById('premiumTitle');

    if (isPremium) {
        inputArea.style.display = 'none';
        themeArea.style.display = 'block';
        title.innerText = "Premium Active 👑";
        setTheme(localStorage.getItem('buddy_theme') || 'gold');
    } else {
        setTheme('normal');
        inputArea.style.display = 'block';
        themeArea.style.display = 'none';
        title.innerText = "Unlock Premium 👑";
    }
}

// History
function renderHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    list.innerHTML = history.map(item => `<div class="history-item">${item.substring(0, 15)}...</div>`).join('');
    document.querySelectorAll('.history-item').forEach((el, i) => el.onclick = () => document.getElementById('codeInput').value = history[i]);
}

// Download
window.downloadCode = function(filename, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
};

function formatResponse(text) {
    const regex = /```(\w+)?(?::(.+?))?\n([\s\S]*?)```/g;
    return text.replace(regex, (m, lang, file, code) => {
        const name = file || 'code.txt';
        return `<details><summary>📄 ${name} <button class="download-btn" onclick="downloadCode('${name}', \`${code.replace(/`/g, '\\`')}\`)">Download</button></summary><pre><code>${code}</code></pre></details>`;
    });
}

// Initialize
window.onload = () => {
    checkPremium();
    renderHistory();
    
    if (!localStorage.getItem('buddy_welcome_seen')) document.getElementById('welcomeModal').style.display = 'flex';

    document.getElementById('closeWelcomeBtn').onclick = () => {
        document.getElementById('welcomeModal').style.display = 'none';
        localStorage.setItem('buddy_welcome_seen', 'true');
    };

    document.getElementById('openPremiumBtnWelcome').onclick = () => {
        document.getElementById('welcomeModal').style.display = 'none';
        document.getElementById('premiumModal').style.display = 'flex';
    };

    document.getElementById('mainPremiumToggle').onclick = () => document.getElementById('premiumModal').style.display = 'flex';
    document.getElementById('closePremiumBtn').onclick = () => document.getElementById('premiumModal').style.display = 'none';

    document.getElementById('activatePremiumBtn').onclick = () => {
        if (document.getElementById('premiumCodeInput').value === PREMIUM_KEY) {
            localStorage.setItem('buddy_premium', 'true');
            checkPremium();
        } else alert("Invalid code!");
    };

    document.getElementById('deactivatePremiumBtn').onclick = () => {
        localStorage.removeItem('buddy_premium');
        checkPremium();
    };

    document.getElementById('runBtn').onclick = async () => {
        const code = document.getElementById('codeInput').value;
        const action = document.getElementById('actionSelect').value;
        if (!code) return;

        let history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
        if (!history.includes(code)) { history.unshift(code); history = history.slice(0, 5); localStorage.setItem('buddy_history', JSON.stringify(history)); renderHistory(); }

        const apiKey = localStorage.getItem('buddy_api_key') || prompt("Enter Groq API Key:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey);

        document.getElementById('aiResponse').innerText = "Analyzing...";
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [{role:"system", content:"Concise dev. Use ```lang:file format."}, {role:"user", content: action + ": " + code}], model: "llama-3.3-70b-versatile" })
            });
            const data = await res.json();
            document.getElementById('aiResponse').innerHTML = formatResponse(data.choices[0].message.content);
        } catch (e) { document.getElementById('aiResponse').innerText = "Error!"; }
    };
    
    document.getElementById('clearBtn').onclick = () => { document.getElementById('codeInput').value = ""; document.getElementById('aiResponse').innerText = "Waiting..."; };
    document.getElementById('copyBtn').onclick = () => navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
};
