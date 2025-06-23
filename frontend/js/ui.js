// Functions for rendering and updating UI elements

import { formatDate } from './utils.js'; // Import utility function

const materialsList = document.getElementById('materialsList');
const noResultsMessage = document.getElementById('noResultsMessage');
const resultsHeading = document.getElementById('resultsHeading');

/**
 * Renders a list of lecture materials as cards in the UI.
 * @param {Array} materials - An array of material objects from the API.
 */
export function displayMaterials(materials) {
    materialsList.innerHTML = ''; // Clear previous results

    if (materials.length === 0) {
        noResultsMessage.style.display = 'block';
        resultsHeading.textContent = 'No Materials Found';
        return;
    } else {
        noResultsMessage.style.display = 'none';
        resultsHeading.textContent = 'Available Lecture Materials'; // Reset heading
    }

    materials.forEach(material => {
        const card = document.createElement('div');
        card.classList.add('material-card');

        card.innerHTML = `
            <h3>${material.title}</h3>
            <p class="course-info">${material.course.code} - ${material.course.title}</p>
            <div class="meta-info">
                <p>Level: ${material.level.name}</p>
                <p>Semester: ${material.semester.name}</p>
                <p>Uploaded: ${formatDate(material.upload_date)}</p>
            </div>
            ${material.description ? `<p class="description">${material.description}</p>` : ''}
            <div class="card-actions">
                <button class="button button-download" data-material-id="${material.material_id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V3.5a.5.5 0 0 0-1 0v6.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                    </svg>
                    Download ${material.file_name.split('.').pop().toUpperCase()}
                </button>
            </div>
        `;
        materialsList.appendChild(card);
    });
}

/**
 * Populates a select dropdown with options from an array of data.
 * @param {HTMLElement} selectElement - The select element to populate.
 * @param {Array} data - An array of objects with 'id' and 'name' properties.
 * @param {string} defaultOptionText - Text for the default "All" option.
 */
export function populateFilterDropdown(selectElement, data, defaultOptionText) {
    // Clear existing options, but keep the default "All" option if it exists
    const defaultOption = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = '';
    if (defaultOptionText) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = defaultOptionText;
        selectElement.appendChild(option);
    }

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name || item.code; // Use name for levels/semesters, code for courses
        selectElement.appendChild(option);
    });
}

/**
 * Clears the displayed materials list.
 */
export function clearMaterialsDisplay() {
    materialsList.innerHTML = '';
    noResultsMessage.style.display = 'none';
    resultsHeading.textContent = 'Available Lecture Materials';
}

/**
 * Manages the mobile filter panel visibility.
 */
export function toggleFiltersPanel(show) {
    const filtersPanel = document.getElementById('filtersPanel');
    if (show) {
        filtersPanel.classList.add('active');
    } else {
        filtersPanel.classList.remove('active');
    }
}