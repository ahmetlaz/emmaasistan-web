const themeSelect = document.getElementById("theme");
themeSelect.onchange = function() {
  localStorage.setItem("emma_theme", themeSelect.value);
  if(themeSelect.value === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
};
window.onload = function() {
  let savedTheme = localStorage.getItem("emma_theme");
  if(savedTheme) {
    themeSelect.value = savedTheme;
    if(savedTheme === "dark") document.body.classList.add("dark");
  }
};