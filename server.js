const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// JSON verilerini okuyabilmek için middleware
app.use(express.json());

// Güvenlik: Yetkisiz kişilerin komut göndermesini engellemek için API Anahtarı
const API_SECRET = process.env.API_SECRET || "evtol-secret-key-123";

// Güvenlik Middleware (Ana sayfa hariç tüm isteklerde x-api-key kontrolü yapar)
app.use((req, res, next) => {
    if (req.path === '/') return next();
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== API_SECRET) {
        return res.status(401).json({ 
            status: "error", 
            message: "Yetkisiz Erişim! Geçersiz veya eksik API Anahtarı." 
        });
    }
    next();
});

// eVTOL Anlık Durum (Telemetri) Verileri
let telemetryData = {
    connected: true,
    battery: 98,
    armed: false,
    offboard_active: false,
    position: { x: 0.0, y: 0.0, z: 0.0 }
};

// 1. Ana Sayfa (Sistem Durum Kontrolü)
app.get('/', (req, res) => {
    res.json({
        status: "online",
        system: "eVTOL Jetson Orin ROS2 API Bridge",
        version: "1.1.0"
    });
});

// 2. Telemetri Bilgisini Okuma Uç Noktası (Telefondan drone'un durumunu görmek için)
app.get('/api/v1/telemetry', (req, res) => {
    res.json({ 
        status: "success", 
        telemetry: telemetryData 
    });
});

// 3. Konum (Setpoint) Gönderme Uç Noktası
app.post('/api/v1/set-position', (req, res) => {
    const { x, y, z, yaw } = req.body;

    if (x === undefined || y === undefined || z === undefined) {
        return res.status(400).json({ 
            status: "error", 
            message: "Eksik koordinat bilgisi! x, y ve z zorunludur." 
        });
    }

    console.log(`[HEDEF KOMUTU] X: ${x}, Y: ${y}, Z: ${z}, Yaw: ${yaw || 0.0}`);

    res.json({
        status: "success",
        message: "Position command dispatched to Jetson Orin ROS2 pipeline",
        setpoint: { x, y, z, yaw: yaw || 0.0 }
    });
});

// 4. Sistemi Aktif/Pasif Etme (Offboard Enable) Uç Noktası
app.post('/api/v1/enable', (req, res) => {
    const { enable } = req.body;

    if (enable === undefined) {
        return res.status(400).json({ 
            status: "error", 
            message: "enable parametresi gereklidir (true/false)." 
        });
    }

    telemetryData.offboard_active = !!enable;
    console.log(`[OFFBOARD DURUMU] ${enable ? "AKTİF EDİLDİ" : "PASİF HALE GETİRİLDİ"}`);

    res.json({
        status: "success",
        offboard_state: enable ? "ENABLED" : "DISABLED"
    });
});

// Sunucuyu Başlat
app.listen(PORT, '0.0.0.0', () => {
    console.log(`eVTOL API Server is running and listening on port ${PORT}`);
});
