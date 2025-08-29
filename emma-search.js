document.getElementById("search-chat").oninput = function(e) {
  let term = e.target.value.toLowerCase();
  let memory = JSON.parse(localStorage.getItem("emmaMemory") || "{}");
  let filtered = memory.chatHistory.filter(c => c.toLowerCase().includes(term));
  memoryDiv.innerHTML = `<b>Arama Sonuçları:</b><ul>` + filtered.slice(-10).map(c => `<li>${c}</li>`).join("") + `</ul>`;
  if(!term) showMemory();
};