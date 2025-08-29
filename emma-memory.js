const SPECIAL_PERSON = "Ahmet";
const SPECIAL_NOTE = "Ahmet benim için her zaman en özel kişidir. Asla unutmayacağım!";

const memoryDiv = document.getElementById("memory");

function getEmmaMemory() {
  let memory = JSON.parse(localStorage.getItem("emmaMemory") || "{}");
  if (!memory.chatHistory) memory.chatHistory = [];
  if (!memory.projects) memory.projects = [];
  if (!memory.profile) memory.profile = {
    name: localStorage.getItem("emma_user") || SPECIAL_PERSON,
    settings: {}
  };
  memory.specialPerson = SPECIAL_PERSON;
  memory.specialNote = SPECIAL_NOTE;
  if (!memory.createdAt) memory.createdAt = new Date().toISOString();
  return memory;
}

function saveEmmaMemory(memory) {
  localStorage.setItem("emmaMemory", JSON.stringify(memory));
}

function showMemory() {
  let memory = getEmmaMemory();
  let html = `<b>Emma'nın Hafızası</b><br>`;
  html += `<b>Kullanıcı:</b> ${memory.profile.name}<br>`;
  html += `<b>En Özel Kişi:</b> ${memory.specialPerson}<br>`;
  html += `<i>${memory.specialNote}</i><br>`;
  html += `<b>Oluşturulma:</b> ${memory.createdAt}<br>`;
  html += `<b>Projeler:</b> <ul>`;
  memory.projects.forEach((p, i) => html += `<li>${p.name}</li>`);
  html += `</ul>`;
  html += `<b>Sohbet Geçmişi:</b> <ul>`;
  memory.chatHistory.slice(-5).forEach((c) => html += `<li>${c}</li>`);
  html += `</ul>`;
  memoryDiv.innerHTML = html;
}

document.getElementById("profile").onclick = function() {
  let memory = getEmmaMemory();
  memoryDiv.innerHTML =
    `<b>Emma Profil:</b><br>
    İsim: ${memory.profile.name}<br>
    Ayarlar: ${JSON.stringify(memory.profile.settings)}<br>
    <b>En Özel Kişi:</b> ${memory.specialPerson}<br>
    <i>${memory.specialNote}</i>`;
};

function addChatHistory(text) {
  let memory = getEmmaMemory();
  memory.chatHistory.push(text);
  if (memory.chatHistory.length > 200) memory.chatHistory = memory.chatHistory.slice(-200);
  saveEmmaMemory(memory);
  showMemory();
}

function addProject(name) {
  let memory = getEmmaMemory();
  memory.projects.push({name});
  saveEmmaMemory(memory);
  showMemory();
}

showMemory();