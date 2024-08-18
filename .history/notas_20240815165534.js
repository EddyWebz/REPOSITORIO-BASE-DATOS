const express = require('express');
const router = express.Router();
const pool = require('./database/database-promise');

// Función para calcular la hora de salida basándose en la hora de ingreso y el número de noches
function calcularHoraSalida(horaIngreso, numeroNoches) {
    const fechaHoraIngreso = new Date(horaIngreso);

    let horaSalidaEstimada;

    // Condición 1: Registro entre 15:00 PM y 04:00 AM del día siguiente
    if (fechaHoraIngreso.getHours() >= 15 || fechaHoraIngreso.getHours() < 4) {
        horaSalidaEstimada = new Date(fechaHoraIngreso);
        horaSalidaEstimada.setHours(12, 30, 0, 0);
    } 
    // Condición 2: Registro entre 07:00 AM y 15:00 PM del mismo día
    else if (fechaHoraIngreso.getHours() >= 7 && fechaHoraIngreso.getHours() < 15) {
        horaSalidaEstimada = new Date(fechaHoraIngreso);
        horaSalidaEstimada.setHours(12, 30, 0, 0);
    }

    // Añadir noches adicionales (si hay más de una noche)
    horaSalidaEstimada.setDate(horaSalidaEstimada.getDate() + (numeroNoches - 1));

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
            SELECT habitacion, plate, garage
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
                    plate: registro.plate
                });
            } else if (registro.garage === 'P2') {
                data.P2.push({
                    habitacion: registro.habitacion,
                    plate: registro.plate
                });
            }
        });

        console.log('Notificaciones:', data); // Para depuración
        res.json(data);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).send('Error del servidor');
    }
});

// Nueva lógica para generar el reporte automático de vehículos en garajes P1 y P2
router.get('/reportes', async (req, res) => {
    const user_id = req.session.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado.' });
    }

    try {
        const now = new Date();

        const [reportes] = await pool.query(`
            SELECT habitacion, plate, garage, datetime, stayNights
            FROM vehiculos
            WHERE user_id = ?
            ORDER BY garage ASC, habitacion ASC
        `, [user_id]);

        const data = {
            P1: [],
            P2: []
        };

        reportes.forEach(registro => {
            const horaSalidaEstimada = calcularHoraSalida(registro.datetime, registro.stayNights);

            // Asegurarse de que el vehículo esté en el reporte si la hora actual es menor a la hora de salida
            if (now < horaSalidaEstimada) {
                if (registro.garage === 'P1') {
                    data.P1.push({
                        habitacion: registro.habitacion,
                        plate: registro.plate
                    });
                } else if (registro.garage === 'P2') {
                    data.P2.push({
                        habitacion: registro.habitacion,
                        plate: registro.plate
                    });
                }
            }
        });

        console.log('Reporte Automático:', data); // Para depuración
        res.json(data);
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
