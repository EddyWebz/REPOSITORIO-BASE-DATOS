document.addEventListener('DOMContentLoaded', () => {
    actualizarNotificaciones();
    configurarFormularioReporte();

    // Configurar auto-actualización cada 5 minutos
    setInterval(actualizarNotificaciones, 5 * 60 * 1000);
});

// Función para obtener y actualizar las notificaciones activas
function actualizarNotificaciones() {
    fetch('/api/notificaciones')
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('notificaciones-contenedor');
            contenedor.innerHTML = ''; // Limpiar contenido previo

            data.forEach(notificacion => {
                const div = document.createElement('div');
                div.classList.add('notificacion');

                if (notificacion.esUrgente) {
                    div.classList.add('urgente');
                }

                div.innerHTML = `
                    <p><strong>Habitación:</strong> ${notificacion.habitacion}</p>
                    <p><strong>Placa:</strong> ${notificacion.placa}</p>
                `;

                contenedor.appendChild(div);
            });
        })
        .catch(error => console.error('Error al obtener notificaciones:', error));
}

// Función para configurar el formulario de generación de reportes
function configurarFormularioReporte() {
    const form = document.getElementById('form-reporte');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;

        fetch(`/api/reportes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#tabla-reporte tbody');
                tbody.innerHTML = ''; // Limpiar contenido previo

                data.forEach(registro => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${registro.fechaIngreso}</td>
                        <td>${registro.garaje}</td>
                        <td>${registro.habitacion}</td>
                        <td>${registro.placa}</td>
                        <td>${registro.horaIngreso}</td>
                        <td>${registro.numeroNoches}</td>
                    `;
                    tbody.appendChild(tr);
                });
            })
            .catch(error => console.error('Error al generar el reporte:', error));
    });
}
