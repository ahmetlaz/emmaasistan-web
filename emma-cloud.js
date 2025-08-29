const GOOGLE_CLIENT_ID = "315917575340-e88a9nvh9sr796ag9gu5p4m036mjet8e.apps.googleusercontent.com";
const GDRIVE_FILE_NAME = "emma_memory.json";
let googleAccessToken = null;
const cloudSyncBtn = document.getElementById('cloud-sync');
const cloudLoadBtn = document.getElementById('cloud-load');
const cloudStatusDiv = document.getElementById('cloud-status');

window.startGoogleDriveOAuth = async function() {
  let redirectUri = window.location.origin;
  let oauthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}`
    + `&redirect_uri=${encodeURIComponent(redirectUri)}`
    + `&scope=https://www.googleapis.com/auth/drive.file`
    + `&response_type=token`
    + `&prompt=consent`;
  let win = window.open(oauthUrl, "google_oauth", "width=500,height=600");
  let pollTimer = setInterval(function() {
    try {
      if (!win || win.closed) {
        clearInterval(pollTimer);
        cloudStatusDiv.innerHTML = "Google ile giriş iptal edildi!";
        return;
      }
      if (win.location.href.startsWith(redirectUri)) {
        clearInterval(pollTimer);
        let hash = win.location.hash;
        if(hash) {
          let params = new URLSearchParams(hash.substring(1));
          googleAccessToken = params.get("access_token");
          win.close();
          if (googleAccessToken) {
            cloudStatusDiv.innerHTML = "Google Drive bağlantısı başarılı!";
          } else {
            cloudStatusDiv.innerHTML = "Google Drive bağlantısı başarısız!";
          }
        }
      }
    } catch(e) {}
  }, 700);
};

async function findGoogleDriveFile(filename) {
  if(!googleAccessToken) return null;
  let url = `https://www.googleapis.com/drive/v3/files?q=name='${filename}' and trashed=false`;
  let res = await fetch(url, {
    headers: { "Authorization": "Bearer " + googleAccessToken }
  });
  if(!res.ok) return null;
  let json = await res.json();
  if(json.files && json.files.length > 0) return json.files[0].id;
  return null;
}

async function uploadToGoogleDrive(filename, data) {
  if(!googleAccessToken) {
    cloudStatusDiv.innerHTML = "Önce Google ile bağlan!";
    return false;
  }
  let fileId = await findGoogleDriveFile(filename);
  let method = fileId ? "PATCH" : "POST";
  let url = fileId ?
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  let body, headers;
  if(fileId) {
    body = data;
    headers = {
      "Authorization": "Bearer " + googleAccessToken,
      "Content-Type": "application/json"
    };
  } else {
    let metadata = {
      name: filename,
      mimeType: "application/json"
    };
    let boundary = "emmaBoundary";
    body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`
      + JSON.stringify(metadata)
      + `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n`
      + data
      + `\r\n--${boundary}--`;
    headers = {
      "Authorization": "Bearer " + googleAccessToken,
      "Content-Type": `multipart/related; boundary=${boundary}`
    };
  }
  let res = await fetch(url, {
    method: method,
    headers: headers,
    body: body
  });
  if(res.ok) {
    cloudStatusDiv.innerHTML = "Emma'nın hafızası Drive'a yedeklendi!";
    return true;
  } else {
    cloudStatusDiv.innerHTML = "Drive'a yedeklenemedi!";
    return false;
  }
}

async function loadFromGoogleDrive(filename) {
  if(!googleAccessToken) {
    cloudStatusDiv.innerHTML = "Önce Google ile bağlan!";
    return null;
  }
  let fileId = await findGoogleDriveFile(filename);
  if(!fileId) {
    cloudStatusDiv.innerHTML = "Drive'da yedek dosyası yok!";
    return null;
  }
  let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  let res = await fetch(url, {
    headers: { "Authorization": "Bearer " + googleAccessToken }
  });
  if(res.ok) {
    cloudStatusDiv.innerHTML = "Drive'dan Emma'nın hafızası alındı!";
    return await res.text();
  } else {
    cloudStatusDiv.innerHTML = "Drive'dan dosya alınamadı!";
    return null;
  }
}

cloudSyncBtn.onclick = async function() {
  let memory = localStorage.getItem("emmaMemory");
  let ok = await uploadToGoogleDrive(GDRIVE_FILE_NAME, memory);
  if(ok) cloudStatusDiv.innerHTML += "<br>Emma'nın hafızası buluta yedeklendi!";
};

cloudLoadBtn.onclick = async function() {
  let data = await loadFromGoogleDrive(GDRIVE_FILE_NAME);
  if(data){
    localStorage.setItem("emmaMemory", data);
    cloudStatusDiv.innerHTML += "<br>Drive'dan hafıza başarıyla geri yüklendi!";
    location.reload();
  }
};