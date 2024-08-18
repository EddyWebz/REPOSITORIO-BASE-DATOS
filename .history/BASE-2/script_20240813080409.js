document.addEventListener('DOMContentLoaded', () => {
    // Prevenir la navegación hacia atrás para evitar que el usuario regrese a la página de inicio de sesión.
    window.history.pushState(null, "", window.location.href); 
    window.onpopstate = function() {
        window.history.pushState(null, "", window.location.href);
    };

    // Elementos del DOM que se utilizarán para manejar las acciones del usuario.
    const vehicleForm = document.getElementById('vehicleForm'); // Formulario de registro de vehículos
    const plateInput = document.getElementById('plate'); // Campo de entrada de placa
    const historyCards = document.getElementById('historyCards'); // Contenedor de las tarjetas del historial
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn'); // Botón para mostrar/ocultar el historial
    const historyContent = document.getElementById('historyContent'); // Contenido del historial
    const searchInput = document.getElementById('searchInput'); // Campo de búsqueda por nombre o placa
    const searchButton = document.getElementById('searchButton'); // Botón de búsqueda
    const searchResults = document.getElementById('searchResults'); // Contenedor de los resultados de búsqueda
    const searchCards = document.getElementById('searchCards'); // Contenedor de las tarjetas de resultados
    const datetimeInput = document.getElementById('datetime'); // Campo de fecha y hora

    // Función para agregar un elemento de texto a una tarjeta, dado un label y un texto.
    const createTextElement = (label, text) => {
        const div = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = label;
        div.appendChild(strong);
        div.appendChild(document.createTextNode(` ${text}`));
        return div;
    };

    // Función para agregar un registro de vehículo al historial de la página.
    const addRecordToCards = (record) => {
        const card = document.createElement('div');
        card.className = 'history-card';

        // Crear y agregar elementos de texto para cada campo del registro.
        card.appendChild(createTextElement('Fecha y Hora:', record.datetime));
        card.appendChild(createTextElement('Marca:', record.brand));
        card.appendChild(createTextElement('Modelo:', record.model));
        card.appendChild(createTextElement('Clave:', record.clave));
        card.appendChild(createTextElement('Placa:', record.plate));
        card.appendChild(createTextElement('Color:', record.color));
        card.appendChild(createTextElement('Propietario:', record.owner));
        card.appendChild(createTextElement('Noches de estadía:', record.stayNights));
        card.appendChild(createTextElement('Habitación:', record.habitacion));
        card.appendChild(createTextElement('Garaje:', record.garage));
        card.appendChild(createTextElement('Observaciones:', record.observations));

        // Manejo de las imágenes asociadas al registro.
        const imagesLabel = document.createElement('div');
        const strongImages = document.createElement('strong');
        strongImages.textContent = 'Imágenes:';
        imagesLabel.appendChild(strongImages);
        card.appendChild(imagesLabel);

        const imageContainer = document.createElement('div');
        record.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.addEventListener('click', () => openFullscreen(img)); // Permite abrir la imagen en pantalla completa.
            imageContainer.appendChild(img);
        });
        card.appendChild(imageContainer);

        // Agregar la tarjeta al contenedor del historial.
        historyCards.prepend(card);
    };

    // Función para cargar el historial de vehículos desde el backend.
    const loadHistory = async () => {
        const response = await fetch('/ruta'); // Solicitud al backend para obtener el historial.
        const records = await response.json();
        records.reverse().forEach(record => addRecordToCards(record)); // Mostrar los registros en orden inverso.
    };

    // Función para manejar el envío del formulario de registro de vehículos.
    const handleFormSubmit = async (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario.

        const formData = new FormData(vehicleForm); // Crear un objeto FormData con los datos del formulario.

        // Enviar los datos al backend usando fetch.
        const response = await fetch('/ALFA', {
            method: 'POST',
            body: formData
        });

        // Manejar la respuesta del servidor.
        if (response.ok) {
            const record = await response.json();
            addRecordToCards(record); // Agregar el nuevo registro al historial en la página.
            vehicleForm.reset(); // Resetear el formulario después del envío exitoso.
            alert('Su vehículo ha sido registrado con éxito');
        } else {
            alert('Hubo un error al registrar el vehículo. Por favor, inténtelo de nuevo.');
        }
    };

    // Función para manejar la búsqueda de vehículos por nombre o placa.
    const handleSearch = async () => {
        const query = searchInput.value.toLowerCase().trim(); // Obtener el valor de búsqueda en minúsculas y sin espacios adicionales.

        // Si el campo de búsqueda está vacío, no hacer nada.
        if (query === '') {
            searchResults.style.display = 'none';
            return;
        }

        // Enviar la solicitud de búsqueda al backend.
        const response = await fetch(`/ruta/search?query=${encodeURIComponent(query)}`);
        const filteredRecords = await response.json();

        // Mostrar los resultados de la búsqueda.
        searchCards.innerHTML = '';
        if (filteredRecords.length > 0) {
            searchResults.style.display = 'block';
            filteredRecords.forEach(record => addRecordToSearchCards(record));
        } else {
            searchResults.style.display = 'none';
            alert('No se encontraron registros que coincidan con la búsqueda.');
        }
    };

    // Función para configurar la fecha y hora actual en el campo correspondiente.
    const setCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        datetimeInput.value = formattedDateTime;
    };

    // Lógica para el menú desplegable.
    const menuIcon = document.querySelector('.menu-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdownContent = document.querySelector('.dropdown-content');

    // Manejo del evento de clic en el icono del menú.
    menuIcon.addEventListener('click', () => {
        dropdownContent.classList.toggle('show'); // Mostrar u ocultar el contenido del menú.
        menuIcon.classList.toggle('open');

        // Cambiar el ícono a una X cuando el menú esté abierto.
        if (menuIcon.classList.contains('open')) {
            menuIcon.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            menuIcon.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Cerrar el menú si se hace clic fuera de él.
    document.addEventListener('click', (event) => {
        if (!dropdownMenu.contains(event.target) && !menuIcon.contains(event.target)) {
            dropdownContent.classList.remove('show');
            menuIcon.classList.remove('open');
            menuIcon.innerHTML = '<i class="fas fa-bars"></i>'; // Restaurar el ícono de hamburguesa.
        }
    });

    // Event listeners para manejar el envío del formulario, la búsqueda y la visibilidad del historial.
    vehicleForm.addEventListener('submit', handleFormSubmit);
    searchButton.addEventListener('click', handleSearch);
    toggleHistoryBtn.addEventListener('click', () => {
        historyContent.style.display = historyContent.style.display === 'none' ? 'block' : 'none';
        toggleHistoryBtn.textContent = historyContent.style.display === 'none' ? 'Mostrar Historial' : 'Ocultar Historial';
    });

    // Configurar la fecha y hora actual en el campo correspondiente y cargar el historial.
    setCurrentDateTime();
    loadHistory();
});
