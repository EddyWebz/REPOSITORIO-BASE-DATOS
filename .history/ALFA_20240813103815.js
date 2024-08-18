const fs = require('fs'); 
const express = require('express');
const multer = require('multer');
const path = require('path');
const connection = require('./database/database');  // Asegúrate de importar la conexión correctamente

const router = express.Router();

// Verificar si la carpeta uploads existe, si no, crearla
const uploadDir = path.join(__dirname, 'BASE-2/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);  // Usar la ruta verificada
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
// Ruta para registrar un nuevo vehículo
router.post('/register', upload.array('image'), (req, res) => {
    const { datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);

    const query = 'INSERT INTO vehicles (datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, JSON.stringify(images)];

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        const vehicle = { id: result.insertId, datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images };
        res.json({ success: true, vehicle });
    });
});

// Ruta para obtener el historial de vehículos
router.get('/history', (req, res) => {
    connection.query('SELECT * FROM vehicles ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });

        const vehicles = results.map(vehicle => ({
            ...vehicle,
            images: JSON.parse(vehicle.images)
        }));

        res.json(vehicles);
    });
});

// Ruta para buscar vehículos por nombre o placa
router.get('/search', (req, res) => {
    const query = req.query.query;
    connection.query('SELECT * FROM vehicles WHERE owner LIKE ? OR plate LIKE ?', [`%${query}%`, `%${query}%`], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });

        const vehicles = results.map(vehicle => ({
            ...vehicle,
            images: JSON.parse(vehicle.images)
        }));

        res.json(vehicles);
    });
});

module.exports = router;
