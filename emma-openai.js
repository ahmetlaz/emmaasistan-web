const chatDiv = document.getElementById("chat");
const inputBox = document.getElementById("input");
const sendBtn = document.getElementById("send");

// OpenAI API anahtarı (senin verdiğin yeni anahtar):
const OPENAI_API_KEY = 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

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
  if (e.key === 'Enter') sendMessage();
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