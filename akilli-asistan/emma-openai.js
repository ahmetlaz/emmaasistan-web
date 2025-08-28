// OpenAI API anahtarını buraya gir! Güvenliğin için kimseyle paylaşma!
const OPENAI_API_KEY = "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";

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');
const mic = document.getElementById('mic');
const upload = document.getElementById('upload');
const download = document.getElementById('download');
const generateImage = document.getElementById('generate-image');
const imageResult = document.getElementById('image-result');
const memoryDiv = document.getElementById('memory');
const langSelect = document.getElementById('lang');
const profileBtn = document.getElementById('profile');
const calendarBtn = document.getElementById('calendar');
const exportPDFBtn = document.getElementById('exportPDF');
const exportMDBtn = document.getElementById('exportMD');
const backupCloudBtn = document.getElementById('backupCloud');
const githubSyncBtn = document.getElementById('githubSync');
const motivationBtn = document.getElementById('motivation');
const themeSelect = document.getElementById('theme');
const extraDiv = document.getElementById('extra');

let lastQuestionType = "text";
let lastOutput = "";
let userProfile = JSON.parse(localStorage.getItem("emma_profile") || "{}");
let userCalendar = JSON.parse(localStorage.getItem("emma_calendar") || "[]");

// Mesajları ekrana yazdır
function appendMessage(sender, text) {
  const div = document.createElement('div');
  div.className = sender;
  div.innerHTML = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Emma'nın yanıtını seçilen dilde sesli olarak okut
function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langSelect.value;
    utter.rate = 1;
    const voices = window.speechSynthesis.getVoices();
    const selVoice = voices.find(v => v.lang === langSelect.value);
    if (selVoice) utter.voice = selVoice;
    window.speechSynthesis.speak(utter);
  }
}

// Emma'nın hafızasında son 5 sohbeti ve projeyi döndür (OpenAI'ya eklenir)
function getMemoryContext() {
  let memoryArr = JSON.parse(localStorage.getItem('emmaMemory') || "[]");
  let lastConvs = memoryArr.slice(-5).map(m => `${m.question}\nYanıt: ${m.answer}`).join("\n----\n");
  let projects = window.loadMyProjects ? window.loadMyProjects() : [];
  let projText = projects.map(p => `Proje: ${p.projectName} (${p.completed ? "tamamlandı" : "devam ediyor"})\n${JSON.stringify(p.data)}`).join("\n====\n");
  let profileText = userProfile.name ? `Kullanıcı: ${userProfile.name}\nİlgi Alanları: ${userProfile.interest || ""}\nFavori Dil: ${userProfile.favLang || ""}\n` : "";
  let calendarText = userCalendar.length ? "Takvim:\n" + userCalendar.map(e => `${e.date}: ${e.title}`).join("\n") : "";
  return `${profileText}\n${calendarText}\nSon Konuşmalar:\n${lastConvs}\nProjeler:\n${projText}`;
}

// Emma'ya sor ve OpenAI'dan yanıt al (hafıza + profil + takvim + dosya ile)
async function emmaAsk(question, fileContents=null, imageAnalysis=null) {
  appendMessage('emma', 'Emma: <i>Yanıt hazırlanıyor...</i>');

  // Hafıza, profil, takvim, dosya ve görsel analizi prompt'a ekleniyor
  let memoryContext = getMemoryContext();
  let finalQuestion = `${memoryContext}\n---\nKullanıcıdan yeni soru: ${question}`;
  if (fileContents) finalQuestion += `\n---\nAşağıdaki dosya içeriğini analiz et:\n${fileContents}`;
  if (imageAnalysis) finalQuestion += `\n---\nAşağıdaki görsel içeriğini analiz et:\n${imageAnalysis}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Sen akıllı, kişiselleştirilmiş, Türkçe ve çoklu dil destekli bir yazılım asistanısın. Hafızanda önceki konuşmaları, projeleri, kullanıcı profilini, takvimi ve dosya/görsel analizlerini hatırla ve gerektiğinde kullanıcının isteğine göre çıktı üret, öneri sun, eksik noktaları tamamla. Komutları ve ek özellikleri uygula." },
          { role: "user", content: finalQuestion }
        ],
        max_tokens: 1200,
        temperature: 0.7
      })
    });
    const data = await res.json();
    if (data.error) {
      chat.lastChild.innerHTML = "Emma: <span style='color:red;'>API Hatası: " + data.error.message + "</span>";
      return;
    }
    const answer = data.choices?.[0]?.message?.content || "Emma'dan yanıt alınamadı.";
    chat.lastChild.innerHTML = "Emma: " + answer;
    saveToMemory(question, answer);
    if (lastQuestionType === "mic") speak(answer);
    lastOutput = answer;
  } catch (err) {
    chat.lastChild.innerHTML = "Emma: <span style='color:red;'>Bağlantı hatası!</span>";
  }
}

// Hafızaya sohbet kaydet ve güncelle
function saveToMemory(question, answer) {
  let memory = JSON.parse(localStorage.getItem('emmaMemory') || "[]");
  memory.push({question, answer, date: new Date().toLocaleString()});
  if (memory.length > 50) memory = memory.slice(memory.length-50);
  localStorage.setItem('emmaMemory', JSON.stringify(memory));
  showMemory();
}
function showMemory() {
  let memory = JSON.parse(localStorage.getItem('emmaMemory') || "[]");
  memoryDiv.innerHTML = `<b>Emma'nın Hafızası</b><ul>` +
    memory.map(m => `<li><b>${m.date}:</b> <i>${m.question}</i> <br> <span>${m.answer}</span></li>`).join("") +
    `</ul><button onclick="clearMemory()">Hafızayı Temizle</button>`;
}
function clearMemory() {
  if (confirm("Emma'nın hafızasını silmek ister misiniz?")) {
    localStorage.removeItem('emmaMemory');
    showMemory();
    appendMessage('emma', "<span style='color:orange;'>Hafıza temizlendi!</span>");
  }
}
showMemory();

// Yazılı ve sesli soru
send.onclick = function() {
  const userMsg = input.value;
  if (!userMsg.trim()) return;
  // Komut sistemi
  if (userMsg.startsWith("/")) handleCommand(userMsg.trim());
  else {
    appendMessage('user', "Sen: " + userMsg);
    lastQuestionType = "text";
    emmaAsk(userMsg);
  }
  input.value = "";
};
input.onkeydown = function(e) {
  if (e.key === "Enter") send.onclick();
};

// Komut sistemi
function handleCommand(cmd) {
  if (cmd === "/takvim göster") calendarBtn.onclick();
  else if (cmd === "/profil göster") profileBtn.onclick();
  else if (cmd === "/proje hafizasi") showMemory();
  else if (cmd === "/motivasyon") motivationBtn.onclick();
  else if (cmd.startsWith("/proje ekle ")) {
    let proj = cmd.replace("/proje ekle ","").split(" ");
    addProject("ahmet", proj[0], {desc: proj.slice(1).join(" ")});
    appendMessage('emma', "Proje eklendi: "+proj[0]);
  } else {
    appendMessage('emma', `<b>Kullanılabilir komutlar:</b> /takvim göster, /profil göster, /proje hafizasi, /motivasyon, /proje ekle <ad> <açıklama>`);
  }
}

// Mikrofon ile konuşma
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = langSelect.value || 'tr-TR';
  recognition.continuous = false;
  recognition.interimResults = false;

  mic.onclick = function() {
    recognition.lang = langSelect.value;
    recognition.start();
    mic.disabled = true;
    mic.innerText = "🎙️";
    input.placeholder = "Konuşun, dinliyorum...";
  };

  recognition.onresult = function(event) {
    mic.disabled = false;
    mic.innerText = "🎤";
    input.placeholder = "Emma'ya bir şey sor...";
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    appendMessage('user', "Sen (mikrofon): " + transcript);
    lastQuestionType = "mic";
    emmaAsk(transcript);
    input.value = "";
  };

  recognition.onend = function() {
    mic.disabled = false;
    mic.innerText = "🎤";
    input.placeholder = "Emma'ya bir şey sor...";
  };

  recognition.onerror = function(event) {
    mic.disabled = false;
    mic.innerText = "🎤";
    input.placeholder = "Emma'ya bir şey sor...";
    alert("Mikrofon hatası: " + event.error);
  };
} else {
  if (mic) mic.style.display = "none";
}

// Dosya yükleme ve analiz
upload.onchange = function(e) {
  const files = e.target.files;
  if (!files.length) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = function(ev) {
    const fileContents = ev.target.result;
    appendMessage('user', `<b>Yüklenen dosya:</b> ${file.name}<pre>${fileContents.substring(0, 1000)}${fileContents.length>1000?"...":""}</pre>`);
    lastQuestionType = "text";
    emmaAsk("Bu dosyayı analiz et ve özetle.", fileContents);
  };
  if (file.type.startsWith('text') || file.type === "" || file.type === "application/json") {
    reader.readAsText(file);
  } else {
    appendMessage('user', `<span style='color:red;'>Yalnızca metin tabanlı dosyalar analiz edilebilir!</span>`);
  }
};

// Çıktı indirme
download.onclick = function() {
  if (!lastOutput) {
    alert("Henüz çıktı alınacak veri yok!");
    return;
  }
  const blob = new Blob([lastOutput], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "emma-cikti.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Görsel oluşturma (DALL-E)
generateImage.onclick = async function() {
  const prompt = input.value;
  if (!prompt.trim()) {
    alert("Lütfen oluşturulacak görsel için bir açıklama gir!");
    return;
  }
  imageResult.innerHTML = "Görsel üretiliyor...";
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "512x512"
      })
    });
    const data = await res.json();
    if (data.error) {
      imageResult.innerHTML = "<span style='color:red;'>Görsel üretim hatası: " + data.error.message + "</span>";
      return;
    }
    const imageUrl = data.data?.[0]?.url;
    if (imageUrl) {
      imageResult.innerHTML = `<img src="${imageUrl}" width="256" height="256"><br><a href="${imageUrl}" target="_blank">Orijinali</a>`;
      appendMessage('emma', `<b>Oluşturulan Görsel:</b><br><img src="${imageUrl}" width="128">`);
      // Görseli analiz etmesi için OpenAI'ya gönder
      emmaAsk("Bu görseli analiz et ve özetle.", null, imageUrl);
    } else {
      imageResult.innerHTML = "<span style='color:red;'>Görsel bulunamadı.</span>";
    }
  } catch (err) {
    imageResult.innerHTML = "<span style='color:red;'>Bağlantı hatası!</span>";
  }
};

// Dil seçimi
langSelect.onchange = function() {
  localStorage.setItem("emma_lang", langSelect.value);
  input.placeholder = langSelect.value === "en-US" ? "Ask Emma something..." :
    langSelect.value === "de-DE" ? "Frage Emma etwas..." :
    langSelect.value === "ar-SA" ? "اسأل إيما..." : "Emma'ya bir şey sor...";
};

// Profil yönetimi
profileBtn.onclick = function() {
  let name = prompt("İsminiz:", userProfile.name || "");
  let interest = prompt("İlgi alanlarınız (virgülle ayırın):", userProfile.interest || "");
  let favLang = prompt("Favori yazılım dili:", userProfile.favLang || "");
  userProfile = {name, interest, favLang};
  localStorage.setItem("emma_profile", JSON.stringify(userProfile));
  appendMessage('emma', `<b>Profil güncellendi:</b> ${name}, İlgi: ${interest}, Favori Dil: ${favLang}`);
};

// Takvim yönetimi
calendarBtn.onclick = function() {
  let title = prompt("Etkinlik başlığı:");
  let date = prompt("Tarih (YYYY-MM-DD):");
  if (!title || !date) return;
  userCalendar.push({title, date});
  localStorage.setItem("emma_calendar", JSON.stringify(userCalendar));
  appendMessage('emma', `<b>Takvime eklendi:</b> ${date} - ${title}`);
};

// PDF export (örnek)
if (exportPDFBtn) {
  exportPDFBtn.onclick = function() {
    let pdfContent = chat.innerText;
    alert("PDF export için ek JavaScript kütüphanesi gereklidir (ör: jsPDF).");
    // jsPDF ile export kodunu ekleyebilirsin.
  };
}

// Markdown export (örnek)
if (exportMDBtn) {
  exportMDBtn.onclick = function() {
    let md = Array.from(chat.children).map(div => 
      (div.className === "user" ? `**Sen:** ${div.innerText}` : `**Emma:** ${div.innerText}`)).join("\n\n");
    const blob = new Blob([md], {type: "text/markdown"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "emma-chat.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
}

// Buluta yedekleme
if (backupCloudBtn) {
  backupCloudBtn.onclick = function() {
    if (window.backupEmmaCloud) window.backupEmmaCloud();
    else alert("Buluta yedekleme için Google Drive/Dropbox API entegrasyonu gerekmektedir.");
  };
}

// Github senkronizasyon
if (githubSyncBtn) {
  githubSyncBtn.onclick = function() {
    if (window.syncEmmaGithub) window.syncEmmaGithub();
    else alert("Github senkronizasyon için API anahtarı ve yetkilendirme gerekmektedir.");
  };
}

// Motivasyon modu
if (motivationBtn) {
  motivationBtn.onclick = function() {
    const motivasyonlar = [
      "Bugün ne öğrendin? Küçük bir adım büyük bir başarıya yol açar!",
      "Kod yazmak bir sanattır. Sen harika bir sanatçısın!",
      "Her hata bir öğrenme fırsatıdır. Devam et!",
      "Emma yanında, her sorunu birlikte çözeriz!",
      "Hedef koy, azimle ilerle, başarı senin olacak!"
    ];
    const msg = motivasyonlar[Math.floor(Math.random()*motivasyonlar.length)];
    appendMessage('emma', `<b>Motivasyon:</b> ${msg}`);
  };
}

// Tema
if (themeSelect) {
  themeSelect.onchange = function() {
    if (themeSelect.value === "dark") {
      document.body.style.background="#23232a";
      document.body.style.color="#eee";
      chat.style.background="#29294a";
      memoryDiv.style.background="#29294a";
    } else {
      document.body.style.background="#f9f9fc";
      document.body.style.color="#222";
      chat.style.background="#fff";
      memoryDiv.style.background="#fff";
    }
  };
}

// Otomatik olarak dil ayarı ve profil/takvim yükle
window.addEventListener('DOMContentLoaded', function() {
  let lang = localStorage.getItem("emma_lang");
  if (lang) langSelect.value = lang;
  input.placeholder = langSelect.value === "en-US" ? "Ask Emma something..." :
    langSelect.value === "de-DE" ? "Frage Emma etwas..." :
    langSelect.value === "ar-SA" ? "اسأل إيما..." : "Emma'ya bir şey sor...";
  showMemory();
});