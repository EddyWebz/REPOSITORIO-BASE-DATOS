document.addEventListener('DOMContentLoaded', () => {
    // Prevenir la navegación hacia atrás
    window.history.pushState(null, "", window.location.href); // Esto reemplaza la entrada en el historial
    window.onpopstate = function() {
        window.history.pushState(null, "", window.location.href); // Esto evita que el usuario pueda ir hacia atrás
    };
    
    const vehicleForm = document.getElementById('vehicleForm');
    const plateInput = document.getElementById('plate');
    const historyCards = document.getElementById('historyCards');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const historyContent = document.getElementById('historyContent');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const searchCards = document.getElementById('searchCards');
    const datetimeInput = document.getElementById('datetime');

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const loadHistory = () => {
        const records = JSON.parse(localStorage.getItem('vehicleRecords')) || [];
        records.reverse().forEach(record => addRecordToCards(record));
    };

    const saveRecord = (record) => {
        const records = JSON.parse(localStorage.getItem('vehicleRecords')) || [];
        records.push(record);
        localStorage.setItem('vehicleRecords', JSON.stringify(records));
    };

    const createTextElement = (label, text) => {
        const div = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = label;
        div.appendChild(strong);
        div.appendChild(document.createTextNode(` ${text}`));
        return div;
    };

    const addRecordToCards = (record) => {
        const card = document.createElement('div');
        card.className = 'history-card';

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

        const imagesLabel = document.createElement('div');
        const strongImages = document.createElement('strong');
        strongImages.textContent = 'Imágenes:';
        imagesLabel.appendChild(strongImages);
        card.appendChild(imagesLabel);

        const imageContainer = document.createElement('div');
        record.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.addEventListener('click', () => openFullscreen(img));
            imageContainer.appendChild(img);
        });
        card.appendChild(imageContainer);

        historyCards.prepend(card);
    };

    const addRecordToSearchCards = (record) => {
        const card = document.createElement('div');
        card.className = 'history-card';

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

        const imagesLabel = document.createElement('div');
        const strongImages = document.createElement('strong');
        strongImages.textContent = 'Imágenes:';
        imagesLabel.appendChild(strongImages);
        card.appendChild(imagesLabel);

        const imageContainer = document.createElement('div');
        record.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.addEventListener('click', () => openFullscreen(img));
            imageContainer.appendChild(img);
        });
        card.appendChild(imageContainer);

        searchCards.appendChild(card);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log("Formulario enviado");

        const formData = new FormData(vehicleForm);
        try {
            const imageFiles = formData.getAll('image');
            console.log("Archivos de imagen: ", imageFiles);

            const images = await Promise.all(Array.from(imageFiles).slice(0, 4).map(file => toBase64(file)));
            console.log("Imágenes convertidas: ", images);

            const record = {
                datetime: formData.get('datetime'),
                brand: formData.get('brand'),
                model: formData.get('model'),
                clave: formData.get('clave'),
                plate: formData.get('plate'),
                color: formData.get('color'),
                owner: formData.get('owner'),
                stayNights: formData.get('stayNights'), // Nuevo campo agregado
                habitacion: formData.get('habitacion'),
                garage: formData.get('garage'),
                observations: formData.get('observations'),
                images: images
            };

            saveRecord(record);
            addRecordToCards(record);
            vehicleForm.reset();

            alert('Su vehículo ha sido registrado con éxito');
            setCurrentDateTime();
        } catch (error) {
            console.error("Error al registrar el vehículo: ", error);
            alert('Hubo un error al registrar el vehículo. Por favor, inténtelo de nuevo.');
        }
    };

    const handlePlateInput = () => {
        const records = JSON.parse(localStorage.getItem('vehicleRecords')) || [];
        const record = records.find(record => record.plate === plateInput.value);

        if (record) {
            document.getElementById('brand').value = record.brand;
            document.getElementById('model').value = record.model;
            document.getElementById('clave').value = record.clave;
            document.getElementById('color').value = record.color;
            document.getElementById('owner').value = record.owner;
        }
    };

    const toggleHistoryVisibility = () => {
        if (historyContent.style.display === 'none') {
            historyContent.style.display = 'block';
            toggleHistoryBtn.textContent = 'Ocultar Historial';
        } else {
            historyContent.style.display = 'none';
            toggleHistoryBtn.textContent = 'Mostrar Historial';
        }
    };

    const openFullscreen = (img) => {
        const fullscreenImg = document.createElement('img');
        fullscreenImg.src = img.src;
        fullscreenImg.classList.add('fullscreen-img');
        fullscreenImg.addEventListener('click', () => {
            document.body.removeChild(fullscreenImg);
        });
        document.body.appendChild(fullscreenImg);
    };

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

    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();

        // Si el campo de búsqueda está vacío, no hacer nada
        if (query === '') {
            searchResults.style.display = 'none';
            return;
        }

        const records = JSON.parse(localStorage.getItem('vehicleRecords')) || [];
        const filteredRecords = records.filter(record =>
            record.plate.toLowerCase().includes(query) || record.owner.toLowerCase().includes(query)
        );

        searchCards.innerHTML = '';
        if (filteredRecords.length > 0) {
            searchResults.style.display = 'block';
            filteredRecords.forEach(record => addRecordToSearchCards(record));
        } else {
            searchResults.style.display = 'none';
            alert('No se encontraron registros que coincidan con la búsqueda.');
        }
    };

    // Nueva funcionalidad para convertir texto a mayúsculas en campos específicos
    const uppercaseFields = ['brand', 'model', 'clave', 'plate', 'color', 'owner', 'habitacion'];

    uppercaseFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', (event) => {
            event.target.value = event.target.value.toUpperCase();
        });
    });

    // Lógica para el menú desplegable
    const menuIcon = document.querySelector('.menu-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuIcon.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
        menuIcon.classList.toggle('open');

        // Cambiar el ícono a una X cuando el menú esté abierto
        if (menuIcon.classList.contains('open')) {
            menuIcon.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            menuIcon.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener('click', (event) => {
        if (!dropdownMenu.contains(event.target) && !menuIcon.contains(event.target)) {
            dropdownContent.classList.remove('show');
            menuIcon.classList.remove('open');
            menuIcon.innerHTML = '<i class="fas fa-bars"></i>'; // Restaurar el ícono de hamburguesa
        }
    });

    vehicleForm.addEventListener('submit', handleFormSubmit);
    plateInput.addEventListener('input', handlePlateInput);
    toggleHistoryBtn.addEventListener('click', toggleHistoryVisibility);
    searchButton.addEventListener('click', handleSearch);

    setCurrentDateTime();
    loadHistory();
});
