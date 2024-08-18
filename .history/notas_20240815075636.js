const express = require('express');
const router = express.Router();
const pool = require('./database/database-promise');  // Cambiado para usar el archivo con Promises

// Función para calcular la hora de salida basándose en la hora de ingreso y el número de noches
function calcularHoraSalida(horaIngreso, numeroNoches) {
    const fechaHoraIngreso = new Date(horaIngreso);

    let horaSalidaEstimada;
    if (fechaHoraIngreso.getHours() < 7) {
        fechaHoraIngreso.setDate(fechaHoraIngreso.getDate() - 1);
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
    } else if (fechaHoraIngreso.getHours() < 15) {
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
    } else {
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
    }

    horaSalidaEstimada.setDate(horaSalidaEstimada.getDate() + numeroNoches - 1);

    return horaSalidaEstimada;
}

// Ruta para obtener notificaciones activas filtradas por user_id
router.get('/notificaciones', async (req, res) => {
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

    try {
        const now = new Date();
        const inicioDia = new Date(now.setHours(7, 0, 0, 0)); 
        const finDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

        const [notificaciones] = await pool.query(`
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
router.get('/reportes', async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

    try {
        const [reportes] = await pool.query(`
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
