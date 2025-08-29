document.getElementById("add-user").onclick = function() {
  let uname = prompt("Yeni kullanıcı adı:");
  let upass = prompt("Yeni şifre:");
  if(!uname || !upass) return;
  let users = JSON.parse(localStorage.getItem("emma_users") || "[]");
  users.push({username: uname, password: upass});
  localStorage.setItem("emma_users", JSON.stringify(users));
  alert("Kullanıcı eklendi!");
};