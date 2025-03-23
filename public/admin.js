// Constants
const API_BASE_URL = 'http://localhost:3000/api';
const TOAST_DURATION = 3000;
const DEBOUNCE_DELAY = 300;

// Global state
let currentSection = 'dashboard';
let searchDebounceTimer;

// Utility function for making authenticated API calls
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin-login.html';
        return;
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${url}`, { ...defaultOptions, ...options });
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/admin-login.html';
        return;
    }
    return response;
};

// Load and display dashboard stats
const loadDashboardStats = async () => {
    try {
        const response = await fetchWithAuth('/admin/stats');
        const data = await response.json();
        if (!data) throw new Error('No data received');

        document.getElementById('totalPhotos').textContent = data.totalPhotos || 0;
        document.getElementById('totalCategories').textContent = data.totalCategories || 0;
        document.getElementById('totalStorage').textContent = formatBytes(data.storageUsed || 0);
    } catch (error) {
        console.error('Error loading stats:', error);
        showError('Failed to load dashboard statistics');
    }
};

// Load and display photos
const loadPhotos = async () => {
    try {
        const response = await fetchWithAuth('/photos');
        const data = await response.json();
        if (!data) throw new Error('No data received');

        const photosList = document.getElementById('photosList');
        photosList.innerHTML = '';

        const photos = Array.isArray(data) ? data : (data.photos || []);
        photos.forEach(photo => {
            const photoCard = document.createElement('div');
            photoCard.className = 'photo-card';
            photoCard.innerHTML = `
                <img src="${API_BASE_URL}/photos/${photo._id}/image" alt="${photo.title}">
                <div class="photo-info">
                    <div class="photo-title">${photo.title}</div>
                    <div class="photo-category">${photo.category?.name || 'Uncategorized'}</div>
                </div>
            `;
            photosList.appendChild(photoCard);
        });
    } catch (error) {
        console.error('Error loading photos:', error);
        showError('Failed to load photos');
    }
};

// Load and display categories
const loadCategories = async () => {
    try {
        const response = await fetchWithAuth('/categories');
        const data = await response.json();
        if (!data) throw new Error('No data received');

        const categoriesList = document.getElementById('categoriesList');
        const categorySelect = document.getElementById('photoCategory');
        
        // Update categories grid
        categoriesList.innerHTML = '';
        const categories = Array.isArray(data) ? data : (data.categories || []);
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div>
                    <h3>${category.name}</h3>
                    <p>${category.description || ''}</p>
                </div>
            `;
            categoriesList.appendChild(categoryCard);
        });

        // Update category select in upload form
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            categorySelect.innerHTML += `<option value="${category._id}">${category.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories');
    }
};

// Preview image before upload
const previewImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('img');
            preview.src = e.target.result;
            preview.style.maxWidth = '200px';
            preview.style.marginTop = '10px';
            
            // Remove any existing preview
            const oldPreview = event.target.parentElement.querySelector('img');
            if (oldPreview) {
                oldPreview.remove();
            }
            
            event.target.parentElement.appendChild(preview);
        };
        reader.readAsDataURL(file);
    }
};

// Handle photo upload
const handlePhotoUpload = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetchWithAuth('/photos/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            form.reset();
            document.getElementById('uploadPhotoModal').style.display = 'none';
            loadPhotos();
            loadDashboardStats();
            showSuccess('Photo uploaded successfully');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to upload photo');
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
        showError('Failed to upload photo');
    }
};

// Handle category creation
const handleCategorySubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = {
        name: form.categoryName.value,
        description: form.categoryDescription.value
    };

    try {
        const response = await fetchWithAuth('/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            form.reset();
            document.getElementById('addCategoryModal').style.display = 'none';
            loadCategories();
            loadDashboardStats();
            showSuccess('Category added successfully');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to add category');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showError('Failed to add category');
    }
};

// Utility functions
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const showError = (message) => {
    console.error(message);
    // You can implement a better error notification here
};

const showSuccess = (message) => {
    console.log(message);
    // You can implement a better success notification here
};

// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.closest('a').dataset.section;
        
        // Update active link
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        e.target.closest('a').classList.add('active');
        
        // Show selected section
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        document.getElementById(section).style.display = 'block';

        // Load section data
        if (section === 'dashboard') loadDashboardStats();
        else if (section === 'photos') loadPhotos();
        else if (section === 'categories') loadCategories();
    });
});

// Modal functions
const openModal = (modalId) => {
    document.getElementById(modalId).style.display = 'block';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!localStorage.getItem('token')) {
        window.location.href = '/admin-login.html';
        return;
    }

    // Load initial data
    loadDashboardStats();
    loadPhotos();
    loadCategories();

    // Setup form handlers
    document.getElementById('uploadPhotoForm').addEventListener('submit', handlePhotoUpload);
    document.getElementById('addCategoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('photoFile').addEventListener('change', previewImage);

    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/admin-login.html';
    });
});
