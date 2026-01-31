const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Kopírování
document.getElementById('copyBtn').addEventListener('click', () => {
    const text = document.getElementById('aiResponse').innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = "Copy", 2000);
});

// Vymazání
document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = "";
    document.getElementById('aiResponse').innerText = "Waiting for code...";
    document.getElementById('aiResponse').style.color = "#f8fafc";
});

// Hlavní akce
document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code.trim()) {
        responseBox.style.color = "#ff4444";
        responseBox.innerText = "Please paste some code first...";
        return;
    }

    let apiKey = localStorage.getItem('buddy_api_key');
    if (!apiKey) {
        apiKey = prompt("Please enter your Groq API Key:");
        if (apiKey) localStorage.setItem('buddy_api_key', apiKey.trim());
        else return;
    }

    const prompts = {
        explain: "Explain this code simply: ",
        debug: "Find bugs in this code: ",
        refactor: "Refactor this code: "
    };

    responseBox.style.color = "#38bdf8";
    responseBox.innerText = "CodeBuddy is thinking... ✍️";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are CodeBuddy. Respond in English. Be clear and helpful." },
                    { role: "user", content: prompts[action] + "\n\n" + code }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        responseBox.style.color = "#f8fafc";
        responseBox.innerText = "";
        
        let i = 0;
        function typeWriter() {
            if (i < aiText.length) {
                responseBox.innerText += aiText.charAt(i);
                i++;
                setTimeout(typeWriter, 5);
            }
        }
        typeWriter();

    } catch (error) {
        responseBox.style.color = "#ff4444";
        responseBox.innerText = "Error: " + error.message;
    }
});
