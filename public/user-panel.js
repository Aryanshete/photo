document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const userToken = localStorage.getItem('userToken');
    const userEmail = localStorage.getItem('userEmail');

    if (!userToken) {
        window.location.href = 'user-login.html';
        return;
    }

    // Set user name
    const userName = document.getElementById('userName');
    userName.textContent = userEmail.split('@')[0];

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        window.location.href = 'user-login.html';
    });

    // Navigation and Content Management
    const sections = ['dashboard', 'gallery', 'favorites', 'collections', 'profile'];
    const navItems = document.querySelectorAll('.nav-item');
    const contentBody = document.querySelector('.content-body');

    // Hide all sections except dashboard initially
    sections.forEach(section => {
        if (section !== 'dashboard') {
            const sectionElement = document.getElementById(section);
            if (sectionElement) {
                sectionElement.style.display = 'none';
            }
        }
    });

    // Handle navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.getAttribute('href').substring(1);
            
            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show/hide sections
            sections.forEach(section => {
                const sectionElement = document.getElementById(section);
                if (sectionElement) {
                    sectionElement.style.display = section === targetSection ? 'block' : 'none';
                }
            });

            // Load section content
            loadSectionContent(targetSection);
        });
    });

    // Load section content
    function loadSectionContent(section) {
        switch(section) {
            case 'gallery':
                loadGallery();
                break;
            case 'favorites':
                loadFavorites();
                break;
            case 'collections':
                loadCollections();
                break;
            case 'profile':
                loadProfile();
                break;
        }
    }

    // Content loading functions
    function loadGallery() {
        const gallerySection = document.getElementById('gallery') || createSection('gallery');
        gallerySection.innerHTML = `
            <h2>My Gallery</h2>
            <div class="gallery-grid">
                <!-- Add your gallery items here -->
            </div>
            <button class="upload-btn">
                <i class="fas fa-upload"></i>
                Upload New Photos
            </button>
        `;
    }

    function loadFavorites() {
        const favoritesSection = document.getElementById('favorites') || createSection('favorites');
        favoritesSection.innerHTML = `
            <h2>Favorite Photos</h2>
            <div class="favorites-grid">
                <!-- Add favorite photos here -->
            </div>
        `;
    }

    function loadCollections() {
        const collectionsSection = document.getElementById('collections') || createSection('collections');
        collectionsSection.innerHTML = `
            <h2>My Collections</h2>
            <div class="collections-grid">
                <!-- Add collections here -->
            </div>
            <button class="create-collection-btn">
                <i class="fas fa-plus"></i>
                Create New Collection
            </button>
        `;
    }

    function loadProfile() {
        const profileSection = document.getElementById('profile') || createSection('profile');
        profileSection.innerHTML = `
            <h2>Profile Settings</h2>
            <div class="profile-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${userEmail}" readonly>
                </div>
                <div class="form-group">
                    <label>Display Name</label>
                    <input type="text" value="${userName.textContent}">
                </div>
                <button class="save-profile-btn">Save Changes</button>
            </div>
        `;
    }

    function createSection(id) {
        const section = document.createElement('section');
        section.id = id;
        section.className = `${id}-section`;
        contentBody.appendChild(section);
        return section;
    }

    // Load initial activity data
    loadActivityData();
});

function loadActivityData() {
    const activities = [
        {
            type: 'upload',
            description: 'Uploaded 5 new photos to Wedding Collection',
            time: '2 hours ago'
        },
        {
            type: 'favorite',
            description: 'Added 3 photos to favorites',
            time: '4 hours ago'
        },
        {
            type: 'collection',
            description: 'Created new collection "Summer 2025"',
            time: '1 day ago'
        }
    ];

    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${activity.type === 'upload' ? 'upload' : 
                                    activity.type === 'favorite' ? 'heart' : 'folder'}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.description}</p>
                    <span>${activity.time}</span>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }
}