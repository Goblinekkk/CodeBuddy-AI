# 🦉 CodeBuddy AI

**CodeBuddy AI** is a lightweight, mobile-first Progressive Web App (PWA) designed for rapid AI-assisted coding. Built with performance and simplicity in mind, it provides a "native app" experience directly in the browser.

---

## ✨ Features

- **Blazing Fast Responses:** Powered by **Llama 3.3 70B** (via Groq API) for near-instant code generation and debugging.
- **Pure PWA Experience:** Install it on your home screen. No browser bars, no clutter—just your code.
- **Zero Frameworks:** Built with vanilla JavaScript and CSS for a tiny footprint and maximum speed.
- **Glassmorphism UI:** A modern, dark-themed interface designed for focus and aesthetics.
- **Session History:** Quickly access your recent prompts and snippets locally.

---

## 🛠️ Technical Breakdown

### High-Performance Streaming
The app uses a custom implementation of the Fetch API to handle streaming responses. Instead of waiting for the full response, CodeBuddy renders tokens in real-time using a non-blocking typewriter effect.

### Offline-Ready PWA
Using a custom **Service Worker**, the app shell is cached locally. This ensures that the interface loads instantly even on slow 3G/4G connections.

### Minimalist Stack
- **Frontend:** HTML5, CSS3 (Custom Variables & Backdrop Filters).
- **Logic:** Vanilla JavaScript (ES6+).
- **AI Engine:** Groq Cloud API (Llama 3.3).

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/Goblinekkk/CodeBuddy-AI.git](https://github.com/Goblinekkk/CodeBuddy-AI.git)
