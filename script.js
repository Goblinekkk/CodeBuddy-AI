document.getElementById('runBtn').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value;
    const action = document.getElementById('actionSelect').value;
    const responseBox = document.getElementById('aiResponse');

    if (!code) {
        responseBox.innerText = "Please provide some code first! ✋";
        return;
    }

    responseBox.innerText = "Analyzing your code... 🤖";

    // Simulate AI delay
    setTimeout(() => {
        if (action === "explain") {
            responseBox.innerText = "Buddy: This code snippet appears to be performing a logic operation. It uses standard syntax and follows best practices for the given language.";
        } else if (action === "debug") {
            responseBox.innerText = "Buddy: No critical syntax errors found, but watch out for potential null pointer exceptions in production!";
        } else {
            responseBox.innerText = "Buddy: Consider using arrow functions and destructuring to make this more readable (ES6 style).";
        }
    }, 1500);
});
