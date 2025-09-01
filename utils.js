export function getApiKeys() {
  return {
    openai: localStorage.getItem("VITE_OPENAI_API_KEY") || "",
    google: localStorage.getItem("VITE_GOOGLE_CLIENT_ID") || ""
  };
}
export function setApiKeys(openaiKey, googleKey) {
  localStorage.setItem("VITE_OPENAI_API_KEY", openaiKey);
  localStorage.setItem("VITE_GOOGLE_CLIENT_ID", googleKey);
}

export function saveMemory(username, messages) {
  localStorage.setItem("memory_"+username, JSON.stringify(messages));
}
export function loadMemory(username) {
  return JSON.parse(localStorage.getItem("memory_"+username) || "[]");
}
export function forgetMemory(username) {
  localStorage.removeItem("memory_"+username);
}

export function addFeature(feature) {
  const old = getFeatures();
  if (!old.includes(feature)) {
    localStorage.setItem("features", JSON.stringify([...old, feature]));
  }
}
export function getFeatures() {
  return JSON.parse(localStorage.getItem("features") || "[]");
}

// Sadece gerçek kullanıcılar: ahmet ve admin
export function usersList() {
  return ["ahmet", "admin"];
}
export function userAuth(username, password) {
  const allowed = usersList();
  return allowed.includes(username.toLowerCase()) && password === "123456";
}
