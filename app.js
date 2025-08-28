const chatDiv = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");
const micBtn = document.getElementById("micBtn");
const codeDiv = document.getElementById("code");

let chatHistory = [];
let micMode = false; // Mikrofonla mı geldi?

function addChat(text, sender = "Sen") {
  chatHistory.push({ sender, text });
  chatDiv.innerHTML = chatHistory.map(c => `<b>${c.sender}:</b> ${c.text}`).join("<br>");
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function aiRespond(message) {
  let answer = "";
  let codeSample = "";
  let lower = message.toLowerCase();

  if (lower.includes("strateji oyunu")) {
    answer = "İşte sana basit bir strateji oyunu kodu (HTML+JS):";
    codeSample = `
<!DOCTYPE html>
<html>
  <head>
    <title>Strateji Oyunu</title>
    <style>
      #board { width: 320px; height: 320px; background: #eee; display: flex; flex-wrap: wrap; }
      .cell { width: 40px; height: 40px; border: 1px solid #aaa; box-sizing: border-box; }
      .player { background: #4caf50; }
      .enemy { background: #f44336; }
    </style>
  </head>
  <body>
    <div id="board"></div>
    <button onclick="moveEnemy()">Düşmanı hareket ettir</button>
    <script>
      const board = document.getElementById('board');
      let playerPos = 0;
      let enemyPos = 63;
      function drawBoard() {
        board.innerHTML = '';
        for(let i=0;i<64;i++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          if(i === playerPos) cell.classList.add('player');
          if(i === enemyPos) cell.classList.add('enemy');
          board.appendChild(cell);
        }
      }
      function moveEnemy() {
        if(enemyPos > playerPos) enemyPos--;
        drawBoard();
      }
      board.onclick = function(e) {
        const idx = Array.from(board.children).indexOf(e.target);
        if(idx >= 0) { playerPos = idx; drawBoard(); }
      };
      drawBoard();
    </script>
  </body>
</html>
    `;
  } else if (lower.includes("program yaz") || lower.includes("hesap makinesi")) {
    answer = "İşte sana basit bir hesap makinesi kodu (HTML+JS):";
    codeSample = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hesap Makinesi</title>
  </head>
  <body>
    <input id="n1" type="number" /> +
    <input id="n2" type="number" />
    <button onclick="calculate()">Hesapla</button>
    <div id="result"></div>
    <script>
      function calculate() {
        var n1 = Number(document.getElementById('n1').value);
        var n2 = Number(document.getElementById('n2').value);
        document.getElementById('result').innerText = 'Sonuç: ' + (n1 + n2);
      }
    </script>
  </body>
</html>
    `;
  } else if (lower.includes("grafik tasarla") || lower.includes("logo çiz") || lower.includes("karakter çiz")) {
    answer = "İşte sana basit bir logo/karakter çizimi (Canvas ile JS):";
    codeSample = `
<!DOCTYPE html>
<html>
  <head>
    <title>Logo Çizimi</title>
  </head>
  <body>
    <canvas id="logo" width="200" height="200"></canvas>
    <script>
      const ctx = document.getElementById('logo').getContext('2d');
      ctx.fillStyle = '#4caf50';
      ctx.beginPath();
      ctx.arc(100,100,80,0,2*Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('AI', 55, 120);
    </script>
  </body>
</html>
    `;
  } else if (lower.includes("konuş") || lower.includes("sesli oku")) {
    answer = "Şimdi konuşuyorum!";
    codeSample = "";
  } else if (lower.includes("apk hazırla") || lower.includes("apk dosyası")) {
    answer = "APK dosyası oluşturmak için kodu Android Studio'ya aktarman ve orada derlemen gerekir. Sana örnek bir Android uygulama kodu ve adım adım rehber verebilirim!";
    codeSample = `
public class MainActivity extends AppCompatActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
  }
}
    `;
  } else {
    answer = "İsteğini gerçekleştirdim.";
  }

  return { answer, codeSample };
}

function handleSend() {
  const userMsg = input.value.trim();
  if (userMsg === "") return;
  addChat(userMsg, "Sen");
  const { answer, codeSample } = aiRespond(userMsg);
  addChat(answer, "Emma");
  codeDiv.textContent = codeSample;
  if (micMode) {
    speak(answer); // Sadece mikrofonla gelirse sesli cevapla!
    micMode = false; // Sonra kapat
  }
  input.value = "";
}

send.addEventListener("click", handleSend);
input.addEventListener("keydown", function(e) {
  if (e.key === "Enter") handleSend();
});

// Kadın sesi fonksiyonu - iki kez konuşmayı engeller!
let alreadySpoken = false;

function speak(text) {
  const synth = window.speechSynthesis;

  function trySpeak() {
    if (alreadySpoken) return;
    let voices = synth.getVoices();
    let voice = voices.find(v =>
      v.lang === "tr-TR" &&
      (
        v.name.toLowerCase().includes("filiz") ||
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("kadın") ||
        v.name.toLowerCase().includes("yeşim") ||
        v.name.toLowerCase().includes("banu") ||
        v.name.toLowerCase().includes("zira")
      )
    );
    if (!voice) {
      voice = voices.find(v => v.lang === "tr-TR");
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "tr-TR";
    if (voice) utter.voice = voice;
    synth.speak(utter);
    alreadySpoken = true;
    utter.onend = () => { alreadySpoken = false; };
  }

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => {
      trySpeak();
      synth.onvoiceschanged = null;
    };
  } else {
    trySpeak();
  }
}

// Mikrofonla konuşma (Speech Recognition)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'tr-TR';
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.onclick = () => {
    recognition.start();
    micBtn.textContent = "Dinleniyor...";
  };

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    micBtn.textContent = "🎤 Konuş";
    micMode = true; // Sesi aç!
    send.click();
  };

  recognition.onerror = function() {
    micBtn.textContent = "🎤 Konuş";
    alert("Ses algılanamadı! Lütfen tekrar deneyin.");
  };

  recognition.onend = function() {
    micBtn.textContent = "🎤 Konuş";
  };
} else {
  micBtn.disabled = true;
  micBtn.textContent = "🎤 Desteklenmiyor";
}