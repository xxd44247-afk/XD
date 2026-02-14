const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => { res.send("Bot 'Sadece Mesaj' Modunda Aktif."); });
app.listen(PORT, () => { console.log(`Sunucu ${PORT} portunda aktif.`); });

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const message1 = process.env.MESSAGE1;
const message2 = process.env.MESSAGE2;

let isFirstMessage = true;

// Rastgele süre üretici (Saniye cinsinden)
const getRandomTime = (min, max) => Math.floor(Math.random() * (max - min + 1) + min) * 1000;

async function startSequence() {
    if (!token || !channelId || !message1 || !message2) {
        console.error("❌ HATA: MESSAGE1, MESSAGE2 veya diğer değişkenler eksik!");
        return;
    }

    const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
    const headers = {
        "Authorization": token.trim(),
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    };

    const currentMsg = isFirstMessage ? message1 : message2;

    try {
        console.log(`--- Döngü: ${isFirstMessage ? "Mesaj 1" : "Mesaj 2"} gönderiliyor ---`);
        
        // Doğrudan mesajı gönder
        await axios.post(url, { content: currentMsg }, { headers });
        console.log(`✅ Gönderildi: ${currentMsg}`);

        // Mesajı değiştir
        isFirstMessage = !isFirstMessage;

        // 8 ile 10 saniye arası rastgele bekle (Ban yememek için en güvenli aralık)
        const nextLoop = getRandomTime(8, 10);
        console.log(`😴 ${nextLoop/1000} saniye ara verildi...`);
        setTimeout(startSequence, nextLoop);

    } catch (err) {
        console.error(`❌ HATA: ${err.response?.status}`);
        console.error(`❌ DETAY: ${JSON.stringify(err.response?.data)}`);
        
        // Hata (örneğin internet kesilmesi veya rate limit) durumunda 20 saniye dinlen
        setTimeout(startSequence, 20000); 
    }
}

startSequence();
