<script>
(function () {
    // Load widget config from global variable (ONLY webhook)
    const config = window.ChatWidgetConfig || {
        webhook: { url: "" }
    };

    let currentSession = crypto.randomUUID();

    // Inject minimal styles (fixed colors)
    const css = `
        .chat-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 380px;
            height: 550px;
            display: none;
            flex-direction: column;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 0 40px rgba(0,0,0,0.15);
            overflow: hidden;
            z-index: 99999;
        }
        .chat-container.open {
            display: flex;
        }
        .chat-header {
            padding: 15px;
            background: #4A90E2;
            color: white;
            font-size: 18px;
            font-weight: bold;
        }
        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            font-family: sans-serif;
        }
        .chat-message {
            padding: 10px 14px;
            border-radius: 14px;
            margin-bottom: 10px;
            max-width: 80%;
            line-height: 1.4;
            font-size: 14px;
        }
        .chat-message.user {
            background: #4A90E2;
            color: white;
            margin-left: auto;
        }
        .chat-message.bot {
            background: #f1f1f1;
            color: #333;
            margin-right: auto;
        }
        .chat-input {
            display: flex;
            padding: 12px;
            border-top: 1px solid #ddd;
            background: white;
        }
        .chat-input textarea {
            flex: 1;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 10px;
            resize: none;
            font-family: inherit;
        }
        .chat-input button {
            margin-left: 10px;
            border: none;
            background: #4A90E2;
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            cursor: pointer;
        }
        .chat-toggle {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #4A90E2;
            color: white;
            width: 65px;
            height: 65px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            z-index: 99999;
        }
    `;
    const styleElement = document.createElement("style");
    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    // Create DOM structure
    const widget = document.createElement("div");
    widget.className = "chat-container";
    widget.innerHTML = `
        <div class="chat-header">
            Chatbot
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <textarea placeholder="Type your message..." rows="1"></textarea>
            <button>Send</button>
        </div>
    `;

    const toggleBtn = document.createElement("div");
    toggleBtn.className = "chat-toggle";
    toggleBtn.textContent = "💬";

    document.body.appendChild(widget);
    document.body.appendChild(toggleBtn);

    const messages = widget.querySelector(".chat-messages");
    const textarea = widget.querySelector("textarea");
    const sendBtn = widget.querySelector("button");

    // Add user message
    function addUserMessage(text) {
        const div = document.createElement("div");
        div.className = "chat-message user";
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    // Add bot message
    function addBotMessage(text) {
        const div = document.createElement("div");
        div.className = "chat-message bot";
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    // Send message to webhook
    async function sendMessage(text) {
        addUserMessage(text);
        textarea.value = "";

        const payload = {
            sessionId: currentSession,
            message: text
        };

        try {
            const res = await fetch(config.webhook.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data?.output) {
                addBotMessage(data.output);
                return;
            }

            if (Array.isArray(data) && data[0]?.output) {
                addBotMessage(data[0].output);
                return;
            }

            addBotMessage("⚠️ No response from server.");

        } catch (err) {
            addBotMessage("⚠️ Error connecting to server.");
        }
    }

    // Toggle widget
    toggleBtn.onclick = () => {
        widget.classList.toggle("open");
    };

    sendBtn.onclick = () => {
        if (textarea.value.trim()) sendMessage(textarea.value.trim());
    };

    textarea.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (textarea.value.trim()) sendMessage(textarea.value.trim());
        }
    });
})();
</script>
