// Utility functions

/**
 * Formats a given date string into a more readable format.
 * @param {string} dateString The date string (e.g., from Material.UploadDate).
 * @returns {string} Formatted date string.
 */
export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Debounces a function call. Useful for search inputs to prevent
 * excessive API calls while the user is typing.
 * @param {function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {function} The debounced function.
 */
export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}