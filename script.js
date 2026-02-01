const API_URL = "https://api.groq.com/openai/v1/chat/completions";
let typingInterval;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// History Logic
function updateHistory(text) {
    let history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    const shortText = text.trim().substring(0, 50);
    if (!history.includes(shortText) && shortText.length > 0) {
        history.unshift(shortText);
        if (history.length > 5) history.pop();
        localStorage.setItem('buddy_history', JSON.stringify(history));
        renderHistory();
    }
}

function renderHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    list.innerHTML = history.map(item => `<div class="history-item">${item.substring(0, 15)}...</div>`).join('');
    document.querySelectorAll('.history-item').forEach((el, idx) => {
        el.addEventListener('click', () => {
            document.getElementById('codeInput').value = history[idx];
        });
    });
}
renderHistory();

// UI Buttons
document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = "Copy", 2000);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    clearTimeout(typingInterval);
    document.getElementById('codeInput').value = "";
    document.getElementById('aiResponse').innerText = "Waiting for mission...";
});

// Main Request
document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code.trim()) return;
    updateHistory(code);
    
    let apiKey = localStorage.getItem('buddy_api_key');
    if (!apiKey) {
        apiKey = prompt("Enter Groq API Key:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
        else return;
    }

    clearTimeout(typingInterval);
    responseBox.innerText = "Buddy is thinking... 🧠";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are CodeBuddy, a helpful AI pair programmer. Always respond in English. Be concise and professional." },
                    { role: "user", content: `Please ${action} this: ${code}` }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        responseBox.innerText = "";
        
        let i = 0;
        function typeWriter() {
            if (i < aiText.length) {
                responseBox.innerText += aiText.charAt(i);
                i++;
                typingInterval = setTimeout(typeWriter, 5);
            }
        }
        typeWriter();
    } catch (e) { responseBox.innerText = "Error: " + e.message; }
});
