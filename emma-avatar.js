document.getElementById("avatar-upload").onchange = function(e) {
  let file = e.target.files[0];
  if(!file) return;
  let reader = new FileReader();
  reader.onload = function(evt) {
    document.getElementById("emma-user-avatar").src = evt.target.result;
    let memory = JSON.parse(localStorage.getItem("emmaMemory") || "{}");
    memory.profile = memory.profile || {};
    memory.profile.avatar = evt.target.result;
    localStorage.setItem("emmaMemory", JSON.stringify(memory));
  };
  reader.readAsDataURL(file);
};
window.addEventListener("DOMContentLoaded", function() {
  let memory = JSON.parse(localStorage.getItem("emmaMemory") || "{}");
  if(memory.profile?.avatar) {
    document.getElementById("emma-user-avatar").src = memory.profile.avatar;
  }
});