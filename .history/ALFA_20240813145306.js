const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const connection = require('./database/database');

// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'BASE-2/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Ruta para registrar un nuevo vehículo
router.post('/register', upload.array('image'), (req, res) => {
    const user_id = req.session.userId;  // Obtener el user_id de la sesión

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado. Por favor, inicie sesión.' });
    }

    const { datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);
    const imagesJson = JSON.stringify(images);  // Convertir a JSON válido

    const query = 'INSERT INTO vehiculos (datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, JSON.stringify(images), user_id];
    
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
    const user_id = req.session.userId;  // Obtener el user_id de la sesión
    connection.query('SELECT * FROM vehiculos WHERE user_id = ? ORDER BY id DESC', [user_id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });

        const vehicles = results.map(vehicle => {
            let images = [];
            try {
                images = JSON.parse(vehicle.images);  // Parsear JSON de imágenes
            } catch (e) {
                console.error('Error al parsear JSON de imágenes:', e);
            }
            return {
                ...vehicle,
                images
            };
        }));

        res.json(vehicles);
    });
});

// Ruta para buscar vehículos por nombre o placa
router.get('/search', (req, res) => {
    const user_id = req.session.userId;  // Obtener el user_id de la sesión
    const query = req.query.query;
    connection.query('SELECT * FROM vehiculos WHERE (owner LIKE ? OR plate LIKE ?) AND user_id = ?', [`%${query}%`, `%${query}%`, user_id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });

        const vehicles = results.map(vehicle => ({
            ...vehicle,
            images: JSON.parse(vehicle.images)
        }));

        res.json(vehicles);
    });
});

module.exports = router;
