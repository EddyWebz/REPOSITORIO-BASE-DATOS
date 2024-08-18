document.addEventListener('DOMContentLoaded', () => {
    // ---- CONFIGURACIÓN INICIAL ----
    // Soluciona error de hora y usa la del dispositivo
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const localDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('datetime').value = localDatetime;
    
    // Establecer la fecha y hora inicial en el campo 'datetime' cuando se carga la página
    setDateTime();


    // ---- VARIABLES ----
    const vehicleForm = document.getElementById('vehicleForm');
    const historyContent = document.getElementById('historyContent');
    const historyCards = document.getElementById('historyCards');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    // ---- FUNCIONES DE FORMATEO ----
    // Helper function para formatear fechas
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // ---- FUNCIONES PARA MANEJAR EL HISTORIAL ----
    // Función para agregar un registro de vehículo al historial o resultados de búsqueda
    function addVehicleToHistory(vehicle) {
        const card = document.createElement('div');
        card.className = 'history-card';

        // Agregar campos del vehículo con formato
        for (let key in vehicle) {
            if (vehicle.hasOwnProperty(key) && key !== 'images' && key !== 'user_id' && key !== 'id' && key !== 'created_at') {
                const div = document.createElement('div');
                let value = vehicle[key];

                // Formatear fechas
                if (key === 'datetime') {
                    value = formatDate(value);
                }

                // Formatear el nombre de la clave (opcional)
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                div.textContent = `${formattedKey}: ${value}`;
                card.appendChild(div);
            }
        }

        // Manejo de imágenes
        if (vehicle.images) {
            vehicle.images.forEach(image => {
                const img = document.createElement('img');
                img.src = image;
                img.alt = 'Imagen del vehículo';
                img.addEventListener('click', () => {
                    const fullscreenImg = document.createElement('img');
                    fullscreenImg.src = image;
                    fullscreenImg.className = 'fullscreen-img';
                    fullscreenImg.addEventListener('click', () => {
                        document.body.removeChild(fullscreenImg);
                    });
                    document.body.appendChild(fullscreenImg);
                });
                card.appendChild(img);
            });
        }

        historyCards.appendChild(card);
    }

    // Cargar el historial desde el backend (todos los vehículos ordenados)
    async function loadHistory() {
        const response = await fetch('/api/history');
        const vehicles = await response.json();

        console.log('Vehicles fetched:', vehicles); // Depuración
        historyContent.style.display = 'block';
        historyCards.innerHTML = ''; // Limpiar historial antes de cargar nuevos resultados
        vehicles.forEach(addVehicleToHistory); // Mostrar del más reciente al más antiguo
    }

    // ---- FUNCIONES PARA MANEJAR EL FORMULARIO DE REGISTRO ----
    // Manejar envío del formulario de registro
    vehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(vehicleForm);
        // No es necesario añadir el user_id en el frontend.
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            addVehicleToHistory(result.vehicle);
            vehicleForm.reset();
             // Repoblar el campo de fecha y hora después de registrar un vehículo
            setDateTime();
        } else {
            alert(result.message || 'Error al registrar vehículo');
        }
    });

    // ---- FUNCIONES DE BÚSQUEDA ----
    // Manejar búsqueda de vehículos por nombre o placa
    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        console.log('Search query sent:', query); // Depuración
        if (!query) return;
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const vehicles = await response.json();
        console.log('Vehicles received:', vehicles); // Depuración
        searchResults.style.display = 'block';
        searchResults.innerHTML = ''; // Limpiar resultados de búsqueda anteriores
        if (vehicles.length === 0) {
            searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
        } else {
            vehicles.forEach(vehicle => {
                const card = document.createElement('div');
                card.className = 'history-card';

                // Mostrar todos los detalles del vehículo
                card.innerHTML = `
                    <div>Fecha hora: ${new Date(vehicle.datetime).toLocaleString()}</div>
                    <div>Marca: ${vehicle.brand}</div>
                    <div>Modelo: ${vehicle.model}</div>
                    <div>Clave: ${vehicle.clave}</div>
                    <div>Placa: ${vehicle.plate}</div>
                    <div>Color: ${vehicle.color}</div>
                    <div>Propietario: ${vehicle.owner}</div>
                    <div>Estancias: ${vehicle.stayNights}</div>
                    <div>Habitación: ${vehicle.habitacion}</div>
                    <div>Garaje: ${vehicle.garage}</div>
                    <div>Observaciones: ${vehicle.observations}</div>
                `;

                // Mostrar las imágenes del vehículo con funcionalidad de pantalla completa
                if (vehicle.images && vehicle.images.length > 0) {
                    vehicle.images.forEach(image => {
                        const img = document.createElement('img');
                        img.src = image;  // Mostrar la imagen
                        img.alt = 'Imagen del vehículo';

                        // Añadir funcionalidad de pantalla completa
                        img.addEventListener('click', () => {
                            const fullscreenImg = document.createElement('img');
                            fullscreenImg.src = image;
                            fullscreenImg.className = 'fullscreen-img';
                            fullscreenImg.addEventListener('click', () => {
                                document.body.removeChild(fullscreenImg);
                            });
                            document.body.appendChild(fullscreenImg);
                        });

                        card.appendChild(img);
                    });
                }

                searchResults.appendChild(card);
            });
        }
    });

    // ---- FUNCIONES PARA MANEJAR EL HISTORIAL ----
    // Mostrar/ocultar historial
    toggleHistoryBtn.addEventListener('click', () => {
        if (historyContent.style.display === 'none') {
            loadHistory();
        } else {
            historyContent.style.display = 'none';
        }
    });

    // ---- FUNCIONES DE INTERACCIÓN ----
    // Manejo del menú desplegable
    const menuIcon = document.querySelector('.menu-icon');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuIcon.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
        menuIcon.classList.toggle('open');
    });

    window.addEventListener('click', (e) => {
        if (!menuIcon.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('show');
            menuIcon.classList.remove('open');
        }
    });
});

// ---- AUTOCOMPLETAR CAMPOS AL INGRESAR PLACA ----
const plateInput = document.getElementById('plate'); // Campo de placa

plateInput.addEventListener('input', async () => {
    const plate = plateInput.value.trim();
    if (plate.length > 0) { // Solo busca si hay algo en el campo de placa
        const response = await fetch(`/api/vehicle/${encodeURIComponent(plate)}`);
        const vehicle = await response.json();

        if (vehicle && !vehicle.message) {
            // Auto rellenar campos en español
            document.getElementById('brand').value = vehicle.brand || '';
            document.getElementById('model').value = vehicle.model || '';
            document.getElementById('clave').value = vehicle.clave || '';
            document.getElementById('color').value = vehicle.color || '';
            document.getElementById('owner').value = vehicle.owner || '';
        } 
        // else {
        //     // Si no se encuentra el vehículo, limpiar los campos (opcional)
        //     document.getElementById('brand').value = '';
        //     document.getElementById('model').value = '';
        //     document.getElementById('clave').value = '';
        //     document.getElementById('color').value = '';
        //     document.getElementById('owner').value = '';
        // }
    }
});
