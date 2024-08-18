const mysql = require('mysql2');  // Asegúrate de estar usando 'mysql2'

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'neo_usuario',       // El nuevo usuario que creaste
    password: 'neo_contraseña', // La contraseña que asignaste
    database: 'login'          // La base de datos que estás usando
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL con mysql2');
});

module.exports = connection;
