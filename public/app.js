const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

let messages = JSON.parse(localStorage.getItem("shahenshah_ai_chat") || "[]");

function saveMessages() {
  localStorage.setItem("shahenshah_ai_chat", JSON.stringify(messages));
}

function render() {
  chat.innerHTML = "";

  welcome.style.display = messages.length ? "none" : "block";

  messages.forEach((message) => {
    const div = document.createElement("div");
    div.className = `message ${message.role}`;
    div.textContent = message.content;
    chat.appendChild(div);
  });

  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(text) {
  messages.push({
    role: "user",
    content: text
  });

  saveMessages();
  render();

  sendBtn.disabled = true;
  input.disabled = true;

  const thinking = document.createElement("div");
  thinking.className = "message assistant";
  thinking.textContent = "Shahenshah AI is thinking...";
  chat.appendChild(thinking);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    messages.push({
      role: "assistant",
      content: data.reply
    });

    saveMessages();
    render();

  } catch (error) {
    thinking.textContent = "Error: " + error.message;
  } finally {
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text || sendBtn.disabled) return;

  input.value = "";
  sendMessage(text);
});

clearBtn.addEventListener("click", () => {
  messages = [];
  saveMessages();
  render();
  input.focus();
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

render();
