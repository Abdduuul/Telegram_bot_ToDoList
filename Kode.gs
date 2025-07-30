// =================================================================
// =====           KONFIGURASI WAJIB DIISI                   =====
// =================================================================
// Ganti dengan token bot yang Anda dapatkan dari BotFather
const TOKEN = "GANTI_DENGAN_TOKEN_BOT_TELEGRAM_ANDA";

// Ganti dengan ID Spreadsheet yang sudah Anda siapkan
const SHEET_ID = "GANTI_DENGAN_ID_SPREADSHEET_ANDA";
// =================================================================


// --- Variabel Global (Tidak perlu diubah) ---
const tgUrl = "https://api.telegram.org/bot" + TOKEN;
const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('tugas');
const userProperties = PropertiesService.getUserProperties();


/**
 * Fungsi utama yang dijalankan saat Telegram mengirim update (pesan, tombol, dll).
 * Ini adalah pintu gerbang untuk semua interaksi.
 * @param {Object} e - Objek event yang dikirim oleh webhook.
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);

    // Menangani ketika pengguna menekan tombol inline (misal: tombol "Selesaikan")
    if (contents.callback_query) {
      handleCallbackQuery(contents.callback_query);
      return;
    }

    // Menangani pesan teks biasa dari pengguna
    if (contents.message) {
      handleMessage(contents.message);
    }
  } catch (err) {
    // Mencatat error jika terjadi masalah, berguna untuk debugging
    Logger.log(err.toString());
  }
}

/**
 * Memproses pesan teks yang masuk.
 * @param {Object} message - Objek pesan dari Telegram.
 */
function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const userState = userProperties.getProperty(String(chatId));

  // Jika pengguna sedang dalam proses 'menambah tugas', maka teks apapun
  // yang dikirim akan dianggap sebagai deskripsi tugas baru.
  if (userState === 'MENUNGGU_TUGAS') {
    tambahTugasKeSheet(chatId, text);
    userProperties.deleteProperty(String(chatId)); // Hapus status agar kembali normal
    return;
  }

  // Menangani navigasi menu utama berdasarkan teks tombol yang ditekan
  switch (text) {
    case "➕ Tambah Tugas":
      // Menyiapkan bot untuk menerima input tugas
      userProperties.setProperty(String(chatId), 'MENUNGGU_TUGAS');
      sendMessage(chatId, "✍️ Oke, silakan ketik tugas baru yang ingin kamu tambahkan:");
      break;
    case "👀 Lihat Tugas":
      lihatTugas(chatId);
      break;
    case "✅ Selesaikan Tugas":
      tampilkanTugasUntukDiselesaikan(chatId);
      break;
    default: // Termasuk saat pengguna mengirim /start atau teks acak
      kirimMenuUtama(chatId);
      break;
  }
}

/**
 * Memproses callback query yang masuk (saat tombol inline ditekan).
 * @param {Object} callbackQuery - Objek callback_query dari Telegram.
 */
function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data; // Data yang kita sematkan di tombol, misal: "selesaikan_1"
  const messageId = callbackQuery.message.message_id;
  const callbackQueryId = callbackQuery.id;

  // Jika data callback diawali dengan "selesaikan_"
  if (data.startsWith("selesaikan_")) {
    const taskId = data.split("_")[1]; // Ambil ID tugas dari data callback
    tandaiTugasSelesai(taskId, chatId, messageId);
  }

  // Memberi tahu Telegram bahwa kita sudah memproses callback ini
  // agar tanda loading di tombol pengguna hilang.
  UrlFetchApp.fetch(tgUrl + "/answerCallbackQuery?callback_query_id=" + callbackQueryId);
}


// =================================================================
// --- FUNGSI-FUNGSI UTAMA BOT ---
// =================================================================

/**
 * Mengirim menu utama dengan keyboard custom.
 * @param {number} chatId - ID chat tujuan.
 */
function kirimMenuUtama(chatId) {
  const text = "👋 Halo! Selamat datang di Bot To-Do List.\n\nSilakan pilih menu di bawah ini untuk memulai:";
  const keyboard = {
    "keyboard": [
      ["➕ Tambah Tugas"],
      ["👀 Lihat Tugas", "✅ Selesaikan Tugas"]
    ],
    "resize_keyboard": true, // Ukuran tombol menyesuaikan
    "one_time_keyboard": false // Keyboard tidak hilang setelah ditekan
  };
  sendMessage(chatId, text, keyboard);
}

/**
 * Menambah tugas baru ke dalam Google Sheet.
 * @param {number} chatId - ID chat pengguna (untuk mengirim balasan).
 * @param {string} tugasText - Deskripsi tugas dari pengguna.
 */
function tambahTugasKeSheet(chatId, tugasText) {
  try {
    const lastRow = sheet.getLastRow();
    // Membuat ID unik sederhana dengan menambah 1 dari ID terakhir
    const newId = lastRow > 0 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
    
    // PERUBAHAN: Menambahkan baris baru ke sheet tanpa chatId, dan dengan kolom Tanggal Selesai kosong.
    sheet.appendRow([newId, tugasText, "Aktif", new Date(), ""]); // Kolom E: Tanggal Diselesaikan sengaja dikosongkan
    
    sendMessage(chatId, `✅ Tugas baru berhasil ditambahkan:\n\n*${tugasText}*`);
  } catch (e) {
    sendMessage(chatId, "Gagal menambahkan tugas. Terjadi kesalahan pada spreadsheet.");
    Logger.log(e);
  }
}

/**
 * Mengambil dan menampilkan semua tugas yang statusnya "Aktif".
 * @param {number} chatId - ID chat pengguna (untuk mengirim balasan).
 */
function lihatTugas(chatId) {
  const data = sheet.getDataRange().getValues();
  let listTugas = "📑 *Daftar Tugas yang Masih Aktif:*\n\n";
  let adaTugas = false;

  // Loop mulai dari 1 untuk melewati baris header
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const taskStatus = row[2]; // Kolom C: Status

    // PERUBAHAN: Filter tidak lagi menggunakan chatId, hanya berdasarkan status.
    if (taskStatus === 'Aktif') {
      listTugas += `• ${row[1]}\n`; // Kolom B: Tugas
      adaTugas = true;
    }
  }

  if (!adaTugas) {
    listTugas = "🎉 Selamat! Tidak ada tugas aktif saat ini.";
  }
  sendMessage(chatId, listTugas);
}

/**
 * Menampilkan daftar tugas aktif dengan tombol "Selesaikan" di sebelahnya.
 * @param {number} chatId - ID chat pengguna (untuk mengirim balasan).
 */
function tampilkanTugasUntukDiselesaikan(chatId) {
  const data = sheet.getDataRange().getValues();
  const inlineKeyboard = [];
  let adaTugas = false;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const taskStatus = row[2];

    // PERUBAHAN: Filter tidak lagi menggunakan chatId.
    if (taskStatus === 'Aktif') {
      const taskId = row[0]; // Kolom A: ID
      const taskText = row[1];
      
      // Membuat satu baris tombol untuk setiap tugas
      inlineKeyboard.push([
        { text: `Selesaikan: ${taskText.substring(0, 25)}...`, callback_data: `selesaikan_${taskId}` }
      ]);
      adaTugas = true;
    }
  }

  if (adaTugas) {
    sendMessage(chatId, "👇 Pilih tugas yang ingin ditandai selesai:", { inline_keyboard: inlineKeyboard });
  } else {
    sendMessage(chatId, "🎉 Hebat! Tidak ada tugas yang perlu diselesaikan.");
  }
}

/**
 * Menemukan tugas berdasarkan ID, mengubah statusnya, dan mencatat tanggal selesai.
 * @param {string|number} taskId - ID tugas yang akan diselesaikan.
 * @param {number} chatId - ID chat pengguna.
 * @param {number} messageId - ID pesan yang berisi tombol, untuk diedit.
 */
function tandaiTugasSelesai(taskId, chatId, messageId) {
  const data = sheet.getDataRange().getValues();
  let tugasSelesaiText = "";

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(taskId)) {
      // PERUBAHAN: Mengisi kolom Status dan Tanggal Diselesaikan.
      sheet.getRange(i + 1, 3).setValue("Selesai"); // Kolom C: Status
      sheet.getRange(i + 1, 5).setValue(new Date()); // Kolom E: Tanggal Diselesaikan
      tugasSelesaiText = data[i][1];
      break;
    }
  }
  
  // Mengedit pesan asli untuk memberi konfirmasi dan menghapus tombol
  if (tugasSelesaiText) {
    const newText = `👍 Berhasil menyelesaikan tugas:\n*${tugasSelesaiText}*`;
    editMessage(chatId, messageId, newText);
  }
}


// =================================================================
// --- FUNGSI BANTUAN (HELPER) ---
// =================================================================

/**
 * Fungsi umum untuk mengirim pesan ke Telegram.
 * @param {number} chatId - ID chat tujuan.
 * @param {string} text - Teks pesan yang akan dikirim.
 * @param {Object} [keyboard] - Opsional: Objek keyboard (reply atau inline).
 */
function sendMessage(chatId, text, keyboard) {
  const payload = {
    'method': 'sendMessage',
    'chat_id': String(chatId),
    'text': text,
    'parse_mode': 'Markdown',
  };
  if (keyboard) {
    payload.reply_markup = JSON.stringify(keyboard);
  }
  UrlFetchApp.fetch(tgUrl + '/', { method: 'post', payload: payload });
}

/**
 * Mengedit teks pesan yang sudah ada di chat.
 * @param {number} chatId - ID chat tujuan.
 * @param {number} messageId - ID pesan yang akan diedit.
 * @param {string} text - Teks baru untuk pesan tersebut.
 */
function editMessage(chatId, messageId, text) {
  const payload = {
    'method': 'editMessageText',
    'chat_id': String(chatId),
    'message_id': String(messageId),
    'text': text,
    'parse_mode': 'Markdown'
  };
  UrlFetchApp.fetch(tgUrl + '/', { method: 'post', payload: payload });
}


// =================================================================
// --- FUNGSI SETUP (HANYA DIJALANKAN SEKALI) ---
// =================================================================

/**
 * Mendaftarkan URL Web App kita ke Telegram (webhook).
 * Telegram akan mengirim semua update ke URL ini.
 */
function setWebhook() {
  // GANTI URL INI dengan URL Web App Anda setelah deploy
  const webAppUrl = "GANTI_DENGAN_URL_WEB_APP_ANDA_SETELAH_DEPLOY";
  const response = UrlFetchApp.fetch(tgUrl + "/setWebhook?url=" + webAppUrl);
  Logger.log(response.getContentText());
}

/**
 * (Opsional) Untuk menghapus webhook jika terjadi masalah.
 */
function deleteWebhook() {
  const response = UrlFetchApp.fetch(tgUrl + "/setWebhook?url=");
  Logger.log(response.getContentText());
}
