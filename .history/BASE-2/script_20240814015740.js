document.addEventListener('DOMContentLoaded', () => {
    const vehicleForm = document.getElementById('vehicleForm');
    const historyContent = document.getElementById('historyContent');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    // Función para agregar un registro de vehículo al historial
    function addVehicleToHistory(vehicle) {
        const historyCards = document.getElementById('historyCards');
        const card = document.createElement('div');
        card.className = 'history-card';

           // Helper function para formatear fechas
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

        // Agregar campos del vehículo
        for (let key in vehicle) {
            if (vehicle.hasOwnProperty(key) && key !== 'images' && key !== 'user_id' && key !== 'id') {
                const div = document.createElement('div');
                div.textContent = `${key}: ${vehicle[key]}`;
                card.appendChild(div);
            }
        }
         // Formatear fechas
         if (key === 'datetime' || key === 'created_at') {
            value = formatDate(value);
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

    // Cargar el historial desde el backend
    async function loadHistory() {
        const response = await fetch('/api/history');
        const vehicles = await response.json();

        console.log('Vehicles fetched:', vehicles); // Depuración
        historyContent.style.display = 'block';
        vehicles.reverse().forEach(addVehicleToHistory);
    }

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
        } else {
            alert(result.message || 'Error al registrar vehículo');
        }
    });

    // Manejar búsqueda de vehículos
    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const vehicles = await response.json();

        searchResults.style.display = 'block';
        searchResults.innerHTML = '';
        vehicles.forEach(addVehicleToHistory);
    });

    // Mostrar/ocultar historial
    toggleHistoryBtn.addEventListener('click', () => {
        if (historyContent.style.display === 'none') {
            loadHistory();
        } else {
            historyContent.style.display = 'none';
        }
    });

    // Configurar fecha y hora actual
    document.getElementById('datetime').value = new Date().toISOString().slice(0, 16);

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
