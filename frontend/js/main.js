document.addEventListener('DOMContentLoaded', () => {
    const lectureMaterialsContainer = document.getElementById('lectureMaterialsGrid'); // Main container
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Get filter elements
    const mainSearchBar = document.getElementById('mainSearchBar');
    const mainSearchButton = document.getElementById('mainSearchButton');
    const levelFilter = document.getElementById('levelFilter');
    const semesterFilter = document.getElementById('semesterFilter');
    const applyFiltersButton = document.getElementById('applyFiltersButton');
    const clearFiltersButton = document.getElementById('clearFiltersButton');

    // Function to fetch lecture materials from the Flask API with search and filter parameters
    // Added 'limit' parameter to control the number of results fetched
    async function fetchLectureMaterials(searchTerm = '', level = '', semester = '', limit = null) { // limit is now a parameter
        if (loadingMessage) loadingMessage.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';
        lectureMaterialsContainer.innerHTML = ''; // Clear previous content

        let url = new URL('/materials', window.location.origin);

        // Add search and filter parameters to the URL
        if (searchTerm) {
            url.searchParams.append('search', searchTerm);
        }
        if (level) {
            url.searchParams.append('level', level);
        }
        if (semester) {
            url.searchParams.append('semester', semester);
        }
        
        // NEW: Add limit to the URL if it's provided
        if (limit !== null) {
            url.searchParams.append('limit', limit);
        }

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const materials = await response.json();

            if (loadingMessage) loadingMessage.style.display = 'none';

            if (materials.length === 0) {
                lectureMaterialsContainer.innerHTML = '<p>No lecture materials found matching your criteria.</p>';
                return;
            }

            materials.forEach(material => {
                const materialCard = document.createElement('div');
                materialCard.className = 'material-item-card';

                materialCard.innerHTML = `
                    <div class="card-image-section">
                        <img src="assets/images/Docs.png" alt="${material.title} Cover">
                    </div>
                    <div class="card-content-section">
                        <h3 class="card-material-title">${material.course_code} - ${material.title}</h3>
                        <p>Level: ${material.level}</p>
                        <p>Semester: ${material.semester}</p>
                    </div>
                    <div class="card-badges-section">
                        <span class="card-badge adopted-badge">
                            <button class="button-download" data-filename="${material.file_name}"><i class="fas fa-download"></i> Download File</button>
                        </span>
                    </div>
                `;
                lectureMaterialsContainer.appendChild(materialCard);
            });

            document.querySelectorAll('.download-button').forEach(button => {
                button.addEventListener('click', handleDownload);
            });

        } catch (error) {
            console.error('Error fetching lecture materials:', error);
            if (loadingMessage) loadingMessage.style.display = 'none';
            if (errorMessage) {
                errorMessage.textContent = `Failed to load materials: ${error.message}. Please ensure the Flask server is running.`;
                errorMessage.style.display = 'block';
            }
            lectureMaterialsContainer.innerHTML = '<p style = "text-align: center">Could not load materials. Please try again later.</p>';
        }
    }

    // Function to handle file downloads (remains the same)
    async function handleDownload(event) {
        const fileName = event.target.dataset.filename;
        if (!fileName) {
            console.error('No filename found for download button.');
            return;
        }

        try {
            const response = await fetch('/download/${fileName}');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${await response.text()}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert(`Failed to download ${fileName}: ${error.message}`);
        }
    }

    // Event Listeners for Search and Filter Buttons
    mainSearchButton.addEventListener('click', () => {
        const searchTerm = mainSearchBar.value;
        const level = levelFilter.value;
        const semester = semesterFilter.value;
        // When searching/filtering, we want all relevant results, so no limit here
        fetchLectureMaterials(searchTerm, level, semester); 
    });

    applyFiltersButton.addEventListener('click', () => {
        const searchTerm = mainSearchBar.value; 
        const level = levelFilter.value;
        const semester = semesterFilter.value;
        // When applying filters, we want all relevant results, so no limit here
        fetchLectureMaterials(searchTerm, level, semester);
    });

    clearFiltersButton.addEventListener('click', () => {
        mainSearchBar.value = ''; // Clear search input
        levelFilter.value = ''; // Reset level filter
        semesterFilter.value = ''; // Reset semester filter
        // When clearing, fetch the initial limited set again
        fetchLectureMaterials('', '', '', 8); // Display first 8 materials again
    });

    // NEW: Initial fetch when the page loads, displaying a limited number of materials
    // You can adjust this number (e.g., 4, 6, 8, 10) based on your design
    fetchLectureMaterials('', '', '', 8); // Load the first 8 materials on page load
});