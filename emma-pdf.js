document.getElementById("download-pdf").onclick = function() {
  let doc = new window.jspdf.jsPDF();
  let chatText = Array.from(document.querySelectorAll("#chat div")).map(div => div.innerText).join("\n\n");
  doc.text(chatText, 10, 10);
  doc.save("emma_chat.pdf");
};