const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PREMIUM_KEY = "Goblinekkk";

// History Logic
function renderHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    list.innerHTML = history.length ? history.map(item => 
        `<div class="history-item">${item.substring(0, 12)}...</div>`
    ).join('') : '<small style="color:#475569">No missions yet</small>';
    
    document.querySelectorAll('.history-item').forEach((el, idx) => {
        el.addEventListener('click', () => document.getElementById('codeInput').value = history[idx]);
    });
}

document.getElementById('deleteHistoryBtn').addEventListener('click', () => {
    if(confirm("Clear all recent missions?")) {
        localStorage.removeItem('buddy_history');
        renderHistory();
    }
});

// Download Function
function downloadCode(filename, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
}

// AI Response Formatting
function formatAiResponse(text) {
    const codeBlockRegex = /```(\w+)?(?::(.+?))?\n([\s\S]*?)```/g;
    if (!text.match(codeBlockRegex)) return text;

    return text.replace(codeBlockRegex, (match, lang, filename, code) => {
        const displayFile = filename || (lang ? `source.${lang}` : 'code-snippet.txt');
        const escapedCode = code.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        
        return `<details>
            <summary>
                <span>📄 ${displayFile}</span>
                <button class="download-btn" onclick="downloadCode('${displayFile}', \`${escapedCode}\`)">Download</button>
            </summary>
            <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </details>`;
    });
}

// Premium & Modal Logic
function checkPremium() {
    if (localStorage.getItem('buddy_premium') === 'true') {
        document.body.classList.add('premium-mode');
    }
}

window.addEventListener('load', () => {
    checkPremium();
    const welcomeModal = document.getElementById('welcomeModal');
    const premiumModal = document.getElementById('premiumModal');

    if (!localStorage.getItem('buddy_welcome_seen')) {
        welcomeModal.style.display = 'flex';
    }

    document.getElementById('closeWelcomeBtn').addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        localStorage.setItem('buddy_welcome_seen', 'true');
    });

    document.getElementById('openPremiumBtn').addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        premiumModal.style.display = 'flex';
    });

    document.getElementById('closePremiumBtn').addEventListener('click', () => {
        premiumModal.style.display = 'none';
        localStorage.setItem('buddy_welcome_seen', 'true');
    });

    document.getElementById('activatePremiumBtn').addEventListener('click', () => {
        const input = document.getElementById('premiumCodeInput').value;
        if (input === PREMIUM_KEY) {
            alert("👑 Premium Activated!");
            localStorage.setItem('buddy_premium', 'true');
            localStorage.setItem('buddy_welcome_seen', 'true');
            premiumModal.style.display = 'none';
            checkPremium();
        } else {
            alert("❌ Invalid code.");
        }
    });
});

// Run Mission
document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code.trim()) return;

    let history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    if (!history.includes(code)) {
        history.unshift(code);
        if (history.length > 6) history.pop();
        localStorage.setItem('buddy_history', JSON.stringify(history));
        renderHistory();
    }

    let apiKey = localStorage.getItem('buddy_api_key');
    if (!apiKey) {
        apiKey = prompt("Enter Groq API Key:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
        else return;
    }

    responseBox.innerHTML = "<span>Buddy is analyzing...</span>";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are CodeBuddy. concise. Use format ```language:filename for code." },
                    { role: "user", content: `Please ${action} this code: ${code}` }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        responseBox.innerHTML = formatAiResponse(data.choices[0].message.content);
        responseBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
        responseBox.innerText = "Error: " + e.message;
    }
});

// Utilities
document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Saved!";
    setTimeout(() => btn.innerText = "Copy", 2000);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = "";
    document.getElementById('aiResponse').innerHTML = "Waiting for mission...";
});

renderHistory();
