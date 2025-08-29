const chatDiv = document.getElementById("chat");
const inputBox = document.getElementById("input");
const sendBtn = document.getElementById("send");

const OPENAI_API_KEY = "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";

async function askEmmaAI(prompt, lang="tr-TR") {
  let system = (lang==="tr-TR")
     ? "Sen Emma adlı çok iyi bir yazılımcı genç kadınsın. Bütün yazılım dillerini biliyorsun. Kod örnekleri, açıklamalar ve motivasyon/tavsiye ver. Yanıtlarında Türkçe dil bilgisine dikkat et, nazik ve kadın gibi konuş."
     : "You are Emma, an expert young female coder. You know all programming languages. Give code samples, explanations and motivation/advice. Be polite and feminine.";
  let res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ]
    })
  });
  let data = await res.json();
  if (data.error) {
    chatDiv.innerHTML += `<div style="color:red"><b>Emma:</b> ${data.error.message}</div>`;
    addChatHistory(data.error.message);
    return data.error.message;
  }
  return data.choices?.[0]?.message?.content || "Emma yanıt veremedi.";
}

sendBtn.onclick = sendMessage;
inputBox.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    let prompt = inputBox.value.trim();
    if(prompt.startsWith("/img")) {
      askEmmaImage(prompt.replace("/img","").trim());
      inputBox.value = "";
      return;
    }
    sendMessage();
  }
});

async function sendMessage() {
  let prompt = inputBox.value.trim();
  if(!prompt) return;
  chatDiv.innerHTML += `<div><b>Sen:</b> ${prompt}</div>`;
  addChatHistory(prompt);
  let langVal = document.getElementById("lang").value;
  let response = await askEmmaAI(prompt, langVal);
  chatDiv.innerHTML += `<div><b>Emma:</b> ${response}</div>`;
  addChatHistory(response);
  inputBox.value = "";
  speakEmma(response);
}

// OpenAI görsel/grafik yanıtı
async function askEmmaImage(prompt) {
  let res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt,
      n: 1,
      size: "512x512"
    })
  });
  let data = await res.json();
  if(data.error) {
    chatDiv.innerHTML += `<div style="color:red"><b>Emma:</b> ${data.error.message}</div>`;
    addChatHistory(data.error.message);
    return;
  }
  let url = data.data?.[0]?.url;
  if(url) {
    chatDiv.innerHTML += `<div><b>Emma:</b> <img src="${url}" style="max-width:300px"></div>`;
    addChatHistory(`Görsel yanıt: ${url}`);
  }
}