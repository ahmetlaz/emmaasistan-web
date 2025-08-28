// Emma'nın hafızası için temel yapı
const STORAGE_KEY = "emma_memory";
let memory = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Sohbet Hafızası (aynı dosyada, farklı localStorage anahtarı)
const CHAT_KEY = "emmaMemory";
let chatMemory = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");

// Proje ekleme
function addProject(owner, projectName, data) {
  memory.push({ owner, projectName, data, completed: false });
  saveMemory();
}

// Proje tamamlama ve silme
function completeProject(owner, projectName) {
  for (let proj of memory) {
    if (proj.owner === owner && proj.projectName === projectName) {
      proj.completed = true;
      // Sadece ahmet ise kalıcı tut, değilse sil
      if (owner !== "ahmet") {
        memory = memory.filter(p => !(p.owner === owner && p.projectName === projectName));
      }
      break;
    }
  }
  saveMemory();
}

// Hafızayı kaydet
function saveMemory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  showProjectMemory();
}

// Hafızadan projeleri yükle (sadece ahmet için)
function loadMyProjects() {
  return memory.filter(p => p.owner === "ahmet");
}

// Tüm projeleri ve sohbeti göster
function showProjectMemory() {
  const memDiv = document.getElementById('memory');
  if (!memDiv) return;
  let html = `<b>Emma'nın Proje Hafızası</b><ul>`;
  for (let proj of memory) {
    html += `<li>
      <b>${proj.owner} / ${proj.projectName}</b>
      ${proj.completed ? "<span style='color:green'> (Tamamlandı)</span>" : "<span style='color:orange'> (Devam ediyor)</span>"}
      <br>
      <pre>${proj.data ? JSON.stringify(proj.data, null, 2).substring(0,700) : ''}${proj.data && JSON.stringify(proj.data).length>700?"...":""}</pre>
    </li>`;
  }
  html += `</ul>
    <button onclick="clearProjectMemory()">Proje Hafızasını Temizle</button>
    <button onclick="downloadProjectMemory()">Projeleri İndir</button>
    <input type="file" id="uploadProjectMemory" style="margin-top:8px;" />
    <label for="uploadProjectMemory" style="cursor:pointer;">Dosyadan yükle</label>
    <hr>
    <b>Emma'nın Sohbet Hafızası</b>
    <ul>${chatMemory.map(m => `<li><b>${m.date}:</b> <i>${m.question}</i> <br> <span>${m.answer}</span></li>`).join("")}</ul>
    <button onclick="clearChatMemory()">Sohbet Hafızasını Temizle</button>
    <button onclick="downloadChatMemory()">Sohbeti İndir</button>
    <input type="file" id="uploadChatMemory" style="margin-top:8px;" />
    <label for="uploadChatMemory" style="cursor:pointer;">Sohbetten yükle</label>
    <hr>
    <button onclick="backupEmmaCloud()">Buluta Yedekle</button>
    <button onclick="syncEmmaGithub()">Github Sync</button>
    <button onclick="motivationEmma()">Motivasyon</button>
    <select id="themeMemory" style="margin-left:10px;">
      <option value="light">Açık Tema</option>
      <option value="dark">Koyu Tema</option>
    </select>
  `;
  memDiv.innerHTML = html;

  // Proje dosya yükleme
  const upInput = document.getElementById('uploadProjectMemory');
  if (upInput) {
    upInput.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            memory = imported;
            saveMemory();
            alert("Proje hafızası başarıyla yüklendi!");
          } else {
            alert("Geçersiz dosya formatı!");
          }
        } catch (err) {
          alert("Dosya okunamadı!");
        }
      };
      reader.readAsText(file);
    };
  }

  // Sohbet dosya yükleme
  const chatInput = document.getElementById('uploadChatMemory');
  if (chatInput) {
    chatInput.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            chatMemory = imported;
            localStorage.setItem(CHAT_KEY, JSON.stringify(chatMemory));
            showProjectMemory();
            alert("Sohbet hafızası başarıyla yüklendi!");
          } else {
            alert("Geçersiz dosya formatı!");
          }
        } catch (err) {
          alert("Dosya okunamadı!");
        }
      };
      reader.readAsText(file);
    };
  }

  // Tema seçimi
  const themeSelectMemory = document.getElementById('themeMemory');
  if (themeSelectMemory) {
    themeSelectMemory.onchange = function() {
      if (themeSelectMemory.value === "dark") {
        memDiv.style.background="#29294a";
        memDiv.style.color="#eee";
      } else {
        memDiv.style.background="#fff";
        memDiv.style.color="#222";
      }
    };
  }
}

// Proje hafızasını tamamen sil
function clearProjectMemory() {
  if (confirm("Emma'nın proje hafızası silinsin mi?")) {
    memory = [];
    saveMemory();
  }
}

// Proje hafızasını dışa aktar (indir)
function downloadProjectMemory() {
  const blob = new Blob([JSON.stringify(memory, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "emma-proje-hafizasi.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Sohbet hafızasını sil
function clearChatMemory() {
  if (confirm("Emma'nın sohbet hafızası silinsin mi?")) {
    chatMemory = [];
    localStorage.setItem(CHAT_KEY, JSON.stringify(chatMemory));
    showProjectMemory();
  }
}

// Sohbet hafızasını indir
function downloadChatMemory() {
  const blob = new Blob([JSON.stringify(chatMemory, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "emma-sohbet-hafizasi.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Buluta Yedekle (örnek, Google Drive entegrasyonu için API gerekli)
function backupEmmaCloud() {
  alert("Buluta yedekleme için Google Drive/Dropbox API entegrasyonu gerekmektedir.");
  // Buraya bulut API kodunu ekleyebilirsin.
}

// Github Sync (örnek)
function syncEmmaGithub() {
  alert("Github senkronizasyon için API anahtarı ve yetkilendirme gerekmektedir.");
  // Buraya Github API kodunu ekleyebilirsin.
}

// Motivasyon fonksiyonu
function motivationEmma() {
  const motivasyonlar = [
    "Bugün ne öğrendin? Küçük bir adım büyük bir başarıya yol açar!",
    "Kod yazmak bir sanattır. Sen harika bir sanatçısın!",
    "Her hata bir öğrenme fırsatıdır. Devam et!",
    "Emma yanında, her sorunu birlikte çözeriz!",
    "Hedef koy, azimle ilerle, başarı senin olacak!"
  ];
  const msg = motivasyonlar[Math.floor(Math.random()*motivasyonlar.length)];
  alert("Emma Motivasyon: " + msg);
}

// Sayfa yüklendiğinde hafızayı göster
if (document.readyState !== "loading") {
  showProjectMemory();
} else {
  window.addEventListener('DOMContentLoaded', showProjectMemory);
}