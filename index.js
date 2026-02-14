const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => { res.send("Bot 'Çift Mesaj' Modunda aktif."); });
app.listen(PORT, () => { console.log(`Sunucu ${PORT} portunda aktif.`); });

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
// İki farklı mesajı alıyoruz
const message1 = process.env.MESSAGE1;
const message2 = process.env.MESSAGE2;

let currentMessageIsFirst = true; // Sırayla göndermek için kontrol değişkeni

const getRandomTime = (min, max) => Math.floor(Math.random() * (max - min + 1) + min) * 1000;

async function startSequence() {
    const url = `https://discord.com/api/v9/channels/${channelId}`;
    const headers = {
        "Authorization": token,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    };

    // Hangi mesajın gönderileceğini seç
    const messageToSend = currentMessageIsFirst ? message1 : message2;

    try {
        console.log(`--- Döngü Başladı (${currentMessageIsFirst ? "Mesaj 1" : "Mesaj 2"}) ---`);
        
        // 1. Yazıyor efekti
        await axios.post(`${url}/typing`, {}, { headers });
        
        // 2. 3-5 saniye yazıyor simülasyonu
        const writingTime = getRandomTime(3, 5);
        await new Promise(resolve => setTimeout(resolve, writingTime));

        // 3. Mesajı gönder
        await axios.post(`${url}/messages`, { content: messageToSend }, { headers });
        console.log(`✅ Gönderildi: ${messageToSend.substring(0, 20)}...`);

        // Sıradaki mesajı değiştir
        currentMessageIsFirst = !currentMessageIsFirst;

        // 4. Bekleme süresi (Toplam 10 saniyeyi aşmamak için 3-5 sn ara)
        const nextLoop = getRandomTime(3, 5);
        setTimeout(startSequence, nextLoop);

    } catch (err) {
        console.error(`❌ Hata: ${err.response?.status || 'Bağlantı hatası'}`);
        setTimeout(startSequence, 20000); // Hata durumunda dinlen
    }
}

if (token && channelId && message1 && message2) {
    startSequence();
} else {
    console.error("HATA: Değişkenler (MESSAGE1 veya MESSAGE2) eksik!");
}
