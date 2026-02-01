const API_URL = "https://api.groq.com/openai/v1/chat/completions";

function renderHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    list.innerHTML = history.map(item => `<div class="history-item">${item.substring(0, 15)}...</div>`).join('');
    document.querySelectorAll('.history-item').forEach((el, idx) => {
        el.addEventListener('click', () => document.getElementById('codeInput').value = history[idx]);
    });
}

// Tlačítko pro smazání historie
document.getElementById('deleteHistoryBtn').addEventListener('click', () => {
    if(confirm("Delete all missions?")) {
        localStorage.removeItem('buddy_history');
        renderHistory();
    }
});

function formatAiResponse(text) {
    // Najde bloky kódu (```kód```) a zabalí je do details/summary
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    return text.replace(codeBlockRegex, (match, code) => {
        // Zkusíme odhadnout název souboru nebo použijeme 'Code Block'
        return `<details>
            <summary>Code View</summary>
            <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </details>`;
    });
}

document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code.trim()) return;

    // Update historie
    let history = JSON.parse(localStorage.getItem('buddy_history') || '[]');
    if (!history.includes(code)) {
        history.unshift(code);
        if (history.length > 5) history.pop();
        localStorage.setItem('buddy_history', JSON.stringify(history));
        renderHistory();
    }

    let apiKey = localStorage.getItem('buddy_api_key');
    if (!apiKey) {
        apiKey = prompt("Groq API Key:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
        else return;
    }

    responseBox.innerHTML = "Thinking... 🧠";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are CodeBuddy. If you provide code, wrap it in markdown code blocks. Always mention the filename if possible." },
                    { role: "user", content: `Please ${action} this: ${code}` }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        // Zobrazení s formátováním (zabalení kódu)
        responseBox.innerHTML = formatAiResponse(aiText);

    } catch (e) {
        responseBox.innerText = "Error: " + e.message;
    }
});

document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('aiResponse').innerText);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = "Copy", 2000);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = "";
    document.getElementById('aiResponse').innerHTML = "Waiting for mission...";
});

renderHistory();
