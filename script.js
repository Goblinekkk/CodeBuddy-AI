// Konfigurace
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    // 1. Kontrola, zda je vložen kód
    if (!code.trim()) {
        responseBox.style.color = "#ff4444";
        responseBox.innerText = "Please paste some code first... ⌨️";
        return;
    }

    // 2. Získání API klíče (uloží se do prohlížeče, aby se neposílal na GitHub)
    let apiKey = localStorage.getItem('buddy_api_key');
    if (!apiKey) {
        apiKey = prompt("Please enter your Groq API Key (it will be saved locally):");
        if (apiKey) {
            localStorage.setItem('buddy_api_key', apiKey);
        } else {
            alert("API Key is required for CodeBuddy to work!");
            return;
        }
    }

    // 3. Příprava promptu podle vybrané akce
    const prompts = {
        explain: "Explain this code simply: ",
        debug: "Find bugs and potential errors in this code: ",
        refactor: "Refactor and clean up this code to be more efficient: "
    };

    responseBox.style.color = "#38bdf8";
    responseBox.innerText = "CodeBuddy is thinking... 🧠";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are CodeBuddy, an expert pair programmer. Provide concise and helpful advice." },
                    { role: "user", content: prompts[action] + "\n\n" + code }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiText = data.choices[0].message.content;

        // 4. Efekt psaní (Typing effect)
        responseBox.style.color = "#f8fafc";
        let i = 0;
        responseBox.innerText = "";
        
        function typeWriter() {
            if (i < aiText.length) {
                responseBox.innerText += aiText.charAt(i);
                i++;
                // Rychlejší psaní pro delší texty
                setTimeout(typeWriter, 15);
            }
        }
        typeWriter();

    } catch (error) {
        console.error("Error:", error);
        responseBox.style.color = "#ff4444";
        responseBox.innerText = "Error: " + error.message;
        // Pokud je klíč špatný, smažeme ho, aby se mohl zadat znova
        if (error.message.includes("API key")) {
            localStorage.removeItem('buddy_api_key');
        }
    }
});
