import json
import os
import getpass

# Dosya isimleri
MODULES_FILE = "modules.json"
API_KEYS_FILE = "api_keys.json"
SETTINGS_FILE = "settings.json"
USERS_FILE = "users.json"
CHAT_HISTORY_FILE = "chat_history.json"

def load_json(filename, default):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return default

def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def login():
    users = load_json(USERS_FILE, {})
    username = input("Kullanıcı adı: ")
    password = getpass.getpass("Şifre: ")
    if username in users and users[username]["password"] == password:
        print(f"Hoşgeldin {username}!")
        return username
    else:
        print("Hatalı kullanıcı adı veya şifre!")
        return None

def register():
    users = load_json(USERS_FILE, {})
    username = input("Yeni kullanıcı adı: ")
    if username in users:
        print("Bu kullanıcı adı zaten var!")
        return None
    password = getpass.getpass("Şifre: ")
    users[username] = {"password": password}
    save_json(USERS_FILE, users)
    print(f"{username} kaydedildi!")
    return username

class EmmaAdminPanel:
    def __init__(self, username):
        self.username = username
        self.modules = load_json(MODULES_FILE, [])
        self.api_keys = load_json(API_KEYS_FILE, {})
        self.settings = load_json(SETTINGS_FILE, {})
        self.chat_history = load_json(CHAT_HISTORY_FILE, [])
        self.users = load_json(USERS_FILE, {})

    def show_menu(self):
        print("\n--- Emma Admin Panel ---")
        print("1. Modül ekle")
        print("2. Modül sil")
        print("3. Modülleri görüntüle")
        print("4. API anahtarı ekle/değiştir")
        print("5. API anahtarlarını görüntüle")
        print("6. Ayar ekle/değiştir")
        print("7. Ayarları görüntüle")
        print("8. Chat geçmişi ekle")
        print("9. Chat geçmişini görüntüle")
        print("10. Kullanıcı ekle/sil/görüntüle")
        print("11. Çıkış")

    def add_module(self):
        name = input("Modül adı: ")
        type_ = input("Tip (chat/kod/grafik/video/ses/cloud/ayar/AI): ")
        self.modules.append({"name": name, "type": type_, "active": True})
        save_json(MODULES_FILE, self.modules)
        print(f"{name} ({type_}) modülü eklendi.")

    def remove_module(self):
        self.list_modules()
        idx = int(input("Silinecek modül numarası: "))
        if 0 <= idx < len(self.modules):
            removed = self.modules.pop(idx)
            save_json(MODULES_FILE, self.modules)
            print(f"{removed['name']} modülü silindi.")
        else:
            print("Geçersiz numara.")

    def list_modules(self):
        print("\nYüklü modüller:")
        for i, m in enumerate(self.modules):
            print(f"{i}: {m['name']} | {m['type']} | {'aktif' if m['active'] else 'pasif'}")

    def edit_api_keys(self):
        key_name = input("API anahtarı adı (örn: openai, google, drive): ")
        key_value = input("API anahtarı değeri: ")
        self.api_keys[key_name] = key_value
        save_json(API_KEYS_FILE, self.api_keys)
        print(f"{key_name} anahtarı güncellendi/eklendi.")

    def list_api_keys(self):
        print("\nKayıtlı API anahtarları:")
        for k, v in self.api_keys.items():
            print(f"{k}: {v}")

    def edit_settings(self):
        key = input("Ayar adı (örn: tema, avatar, ses): ")
        value = input("Ayar değeri: ")
        self.settings[key] = value
        save_json(SETTINGS_FILE, self.settings)
        print(f"{key} ayarı güncellendi/eklendi.")

    def list_settings(self):
        print("\nKayıtlı Ayarlar:")
        for k, v in self.settings.items():
            print(f"{k}: {v}")

    def add_chat(self):
        msg = input("Yeni chat mesajı: ")
        self.chat_history.append({"user": self.username, "msg": msg})
        save_json(CHAT_HISTORY_FILE, self.chat_history)
        print("Mesaj kaydedildi.")

    def list_chat_history(self):
        print("\nChat geçmişi:")
        for i, chat in enumerate(self.chat_history):
            print(f"{i}: {chat['user']} > {chat['msg']}")

    def user_management(self):
        print("\nKullanıcılar:")
        for u in self.users:
            print(f"- {u}")
        action = input("Ekle (e), Sil (s), Görüntüle (g): ").lower()
        if action == "e":
            username = input("Yeni kullanıcı adı: ")
            if username in self.users:
                print("Kullanıcı zaten var!")
                return
            password = getpass.getpass("Şifre: ")
            self.users[username] = {"password": password}
            save_json(USERS_FILE, self.users)
            print(f"{username} eklendi.")
        elif action == "s":
            username = input("Silinecek kullanıcı adı: ")
            if username in self.users:
                del self.users[username]
                save_json(USERS_FILE, self.users)
                print(f"{username} silindi.")
            else:
                print("Kullanıcı bulunamadı.")
        elif action == "g":
            print("Kullanıcı listesi:")
            for u in self.users:
                print(f"- {u}")

    def run(self):
        while True:
            self.show_menu()
            choice = input("Seçim: ")
            if choice == "1":
                self.add_module()
            elif choice == "2":
                self.remove_module()
            elif choice == "3":
                self.list_modules()
            elif choice == "4":
                self.edit_api_keys()
            elif choice == "5":
                self.list_api_keys()
            elif choice == "6":
                self.edit_settings()
            elif choice == "7":
                self.list_settings()
            elif choice == "8":
                self.add_chat()
            elif choice == "9":
                self.list_chat_history()
            elif choice == "10":
                self.user_management()
            elif choice == "11":
                print("Çıkılıyor...")
                break
            else:
                print("Geçersiz seçim.")

def main():
    print("Emma'ya Hoşgeldin!")
    while True:
        action = input("Giriş (g) / Kayıt (k) / Çıkış (ç): ").lower()
        if action == "g":
            username = login()
            if username:
                panel = EmmaAdminPanel(username)
                panel.run()
        elif action == "k":
            username = register()
            if username:
                panel = EmmaAdminPanel(username)
                panel.run()
        elif action == "ç":
            print("Güle güle!")
            break
        else:
            print("Geçersiz seçim.")

if __name__ == "__main__":
    main()