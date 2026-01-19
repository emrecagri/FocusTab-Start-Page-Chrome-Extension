# FocusTab - Personalized Focus & Zen Dashboard

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://go.emrecb.com/focustab-start-page-web-store)
![Version](https://img.shields.io/badge/version-9.2.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-GNU-green?style=for-the-badge)

[🇹🇷 Türkçe](#-türkçe) | [🇬🇧 English](#-english)

---

## 🇹🇷 Türkçe

**FocusTab**, tarayıcınızın varsayılan "Yeni Sekme" sayfasını, üretkenliği artıran ve zihinsel dinginlik sağlayan güçlü bir kişisel panele dönüştüren kapsamlı bir Google Chrome eklentisidir. Görev yönetimi ile rahatlama arasındaki köprüyü kurarak, özelleştirilebilir bir atmosfer eşliğinde günlük hedeflerinize odaklanmanızı sağlar.

### 🌟 Temel Özellikler

#### 1. Üretkenlik ve Odak Yönetimi
* **🍅 Pomodoro Zamanlayıcı:** Entegre sayaç ile 25 dakikalık odaklanma periyotları (sesli ve görsel bildirimli).
* **🎯 Günlük Odak (Daily Focus):** Günün en önemli görevini belirleme, tamamlama ve takip etme alanı.
* **📝 Todo Listesi:** Ana ekranı kalabalıklaştırmadan yan panelde açılan pratik görev yönetimi.
* **🚀 Akıllı Kısayollar:** İkonları otomatik çekilen, sık kullanılan web siteleri için hızlı erişim.

#### 2. Atmosfer ve Ses Mikseri (Soundscape)
Çalışma ortamınızı kişiselleştirmek için **18 farklı ortam sesini** karıştırın:
* Yağmur, Kamp Ateşi, Kafe, Orman, Dalgalar, Klavye sesi, Beyaz Gürültü ve daha fazlası.
* **Ses Kontrolü:** Her ses kanalı için bağımsız ses seviyesi ayarı.

#### 3. Zen Modu (Derin Odaklanma)
* **Tek Tuşla Sadeli:** Dikkat dağıtıcı tüm öğeleri (saat, hava durumu vb.) gizler.
* **Akıllı Çıkış:** Fareyi hareket ettirdiğinizde beliren buton ile akışı bozmadan moddan çıkabilirsiniz.

#### 4. Görsel ve Teknik Özelleştirme
* **🖼️ Dinamik Arka Planlar:** Unsplash API entegrasyonu ile yüksek kaliteli manzaralar veya Özel Resim URL'si.
* **☁️ Canlı Hava Durumu:** Open-Meteo API ile bulunduğunuz konuma göre anlık durum bilgisi.
* **🌍 Çoklu Dil Desteği (i18n):** Türkçe, İngilizce, Almanca ve İspanyolca dillerine tam uyumlu.
* **🎨 Kişiselleştirme:** İsimle selamlama, arka plan bulanıklığı (blur) ve karartma ayarları.

---

### 🛠️ Kullanılan Teknolojiler

* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Platform:** Chrome Extension API (Manifest V3)
* **Veri Yönetimi:** `chrome.storage.local` (Ayarlar ve görevlerin saklanması)
* **API Entegrasyonları:**
    * [Open-Meteo](https://open-meteo.com/) (Hava Durumu)
    * [Unsplash Source](https://source.unsplash.com/) (Arka Planlar)

---

### 🚀 Kurulum (Geliştiriciler İçin)

Projeyi yerel ortamınızda çalıştırmak veya geliştirmek isterseniz:

1.  **Repoyu klonlayın:**
    ```bash
    git clone [https://github.com/emrecagri/FocusTab-Start-Page-Chrome-Extension.git)
    ```
2.  **Chrome Uzantılarını Açın:**
    * Tarayıcıda `chrome://extensions/` adresine gidin.
3.  **Geliştirici Modunu Açın:**
    * Sağ üst köşedeki anahtarı aktif hale getirin.
4.  **Paketlenmemiş Öğe Yükle:**
    * "Paketlenmemiş öğe yükle" (Load unpacked) butonuna tıklayın ve proje klasörünü seçin.

---
---

## 🇬🇧 English

**FocusTab** is a robust Google Chrome extension designed to transform the default “New Tab” page into a productivity hub and a sanctuary for mental clarity. It bridges the gap between task management and relaxation, allowing users to stay focused on their daily goals while immersing themselves in a customizable audio-visual environment.

### 🌟 Key Features

#### 1. Productivity & Focus Management
* **🍅 Pomodoro Timer:** Built-in focus timer (standard 25-min intervals) with visual and audio notifications.
* **🎯 Daily Focus:** A dedicated input area to define, track, and check off the single most important task of the day.
* **📝 Todo List Sidebar:** A slide-out panel to manage tasks seamlessly without cluttering the main view.
* **🚀 Smart Shortcuts:** Add and manage quick links to favorite websites with automatic favicon fetching.

#### 2. Ambient Sound Mixer (Soundscape)
Create your perfect background atmosphere by mixing up to **18 different high-quality ambient sounds**:
* Rain, Fireplace, Cafe, Forest, Waves, Keyboard typing, White Noise, and more.
* **Volume Control:** Independent volume sliders for each sound channel.

#### 3. Zen Mode (Deep Work)
* **Declutter Instantly:** One-click mode to hide all distractions (clock, weather, widgets).
* **Smart Exit:** Features a “mouse-over” reveal mechanism to exit the mode without breaking visual minimalism.

#### 4. Customization & Utilities
* **🖼️ Dynamic Backgrounds:** High-quality wallpapers via Unsplash API or Custom Image URLs.
* **☁️ Live Weather:** Real-time temperature and conditions via Open-Meteo API based on your location.
* **🌍 Localization (i18n):** Full UI support for English, Turkish, German, and Spanish.
* **🎨 Personalization:** Time-based greetings ("Good Morning"), adjustable blur, and overlay opacity settings.

---

### 🛠️ Tech Stack

* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Platform:** Chrome Extension API (Manifest V3)
* **Data Persistence:** `chrome.storage.local` (User preferences and tasks)
* **APIs Used:**
    * [Open-Meteo](https://open-meteo.com/) (Weather Data)
    * [Unsplash Source](https://source.unsplash.com/) (Images)

---

### 🚀 Installation (For Developers)

If you want to run this extension locally or contribute:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/emrecagri/FocusTab-Start-Page-Chrome-Extension.git)
    ```
2.  **Open Chrome Extensions Management:**
    * Navigate to `chrome://extensions/` in your browser.
3.  **Enable Developer Mode:**
    * Toggle the switch on the top right corner.
4.  **Load Unpacked:**
    * Click the "Load unpacked" button and select the folder where you cloned this repository.

---

## 📸 Screenshots / Ekran Görüntüleri

| Dashboard View | Zen Mode |
|:---:|:---:|
| ![Dashboard](path/to/screenshot1.png) | ![Zen Mode](path/to/screenshot2.png) |
## 📂 Project Structure

```text
FocusTab/
├── _locales/          # i18n JSON files (en, tr, de, es)
├── assets/            # Icons, images, and static resources
├── css/               # Stylesheets (Main, Zen Mode, Sidebar)
├── js/                # Logic (Background, Weather, Audio, Todo)
├── manifest.json      # Chrome Extension Manifest V3
└── README.md          # Documentation
