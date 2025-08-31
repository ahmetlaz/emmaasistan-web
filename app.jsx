import React, { useState, useEffect } from "react";
import "./styles.css";
import { getApiKeys, setApiKeys, saveMemory, loadMemory, addFeature, getFeatures, userAuth, usersList, forgetMemory } from "./utils";

// Giriş ekranı
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (userAuth(username, password)) {
      onLogin(username);
    } else {
      setError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  return (
    <div className="login-screen">
      <h1>Akıllı Asistan Giriş</h1>
      <input type="text" placeholder="Kullanıcı Adı" value={username} onChange={e=>setUsername(e.target.value)} />
      <input type="password" placeholder="Şifre" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Giriş Yap</button>
      {error && <div className="error">{error}</div>}
      <div className="login-users">
        <small>(İzinli kullanıcılar: {usersList().join(", ")})</small>
      </div>
    </div>
  );
}

// Admin paneli
function AdminPanel({ apiKeys, setApiKeysState, featureList, setFeatureList }) {
  const [openaiKey, setOpenaiKey] = useState(apiKeys.openai);
  const [googleKey, setGoogleKey] = useState(apiKeys.google);
  const [newFeature, setNewFeature] = useState("");

  const handleSave = () => {
    setApiKeys(openaiKey, googleKey);
    setApiKeysState({ openai: openaiKey, google: googleKey });
    alert("API anahtarları güncellendi!");
  };

  const handleAddFeature = () => {
    if (newFeature.trim().length > 2) {
      addFeature(newFeature);
      setFeatureList(getFeatures());
      setNewFeature("");
      alert("Yeni özellik eklendi!");
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Paneli</h2>
      <label>OpenAI API Key:</label>
      <input type="text" value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)} />
      <label>Google API Key:</label>
      <input type="text" value={googleKey} onChange={e=>setGoogleKey(e.target.value)} />
      <button onClick={handleSave}>API Anahtarlarını Kaydet</button>
      <hr />
      <label>Yeni Özellik Ekle:</label>
      <input type="text" value={newFeature} onChange={e=>setNewFeature(e.target.value)} placeholder="Özellik başlığı yaz" />
      <button onClick={handleAddFeature}>Ekle</button>
      <div className="feature-list">
        <b>Eklenen Özellikler:</b>
        <ul>
          {featureList.map((f,i)=><li key={i}>{f}</li>)}
        </ul>
      </div>
    </div>
  );
}

// Sohbet ve multi-modül asistan
function ChatAsistant({ username, apiKeys, featureList }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(loadMemory(username));
  const [aiAnswer, setAiAnswer] = useState("");
  const [mode, setMode] = useState("chat"); // chat, code, graphic, video, audio, etc.
  const [forgetFlag, setForgetFlag] = useState(false);

  useEffect(() => {
    saveMemory(username, messages);
  }, [messages, username]);

  const handleSend = async () => {
    let answer = "";

    // Multi-modül AI cevabı (OpenAI ile gerçek API bağlanabilir)
    if (mode === "chat") {
      answer = `🤖 Sohbet: "${input}" için en iyi cevap buraya gelir.`;
    } else if (mode === "code") {
      answer = `💻 Kod: "${input}" için örnek kod burada.\n// Kod çıktısı örnek`;
    } else if (mode === "graphic") {
      answer = `🎨 Grafik: "${input}" için AI ile üretilen görsel burada.`;
    } else if (mode === "video") {
      answer = `📹 Video: "${input}" için video üretildi.`;
    } else if (mode === "audio") {
      answer = `🔊 Ses: "${input}" için ses dosyası oluşturuldu.`;
    } else {
      answer = `⚙️ (${mode}) Özelliği: "${input}" için sonuç burada.`;
    }

    setMessages([...messages, { user: username, text: input }, { user: "asistan", text: answer }]);
    setInput("");
    setAiAnswer(answer);
  };

  const handleForget = () => {
    forgetMemory(username);
    setMessages([]);
    setForgetFlag(true);
    setTimeout(()=>setForgetFlag(false), 2000);
  };

  return (
    <div className="chat-panel">
      <h2>Akıllı Asistan ({username})</h2>

      <div className="feature-modes">
        {["chat", "code", "graphic", "video", "audio", ...featureList].map(f=>
          <button key={f} className={mode===f?"active":""} onClick={()=>setMode(f)}>
            {f[0].toUpperCase()+f.slice(1)}
          </button>
        )}
      </div>

      <div className="chat-history">
        {messages.map((m,i)=>
          <div key={i} className={m.user==="asistan"?"msg-ai":"msg-user"}>
            <b>{m.user==="asistan"?"Asistan":"Sen"}:</b> {m.text}
          </div>
        )}
      </div>

      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ne yapmak istiyorsun?" />
      <button onClick={handleSend}>Gönder</button>
      <button className="forget-btn" onClick={handleForget}>Unut</button>
      {forgetFlag && <div className="forget-msg">Tüm geçmiş unutuldu!</div>}
      {aiAnswer && <div className="ai-answer">{aiAnswer}</div>}
    </div>
  );
}

// Ana uygulama
export default function App() {
  const [user, setUser] = useState("");
  const [apiKeys, setApiKeysState] = useState(getApiKeys());
  const [featureList, setFeatureList] = useState(getFeatures());

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="container">
      <AdminPanel
        apiKeys={apiKeys}
        setApiKeysState={setApiKeysState}
        featureList={featureList}
        setFeatureList={setFeatureList}
      />
      <ChatAsistant
        username={user}
        apiKeys={apiKeys}
        featureList={featureList}
      />
      <footer>
        <small>Akıllı Asistan | Güvenli, tam sürüm, unutmaz, mobil/masaüstü uyumlu</small>
      </footer>
    </div>
  );
}