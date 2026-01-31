const responses = {
    explain: "CodeBuddy: This code creates a function that handles data input. It uses modern syntax, but ensure you handle errors properly to avoid crashes.",
    debug: "CodeBuddy: Found a potential issue! Your logic might cause an infinite loop if the condition is never met. Try adding a break point.",
    refactor: "CodeBuddy: Clean code tip! You can use a .map() function here instead of a for-loop to make the code more readable and concise."
};

document.getElementById('runBtn').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code.trim()) {
        responseBox.style.color = "#ff4444";
        responseBox.innerText = "Please paste some code first... ⌨️";
        return;
    }

    responseBox.style.color = "#38bdf8";
    responseBox.innerText = "CodeBuddy is thinking... 🧠";

    setTimeout(() => {
        responseBox.style.color = "#f8fafc";
        // Simulace psaní (typing effect)
        let i = 0;
        const txt = responses[action];
        responseBox.innerText = "";
        
        function typeWriter() {
            if (i < txt.length) {
                responseBox.innerText += txt.charAt(i);
                i++;
                setTimeout(typeWriter, 30);
            }
        }
        typeWriter();
    }, 1200);
});
