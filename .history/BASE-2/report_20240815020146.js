document.addEventListener('DOMContentLoaded', () => {
    actualizarNotificaciones();
    configurarFormularioReporte();

    // Configurar auto-actualización cada 5 minutos
    setInterval(actualizarNotificaciones, 5 * 60 * 1000);
});

// Función para obtener y actualizar las notificaciones activas
function actualizarNotificaciones() {
    fetch('/notificaciones')
        .then(response => response.json())
        .then(data => {
            const contenedorP1 = document.getElementById('notificaciones-contenedor-P1');
            const contenedorP2 = document.getElementById('notificaciones-contenedor-P2');
            contenedorP1.innerHTML = ''; // Limpiar contenido previo
            contenedorP2.innerHTML = ''; // Limpiar contenido previo

            data.P1.forEach(notificacion => {
                const div = document.createElement('div');
                div.classList.add('notificacion');
                div.innerHTML = `<p><strong>Habitación:</strong> ${notificacion.habitacion} <strong>Placa:</strong> ${notificacion.placa}</p>`;
                contenedorP1.appendChild(div);
            });

            data.P2.forEach(notificacion => {
                const div = document.createElement('div');
                div.classList.add('notificacion');
                div.innerHTML = `<p><strong>Habitación:</strong> ${notificacion.habitacion} <strong>Placa:</strong> ${notificacion.placa}</p>`;
                contenedorP2.appendChild(div);
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

        fetch(`/reportes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
            .then(response => response.json())
            .then(data => {
                const tbodyP1 = document.getElementById('tabla-reporte-P1').querySelector('tbody');
                const tbodyP2 = document.getElementById('tabla-reporte-P2').querySelector('tbody');
                tbodyP1.innerHTML = ''; // Limpiar contenido previo
                tbodyP2.innerHTML = ''; // Limpiar contenido previo

                data.P1.forEach(registro => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${registro.habitacion}</td><td>${registro.placa}</td>`;
                    tbodyP1.appendChild(tr);
                });

                data.P2.forEach(registro => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${registro.habitacion}</td><td>${registro.placa}</td>`;
                    tbodyP2.appendChild(tr);
                });
            })
            .catch(error => console.error('Error al generar el reporte:', error));
    });
}
