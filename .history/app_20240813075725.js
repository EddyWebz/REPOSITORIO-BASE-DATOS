const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path'); // Importa el módulo path para manejar rutas de archivos
const connection = require('./database/database'); // Importa la conexión desde database.js
const session = require('express-session'); // Importa express-session para manejar sesiones

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la sesión
app.use(session({
    secret: 'c7b226554f4666a11164ac960f8f807b140116defe512e297e73d1b04a043231', // Secreto de sesión seguro
    resave: false, // No guarda la sesión si no hay cambios
    saveUninitialized: false, // No guarda sesiones vacías
    cookie: {
        secure: false, // Configúralo como true si usas HTTPS
        httpOnly: true, // Asegura que la cookie no sea accesible desde JavaScript
        maxAge: 24 * 60 * 60 * 1000 // Duración de la cookie: 24 horas
    }
}));

// Servir archivos estáticos desde la carpeta 'BASE-2'
app.use(express.static(path.join(__dirname, 'BASE-2')));

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'BASE-2/uploads')));

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next(); // Si está autenticado, continúa con la siguiente función
    } else {
        res.redirect('/login'); // Si no está autenticado, redirige al inicio de sesión
    }
}

// Proteger la ruta a cuerpo.html (que está fuera de la carpeta pública)
app.get('/privado/cuerpo.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'cuerpo.html')); // Envía el archivo cuerpo.html si está autenticado
});
// Importar y usar las rutas de vehiculos.js
const vehiculosRoutes = require('./ALFA.js');  // Asegúrate de que la ruta al archivo vehiculos.js sea correcta
app.use('/vehiculos', vehiculosRoutes);  // Configura la ruta base para vehiculos.js

// Ruta para servir la página de inicio de sesión desde la carpeta pública
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'BASE-2', 'index.html')); // Ajusta el nombre del archivo según corresponda
});

// Ruta de registro de usuarios
app.post('/register', (req, res) => {
    const { nombre, email, password } = req.body;

    const checkEmailSql = 'SELECT email FROM usuarios WHERE email = ?';
    connection.query(checkEmailSql, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // Si el correo ya existe, enviar un mensaje de error
            return res.status(409).send('El correo ya está registrado');
        } else {
            // Si el correo no existe, proceder con el registro
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) throw err;

                const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
                connection.query(sql, [nombre, email, hash], (err, result) => {
                    if (err) {
                        res.status(500).send('Error al registrar el usuario');
                        throw err;
                    }
                    res.status(200).send('Usuario registrado con éxito');
                });
            });
        }
    });
});

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Buscar el usuario por email
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(sql, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // Comparar la contraseña hasheada
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    req.session.userId = results[0].id; // Almacena el ID del usuario en la sesión
                    res.status(200).send('Inicio de sesión exitoso');
                } else {
                    res.status(401).send('Contraseña incorrecta');
                }
            });
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    });
});


// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
