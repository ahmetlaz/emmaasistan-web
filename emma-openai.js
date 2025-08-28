// Artık API anahtarı ve OpenAI endpoint doğrudan burada olmayacak!
// Güvenli proxy kullanımı için backend'e fetch atıyoruz (örnek: /emma-openai)

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
// Artık backend proxyye fetch atıyor!
async function emmaAsk(question, fileContents=null, imageAnalysis=null) {
  appendMessage('emma', 'Emma: <i>Yanıt hazırlanıyor...</i>');

  // Hafıza, profil, takvim, dosya ve görsel analizi prompt'a ekleniyor
  let memoryContext = getMemoryContext();
  let finalQuestion = `${memoryContext}\n---\nKullanıcıdan yeni soru: ${question}`;
  if (fileContents) finalQuestion += `\n---\nAşağıdaki dosya içeriğini analiz et:\n${fileContents}`;
  if (imageAnalysis) finalQuestion += `\n---\nAşağıdaki görsel içeriğini analiz et:\n${imageAnalysis}`;

  try {
    const res = await fetch("/emma-openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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

// Görsel oluşturma (DALL-E)
generateImage.onclick = async function() {
  const prompt = input.value;
  if (!prompt.trim()) {
    alert("Lütfen oluşturulacak görsel için bir açıklama gir!");
    return;
  }
  imageResult.innerHTML = "Görsel üretiliyor...";
  try {
    const res = await fetch("/emma-dalle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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

// (Diğer kodlar aynen kalabilir - sadece yukarıdaki fetch'ler değişti)
