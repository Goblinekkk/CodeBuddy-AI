// --- Kill Switch for legacy versions ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for(let r of registrations) r.unregister();
    });
}
caches.keys().then(names => {
    for (let n of names) caches.delete(n);
});

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
let typingInterval;

function renderHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    list.innerHTML = history.map(item => `<div class="history-item">${item.substring(0, 15)}...</div>`).join('');
    document.querySelectorAll('.history-item').forEach((el, idx) => {
        el.addEventListener('click', () => document.getElementById('codeInput').value = history[idx]);
    });
}

function updateHistory(text) {
    let history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    if (!history.includes(text) && text.trim().length > 0) {
        history.unshift(text);
        if (history.length > 5) history.pop();
        localStorage.setItem('buddy_history', JSON.stringify(history));
        renderHistory();
    }
}

document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = "Copy", 2000);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = "";
    document.getElementById('aiResponse').innerText = "Waiting for mission...";
});

document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code.trim()) return;
    updateHistory(code);

    let apiKey = localStorage.getItem('buddy_api_key');
    if (!apiKey) {
        apiKey = prompt("Please enter your Groq API key:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
        else return;
    }

    responseBox.innerText = "Buddy is thinking... 🧠";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are CodeBuddy, a helpful AI pair programmer. Be concise, professional, and provide accurate code." },
                    { role: "user", content: `Please ${action} this: ${code}` }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        responseBox.innerText = "";
        let i = 0;
        function type() {
            if (i < aiText.length) {
                responseBox.innerText += aiText.charAt(i);
                i++;
                setTimeout(type, 5);
            }
        }
        type();

    } catch (e) {
        responseBox.innerText = "Error: " + e.message;
    }
});

renderHistory();
