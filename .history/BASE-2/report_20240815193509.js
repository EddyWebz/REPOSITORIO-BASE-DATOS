document.addEventListener('DOMContentLoaded', () => {
    actualizarNotificaciones();
    generarReporteAutomatico(); // Generar el reporte automáticamente al cargar la página

    // Configurar auto-actualización cada 5 minutos para notificaciones y reporte
    setInterval(actualizarNotificaciones, 5 * 60 * 1000);
    setInterval(generarReporteAutomatico, 5 * 60 * 1000);

    // Configurar botón de impresión/descarga
    document.getElementById('btn-imprimir').addEventListener('click', imprimirReporte);
    
    // Refrescar la página después de cerrar el cuadro de diálogo de impresión
    window.addEventListener('afterprint', function() {
        window.location.reload();
    });
});

// Función para obtener y actualizar las notificaciones activas
function actualizarNotificaciones() {
    fetch('/api/notas/notificaciones')
        .then(response => response.json())
        .then(data => {
            console.log('Notificaciones recibidas:', data); // Para depuración

            const contenedorP1 = document.getElementById('notificaciones-contenedor-P1');
            const contenedorP2 = document.getElementById('notificaciones-contenedor-P2');
            contenedorP1.innerHTML = ''; // Limpiar contenido previo
            contenedorP2.innerHTML = ''; // Limpiar contenido previo

            data.P1.forEach(notificacion => {
                const div = document.createElement('div');
                div.classList.add('notificacion');
                div.innerHTML = `<p><strong>Habitación:</strong> ${notificacion.habitacion} <strong>Placa:</strong> ${notificacion.plate}</p>`;
                contenedorP1.appendChild(div);
            });

            data.P2.forEach(notificacion => {
                const div = document.createElement('div');
                div.classList.add('notificacion');
                div.innerHTML = `<p><strong>Habitación:</strong> ${notificacion.habitacion} <strong>Placa:</strong> ${notificacion.plate}</p>`;
                contenedorP2.appendChild(div);
            });
        })
        .catch(error => console.error('Error al obtener notificaciones:', error));
}

// Función para generar y actualizar el reporte automático de vehículos en garaje
function generarReporteAutomatico() {
    fetch('/api/notas/reportes')
        .then(response => response.json())
        .then(data => {
            console.log('Datos del reporte recibidos:', data); // Para depuración

            const tbodyP1 = document.getElementById('tabla-reporte-P1').querySelector('tbody');
            const tbodyP2 = document.getElementById('tabla-reporte-P2').querySelector('tbody');
            tbodyP1.innerHTML = ''; // Limpiar contenido previo
            tbodyP2.innerHTML = ''; // Limpiar contenido previo

            data.P1.forEach(registro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${registro.habitacion}</td><td>${registro.plate}</td>`;
                tbodyP1.appendChild(tr);
            });

            data.P2.forEach(registro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${registro.habitacion}</td><td>${registro.plate}</td>`;
                tbodyP2.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al generar el reporte:', error));
}

// Función para imprimir o descargar el reporte como PDF
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn-imprimir').addEventListener('click', function() {
        // Crear una instancia de jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Obtener el contenido del reporte
        const content = document.getElementById('reportes-garajes').innerText;

        // Configurar el PDF y agregar contenido
        doc.setFontSize(12);
        doc.text(content, 10, 10); // El contenido se agrega en las coordenadas (10, 10) de la página

        // Descargar el PDF
        doc.save('reporte.pdf');
    });
});