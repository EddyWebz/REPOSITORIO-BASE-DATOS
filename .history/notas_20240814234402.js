const express = require('express');
const router = express.Router();
const connection = require('./database/database');

// Ruta para obtener notificaciones activas filtradas por user_id
router.get('/api/notificaciones', async (req, res) => {
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

    try {
        const notificaciones = await connection.query(`
            SELECT habitacion, placa, hora_ingreso, numero_noches
            FROM vehiculos
            WHERE user_id = ? AND DATE_ADD(hora_ingreso, INTERVAL numero_noches DAY) > NOW()
            ORDER BY hora_ingreso ASC
        `, [user_id]);

        const data = notificaciones.map(registro => {
            const horaSalidaEstimada = calcularHoraSalida(registro.hora_ingreso, registro.numero_noches);
            const tiempoRestante = horaSalidaEstimada - Date.now();

            return {
                habitacion: registro.habitacion,
                placa: registro.placa,
                esUrgente: tiempoRestante <= (2 * 60 * 60 * 1000) // Menos de 2 horas para salir
            };
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
            SELECT fecha_ingreso AS fechaIngreso, garaje, habitacion, placa, hora_ingreso AS horaIngreso, numero_noches AS numeroNoches
            FROM vehiculos
            WHERE user_id = ? AND fecha_ingreso BETWEEN ? AND ?
            ORDER BY fecha_ingreso ASC
        `, [user_id, fechaInicio, fechaFin]);

        res.json(reportes);
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).send('Error del servidor');
    }
});

// Función auxiliar para calcular la hora estimada de salida
function calcularHoraSalida(horaIngreso, numeroNoches) {
    const fechaHoraIngreso = new Date(horaIngreso);
    const horasPorNoche = 21.5; // Desde las 15:00 hasta las 12:30 del día siguiente
    return fechaHoraIngreso.getTime() + (numeroNoches * horasPorNoche * 60 * 60 * 1000);
}

module.exports = router;
