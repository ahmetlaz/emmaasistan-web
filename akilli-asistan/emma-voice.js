const micBtn = document.getElementById("mic");
const inputBox = document.getElementById("input");
let recognizing = false;
let recognition;

function isSpeechRecognitionSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

if (isSpeechRecognitionSupported()) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = document.getElementById("lang").value;
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.onclick = function() {
    if (recognizing) {
      recognition.stop();
      micBtn.innerText = "🎤";
    } else {
      recognition.lang = document.getElementById("lang").value;
      recognition.start();
      micBtn.innerText = "🛑";
    }
    recognizing = !recognizing;
  };

  recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript;
    inputBox.value = transcript;
    sendMessage();
  };
  recognition.onerror = function(event) {
    micBtn.innerText = "🎤";
    recognizing = false;
    alert("Mikrofon hatası: " + event.error + ". Chrome ve HTTPS ile deneyin!");
  };
  recognition.onend = function() {
    micBtn.innerText = "🎤";
    recognizing = false;
  };
} else {
  micBtn.style.display = "none";
  alert("Tarayıcınızda mikrofon/sesli mesaj desteği yok! Lütfen Chrome ve HTTPS ile açın.");
}

function speakEmma(text) {
  if (!('speechSynthesis' in window)) return;
  let utter = new SpeechSynthesisUtterance(text);
  utter.lang = document.getElementById("lang").value;
  utter.rate = 0.85; // Kadın sesi için hız yavaşlatıldı
  let selectVoice = () => {
    let voices = window.speechSynthesis.getVoices();
    let femaleVoice;
    if (utter.lang === "tr-TR") {
      femaleVoice = voices.find(v => v.lang === "tr-TR" && v.name.toLowerCase().includes('yelda'));
      if (!femaleVoice) femaleVoice = voices.find(v => v.lang === "tr-TR" && v.gender === 'female');
      if (!femaleVoice) femaleVoice = voices.find(v => v.lang === "tr-TR");
    }
    if (!femaleVoice) femaleVoice = voices.find(v => v.gender === 'female');
    if (!femaleVoice && voices.length) femaleVoice = voices[0];
    if (femaleVoice) utter.voice = femaleVoice;
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = selectVoice;
  } else {
    selectVoice();
  }
  window.speechSynthesis.speak(utter);
}