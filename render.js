/**
 * Rick & Morty Desktop Explorer - Renderer Process
 * Integración y extensión del código JavaScript original proporcionado en clase.
 */

// Elementos del DOM originales
const cards = document.getElementById('card-dinamica');
const templateCard = document.getElementById('template-card').content;

// Elementos adicionales para control de escritorio, búsqueda y paginación
const inputSearch = document.getElementById('input-search');
const filterStatus = document.getElementById('filter-status');
const filterGender = document.getElementById('filter-gender');
const btnReset = document.getElementById('btn-reset');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnRetry = document.getElementById('btn-retry');

const currentPageNum = document.getElementById('current-page-num');
const totalPagesNum = document.getElementById('total-pages-num');
const totalCharactersSpan = document.getElementById('total-characters');

const feedbackMessage = document.getElementById('feedback-message');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackText = document.getElementById('feedback-text');
const feedbackIcon = document.getElementById('feedback-icon');

// Estado de la consulta y navegación
let currentPage = 1;
let totalPages = 1;
let searchTimeout = null;

// Construye la URL de la API considerando página y filtros activos
const buildApiUrl = (page = 1) => {
    const baseUrl = 'https://rickandmortyapi.com/api/character';
    const params = new URLSearchParams();

    params.append('page', page);

    const name = inputSearch.value.trim();
    if (name) {
        params.append('name', name);
    }

    const status = filterStatus.value;
    if (status) {
        params.append('status', status);
    }

    const gender = filterGender.value;
    if (gender) {
        params.append('gender', gender);
    }

    return `${baseUrl}/?${params.toString()}`;
};

/**
 * Función principal para consultar la API de Rick and Morty
 * Mantiene la firma y lógica base original pero añade manejo de paginación y filtros
 */
const fetchData = async (page = 1) => {
    try {
        loadingData(true);
        hideFeedback();

        const url = buildApiUrl(page);
        const res = await fetch(url);

        if (!res.ok) {
            if (res.status === 404) {
                // Sin coincidencias para la búsqueda
                showFeedback(
                    "🔍",
                    "No se encontraron personajes",
                    "No hay ningún habitante del multiverso que coincida con tus criterios de búsqueda.",
                    false
                );
                cards.textContent = "";
                updatePaginationUI(page, 0, 0);
                return;
            }
            throw new Error(`Error en la consulta: ${res.statusText}`);
        }

        const data = await res.json();
        currentPage = page;
        totalPages = data.info ? data.info.pages : 1;
        const totalCount = data.info ? data.info.count : data.results.length;

        showData(data);
        updatePaginationUI(currentPage, totalPages, totalCount);

        // Scroll al inicio de los resultados
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Error al obtener personajes:", error);
        cards.textContent = "";
        showFeedback(
            "⚠️",
            "Error de Conexión",
            "No fue posible comunicarse con la API de Rick and Morty. Revisa tu conexión a internet.",
            true
        );
        updatePaginationUI(page, 0, 0);
    } finally {
        loadingData(false);
    }
};

/**
 * Control del indicador de carga
 * Mantiene la función original loadingData
 */
const loadingData = (estado) => {
    const loading = document.querySelector('#loading');
    if (estado) {
        loading.classList.remove('d-none');
    } else {
        loading.classList.add('d-none');
    }
};

/**
 * Renderiza los personajes en el DOM
 * Mantiene el uso del DocumentFragment y el templateCard,
 * mostrando obligatoriamente los 6 campos requeridos:
 * 1. Imagen
 * 2. Nombre
 * 3. Estado (Status)
 * 4. Especie (Species)
 * 5. Género (Gender)
 * 6. Origen (Origin)
 */
const showData = (data) => {
    const fragment = document.createDocumentFragment();
    cards.textContent = "";

    data.results.forEach((item) => {
        const clone = templateCard.cloneNode(true);

        // 1. Imagen
        const img = clone.querySelector('img');
        img.setAttribute('src', item.image);
        img.setAttribute('alt', item.name);

        // 2. Nombre
        const nameEl = clone.querySelector('.character-name');
        nameEl.textContent = item.name;

        // 3. Estado (con clase visual y badge)
        const floatingBadge = clone.querySelector('.status-floating-badge');
        const statusText = clone.querySelector('.status-text');
        const statusValue = clone.querySelector('.character-status-val');

        let statusClass = 'status-unknown';
        let statusLabel = item.status || 'Desconocido';

        if (item.status === 'Alive') {
            statusClass = 'status-alive';
            statusLabel = 'Vivo';
        } else if (item.status === 'Dead') {
            statusClass = 'status-dead';
            statusLabel = 'Muerto';
        }

        floatingBadge.classList.add(statusClass);
        statusText.textContent = statusLabel;
        statusValue.textContent = `${statusLabel} (${item.status})`;

        // 4. Especie
        const speciesValue = clone.querySelector('.character-species-val');
        speciesValue.textContent = item.species || 'Desconocida';

        // 5. Género
        const genderValue = clone.querySelector('.character-gender-val');
        let genderSpanish = item.gender;
        if (item.gender === 'Male') genderSpanish = 'Masculino';
        else if (item.gender === 'Female') genderSpanish = 'Femenino';
        else if (item.gender === 'Genderless') genderSpanish = 'Sin género';
        else if (item.gender === 'unknown') genderSpanish = 'Desconocido';
        genderValue.textContent = genderSpanish;

        // 6. Origen
        const originValue = clone.querySelector('.character-origin-val');
        originValue.textContent = (item.origin && item.origin.name) ? item.origin.name : 'Desconocido';

        fragment.appendChild(clone);
    });

    cards.appendChild(fragment);
};

// Actualiza los estados de la barra de paginación
const updatePaginationUI = (page, total, count) => {
    currentPageNum.textContent = total > 0 ? page : 0;
    totalPagesNum.textContent = total;
    totalCharactersSpan.textContent = count;

    btnPrev.disabled = page <= 1;
    btnNext.disabled = page >= total || total === 0;
};

// Muestra mensajes de feedback (sin resultados o error de red)
const showFeedback = (icon, title, message, showRetry = false) => {
    feedbackIcon.textContent = icon;
    feedbackTitle.textContent = title;
    feedbackText.textContent = message;

    if (showRetry) {
        btnRetry.classList.remove('d-none');
    } else {
        btnRetry.classList.add('d-none');
    }

    feedbackMessage.classList.remove('d-none');
};

const hideFeedback = () => {
    feedbackMessage.classList.add('d-none');
};

// Eventos de Búsqueda con Debounce (optimización para escritorio)
inputSearch.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        fetchData(1);
    }, 350);
});

// Eventos para filtros por Select
filterStatus.addEventListener('change', () => {
    currentPage = 1;
    fetchData(1);
});

filterGender.addEventListener('change', () => {
    currentPage = 1;
    fetchData(1);
});

// Botón de Limpiar filtros
btnReset.addEventListener('click', () => {
    inputSearch.value = "";
    filterStatus.value = "";
    filterGender.value = "";
    currentPage = 1;
    fetchData(1);
});

// Eventos de Botones de Paginación
btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
        fetchData(currentPage - 1);
    }
});

btnNext.addEventListener('click', () => {
    if (currentPage < totalPages) {
        fetchData(currentPage + 1);
    }
});

btnRetry.addEventListener('click', () => {
    fetchData(currentPage);
});

// Atajos de teclado estilo aplicación de escritorio
window.addEventListener('keydown', (e) => {
    // Si el usuario presiona Escape en el buscador, limpia el texto
    if (e.key === 'Escape' && document.activeElement === inputSearch) {
        inputSearch.value = '';
        fetchData(1);
        inputSearch.blur();
    }
    // Flecha izquierda para página anterior si no está escribiendo en el buscador
    if (e.key === 'ArrowLeft' && document.activeElement !== inputSearch && !btnPrev.disabled) {
        btnPrev.click();
    }
    // Flecha derecha para página siguiente si no está escribiendo en el buscador
    if (e.key === 'ArrowRight' && document.activeElement !== inputSearch && !btnNext.disabled) {
        btnNext.click();
    }
});

// Inicialización de la aplicación (Igual que en la práctica original)
fetchData(1);
