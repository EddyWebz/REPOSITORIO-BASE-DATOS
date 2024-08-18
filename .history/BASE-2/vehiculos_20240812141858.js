const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const connection = require('./database/database'); // Importa la conexión a la base de datos MySQL.

// Configuración de multer para la carga de imágenes.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './BASE-2/uploads/'); // Carpeta donde se guardarán las imágenes.
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nombre único para cada archivo.
    }
});
const upload = multer({ storage: storage }); // Instancia de multer con la configuración de almacenamiento.

// Ruta para obtener todos los vehículos (Historial de Vehículos) del usuario autenticado.
router.get('/vehiculos', (req, res) => {
    const userId = req.session.userId; // Obtener el ID del usuario autenticado.
    connection.query('SELECT * FROM vehiculos WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los vehículos' }); // Manejo de errores.
        }
        res.json(results); // Respuesta con el historial de vehículos.
    });
});

// Ruta para guardar un nuevo vehículo asociado al usuario autenticado.
router.post('/api/vehiculos', upload.array('image', 4), (req, res) => {
    const record = {
        datetime: req.body.datetime,
        brand: req.body.brand,
        model: req.body.model,
        clave: req.body.clave,
        plate: req.body.plate,
        color: req.body.color,
        owner: req.body.owner,
        stayNights: req.body.stayNights,
        habitacion: req.body.habitacion,
        garage: req.body.garage,
        observations: req.body.observations,
        images: JSON.stringify(req.files.map(file => `/uploads/${file.filename}`)), // Guardar las rutas de las imágenes como JSON.
        user_id: req.session.userId // Asociar el registro con el usuario autenticado.
    };

    // Inserción del nuevo registro en la base de datos.
    connection.query('INSERT INTO vehiculos SET ?', record, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar el vehículo' }); // Manejo de errores.
        }
        res.json({ id: results.insertId, ...record }); // Respuesta con el nuevo registro guardado.
    });
});

// Ruta para buscar vehículos por nombre o placa, asociados al usuario autenticado.
router.get('/vehiculos/search', (req, res) => {
    const userId = req.session.userId; // Obtener el ID del usuario autenticado.
    const search = `%${req.query.query.toLowerCase()}%`; // Buscar por coincidencia parcial en nombre o placa.
    connection.query(
        'SELECT * FROM vehiculos WHERE (LOWER(plate) LIKE ? OR LOWER(owner) LIKE ?) AND user_id = ?',
        [search, search, userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al buscar vehículos' }); // Manejo de errores.
            }
            res.json(results); // Respuesta con los resultados de la búsqueda.
        }
    );
});

module.exports = router; // Exporta el enrutador para ser utilizado en la aplicación principal.
