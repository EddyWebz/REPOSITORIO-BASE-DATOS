const express = require('express');
const router = express.Router();
const connection = require('./database/database');

// Función auxiliar para calcular la hora estimada de salida
function calcularHoraSalida(horaIngreso, numeroNoches) {
    const fechaHoraIngreso = new Date(horaIngreso);
    const horasPorNoche = 21.5; // Desde las 15:00 hasta las 12:30 del día siguiente
    return fechaHoraIngreso.getTime() + (numeroNoches * horasPorNoche * 60 * 60 * 1000);
}

// Ruta para obtener notificaciones activas filtradas por user_id
router.get('/api/notificaciones', async (req, res) => {
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

    try {
        const now = new Date();
        const inicioDia = new Date(now.setHours(7, 0, 0, 0)); // Hoy a las 7:00 AM
        const finDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000); // 24 horas después

        const notificaciones = await connection.query(`
            SELECT habitacion, placa, garage
            FROM vehiculos
            WHERE user_id = ? AND datetime BETWEEN ? AND ?
            ORDER BY garage ASC, habitacion ASC
        `, [user_id, inicioDia, finDia]);

        const data = {
            P1: [],
            P2: []
        };

        notificaciones.forEach(registro => {
            if (registro.garage === 'P1') {
                data.P1.push({
                    habitacion: registro.habitacion,
                    placa: registro.placa
                });
            } else if (registro.garage === 'P2') {
                data.P2.push({
                    habitacion: registro.habitacion,
                    placa: registro.placa
                });
            }
        });

        res.json(data);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).send('Error del servidor');
    }
});

// Ruta para generar reportes filtrados por user_id y fechas
router.get('/api/reportes', async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

    try {
        const reportes = await connection.query(`
            SELECT habitacion, placa, garage
            FROM vehiculos
            WHERE user_id = ? AND fecha_ingreso BETWEEN ? AND ?
            ORDER BY garage ASC, habitacion ASC
        `, [user_id, fechaInicio, fechaFin]);

        const data = {
            P1: [],
            P2: []
        };

        reportes.forEach(registro => {
            if (registro.garage === 'P1') {
                data.P1.push({
                    habitacion: registro.habitacion,
                    placa: registro.placa
                });
            } else if (registro.garage === 'P2') {
                data.P2.push({
                    habitacion: registro.habitacion,
                    placa: registro.placa
                });
            }
        });

        res.json(data);
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
