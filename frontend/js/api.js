// Functions for making API calls to your Flask backend

// Base URL for your Flask backend (important! Update this when deploying)
const BASE_URL = 'http://127.0.0.1:5000'; // Default Flask development server URL

/**
 * Fetches lecture materials from the backend, with optional search and filter parameters.
 * @param {Object} params - An object containing search and filter parameters.
 * @param {string} [params.search] - General search keyword.
 * @param {number} [params.course_id] - Filter by Course ID.
 * @param {number} [params.level_id] - Filter by Level ID.
 * @param {number} [params.semester_id] - Filter by Semester ID.
 * @returns {Promise<Array>} A promise that resolves to an array of material objects.
 */
export async function getMaterials(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/materials?${queryString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching materials:', error);
        return []; // Return an empty array on error
    }
}

/**
 * Fetches all available levels from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of level objects.
 */
export async function getLevels() {
    try {
        const response = await fetch(`${BASE_URL}/levels`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching levels:', error);
        return [];
    }
}

/**
 * Fetches all available semesters from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of semester objects.
 */
export async function getSemesters() {
    try {
        const response = await fetch(`${BASE_URL}/semesters`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching semesters:', error);
        return [];
    }
}

/**
 * Fetches all available courses from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of course objects.
 */
export async function getCourses() {
    try {
        const response = await fetch(`${BASE_URL}/courses`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

/**
 * Initiates the download of a specific material from the backend.
 * This will typically trigger a file download in the browser.
 * @param {number} materialId - The ID of the material to download.
 */
export function downloadMaterial(materialId) {
    // Directly navigating to the URL will trigger a browser download
    window.location.href = `${BASE_URL}/materials/${materialId}/download`;
}