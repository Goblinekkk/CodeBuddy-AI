const API_URL = "https://api.groq.com/openai/v1/chat/completions";
let typingInterval;

// History Logic
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

// UI Actions
document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
    alert("Zkopírováno!");
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = "";
    document.getElementById('aiResponse').innerText = "Čekám na instrukce...";
});

// AI Request
document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code.trim()) return;
    updateHistory(code);

    let apiKey = localStorage.getItem('buddy_api_key');
    if (!apiKey) {
        apiKey = prompt("Vlož svůj Groq API klíč:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
        else return;
    }

    responseBox.innerText = "Buddy přemýšlí... 🧠";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Jsi CodeBuddy, užitečný AI programátor. Odpovídej v češtině, stručně a technicky správně." },
                    { role: "user", content: `Proveď akci ${action} na tomto kódu: ${code}` }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        // Typewriter effect
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
        responseBox.innerText = "Chyba: " + e.message;
    }
});

renderHistory();
