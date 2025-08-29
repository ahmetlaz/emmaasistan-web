// Dosya yükleme ve chat'e gönderme
document.getElementById("file-upload").onchange = function(e) {
  let file = e.target.files[0];
  if(!file) return;
  let reader = new FileReader();
  reader.onload = function(evt) {
    let content = evt.target.result;
    let type = file.type || '';
    if (type.startsWith('image/')) {
      chatDiv.innerHTML += `<div><b>Dosya:</b> ${file.name}<br><img src="${content}" style="max-width:200px"></div>`;
      addChatHistory(`Dosya: ${file.name} - Görsel yüklendi.`);
    } else {
      chatDiv.innerHTML += `<div><b>Dosya:</b> ${file.name}<pre>${content}</pre></div>`;
      addChatHistory(`Dosya: ${file.name} - İçerik: ${content}`);
    }
  };
  if(file.type.startsWith('image/')) reader.readAsDataURL(file);
  else reader.readAsText(file);
};

// Chat geçmişini TXT/CSV olarak indir
document.getElementById("export-txt").onclick = function() {
  let memory = JSON.parse(localStorage.getItem("emmaMemory") || "{}");
  let txt = memory.chatHistory ? memory.chatHistory.join("\n") : "";
  let blob = new Blob([txt], {type: "text/plain"});
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "emma_chat.txt";
  link.click();
};
document.getElementById("export-csv").onclick = function() {
  let memory = JSON.parse(localStorage.getItem("emmaMemory") || "{}");
  let csv = "Mesaj\n" + (memory.chatHistory ? memory.chatHistory.map(m => `"${m.replace(/"/g,'""')}"`).join("\n") : "");
  let blob = new Blob([csv], {type: "text/csv"});
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "emma_chat.csv";
  link.click();
};

// Sohbet ve hafızayı temizleme
document.getElementById("clear-history").onclick = function() {
  if(confirm("Sohbet geçmişini ve hafızayı silmek istediğine emin misin?")) {
    localStorage.removeItem("emmaMemory");
    location.reload();
  }
};