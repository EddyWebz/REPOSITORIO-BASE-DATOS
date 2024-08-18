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

// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);  // Usar la ruta verificada
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage }); 
// Ruta para registrar un nuevo vehículo
router.post('/register', upload.array('image'), (req, res) => {
    const { datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);
    const user_id = req.session.user_id;  // Obtener el user_id de la sesión
    const query = 'INSERT INTO vehiculos (datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
    connection.query('SELECT * FROM vehicles ORDER BY id DESC', [user_id], (err, results) => {
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
        
        

