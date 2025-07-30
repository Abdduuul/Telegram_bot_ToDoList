# Bot Telegram To-Do List dengan Google Apps Script & Google Sheets

Ini adalah proyek sederhana untuk membuat bot Telegram yang berfungsi sebagai pencatat daftar tugas (To-Do List). Bot ini dibangun sepenuhnya menggunakan **Google Apps Script** dan menggunakan **Google Sheets** sebagai databasenya.

Bot ini dirancang untuk penggunaan pribadi atau tim kecil yang berbagi satu daftar tugas yang sama.

---

## ✨ Fitur

- **➕ Tambah Tugas**: Menambahkan tugas baru ke dalam daftar.
- **👀 Lihat Tugas**: Menampilkan semua tugas yang masih berstatus "Aktif".
- **✅ Selesaikan Tugas**: Menandai tugas sebagai "Selesai" dan mencatat waktu penyelesaiannya.
- **📝 Berbasis Google Sheets**: Semua data tugas tersimpan rapi di dalam spreadsheet Google Anda, mudah untuk dilihat dan dikelola.
- **🚀 Tanpa Server**: Dijalankan sepenuhnya di ekosistem Google, tidak memerlukan server atau hosting tambahan.

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda memiliki:
1.  Akun **Telegram**.
2.  Akun **Google** (untuk Google Sheets dan Apps Script).

---

## 🚀 Panduan Instalasi dan Konfigurasi

Ikuti langkah-langkah berikut untuk menjalankan bot Anda sendiri.

### Langkah 1: Buat Bot Telegram & Dapatkan Token

Anda perlu mendaftarkan bot Anda ke Telegram untuk mendapatkan kunci akses (token).

1.  Buka aplikasi Telegram, cari **@BotFather** (akun terverifikasi dengan centang biru).
2.  Mulai percakapan dan kirim perintah `/newbot`.
3.  Ikuti instruksi untuk memberikan nama dan *username* untuk bot Anda. *Username* harus unik dan diakhiri dengan `bot`.
4.  Setelah berhasil, **BotFather** akan memberikan Anda sebuah **TOKEN API**. Salin dan simpan token ini baik-baik.

### Langkah 2: Siapkan Google Sheet sebagai Database

1.  Buka [Google Sheets](https://sheets.google.com) dan buat **Spreadsheet baru**.
2.  Ganti nama *sheet* default (biasanya "Sheet1") menjadi `tugas`.
3.  Pada baris pertama, buat *header* kolom dengan struktur berikut:
    - Kolom A: `ID`
    - Kolom B: `Tugas`
    - Kolom C: `Status`
    - Kolom D: `Tanggal Dibuat`
    - Kolom E: `Tanggal Diselesaikan`
4.  Salin **ID Spreadsheet**. Anda bisa menemukannya di URL. Contoh: `https://docs.google.com/spreadsheets/d/`**`INI_ADALAH_ID_NYA`**`/edit`.

### Langkah 3: Konfigurasi Google Apps Script

1.  Dari Google Sheet yang tadi Anda buat, klik menu **Extensions** > **Apps Script**.
2.  Hapus semua kode contoh di dalam editor `Code.gs`.
3.  Salin seluruh isi file `Code.gs` dari repositori ini dan tempelkan ke editor.
4.  Isi bagian konfigurasi di bagian atas skrip:
    ```javascript
    // Ganti dengan token bot yang Anda dapatkan dari BotFather
    const TOKEN = "GANTI_DENGAN_TOKEN_BOT_TELEGRAM_ANDA";

    // Ganti dengan ID Spreadsheet yang sudah Anda siapkan
    const SHEET_ID = "GANTI_DENGAN_ID_SPREADSHEET_ANDA";
    ```

### Langkah 4: Deploy Skrip sebagai Web App

1.  Di editor Apps Script, klik tombol **Deploy** > **New deployment**.
2.  Klik ikon gerigi (⚙️) di sebelah "Select type", lalu pilih **Web app**.
3.  Pada bagian **Configuration**:
    - **Description**: Beri deskripsi (misal: "Bot Tugas Telegram v1").
    - **Execute as**: Pilih `Me`.
    - **Who has access**: Pilih `Anyone`. **(Ini sangat penting)**.
4.  Klik **Deploy**.
5.  Berikan otorisasi kepada skrip dengan mengklik **Authorize access**, memilih akun Google Anda, lalu klik **Advanced** > **Go to (unsafe)**, dan **Allow**.
6.  Setelah berhasil, sebuah jendela akan muncul menampilkan **Web app URL**. **Salin URL ini**.

### Langkah 5: Atur Webhook

Ini adalah langkah terakhir untuk menghubungkan skrip Anda ke Telegram.

1.  Kembali ke editor Apps Script.
2.  Cari fungsi `setWebhook` di bagian paling bawah kode.
3.  Ganti placeholder URL dengan **Web app URL** yang baru saja Anda salin.
    ```javascript
    function setWebhook() {
      // GANTI URL INI dengan URL Web App Anda setelah deploy
      const webAppUrl = "GANTI_DENGAN_URL_WEB_APP_ANDA_SETELAH_DEPLOY";
      const response = UrlFetchApp.fetch(tgUrl + "/setWebhook?url=" + webAppUrl);
      Logger.log(response.getContentText());
    }
    ```
4.  **Simpan proyek** (klik ikon disket atau `Ctrl` + `S`).
5.  Di bagian atas editor, pilih fungsi `setWebhook` dari menu dropdown fungsi.
6.  Klik tombol **Run**.

Bot Anda sekarang sudah aktif dan siap digunakan!

---

## ⚙️ Cara Menggunakan

1.  Buka Telegram dan cari bot Anda.
2.  Kirim pesan `/start` atau pesan apa saja untuk memunculkan menu utama.
3.  Gunakan tombol yang tersedia untuk berinteraksi dengan bot.
    - **➕ Tambah Tugas**: Bot akan meminta Anda mengetikkan tugas baru.
    - **👀 Lihat Tugas**: Bot akan menampilkan semua tugas yang belum selesai.
    - **✅ Selesaikan Tugas**: Bot akan menampilkan daftar tugas aktif dengan tombol untuk menyelesaikannya.

---

Selamat mencoba!
