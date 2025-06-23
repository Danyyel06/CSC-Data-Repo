// Main application logic and event handling

import * as api from './api.js'; // Import all functions from api.js
import * as ui from './ui.js';   // Import all functions from ui.js
import { debounce } from './utils.js'; // Import specific utility function

// Get DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const levelFilter = document.getElementById('levelFilter');
const semesterFilter = document.getElementById('semesterFilter');
const courseFilter = document.getElementById('courseFilter');
const applyFiltersButton = document.getElementById('applyFiltersButton');
const clearFiltersButton = document.getElementById('clearFiltersButton');
const materialsList = document.getElementById('materialsList'); // To attach download listeners
const openFiltersButton = document.getElementById('openFiltersButton');
const closeFiltersButton = document.getElementById('closeFiltersButton');


// State variables for current filters and search term
let currentSearchTerm = '';
let currentFilters = {
    course_id: null,
    level_id: null,
    semester_id: null
};

/**
 * Fetches and displays materials based on current search and filter state.
 */
async function fetchAndDisplayMaterials() {
    const params = { ...currentFilters };
    if (currentSearchTerm) {
        params.search = currentSearchTerm;
    }
    const materials = await api.getMaterials(params);
    ui.displayMaterials(materials);
}

/**
 * Initializes filter dropdowns with data from the API.
 */
async function initializeFilters() {
    const levels = await api.getLevels();
    ui.populateFilterDropdown(levelFilter, levels, 'All Levels');

    const semesters = await api.getSemesters();
    ui.populateFilterDropdown(semesterFilter, semesters, 'All Semesters');

    const courses = await api.getCourses();
    // For courses, display CourseCode and CourseTitle together
    const formattedCourses = courses.map(course => ({
        id: course.id,
        name: `${course.code} - ${course.title}`
    }));
    ui.populateFilterDropdown(courseFilter, formattedCourses, 'All Courses');
}

/**
 * Handles applying filters based on dropdown selections.
 */
function handleApplyFilters() {
    currentFilters.level_id = levelFilter.value ? parseInt(levelFilter.value) : null;
    currentFilters.semester_id = semesterFilter.value ? parseInt(semesterFilter.value) : null;
    currentFilters.course_id = courseFilter.value ? parseInt(courseFilter.value) : null;
    fetchAndDisplayMaterials();
    // Close filter panel on mobile after applying filters
    if (window.innerWidth <= 767) { // Check if it's a mobile view
        ui.toggleFiltersPanel(false);
    }
}

/**
 * Handles clearing all filters.
 */
function handleClearFilters() {
    levelFilter.value = '';
    semesterFilter.value = '';
    courseFilter.value = '';
    currentFilters = {
        course_id: null,
        level_id: null,
        semester_id: null
    };
    fetchAndDisplayMaterials();
    // Close filter panel on mobile after clearing filters
    if (window.innerWidth <= 767) { // Check if it's a mobile view
        ui.toggleFiltersPanel(false);
    }
}

/**
 * Handles the main search button click or enter key press.
 */
function handleSearch() {
    currentSearchTerm = searchInput.value.trim();
    fetchAndDisplayMaterials();
}

/**
 * Handles click events on the materials list, specifically for download buttons.
 * Uses event delegation.
 */
function handleMaterialListClick(event) {
    const downloadButton = event.target.closest('.button-download');
    if (downloadButton) {
        const materialId = downloadButton.dataset.materialId;
        if (materialId) {
            api.downloadMaterial(parseInt(materialId));
        }
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();       // Populate filter dropdowns
    fetchAndDisplayMaterials(); // Load initial materials
});

searchButton.addEventListener('click', handleSearch);

// Debounce search input for real-time suggestions (optional, but good for UX)
searchInput.addEventListener('input', debounce(handleSearch, 500));
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

applyFiltersButton.addEventListener('click', handleApplyFilters);
clearFiltersButton.addEventListener('click', handleClearFilters);
materialsList.addEventListener('click', handleMaterialListClick); // Event delegation for downloads

// Mobile filter panel toggles
openFiltersButton.addEventListener('click', () => ui.toggleFiltersPanel(true));
closeFiltersButton.addEventListener('click', () => ui.toggleFiltersPanel(false));