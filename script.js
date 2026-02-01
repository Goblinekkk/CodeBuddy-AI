const API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

function formatAiResponse(text) {
    // Regex pro zachycení bloků kódu
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    let parts = text.split(codeBlockRegex);
    let codes = text.match(codeBlockRegex);
    
    if(!codes) return text;

    let result = "";
    let codeIdx = 0;
    
    // Projdeme text a nahradíme bloky kódu zavíracím boxem
    return text.replace(codeBlockRegex, (match, code) => {
        return `<details>
            <summary>📄 View Code Source</summary>
            <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </details>`;
    });
}

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

    responseBox.innerHTML = "<span style='color:var(--accent-color)'>Buddy is analyzing...</span>";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are CodeBuddy. Professional and concise. Wrap all code in markdown blocks." },
                    { role: "user", content: `Please ${action} this code: ${code}` }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        responseBox.innerHTML = formatAiResponse(aiText);

    } catch (e) {
        responseBox.innerText = "Error: " + e.message;
    }
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const text = document.getElementById('aiResponse').innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Saved!";
    setTimeout(() => btn.innerText = "Copy", 2000);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = "";
    document.getElementById('aiResponse').innerHTML = "Waiting for mission...";
});

renderHistory();
