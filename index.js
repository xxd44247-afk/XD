const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot aktif: 5 saniye yazıyor görünüp mesaj atıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const message = process.env.MESSAGE;

if (!token || !channelId || !message) {
    console.error("HATA: TOKEN, CHANNEL_ID veya MESSAGE eksik!");
} else {
    // Döngü: İşlem bittikten sonra tekrar başlaması için iç içe setTimeout kullanıyoruz
    // Bu sayede 5 saniyelik yazma süresi + mesaj atma süresi birbirine karışmaz.
    startSequence();
}

async function startSequence() {
    const url = `https://discord.com/api/v9/channels/${channelId}`;
    const headers = {
        "Authorization": token,
        "Content-Type": "application/json"
    };

    try {
        console.log("--- Yeni döngü başladı ---");
        
        // 1. "Yazıyor..." efektini başlat
        await axios.post(`${url}/typing`, {}, { headers });
        console.log("👀 Yazıyor olarak görünüyor (5 saniye beklenecek)...");

        // 2. Tam 5 saniye (5000 ms) bekleme
        setTimeout(async () => {
            try {
                // 3. Mesajı gönder
                await axios.post(`${url}/messages`, { content: message }, { headers });
                console.log(`✅ Mesaj gönderildi: "${message}"`);
                
                // 4. Bir sonraki mesaj için kısa bir ara ver ve döngüyü tekrarla
                setTimeout(startSequence, 2000); 
            } catch (err) {
                console.error("❌ Mesaj hatası:", err.response?.status);
                setTimeout(startSequence, 5000); // Hata olursa 5 sn sonra tekrar dene
            }
        }, 5000); 

    } catch (err) {
        console.error("❌ Yazıyor hatası:", err.response?.status);
        setTimeout(startSequence, 5000);
    }
}
