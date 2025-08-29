document.getElementById("voice-rate").oninput = function(e) {
  localStorage.setItem("emma_voice_rate", e.target.value);
};