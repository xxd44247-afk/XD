const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => { res.send("8 Tokenli Hızlı Sistem Aktif (Yazıyor Kapalı)"); });
app.listen(PORT, () => { console.log(`Sunucu ${PORT} portunda aktif.`); });

// Render Environment Variables'dan gelen virgüllü listeyi parçalara ayırıyoruz
const tokensRaw = process.env.TOKENS || "";
const tokens = tokensRaw.split(",").map(t => t.trim()).filter(t => t !== "");

const channelId = process.env.CHANNEL_ID;
const message1 = process.env.MESSAGE1;
const message2 = process.env.MESSAGE2;

let currentTokenIndex = 0; 
let isFirstMessage = true; 

async function startSequence() {
    // Güvenlik Kontrolü
    if (tokens.length === 0 || !channelId || !message1 || !message2) {
        console.error("❌ HATA: Değişkenler eksik! TOKENS, CHANNEL_ID, MESSAGE1 veya MESSAGE2'yi kontrol et.");
        return;
    }

    const currentToken = tokens[currentTokenIndex];
    const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
    
    const headers = {
        "Authorization": currentToken.replace(/"/g, ""), // Varsa tırnak işaretlerini temizler
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    };

    const currentMsg = isFirstMessage ? message1 : message2;

    try {
        // Doğrudan Mesaj Gönderimi (Yazıyor efekti yok)
        await axios.post(url, { content: currentMsg }, { headers });
        console.log(`✅ [Hesap ${currentTokenIndex + 1}] Mesaj Gönderildi.`);
    } catch (err) {
        console.error(`❌ [Hesap ${currentTokenIndex + 1}] Hata: ${err.response?.status}`);
        // 401 hatası gelirse o token patlamış demektir
    }

    // --- SIRALAMAYI GÜNCELLE ---
    currentTokenIndex = (currentTokenIndex + 1) % tokens.length; // 1'den 8'e kadar döner
    isFirstMessage = !isFirstMessage; // M1 ve M2 arasında geçiş yapar

    // İstediğin gibi her mesaj arası 1 saniye (1000ms) bekleme
    setTimeout(startSequence, 1000);
}

// Sistemi Başlat
if (tokens.length > 0) {
    console.log(`🚀 ${tokens.length} adet token ile döngü başlıyor...`);
    startSequence();
} else {
    console.error("HATA: TOKENS bulunamadı!");
}
