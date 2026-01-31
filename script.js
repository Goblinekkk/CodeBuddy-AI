// Konfigurace API - používáme Groq, protože je bleskově rychlý
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

document.getElementById('runBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    // 1. Kontrola, zda uživatel vložil nějaký kód
    if (!code.trim()) {
        responseBox.style.color = "#ff4444";
        responseBox.innerText = "Please paste some code first... ⌨️";
        return;
    }

    // 2. Správa API klíče přes localStorage (bezpečné uložení v mobilu)
    let apiKey = localStorage.getItem('buddy_api_key');
    
    if (!apiKey) {
        apiKey = prompt("Please enter your Groq API Key:");
        if (apiKey && apiKey.trim().length > 10) {
            localStorage.setItem('buddy_api_key', apiKey.trim());
        } else {
            responseBox.style.color = "#ff4444";
            responseBox.innerText = "Invalid API Key. Get one at console.groq.com";
            return;
        }
    }

    // 3. Nastavení instrukcí pro AI podle vybrané akce
    const prompts = {
        explain: "Explain this code in a simple way for a developer: ",
        debug: "Identify bugs, logical errors, or security risks in this code: ",
        refactor: "Suggest a cleaner, more modern, and more efficient version of this code: "
    };

    // Vizuální zpětná vazba, že se něco děje
    responseBox.style.color = "#38bdf8";
    responseBox.innerText = "CodeBuddy is analyzing... 🧠";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        content: "You are CodeBuddy, a helpful and witty AI pair programmer. You provide clear, concise technical advice and always format code snippets properly." 
                    },
                    { 
                        role: "user", 
                        content: prompts[action] + "\n\n" + code 
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7
            })
        });

        const data = await response.json();

        // Pokud je klíč špatný, server vrátí chybu - v tom případě ho smažeme, aby se mohl zadat znovu
        if (data.error) {
            if (data.error.code === "authentication_                     error" || data.error.type === "invalid_request_error") {
                localStorage.removeItem('buddy_api_key');
            }
            throw new Error(data.error.message);
        }

        const aiText = data.choices[0].message.content;

        // 4. Efekt psaní (Typing effect) pro lepší pocit z aplikace
        responseBox.style.color = "#f8fafc";
        responseBox.innerText = "";
        let i = 0;
        
        function typeWriter() {
            if (i < aiText.length) {
                responseBox.innerText += aiText.charAt(i);
                i++;
                // Rychlost psaní (15ms je fajn pro mobily)
                setTimeout(typeWriter, 15);
                
                // Automatické scrollování dolů, aby byla vidět nová slova
                responseBox.scrollTop = responseBox.scrollHeight;
            }
        }
        typeWriter();

    } catch (error) {
        console.error("API Error:", error);
        responseBox.style.color = "#ff4444";
        responseBox.innerText = "Ops! CodeBuddy is offline. " + error.message;
    }
});
