// Çoklu kullanıcı desteği: localStorage'dan eklenen kullanıcılar + sabitler
const APPROVED_USERS = (JSON.parse(localStorage.getItem("emma_users") || "[]")).concat([
  { username: "ahmet", password: "ada35mina" },
  { username: "hilal", password: "ada35mina" }
]);
const loginContainer = document.getElementById("login-container");
const emmaAppDiv = document.getElementById("emma-app");
const loginStatus = document.getElementById("login-status");

document.getElementById("login-button").onclick = function() {
  let user = document.getElementById("login-username").value.trim();
  let pass = document.getElementById("login-password").value;
  let found = APPROVED_USERS.find(u => u.username === user && u.password === pass);
  if (found) {
    localStorage.setItem("emma_user", user);
    loginContainer.style.display = "none";
    emmaAppDiv.style.display = "block";
  } else {
    loginStatus.innerText = "Erişim engellendi: Onaylı kullanıcı değilsiniz.";
  }
};

// Her açılışta giriş ekranı gelsin, otomatik giriş olmasın:
window.onload = function() {
  loginContainer.style.display = "block";
  emmaAppDiv.style.display = "none";
  localStorage.removeItem("emma_user");
};