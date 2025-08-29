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

  // Push-to-talk: basılı tutunca konuş, bırakınca durdur
  micBtn.onmousedown = function() {
    if(recognition && !recognizing) {
      recognition.lang = document.getElementById("lang").value;
      recognition.start();
      micBtn.innerText = "🛑";
      recognizing = true;
    }
  };
  micBtn.onmouseup = function() {
    if(recognition && recognizing) {
      recognition.stop();
      micBtn.innerText = "🎤";
      recognizing = false;
    }
  };

  micBtn.onclick = function() {
    if (recognizing) {
      recognition.stop();
      micBtn.innerText = "🎤";
      recognizing = false;
    } else {
      recognition.lang = document.getElementById("lang").value;
      recognition.start();
      micBtn.innerText = "🛑";
      recognizing = true;
    }
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

// Sesli yanıt + kullanıcı ayarı
function speakEmma(text) {
  if (!('speechSynthesis' in window)) return;
  let utter = new SpeechSynthesisUtterance(text);
  utter.lang = document.getElementById("lang").value;
  utter.rate = parseFloat(localStorage.getItem("emma_voice_rate") || "0.85");
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

// Otomatik dil algılama
inputBox.oninput = function() {
  let val = inputBox.value;
  let turkishLetters = /[ğüşıöçĞÜŞİÖÇ]/;
  if(turkishLetters.test(val)) document.getElementById("lang").value = "tr-TR";
  else document.getElementById("lang").value = "en-US";
};