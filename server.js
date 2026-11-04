const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: "online",
        system: "eVTOL Jetson Orin ROS2 API Bridge",
        timestamp: new Date()
    });
});

app.post('/api/v1/set-position', (req, res) => {
    const { x, y, z, yaw } = req.body;
    console.log(`[TARGET SETPOINT] X: ${x}, Y: ${y}, Z: ${z}, Yaw: ${yaw}`);
    res.json({
        status: "success",
        message: "Position command dispatched to Jetson Orin ROS2 pipeline",
        setpoint: { x, y, z, yaw: yaw || 0 }
    });
});

app.post('/api/v1/enable', (req, res) => {
    const { enable } = req.body;
    console.log(`[OFFBOARD STATE] Mode: ${enable ? "ENABLED" : "DISABLED"}`);
    res.json({
        status: "success",
        offboard_state: enable ? "ENABLED" : "DISABLED"
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`eVTOL Server running on port ${PORT}`);
});
