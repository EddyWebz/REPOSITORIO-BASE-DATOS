const express = require('express');
const router = express.Router();
const connection = require('./database/database');
/ Ruta para obtener notificaciones activas filtradas por user_id
router.get('/api/notificaciones', async (req, res) => {
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

// Función para calcular la hora de salida basándose en la hora de ingreso y el número de noches
function calcularHoraSalida(horaIngreso, numeroNoches) {
    const fechaHoraIngreso = new Date(horaIngreso);

    let horaSalidaEstimada;
    if (fechaHoraIngreso.getHours() < 7) {
        // Si se registra entre las 12:00 AM y las 7:00 AM, asignar a la noche anterior
        fechaHoraIngreso.setDate(fechaHoraIngreso.getDate() - 1);
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
    } else if (fechaHoraIngreso.getHours() < 15) {
        // Si se registra entre las 7:00 AM y las 15:00 horas, la noche empieza a las 15:00
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
    } else {
        // Si se registra después de las 15:00 horas, la noche empieza inmediatamente
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
    }

    // Añadir las noches correspondientes
    horaSalidaEstimada.setDate(horaSalidaEstimada.getDate() + numeroNoches - 1);

    return horaSalidaEstimada;
}

// Ruta para generar reportes filtrados por user_id y fechas
router.get('/api/reportes', async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

    try {
        const reportes = await connection.query(`
            SELECT habitacion, placa, garage, datetime, stayNights
            FROM vehiculos
            WHERE user_id = ? AND datetime BETWEEN ? AND ?
            ORDER BY garage ASC, habitacion ASC
        `, [user_id, fechaInicio, fechaFin]);

        const data = {
            P1: [],
            P2: []
        };

        reportes.forEach(registro => {
            const horaSalidaEstimada = calcularHoraSalida(registro.datetime, registro.stayNights);
            if (Date.now() < horaSalidaEstimada.getTime()) {
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
            }
        });

        res.json(data);
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
