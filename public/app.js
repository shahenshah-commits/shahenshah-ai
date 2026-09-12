const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const suggestions = document.querySelectorAll(".suggestion");

let messages = JSON.parse(
  localStorage.getItem("shahenshah_ai_chat") || "[]"
);


/* SAVE */

function saveMessages() {
  localStorage.setItem(
    "shahenshah_ai_chat",
    JSON.stringify(messages)
  );
}


/* COPY BUTTON */

function copyText(text, button) {
  navigator.clipboard.writeText(text)
    .then(() => {
      const oldText = button.textContent;

      button.textContent = "Copied ✓";

      setTimeout(() => {
        button.textContent = oldText;
      }, 1500);
    })
    .catch(() => {
      button.textContent = "Copy failed";
    });
}


/* RENDER */

function render() {

  chat.innerHTML = "";

  welcome.style.display =
    messages.length ? "none" : "block";


  messages.forEach((message) => {

    const wrapper = document.createElement("div");

    wrapper.className =
      `message ${message.role}`;


    const text = document.createElement("div");

    text.textContent = message.content;

    wrapper.appendChild(text);


    /* COPY AI RESPONSE */

    if (message.role === "assistant") {

      const copyBtn =
        document.createElement("button");

      copyBtn.type = "button";

      copyBtn.textContent = "Copy";

      copyBtn.style.marginTop = "10px";
      copyBtn.style.padding = "5px 9px";
      copyBtn.style.borderRadius = "8px";
      copyBtn.style.border =
        "1px solid rgba(255,255,255,.1)";
      copyBtn.style.background =
        "rgba(255,255,255,.04)";
      copyBtn.style.color = "#94a3b8";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.fontSize = "10px";

      copyBtn.addEventListener("click", () => {
        copyText(message.content, copyBtn);
      });

      wrapper.appendChild(copyBtn);
    }


    chat.appendChild(wrapper);

  });


  chat.scrollTop = chat.scrollHeight;
}


/* THINKING */

function createThinking() {

  const thinking =
    document.createElement("div");

  thinking.className =
    "message assistant thinking";

  thinking.innerHTML = `
    <span>Shahenshah AI is thinking</span>
    <span class="thinking-dot"></span>
    <span class="thinking-dot"></span>
    <span class="thinking-dot"></span>
  `;

  chat.appendChild(thinking);

  chat.scrollTop = chat.scrollHeight;

  return thinking;
}


/* SEND */

async function sendMessage(text) {

  messages.push({
    role: "user",
    content: text
  });

  saveMessages();
  render();


  sendBtn.disabled = true;
  input.disabled = true;


  const thinking =
    createThinking();


  try {

    const response =
      await fetch("/api/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          messages
        })

      });


    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "Server returned an invalid response."
      );
    }


    if (!response.ok) {
      throw new Error(
        data.error || "Request failed"
      );
    }


    if (!data.reply) {
      throw new Error(
        "AI did not return a response."
      );
    }


    messages.push({
      role: "assistant",
      content: data.reply
    });


    saveMessages();

    render();


  } catch (error) {

    thinking.className =
      "message assistant";

    thinking.textContent =
      "⚠️ " + error.message;

  } finally {

    sendBtn.disabled = false;

    input.disabled = false;

    input.focus();

  }
}


/* FORM */

form.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const text =
      input.value.trim();


    if (
      !text ||
      sendBtn.disabled
    ) {
      return;
    }


    input.value = "";

    autoResize();

    sendMessage(text);

  }
);


/* CLEAR */

clearBtn.addEventListener(
  "click",
  () => {

    if (!messages.length) {
      input.focus();
      return;
    }


    const confirmed =
      confirm(
        "Clear your complete chat history?"
      );


    if (!confirmed) {
      return;
    }


    messages = [];

    saveMessages();

    render();

    input.focus();

  }
);


/* ENTER TO SEND */

input.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      form.requestSubmit();

    }

  }
);


/* AUTO RESIZE */

function autoResize() {

  input.style.height = "auto";

  input.style.height =
    Math.min(
      input.scrollHeight,
      150
    ) + "px";
}


input.addEventListener(
  "input",
  autoResize
);


/* SUGGESTIONS */

suggestions.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        input.value =
          button.textContent.trim();

        autoResize();

        input.focus();

      }
    );

  }
);


/* START */

render();

autoResize();
